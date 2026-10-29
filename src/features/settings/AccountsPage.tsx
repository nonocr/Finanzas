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
        Agregar cuenta o tarjeta
      </Button>

      {editing && (
        <AccountSheet key={editing.key} open={open} initial={editing.acc} onClose={() => setOpen(false)} />
      )}
    </Screen>
  );
}

function AccountSheet({ open, initial, onClose }: { open: boolean; initial: Partial<Account>; onClose: () => void }) {
  const save = useSaveAccount();
  const toast = useToast();
  const [acc, setAcc] = useState<Partial<Account>>(initial);
  const set = (patch: Partial<Account>) => setAcc((a) => ({ ...a, ...patch }));
  const type = acc.type ?? 'debito';
  const isCard = type === 'credito' || type === 'debito';

  const submit = async () => {
    await save.mutateAsync({
      ...acc,
      name: acc.name?.trim(),
      last4: acc.last4 || null,
      wallet_name: acc.wallet_name?.trim() || null,
    });
    toast(initial.id ? 'Cuenta actualizada' : 'Cuenta agregada');
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
          className="min-h-11 text-body font-semibold text-blue disabled:text-label-3"
          disabled={!acc.name?.trim() || save.isPending}
          onClick={submit}
        >
          Guardar
        </button>
      }
    >
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {(Object.keys(ACCOUNT_TYPE_LABEL) as AccountType[]).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={t === type}
            onClick={() => set({ type: t })}
            className={
              'press min-h-11 shrink-0 rounded-full px-4 text-subhead font-semibold ' +
              (t === type ? 'bg-label text-black' : 'bg-card-2 text-label')
            }
          >
            {ACCOUNT_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <FormGroup>
        <FormRow label="Nombre">
          <TextInput value={acc.name ?? ''} onChange={(e) => set({ name: e.target.value })} placeholder="Visa BAC" />
        </FormRow>
        <FormRow label={type === 'credito' ? 'Deuda inicial' : 'Saldo inicial'} last={!isCard}>
          <ColonesInput
            cents={acc.initial_balance ? Math.abs(acc.initial_balance) : null}
            onChange={(c) => set({ initial_balance: (type === 'credito' ? -1 : 1) * (c ?? 0) })}
          />
        </FormRow>
        {isCard && (
          <FormRow label="Últimos 4 dígitos" last>
            <TextInput
              inputMode="numeric"
              className="tnum"
              placeholder="1234"
              value={acc.last4 ?? ''}
              onChange={(e) => set({ last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
          </FormRow>
        )}
      </FormGroup>

      {isCard && (
        <FormGroup footer="Escribe el nombre tal como aparece la tarjeta en Apple Wallet; así los pagos del Atajo llegan a esta cuenta.">
          <FormRow label="Nombre en Wallet" last>
            <TextInput value={acc.wallet_name ?? ''} onChange={(e) => set({ wallet_name: e.target.value })} placeholder="Visa BAC" />
          </FormRow>
        </FormGroup>
      )}

      {type === 'credito' && (
        <FormGroup footer="Con estas fechas te avisamos cuántos días faltan para pagar.">
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

      {initial.id && (
        <Button variant="destructive" className="mt-6 w-full" onClick={archive}>
          Archivar cuenta
        </Button>
      )}
    </Sheet>
  );
}
