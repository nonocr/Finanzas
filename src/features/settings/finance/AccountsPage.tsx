import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ACCOUNT_ICONS } from '../../../components/palette';
import { Sheet } from '../../../components/Sheet';
import { useToast } from '../../../components/Toast';
import { Button, IconTile, Row, Screen, Section } from '../../../components/ui';
import { QuietColon } from '../../../components/motion';
import { useT, type Strings } from '../../../i18n';
import { crDay } from '../../../lib/format/dates';
import { formatCRC } from '../../../lib/format/money';
import { useAccounts, useArchivedAccounts, useBalances, useSaveAccount } from '../../../lib/data/queries';
import type { Account, AccountType } from '../../../lib/data/types';
import { Toggle } from '../../transactions/TransactionSheet';
import { BackLink } from '../MorePage';
import { ColonesInput, DayInput, FormGroup, FormHeader, FormRow, TextInput } from '../form';

// El efectivo va en topo (el color del billete), no en verde: el verde significa «ingreso».
const TYPE_COLOR: Record<AccountType, string> = {
  efectivo: 'var(--color-brown)',
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
  const t = useT();
  const { data: accounts = [] } = useAccounts();
  const { data: archived = [] } = useArchivedAccounts();
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
    <Screen title={t.accounts.title} subtitle={<BackLink />}>
      <div className="black-card rounded-[18px] px-5 pt-5 pb-5">
        <p className="text-headline font-semibold">{t.accounts.netWorth}</p>
        <p className={'tnum mt-3 text-[40px] leading-[46px] font-light tracking-[-0.03em] ' + (net < 0 ? 'text-red' : 'engraved')}>
          {net < 0 ? formatCRC(net) : <><QuietColon />{formatCRC(net).replace('₡', '')}</>}
        </p>
      </div>

      <Section header={t.accounts.cashAndBanks}>
        {others.map((a) => (
          <Row
            key={a.id}
            onClick={() => openEditor(a)}
            leading={<IconTile icon={ACCOUNT_ICONS[a.type]} color={TYPE_COLOR[a.type]} />}
            title={a.name}
            subtitle={t.accounts.types[a.type] + (a.last4 ? ` · •••${a.last4}` : '')}
            trailing={<span className="tnum font-semibold text-label">{formatCRC(balanceOf.get(a.id) ?? 0)}</span>}
            chevron
          />
        ))}
      </Section>

      {cards.length > 0 && (
        <Section header={t.accounts.creditCards}>
          {cards.map((a) => {
            const debt = -(balanceOf.get(a.id) ?? 0);
            const parts = [
              a.last4 ? `•••${a.last4}` : null,
              a.payment_day ? t.accounts.paymentIn(daysUntil(a.payment_day)) : null,
              a.cutoff_day ? t.accounts.cutoffOn(a.cutoff_day) : null,
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
                      {debt > 0 ? formatCRC(debt) : t.accounts.upToDate}
                    </span>
                    {a.credit_limit && debt > 0 && (
                      <span className="tnum block text-footnote text-label-2">
                        {t.accounts.ofLimit(Math.round((debt / a.credit_limit) * 100))}
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
        {t.accounts.add}
      </Button>

      {archived.length > 0 && (
        <Section header={t.accounts.archived} footer={t.accounts.archivedFooter}>
          {archived.map((a) => (
            <Row
              key={a.id}
              onClick={() => openEditor(a)}
              leading={
                <span className="opacity-50">
                  <IconTile icon={ACCOUNT_ICONS[a.type]} color={TYPE_COLOR[a.type]} />
                </span>
              }
              title={<span className="text-label-2">{a.name}</span>}
              subtitle={t.accounts.types[a.type] + (a.last4 ? ` · •••${a.last4}` : '')}
              chevron
            />
          ))}
        </Section>
      )}

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

/** Orden del selector de tipo; el nombre largo de cada uno sale de t.accounts.kinds. */
const KIND_ORDER: AccountType[] = ['debito', 'credito', 'efectivo', 'banco', 'ahorro'];

/** Nombre que se guarda si no se escribió uno: lo justo para distinguirla. */
const fallbackName = (t: Strings, type: AccountType, last4: string | null | undefined) =>
  last4 && (type === 'debito' || type === 'credito')
    ? t.accounts.fallbackCardName(type === 'credito', last4)
    : t.accounts.types[type];

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
  const t = useT();
  const save = useSaveAccount();
  const toast = useToast();
  const [acc, setAcc] = useState<Partial<Account>>(initial);
  const set = (patch: Partial<Account>) => setAcc((a) => ({ ...a, ...patch }));
  const type = acc.type ?? 'debito';
  const isCard = type === 'credito' || type === 'debito';
  // El campo muestra el saldo de HOY; al guardar se ajusta el saldo inicial para que hoy cuadre.
  const startBalance = initial.id ? (currentBalance ?? 0) : (initial.initial_balance ?? 0);
  const [balance, setBalance] = useState<number | null>(startBalance ? Math.abs(startBalance) : null);
  // El campo muestra el monto sin signo. El signo "raro" (sobregiro, o saldo a favor en la tarjeta) se conserva aparte;
  // si no, editar solo el nombre de una cuenta en negativo la pasaría a positivo.
  const [inverted, setInverted] = useState(startBalance !== 0 && Math.sign(startBalance) !== (initial.type === 'credito' ? -1 : 1));
  // Lo opcional queda plegado; se abre solo al editar una cuenta que ya tiene esos datos.
  const [details, setDetails] = useState(
    Boolean(startBalance || initial.credit_limit || initial.cutoff_day || initial.payment_day || initial.wallet_name),
  );
  const name = acc.name?.trim() || fallbackName(t, type, acc.last4);
  const last4Len = (acc.last4 ?? '').length;
  const sameLast4 = isCard && last4Len === 4 ? others.find((o) => o.last4 === acc.last4) : undefined;
  const sameName = others.find((o) => o.name.toLowerCase() === name.toLowerCase());
  const valid = !sameName && (last4Len === 0 || last4Len === 4);

  const submit = async () => {
    if (!valid) return;
    const desired = (type === 'credito' ? -1 : 1) * (inverted ? -1 : 1) * (balance ?? 0);
    const initial_balance = initial.id ? (initial.initial_balance ?? 0) + (desired - (currentBalance ?? 0)) : desired;
    await save.mutateAsync({
      ...acc,
      type,
      name,
      initial_balance,
      last4: isCard && last4Len === 4 ? acc.last4 : null,
      wallet_name: acc.wallet_name?.trim() || null,
    });
    toast(initial.id ? t.accounts.updated : t.accounts.added(name));
    onClose();
  };

  const setArchived = async (archived: boolean) => {
    await save.mutateAsync({ id: initial.id, archived });
    toast(archived ? t.accounts.archivedToast : t.accounts.reactivatedToast);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={initial.id ? t.accounts.edit : t.accounts.new}
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          {t.common.cancel}
        </button>
      }
      trailing={
        <button
          type="button"
          className="press metal min-h-9 rounded-full px-4 text-body font-semibold disabled:bg-none disabled:bg-fill disabled:text-label-3 disabled:shadow-none"
          disabled={!valid || save.isPending}
          onClick={submit}
        >
          {t.common.save}
        </button>
      }
    >
      {/* Selector de tipo: una fila de cinco mosaicos con el mismo ícono y color que en la lista de cuentas. */}
      <FormHeader>{t.accounts.type}</FormHeader>
      <div className="grid grid-cols-5 gap-1.5">
        {KIND_ORDER.map((k) => {
          const on = k === type;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              aria-label={t.accounts.kinds[k]}
              onClick={() => set({ type: k })}
              className={clsx(
                'press flex min-w-0 flex-col items-center gap-2 rounded-[12px] px-0.5 pt-3 pb-2.5 text-footnote font-semibold',
                on ? 'metal' : 'bg-card-2 text-label-2',
              )}
            >
              <IconTile icon={ACCOUNT_ICONS[k]} color={TYPE_COLOR[k]} size={32} />
              <span className="max-w-full truncate">{t.accounts.types[k]}</span>
            </button>
          );
        })}
      </div>

      <FormGroup
        footer={
          <>
            {sameName ? (
              <p className="text-red">{t.accounts.sameName(sameName.name)}</p>
            ) : sameLast4 ? (
              <p className="text-orange">{t.accounts.sameLast4(sameLast4.name, sameLast4.last4 ?? '')}</p>
            ) : (
              <p>
                {t.accounts.savedAsBefore}
                <span className="font-semibold text-label">{name}</span>
                {t.accounts.savedAsAfter}
              </p>
            )}
            {isCard && <p>{t.accounts.last4Help}</p>}
          </>
        }
      >
        {isCard && (
          <FormRow label={t.accounts.last4}>
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
        <FormRow label={t.accounts.name} last>
          <TextInput
            value={acc.name ?? ''}
            maxLength={60}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={isCard ? t.accounts.namePlaceholder : t.accounts.types[type]}
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
              {type === 'credito' ? t.accounts.creditDetails : t.accounts.currentBalance}
            </span>
            <span className="shrink-0 text-body text-label-3">{t.accounts.optional}</span>
            <ChevronDown size={18} strokeWidth={2.25} className="shrink-0 text-label-3" />
          </button>
        </FormGroup>
      ) : (
        <>
          <FormGroup footer={type === 'credito' ? t.accounts.creditBalanceFooter : t.accounts.balanceFooter}>
            <FormRow
              label={
                type === 'credito'
                  ? inverted
                    ? t.accounts.creditInFavor
                    : t.accounts.currentDebt
                  : t.accounts.currentBalance
              }
            >
              <ColonesInput cents={balance} onChange={setBalance} />
            </FormRow>
            <FormRow label={type === 'credito' ? t.accounts.overpaid : t.accounts.overdrawn} last>
              <span className="flex w-full justify-end">
                <Toggle checked={inverted} onChange={setInverted} />
              </span>
            </FormRow>
          </FormGroup>
          {type === 'credito' && (
            <FormGroup footer={t.accounts.datesFooter}>
              <FormRow label={t.accounts.limit}>
                <ColonesInput cents={acc.credit_limit ?? null} onChange={(c) => set({ credit_limit: c })} />
              </FormRow>
              <FormRow label={t.accounts.cutoffDay}>
                <DayInput value={acc.cutoff_day ?? null} onChange={(v) => set({ cutoff_day: v })} />
              </FormRow>
              <FormRow label={t.accounts.paymentDay} last>
                <DayInput value={acc.payment_day ?? null} onChange={(v) => set({ payment_day: v })} />
              </FormRow>
            </FormGroup>
          )}
          {isCard && (
            <FormGroup footer={t.accounts.walletNameFooter}>
              <FormRow label={t.accounts.walletName} last>
                <TextInput
                  value={acc.wallet_name ?? ''}
                  maxLength={80}
                  onChange={(e) => set({ wallet_name: e.target.value })}
                  placeholder={t.accounts.optional}
                />
              </FormRow>
            </FormGroup>
          )}
        </>
      )}

      {initial.id &&
        (initial.archived ? (
          <Button variant="tinted" className="mt-8 w-full" onClick={() => setArchived(false)}>
            {t.accounts.reactivate}
          </Button>
        ) : (
          <Button variant="destructive" className="mt-8 w-full" onClick={() => setArchived(true)}>
            {t.accounts.archive}
          </Button>
        ))}
    </Sheet>
  );
}
