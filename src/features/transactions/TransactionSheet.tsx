import clsx from 'clsx';
import { onlineManager } from '@tanstack/react-query';
import { ArrowRight, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AmountInput } from '../../components/AmountInput';
import { CategoryGrid } from '../../components/CategoryGrid';
import { Segmented } from '../../components/motion';
import { ACCOUNT_ICONS } from '../../components/palette';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui';
import { crDay, crDayOf, crDayStartInstant, isoDate } from '../../lib/dates';
import {
  useAccounts,
  useCategories,
  useDeleteTransaction,
  useSaveMerchantRule,
  useSaveTransaction,
} from '../../lib/queries';
import type { Account, Transaction, TxType } from '../../lib/types';

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
  { value: 'transferencia', label: 'Entre cuentas' },
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

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const cats = useMemo(
    () => categories.filter((c) => c.kind === (type === 'ingreso' ? 'ingreso' : 'gasto') && !c.parent_id),
    [categories, type],
  );
  const cents = Number(colones || '0') * 100;
  const isTransfer = type === 'transferencia';
  const destination = accounts.find((a) => a.id === toAccountId);
  const today = isoDate(crDay());
  const valid =
    cents > 0 &&
    account &&
    (isTransfer ? destination && destination.id !== account.id : true) &&
    (!pending || categoryId);

  // Sin esperar a la red: el cambio entra a la cola (lib/offline.ts), la lista se actualiza al instante
  // y se sube en cuanto haya conexión.
  const submit = () => {
    if (!valid || !account) return;
    const occurred_at =
      tx && isoDate(crDayOf(tx.occurred_at)) === date
        ? tx.occurred_at
        : date === today
          ? new Date().toISOString()
          : new Date(crDayStartInstant(new Date(date + 'T00:00:00Z')).getTime() + 12 * 3_600_000).toISOString();
    save.mutate({
      id: tx?.id ?? crypto.randomUUID(),
      type,
      amount: cents,
      account_id: account.id,
      to_account_id: isTransfer ? (destination?.id ?? null) : null,
      category_id: isTransfer ? null : categoryId,
      merchant: merchant.trim() || null,
      note: note.trim() || null,
      occurred_at,
      source: tx?.source ?? 'manual',
      status: 'confirmada',
    });
    if (pending && remember && categoryId && tx?.merchant) {
      saveRule.mutate({ pattern: tx.merchant.trim().toUpperCase(), category_id: categoryId });
    }
    try {
      localStorage.setItem(LAST_ACCOUNT_KEY, account.id);
    } catch {
      // preferencia opcional
    }
    const done = tx
      ? pending
        ? 'Pago confirmado'
        : 'Cambios guardados'
      : type === 'ingreso'
        ? 'Ingreso guardado'
        : isTransfer
          ? 'Movimiento guardado'
          : 'Gasto guardado';
    toast(onlineManager.isOnline() ? done : `${done} · se sube al volver la señal`);
    onClose();
  };

  const destroy = () => {
    if (!tx) return;
    remove.mutate(tx.id);
    toast(onlineManager.isOnline() ? 'Movimiento eliminado' : 'Eliminado · se sincroniza al volver la señal');
    onClose();
  };

  const title = pending
    ? 'Revisar pago'
    : tx
      ? 'Editar'
      : type === 'ingreso'
        ? 'Nuevo ingreso'
        : isTransfer
          ? 'Entre cuentas'
          : 'Nuevo gasto';

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={title}
      leading={
        <button type="button" className="min-h-11 text-body text-blue" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button
          type="button"
          className="press min-h-9 rounded-full bg-blue px-4 text-body font-semibold text-white disabled:bg-fill disabled:text-label-3"
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
      {isTransfer && (
        <p className="mt-2 px-1 text-footnote text-label-2">
          Para mover plata entre tus cuentas: pagar la tarjeta, sacar efectivo del cajero o pasar a ahorros. No cuenta como gasto ni
          como ingreso.
        </p>
      )}

      <div className="mt-5">
        <AmountInput value={colones} onChange={setColones} autoFocus={!tx} tone={type === 'ingreso' ? 'ingreso' : undefined} />
      </div>

      {!isTransfer && (
        <Group label="Categoría">
          <CategoryGrid categories={cats} selected={categoryId} onSelect={setCategoryId} />
        </Group>
      )}

      <Group label={isTransfer ? 'Desde' : type === 'ingreso' ? 'Entra a' : 'Pagado con'}>
        <AccountChips accounts={accounts} selected={account?.id} onSelect={setAccountId} />
      </Group>

      {isTransfer && (
        <Group label="Hacia" icon={<ArrowRight size={14} strokeWidth={2.25} />}>
          <AccountChips
            accounts={accounts.filter((a) => a.id !== account?.id)}
            selected={toAccountId ?? undefined}
            onSelect={setToAccountId}
          />
        </Group>
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
            <span className="rounded-[8px] bg-card-3 px-3 py-1.5 text-body">
              {date === today ? 'Hoy' : pillDate.format(new Date(date + 'T00:00:00Z'))}
            </span>
            <input
              type="date"
              value={date}
              max={today}
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

function Group({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 flex items-center gap-1 px-1 text-footnote font-semibold text-label-2 uppercase">
        {label}
        {icon}
      </p>
      {children}
    </div>
  );
}

function AccountChips({
  accounts,
  selected,
  onSelect,
}: {
  accounts: Account[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((a) => {
        const Icon = ACCOUNT_ICONS[a.type];
        const on = a.id === selected;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            aria-pressed={on}
            className={clsx(
              'press flex min-h-11 items-center gap-2 rounded-full py-1.5 pr-4 pl-3 text-subhead font-semibold',
              on ? 'bg-label text-black' : 'bg-card-2 text-label',
            )}
          >
            <Icon size={18} strokeWidth={2} className={on ? 'text-black/60' : 'text-label-2'} />
            {a.name}
            {a.last4 && <span className={on ? 'text-black/50' : 'text-label-3'}>•{a.last4}</span>}
          </button>
        );
      })}
    </div>
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
