import clsx from 'clsx';
import { ArrowRight, Delete, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Segmented } from '../../components/motion';
import { ACCOUNT_ICONS, colorOf, iconOf } from '../../components/palette';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui';
import { crDay, crDayOf, crDayStartInstant, isoDate } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import {
  useAccounts,
  useCategories,
  useDeleteTransaction,
  useSaveMerchantRule,
  useSaveTransaction,
} from '../../lib/queries';
import type { Transaction, TxType } from '../../lib/types';

const LAST_ACCOUNT_KEY = 'finanzas-last-account';
const pillDate = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const readLastAccount = () => {
  try {
    return localStorage.getItem(LAST_ACCOUNT_KEY);
  } catch {
    return null;
  }
};

const TYPE_OPTIONS: { value: TxType; label: string }[] = [
  { value: 'gasto', label: 'Gasto' },
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'transferencia', label: 'Transferencia' },
];

export function TransactionSheet({
  open,
  tx,
  initialType,
  onClose,
}: {
  open: boolean;
  tx: Transaction | null;
  initialType: TxType;
  onClose: () => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const saveRule = useSaveMerchantRule();
  const toast = useToast();

  const pending = tx?.status === 'por_revisar';
  const [type, setType] = useState<TxType>(tx?.type ?? initialType);
  const [colones, setColones] = useState(tx ? String(Math.round(tx.amount / 100)) : '');
  const [categoryId, setCategoryId] = useState<string | null>(tx?.category_id ?? null);
  const [accountId, setAccountId] = useState<string | null>(tx?.account_id ?? readLastAccount());
  const [toAccountId, setToAccountId] = useState<string | null>(tx?.to_account_id ?? null);
  const [merchant, setMerchant] = useState(tx?.merchant ?? '');
  const [note, setNote] = useState(tx?.note ?? '');
  const [date, setDate] = useState(isoDate(tx ? crDayOf(tx.occurred_at) : crDay()));
  const [remember, setRemember] = useState(pending && Boolean(tx?.merchant));
  // Al editar el monto ya existe: el teclado aparece solo si se toca el monto.
  const [showPad, setShowPad] = useState(!tx);

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const cats = useMemo(
    () => categories.filter((c) => c.kind === (type === 'ingreso' ? 'ingreso' : 'gasto') && !c.parent_id),
    [categories, type],
  );
  const cents = Number(colones || '0') * 100;
  const isTransfer = type === 'transferencia';
  const destination = accounts.find((a) => a.id === toAccountId);
  const valid =
    cents > 0 &&
    account &&
    (isTransfer ? destination && destination.id !== account.id : true) &&
    (!pending || categoryId);

  const press = (key: string) => {
    if (key === 'del') return setColones((v) => v.slice(0, -1));
    setColones((v) => {
      const next = (v + key).replace(/^0+/, '');
      return next.length > 10 ? v : next;
    });
  };

  const submit = async () => {
    if (!valid || !account) return;
    const today = isoDate(crDay());
    const occurred_at =
      tx && isoDate(crDayOf(tx.occurred_at)) === date
        ? tx.occurred_at
        : date === today
          ? new Date().toISOString()
          : new Date(crDayStartInstant(new Date(date + 'T00:00:00Z')).getTime() + 12 * 3_600_000).toISOString();
    await save.mutateAsync({
      id: tx?.id,
      type,
      amount: cents,
      account_id: account.id,
      to_account_id: isTransfer ? (destination?.id ?? null) : null,
      category_id: isTransfer ? null : categoryId,
      merchant: merchant.trim() || null,
      note: note.trim() || null,
      occurred_at,
      status: 'confirmada',
    });
    if (pending && remember && categoryId && tx?.merchant) {
      await saveRule.mutateAsync({ pattern: tx.merchant.trim().toUpperCase(), category_id: categoryId });
    }
    try {
      localStorage.setItem(LAST_ACCOUNT_KEY, account.id);
    } catch {
      // preferencia opcional
    }
    toast(tx ? (pending ? 'Pago confirmado' : 'Cambios guardados') : type === 'ingreso' ? 'Ingreso guardado' : 'Gasto guardado');
    onClose();
  };

  const destroy = async () => {
    if (!tx) return;
    await remove.mutateAsync(tx.id);
    toast('Movimiento eliminado');
    onClose();
  };

  const title = pending ? 'Revisar pago' : tx ? 'Editar' : type === 'ingreso' ? 'Nuevo ingreso' : type === 'transferencia' ? 'Transferencia' : 'Nuevo gasto';

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      leading={
        <button type="button" className="min-h-11 text-body text-blue" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button
          type="button"
          className="min-h-11 text-body font-semibold text-blue disabled:text-label-3"
          disabled={!valid || save.isPending}
          onClick={submit}
        >
          {pending ? 'Confirmar' : 'Guardar'}
        </button>
      }
    >
      {pending && (
        <div className="mb-4 flex items-center gap-3 rounded-[12px] bg-blue/15 px-3.5 py-3 text-subhead text-label">
          <Smartphone size={20} strokeWidth={2} className="shrink-0 text-blue" />
          <span>
            Llegó de Apple Wallet{tx?.note ? ` (${tx.note.replace(/^Wallet · /, '')})` : ''}. Elige la categoría y confírmalo.
          </span>
        </div>
      )}

      {!tx && <Segmented options={TYPE_OPTIONS} value={type} onChange={setType} />}

      <button
        type="button"
        onClick={() => setShowPad(true)}
        disabled={showPad}
        aria-label={showPad ? undefined : 'Cambiar monto'}
        className={clsx(
          'tnum mt-5 block w-full text-center text-[52px] leading-[60px] font-bold tracking-[-0.02em]',
          cents === 0 && 'text-label-3',
          type === 'ingreso' && cents > 0 && 'text-green',
        )}
        aria-live="polite"
      >
        {formatCRC(cents)}
      </button>
      {!showPad && <p className="text-center text-footnote text-label-2">Toca el monto para cambiarlo</p>}

      <div className={clsx('mt-4 grid grid-cols-3 gap-2', !showPad && 'hidden')} aria-label="Teclado numérico">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            aria-label={k === 'del' ? 'Borrar' : k}
            className="press grid h-12 place-items-center rounded-[10px] bg-card-2 text-title3 font-medium active:bg-card-3"
          >
            {k === 'del' ? <Delete size={22} strokeWidth={2} /> : k}
          </button>
        ))}
      </div>

      {!isTransfer && (
        <Picker label="Categoría">
          {cats.map((c) => {
            const Icon = iconOf(c.icon);
            const on = c.id === categoryId;
            return (
              <Chip key={c.id} on={on} onClick={() => setCategoryId(on ? null : c.id)}>
                <span className="grid size-6 place-items-center rounded-[7px] text-white" style={{ background: colorOf(c.color) }}>
                  <Icon size={15} strokeWidth={2.25} />
                </span>
                {c.name}
              </Chip>
            );
          })}
        </Picker>
      )}

      <Picker label={isTransfer ? 'Desde' : type === 'ingreso' ? 'Entra a' : 'Pagado con'}>
        {accounts.map((a) => {
          const Icon = ACCOUNT_ICONS[a.type];
          return (
            <Chip key={a.id} on={a.id === account?.id} onClick={() => setAccountId(a.id)}>
              <Icon size={18} strokeWidth={2} className="text-label-2" />
              {a.name}
            </Chip>
          );
        })}
      </Picker>

      {isTransfer && (
        <Picker label="Hacia" icon={<ArrowRight size={14} strokeWidth={2.25} />}>
          {accounts
            .filter((a) => a.id !== account?.id)
            .map((a) => {
              const Icon = ACCOUNT_ICONS[a.type];
              return (
                <Chip key={a.id} on={a.id === toAccountId} onClick={() => setToAccountId(a.id)}>
                  <Icon size={18} strokeWidth={2} className="text-label-2" />
                  {a.name}
                </Chip>
              );
            })}
        </Picker>
      )}

      <div className="mt-5 overflow-hidden rounded-[12px] bg-card-2">
        <Field label={isTransfer ? 'Descripción' : type === 'ingreso' ? 'Origen' : 'Comercio'}>
          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder={isTransfer ? 'Pago de tarjeta' : type === 'ingreso' ? 'Salario' : 'Automercado'}
            className="w-full bg-transparent text-right text-body outline-none placeholder:text-label-3"
            autoComplete="off"
          />
        </Field>
        <Field label="Fecha">
          {/* Pastilla de fecha al estilo iOS; el input nativo queda encima, transparente, para abrir el selector. */}
          <span className="relative inline-flex">
            <span className="rounded-[8px] bg-card-3 px-3 py-1.5 text-body">{pillDate.format(new Date(date + 'T00:00:00Z'))}</span>
            <input
              type="date"
              value={date}
              max={isoDate(crDay())}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              aria-label="Fecha"
              className="absolute inset-0 opacity-0 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full"
            />
          </span>
        </Field>
        <Field label="Nota" last>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opcional"
            className="w-full bg-transparent text-right text-body outline-none placeholder:text-label-3"
            autoComplete="off"
          />
        </Field>
      </div>

      {pending && tx?.merchant && (
        <label className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-[12px] bg-card-2 px-4 py-2.5">
          <span className="text-body">
            Usar siempre esta categoría para <span className="font-semibold">{tx.merchant}</span>
          </span>
          <Toggle checked={remember} onChange={setRemember} />
        </label>
      )}

      {tx && (
        <Button variant="destructive" className="mt-6 w-full" onClick={destroy} disabled={remove.isPending}>
          Eliminar movimiento
        </Button>
      )}
    </Sheet>
  );
}

function Picker({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 flex items-center gap-1 px-1 text-footnote font-semibold text-label-2 uppercase">
        {label}
        {icon}
      </p>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={clsx(
        'press flex min-h-11 shrink-0 items-center gap-2 rounded-full py-1.5 pr-4 pl-2 text-subhead font-semibold whitespace-nowrap',
        on ? 'bg-label text-black [&_svg.text-label-2]:text-black/60' : 'bg-card-2 text-label',
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, last, children }: { label: string; last?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 items-center gap-4 pl-4">
      <span className={clsx('flex min-h-11 flex-1 items-center gap-4 pr-4', !last && 'shadow-[inset_0_-0.5px_0_var(--color-sep)]')}>
        <span className="shrink-0 text-body">{label}</span>
        <span className="flex min-w-0 flex-1 justify-end">{children}</span>
      </span>
    </label>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-green' : 'bg-fill-2',
      )}
    >
      <span
        className="absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_3px_1px_rgb(0_0_0/0.06)] transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}
