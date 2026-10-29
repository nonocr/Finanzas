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
import { ColonesInput, DayInput, FormGroup, FormRow, TextInput } from './form';

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
  onClose,
}: {
  open: boolean;
  initial: Partial<Account>;
  others: Account[];
  onClose: () => void;
}) {
  const save = useSaveAccount();
  const toast = useToast();
  const [acc, setAcc] = useState<Partial<Account>>(initial);
  const set = (patch: Partial<Account>) => setAcc((a) => ({ ...a, ...patch }));
  const type = acc.type ?? 'debito';
  const isCard = type === 'credito' || type === 'debito';
  // Lo opcional queda plegado; se abre solo al editar una cuenta que ya tiene esos datos.
  const [details, setDetails] = useState(
    Boolean(initial.initial_balance || initial.credit_limit || initial.cutoff_day || initial.payment_day || initial.wallet_name),
  );
  const name = acc.name?.trim() || fallbackName(type, acc.last4);
  const sameLast4 = isCard && acc.last4?.length === 4 ? others.find((o) => o.last4 === acc.last4) : undefined;
  const sameName = others.find((o) => o.name.toLowerCase() === name.toLowerCase());
  const valid = !sameName && (acc.last4 ?? '').length !== 1 && (acc.last4 ?? '').length < 5;

  const submit = async () => {
    if (!valid) return;
    await save.mutateAsync({
      ...acc,
      type,
      name,
      last4: isCard && acc.last4?.length === 4 ? acc.last4 : null,
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
      <div className="mb-4 flex flex-wrap gap-2">
        {KIND_OPTIONS.map((k) => (
          <button
            key={k.type}
            type="button"
            aria-pressed={k.type === type}
            onClick={() => set({ type: k.type })}
            className={
              'press min-h-11 rounded-full px-4 text-subhead font-semibold ' +
              (k.type === type ? 'bg-label text-black' : 'bg-card-2 text-label')
            }
          >
            {k.label}
          </button>
        ))}
      </div>

      <FormGroup
        footer={
          isCard
            ? 'Con los últimos 4 dígitos la distingues de tus otras tarjetas, y los pagos de Wallet llegan a la correcta. El nombre es opcional.'
            : undefined
        }
      >
        {isCard && (
          <FormRow label="Últimos 4 dígitos">
            <TextInput
              inputMode="numeric"
              pattern="[0-9]*"
              className="tnum"
              placeholder="1234"
              autoFocus={!initial.id}
              value={acc.last4 ?? ''}
              onChange={(e) => set({ last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
          </FormRow>
        )}
        <FormRow label="Nombre" last>
          <TextInput
            value={acc.name ?? ''}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={isCard ? 'Ej. Visa BAC' : ACCOUNT_TYPE_LABEL[type]}
          />
        </FormRow>
      </FormGroup>

      {sameName ? (
        <p className="mt-2 px-1 text-footnote text-red">Ya tienes una cuenta llamada «{sameName.name}». Ponle otro nombre.</p>
      ) : sameLast4 ? (
        <p className="mt-2 px-1 text-footnote text-orange">
          «{sameLast4.name}» también termina en {sameLast4.last4}. Ponles nombres distintos para no confundirlas.
        </p>
      ) : (
        <p className="mt-2 px-1 text-footnote text-label-2">
          Se guardará como <span className="font-semibold text-label">{name}</span>.
        </p>
      )}

      {!details ? (
        <button
          type="button"
          onClick={() => setDetails(true)}
          className="mt-4 flex min-h-11 w-full items-center justify-between rounded-[12px] bg-card-2 px-4 text-body"
        >
          <span className="text-label-2">
            {type === 'credito' ? 'Saldo, límite y fechas de pago (opcional)' : 'Saldo inicial (opcional)'}
          </span>
          <ChevronDown size={18} strokeWidth={2.25} className="text-label-3" />
        </button>
      ) : (
        <>
          <FormGroup footer={type === 'credito' ? 'Lo que debes hoy en la tarjeta.' : 'Lo que tiene hoy, para que el saldo cuadre.'}>
            <FormRow label={type === 'credito' ? 'Deuda actual' : 'Saldo actual'} last>
              <ColonesInput
                cents={acc.initial_balance ? Math.abs(acc.initial_balance) : null}
                onChange={(c) => set({ initial_balance: (type === 'credito' ? -1 : 1) * (c ?? 0) })}
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
                <TextInput value={acc.wallet_name ?? ''} onChange={(e) => set({ wallet_name: e.target.value })} placeholder="Opcional" />
              </FormRow>
            </FormGroup>
          )}
        </>
      )}

      {initial.id && (
        <Button variant="destructive" className="mt-6 w-full" onClick={archive}>
          Archivar cuenta
        </Button>
      )}
    </Sheet>
  );
}
