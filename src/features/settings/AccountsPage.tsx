import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ACCOUNT_ICONS } from '../../components/palette';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Button, IconTile, Row, Screen, Section } from '../../components/ui';
import { crDay } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import { useAccounts, useBalances, useSaveAccount } from '../../lib/queries';
import { ACCOUNT_TYPE_LABEL, type Account, type AccountType } from '../../lib/types';
import { BackLink } from './MorePage';
import { ColonesInput, DayInput, FormGroup, FormHeader, FormRow, TextInput } from './form';

const TYPE_COLOR: Record<AccountType, string> = {
  efectivo: 'var(--color-green)',
  debito: 'var(--color-blue)',
  credito: 'var(--color-indigo)',
  banco: 'var(--color-teal)',
  ahorro: 'var(--color-pink)',
};

/** Días hasta la próxima fecha con ese día del mes. */
function daysUntil(day: number) {
  const today = crDay();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  let target = new Date(Date.UTC(y, m, day));
  if (target.getTime() < today.getTime()) target = new Date(Date.UTC(y, m + 1, day));
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function AccountsPage() {
  const { data: accounts = [] } = useAccounts();
  const { data: balances = [] } = useBalances();
  const balanceOf = useMemo(() => new Map(balances.map((b) => [b.account_id, b.balance])), [balances]);
  const [editing, setEditing] = useState<{ acc: Partial<Account>; key: number } | null>(null);
  const [open, setOpen] = useState(false);

  const openEditor = (acc: Partial<Account>) => {
    setEditing((prev) => ({ acc, key: (prev?.key ?? 0) + 1 }));
    setOpen(true);
  };

  const cards = accounts.filter((a) => a.type === 'credito');
  const others = accounts.filter((a) => a.type !== 'credito');
  const net = accounts.reduce((s, a) => s + (balanceOf.get(a.id) ?? 0), 0);

  return (
    <Screen title="Cuentas" subtitle={<BackLink />}>
      <div className="rounded-card bg-card p-4">
        <p className="text-subhead font-semibold text-label-2">Patrimonio neto</p>
        <p className={'tnum text-title1 font-bold ' + (net < 0 ? 'text-red' : '')}>{formatCRC(net)}</p>
      </div>

      <Section header="Efectivo y bancos">
        {others.map((a) => (
          <Row
            key={a.id}
            onClick={() => openEditor(a)}
            leading={<IconTile icon={ACCOUNT_ICONS[a.type]} color={TYPE_COLOR[a.type]} />}
            title={a.name}
            subtitle={ACCOUNT_TYPE_LABEL[a.type] + (a.last4 ? ` · •••${a.last4}` : '')}
            trailing={<span className="tnum font-semibold text-label">{formatCRC(balanceOf.get(a.id) ?? 0)}</span>}
            chevron
          />
        ))}
      </Section>

      {cards.length > 0 && (
        <Section header="Tarjetas de crédito">
          {cards.map((a) => {
            const debt = -(balanceOf.get(a.id) ?? 0);
            const parts = [
              a.last4 ? `•••${a.last4}` : null,
              a.payment_day ? `Pago en ${daysUntil(a.payment_day)} días` : null,
              a.cutoff_day ? `corte el ${a.cutoff_day}` : null,
            ].filter(Boolean);
            return (
              <Row
                key={a.id}
                onClick={() => openEditor(a)}
                leading={<IconTile icon={ACCOUNT_ICONS.credito} color={TYPE_COLOR.credito} />}
                title={a.name}
                subtitle={parts.join(' · ')}
                trailing={
                  <span className="text-right">
                    <span className={'tnum block font-semibold ' + (debt > 0 ? 'text-label' : 'text-green')}>
                      {debt > 0 ? formatCRC(debt) : 'Al día'}
                    </span>
                    {a.credit_limit && debt > 0 && (
                      <span className="tnum block text-footnote text-label-2">
                        {Math.round((debt / a.credit_limit) * 100)}% del límite
                      </span>
                    )}
                  </span>
                }
                chevron
              />
            );
          })}
        </Section>
      )}

      <Button variant="tinted" className="mt-6 w-full" onClick={() => openEditor({ type: 'debito' })}>
        Agregar tarjeta o cuenta
      </Button>

      {editing && (
        <AccountSheet
          key={editing.key}
          open={open}
          initial={editing.acc}
          others={accounts.filter((a) => a.id !== editing.acc.id)}
          currentBalance={editing.acc.id ? balanceOf.get(editing.acc.id) : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </Screen>
  );
}

const KIND_OPTIONS: { type: AccountType; label: string }[] = [
  { type: 'debito', label: 'Tarjeta de débito' },
  { type: 'credito', label: 'Tarjeta de crédito' },
  { type: 'efectivo', label: 'Efectivo' },
  { type: 'banco', label: 'Cuenta bancaria' },
  { type: 'ahorro', label: 'Ahorro' },
];

/** Nombre que se guarda si no se escribió uno: lo justo para distinguirla. */
const fallbackName = (type: AccountType, last4: string | null | undefined) =>
  last4 && (type === 'debito' || type === 'credito')
    ? `${type === 'credito' ? 'Crédito' : 'Débito'} •${last4}`
    : ACCOUNT_TYPE_LABEL[type];

function AccountSheet({
  open,
  initial,
  others,
  currentBalance,
  onClose,
}: {
  open: boolean;
  initial: Partial<Account>;
  others: Account[];
  /** Saldo de hoy (con signo; en crédito la deuda es negativa). Solo al editar. */
  currentBalance?: number;
  onClose: () => void;
}) {
  const save = useSaveAccount();
  const toast = useToast();
  const [acc, setAcc] = useState<Partial<Account>>(initial);
  const set = (patch: Partial<Account>) => setAcc((a) => ({ ...a, ...patch }));
  const type = acc.type ?? 'debito';
  const isCard = type === 'credito' || type === 'debito';
  // El campo muestra el saldo de HOY; al guardar se ajusta el saldo inicial para que hoy cuadre.
  const startBalance = initial.id ? (currentBalance ?? 0) : (initial.initial_balance ?? 0);
  const [balance, setBalance] = useState<number | null>(startBalance ? Math.abs(startBalance) : null);
  // Lo opcional queda plegado; se abre solo al editar una cuenta que ya tiene esos datos.
  const [details, setDetails] = useState(
    Boolean(startBalance || initial.credit_limit || initial.cutoff_day || initial.payment_day || initial.wallet_name),
  );
  const name = acc.name?.trim() || fallbackName(type, acc.last4);
  const last4Len = (acc.last4 ?? '').length;
  const sameLast4 = isCard && last4Len === 4 ? others.find((o) => o.last4 === acc.last4) : undefined;
  const sameName = others.find((o) => o.name.toLowerCase() === name.toLowerCase());
  const valid = !sameName && (last4Len === 0 || last4Len === 4);

  const submit = async () => {
    if (!valid) return;
    const desired = (type === 'credito' ? -1 : 1) * (balance ?? 0);
    const initial_balance = initial.id ? (initial.initial_balance ?? 0) + (desired - (currentBalance ?? 0)) : desired;
    await save.mutateAsync({
      ...acc,
      type,
      name,
      initial_balance,
      last4: isCard && last4Len === 4 ? acc.last4 : null,
      wallet_name: acc.wallet_name?.trim() || null,
    });
    toast(initial.id ? 'Cuenta actualizada' : `${name} agregada`);
    onClose();
  };

  const archive = async () => {
    await save.mutateAsync({ id: initial.id, archived: true });
    toast('Cuenta archivada');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={initial.id ? 'Editar cuenta' : 'Nueva cuenta'}
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
          Guardar
        </button>
      }
    >
      {/* Selector de tipo: una fila de cinco mosaicos con el mismo ícono y color que en la lista de cuentas. */}
      <FormHeader>Tipo</FormHeader>
      <div className="grid grid-cols-5 gap-1.5">
        {KIND_OPTIONS.map((k) => {
          const on = k.type === type;
          return (
            <button
              key={k.type}
              type="button"
              aria-pressed={on}
              aria-label={k.label}
              onClick={() => set({ type: k.type })}
              className={clsx(
                'press flex min-w-0 flex-col items-center gap-2 rounded-[12px] px-0.5 pt-3 pb-2.5 text-footnote font-semibold',
                on ? 'bg-label text-black' : 'bg-card-2 text-label-2',
              )}
            >
              <IconTile icon={ACCOUNT_ICONS[k.type]} color={TYPE_COLOR[k.type]} size={32} />
              <span className="max-w-full truncate">{ACCOUNT_TYPE_LABEL[k.type]}</span>
            </button>
          );
        })}
      </div>

      <FormGroup
        footer={
          <>
            {sameName ? (
              <p className="text-red">Ya tienes una cuenta llamada «{sameName.name}». Ponle otro nombre.</p>
            ) : sameLast4 ? (
              <p className="text-orange">
                «{sameLast4.name}» también termina en {sameLast4.last4}. Ponles nombres distintos para no confundirlas.
              </p>
            ) : (
              <p>
                Se guardará como <span className="font-semibold text-label">{name}</span>.
              </p>
            )}
            {isCard && (
              <p>
                Con los últimos 4 dígitos la distingues de tus otras tarjetas, y los pagos de Wallet llegan a la correcta. El
                nombre es opcional.
              </p>
            )}
          </>
        }
      >
        {isCard && (
          <FormRow label="Últimos 4 dígitos">
            <TextInput
              inputMode="numeric"
              pattern="[0-9]*"
              className="tnum"
              placeholder="1234"
              value={acc.last4 ?? ''}
              onChange={(e) => set({ last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
          </FormRow>
        )}
        <FormRow label="Nombre" last>
          <TextInput
            value={acc.name ?? ''}
            maxLength={60}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={isCard ? 'Ej. Visa BAC' : ACCOUNT_TYPE_LABEL[type]}
          />
        </FormRow>
      </FormGroup>

      {!details ? (
        <FormGroup>
          <button
            type="button"
            aria-expanded={false}
            onClick={() => setDetails(true)}
            className="flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-card-3"
          >
            <span className="min-w-0 flex-1 truncate text-body">
              {type === 'credito' ? 'Deuda, límite y fechas' : 'Saldo actual'}
            </span>
            <span className="shrink-0 text-body text-label-3">Opcional</span>
            <ChevronDown size={18} strokeWidth={2.25} className="shrink-0 text-label-3" />
          </button>
        </FormGroup>
      ) : (
        <>
          <FormGroup
            footer={
              type === 'credito'
                ? 'Lo que debes hoy. Cada gasto con la tarjeta lo sube y cada pago (Entre cuentas) lo baja.'
                : 'Lo que tiene hoy. Cada gasto lo baja y cada ingreso lo sube, también los que llegan de Wallet.'
            }
          >
            <FormRow label={type === 'credito' ? 'Deuda actual' : 'Saldo actual'} last>
              <ColonesInput
                cents={balance}
                onChange={setBalance}
              />
            </FormRow>
          </FormGroup>
          {type === 'credito' && (
            <FormGroup footer="Con las fechas te avisamos cuántos días faltan para pagar.">
              <FormRow label="Límite">
                <ColonesInput cents={acc.credit_limit ?? null} onChange={(c) => set({ credit_limit: c })} />
              </FormRow>
              <FormRow label="Día de corte">
                <DayInput value={acc.cutoff_day ?? null} onChange={(v) => set({ cutoff_day: v })} />
              </FormRow>
              <FormRow label="Día de pago" last>
                <DayInput value={acc.payment_day ?? null} onChange={(v) => set({ payment_day: v })} />
              </FormRow>
            </FormGroup>
          )}
          {isCard && (
            <FormGroup footer="Solo si en Apple Wallet la tarjeta tiene otro nombre y no muestra los últimos 4 dígitos.">
              <FormRow label="Nombre en Wallet" last>
                <TextInput value={acc.wallet_name ?? ''} maxLength={80} onChange={(e) => set({ wallet_name: e.target.value })} placeholder="Opcional" />
              </FormRow>
            </FormGroup>
          )}
        </>
      )}

      {initial.id && (
        <Button variant="destructive" className="mt-8 w-full" onClick={archive}>
          Archivar cuenta
        </Button>
      )}
    </Sheet>
  );
}
