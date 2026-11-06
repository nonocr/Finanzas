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
import { getLang, useT } from '../../i18n';
import { clockTime, crDay, crDayOf, crInstant, crTimeOf, isoDate, longDate } from '../../lib/dates';
import {
  centsToUsdInput,
  formatRate,
  isSaneRate,
  parseRateInput,
  parseUsdAmount,
  usdInputToCents,
  usdToColonCents,
} from '../../lib/fx';
import { formatCRC } from '../../lib/money';
import {
  useAccounts,
  useCategories,
  useDeleteTransaction,
  useLookups,
  useSaveMerchantRule,
  useSaveTransaction,
  useUsdRate,
} from '../../lib/queries';
import type { Account, Transaction, TxType } from '../../lib/types';

/** Tipo de cambio para el campo, con el separador decimal del idioma (454,41 / 454.41); parseRateInput lee los dos. */
const rateToText = (rate: number) => (getLang() === 'es' ? String(rate).replace('.', ',') : String(rate));

const LAST_ACCOUNT_KEY = 'finanzas-last-account';
export const PICKER_INPUT =
  'absolute inset-0 opacity-0 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full';
const readLastAccount = () => {
  try {
    return localStorage.getItem(LAST_ACCOUNT_KEY);
  } catch {
    return null;
  }
};

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
  const t = useT();
  const typeOptions: { value: TxType; label: string }[] = [
    { value: 'gasto', label: t.transactions.types.expense },
    { value: 'ingreso', label: t.transactions.types.income },
    { value: 'transferencia', label: t.transactions.types.transfer },
  ];
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const saveRule = useSaveMerchantRule();
  const toast = useToast();

  const pending = tx?.status === 'por_revisar';
  // Pago de Wallet que llegó sin monto (el datáfono no lo mandó): hay que escribirlo al confirmarlo.
  const missingAmount = tx?.amount === 0;
  // Cargo en dólares que el servidor no pudo convertir (Hacienda no respondió): se abre en dólares con el monto leído.
  const rawUsd = missingAmount ? parseUsdAmount(tx?.amount_raw) : null;
  const savedUsd = tx?.original_currency === 'USD' && tx.original_amount ? tx.original_amount : null;
  const [type, setType] = useState<TxType>(tx?.type ?? initialType);
  const [colones, setColones] = useState(tx && !missingAmount ? String(Math.round(tx.amount / 100)) : '');
  const [currency, setCurrency] = useState<'CRC' | 'USD'>(savedUsd || rawUsd ? 'USD' : 'CRC');
  const [usdText, setUsdText] = useState(savedUsd || rawUsd ? centsToUsdInput((savedUsd ?? rawUsd)!) : '');
  // null = sin tocar: se usa el tipo de cambio guardado con el movimiento o, si es nuevo, el del día.
  const [rateText, setRateText] = useState<string | null>(savedUsd && tx?.fx_rate ? rateToText(tx.fx_rate) : null);
  const [categoryId, setCategoryId] = useState<string | null>(tx?.category_id ?? null);
  const [accountId, setAccountId] = useState<string | null>(tx?.account_id ?? readLastAccount());
  const [toAccountId, setToAccountId] = useState<string | null>(tx?.to_account_id ?? null);
  const [merchant, setMerchant] = useState(tx?.merchant ?? '');
  const [note, setNote] = useState(tx?.note ?? '');
  const [date, setDate] = useState(isoDate(tx ? crDayOf(tx.occurred_at) : crDay()));
  const [initialTime] = useState(() => crTimeOf(tx ? tx.occurred_at : new Date()));
  const [time, setTime] = useState(initialTime);
  const [remember, setRemember] = useState(pending && Boolean(tx?.merchant));

  const [confirmDelete, setConfirmDelete] = useState(false);
  // Un movimiento de una cuenta archivada conserva su cuenta al editarlo (antes pasaba a la primera de la lista).
  const { accMap } = useLookups();
  const choices = useMemo(() => {
    const ids = [tx?.account_id, tx?.to_account_id].filter((id): id is string => !!id && !accounts.some((a) => a.id === id));
    return [...accounts, ...ids.map((id) => accMap.get(id)).filter((a): a is Account => !!a)];
  }, [accounts, accMap, tx]);
  const account = choices.find((a) => a.id === accountId) ?? accounts[0];
  const cats = useMemo(
    () => categories.filter((c) => c.kind === (type === 'ingreso' ? 'ingreso' : 'gasto') && !c.parent_id),
    [categories, type],
  );
  const isTransfer = type === 'transferencia';
  const inUsd = currency === 'USD' && !isTransfer;
  const { data: liveRate, isFetching: fetchingRate } = useUsdRate(inUsd && rateText === null);
  const rateShown = rateText ?? (liveRate ? rateToText(liveRate.rate) : '');
  const rate = parseRateInput(rateShown);
  const rateOk = rate !== null && isSaneRate(rate);
  const usdCents = usdInputToCents(usdText);
  const cents = inUsd ? (rateOk ? usdToColonCents(usdCents, rate) : 0) : Number(colones || '0') * 100;
  const destination = choices.find((a) => a.id === toAccountId);
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
    // Sin tocar fecha ni hora se conserva el instante original (con sus segundos); una hora futura queda en "ahora".
    const untouched = time === initialTime && date === (tx ? isoDate(crDayOf(tx.occurred_at)) : today);
    const now = new Date().toISOString();
    const chosen = crInstant(date, time);
    const occurred_at = untouched ? (tx?.occurred_at ?? now) : chosen > now ? now : chosen;
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
      original_currency: inUsd ? 'USD' : null,
      original_amount: inUsd ? usdCents : null,
      fx_rate: inUsd ? rate : null,
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
        ? t.transactions.toastConfirmed
        : t.transactions.toastChanges
      : type === 'ingreso'
        ? t.transactions.toastIncome
        : isTransfer
          ? t.transactions.toastTransfer
          : t.transactions.toastExpense;
    toast(onlineManager.isOnline() ? done : t.transactions.toastOffline(done));
    onClose();
  };

  const destroy = () => {
    if (!tx) return;
    remove.mutate(tx.id);
    toast(onlineManager.isOnline() ? t.transactions.toastDeleted : t.transactions.toastDeletedOffline);
    onClose();
  };

  const title = pending
    ? t.transactions.titleReview
    : tx
      ? t.common.edit
      : type === 'ingreso'
        ? t.transactions.titleNewIncome
        : isTransfer
          ? t.transactions.types.transfer
          : t.transactions.titleNewExpense;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={title}
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
          {pending ? t.transactions.confirm : t.common.save}
        </button>
      }
    >
      {pending && (
        <div className="mb-4 flex items-center gap-3 rounded-[12px] bg-accent/12 px-3.5 py-3 text-subhead text-label">
          <Smartphone size={20} strokeWidth={2} className="shrink-0 text-accent" />
          <span>
            {t.transactions.walletArrived}
            {tx?.note ? ` (${tx.note.replace(/^Wallet · /, '')})` : ''}
            {savedUsd || rawUsd
              ? t.transactions.walletUsd(savedUsd && tx?.fx_rate ? formatRate(tx.fx_rate) : null)
              : missingAmount
                ? tx?.amount_raw
                  ? t.transactions.walletUnreadable(tx.amount_raw)
                  : t.transactions.walletNoAmount
                : t.transactions.walletPickCategory}
          </span>
        </div>
      )}

      {!tx && (
        <Segmented
          options={typeOptions}
          value={type}
          onChange={(next) => {
            // La categoría elegida es de gastos o de ingresos: al cambiar de tipo deja de valer y quedaría escondida.
            if ((next === 'ingreso') !== (type === 'ingreso')) setCategoryId(null);
            setType(next);
          }}
        />
      )}
      {isTransfer && (
        <p className="mt-2 px-1 text-footnote text-label-2">
          {t.transactions.transferHint}
        </p>
      )}

      <div className="mt-5">
        {inUsd ? (
          <AmountInput
            currency="USD"
            value={usdText}
            onChange={setUsdText}
            autoFocus={(!tx || missingAmount) && !rawUsd}
            tone={type === 'ingreso' ? 'ingreso' : undefined}
          />
        ) : (
          <AmountInput value={colones} onChange={setColones} autoFocus={!tx || missingAmount} tone={type === 'ingreso' ? 'ingreso' : undefined} />
        )}
      </div>

      {!isTransfer && (
        <div className="mx-auto mt-3 w-56">
          <Segmented
            options={[
              { value: 'CRC', label: t.transactions.colones },
              { value: 'USD', label: t.transactions.dollars },
            ]}
            value={currency}
            onChange={setCurrency}
          />
        </div>
      )}

      {inUsd && (
        <>
          <div className="mt-4 overflow-hidden rounded-[12px] bg-card-2">
            <Field label={t.transactions.exchangeRate}>
              <input
                inputMode="decimal"
                value={rateShown}
                onChange={(e) => setRateText(e.target.value.replace(/[^\d.,]/g, '').slice(0, 9))}
                placeholder={fetchingRate ? t.transactions.searching : getLang() === 'es' ? '₡0,00' : '₡0.00'}
                aria-label={t.transactions.exchangeRateLabel}
                className="tnum w-full bg-transparent text-right text-body outline-none placeholder:text-label-3"
                autoComplete="off"
              />
            </Field>
            <Field label={t.transactions.inColones} last>
              <span className="tnum text-body font-semibold">{cents > 0 ? formatCRC(cents) : '—'}</span>
            </Field>
          </div>
          <p className="mt-2 px-4 text-footnote text-pretty text-label-2">
            {rateShown && !rateOk
              ? t.transactions.rateInvalid
              : rateText !== null || savedUsd
                ? t.transactions.rateBankNote
                : liveRate
                  ? t.transactions.rateBccr(liveRate.date)
                  : fetchingRate
                    ? t.transactions.rateFetching
                    : t.transactions.rateFailed}
          </p>
        </>
      )}

      {!isTransfer && (
        <Group label={t.transactions.category}>
          <CategoryGrid categories={cats} selected={categoryId} onSelect={setCategoryId} />
        </Group>
      )}

      <Group label={isTransfer ? t.transactions.from : type === 'ingreso' ? t.transactions.incomeTo : t.transactions.paidWith}>
        <AccountChips accounts={choices} selected={account?.id} onSelect={setAccountId} />
      </Group>

      {isTransfer && (
        <Group label={t.transactions.to} icon={<ArrowRight size={14} strokeWidth={2.25} />}>
          <AccountChips
            accounts={choices.filter((a) => a.id !== account?.id)}
            selected={toAccountId ?? undefined}
            onSelect={setToAccountId}
          />
        </Group>
      )}

      <div className="mt-5 overflow-hidden rounded-[12px] bg-card-2">
        <Field label={isTransfer ? t.transactions.description : type === 'ingreso' ? t.transactions.source : t.transactions.merchant}>
          <input
            value={merchant}
            maxLength={200}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder={isTransfer ? t.transactions.placeholderTransfer : type === 'ingreso' ? t.transactions.placeholderIncome : t.transactions.placeholderExpense}
            className="w-full bg-transparent text-right text-body outline-none placeholder:text-label-3"
            autoComplete="off"
          />
        </Field>
        <Field label={t.transactions.date}>
          {/* Pastilla de fecha al estilo iOS; el input nativo queda encima, transparente, para abrir el selector. */}
          <span className="relative inline-flex">
            <span className="rounded-[8px] bg-card-3 px-3 py-1.5 text-body">
              {date === today ? t.transactions.today : longDate(new Date(date + 'T00:00:00Z'))}
            </span>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              aria-label={t.transactions.date}
              className={PICKER_INPUT}
            />
          </span>
        </Field>
        <Field label={t.transactions.time}>
          <span className="relative inline-flex">
            <span className="tnum rounded-[8px] bg-card-3 px-3 py-1.5 text-body">{clockTime(time)}</span>
            <input
              type="time"
              value={time}
              onChange={(e) => e.target.value && setTime(e.target.value.slice(0, 5))}
              aria-label={t.transactions.time}
              className={PICKER_INPUT}
            />
          </span>
        </Field>
        <Field label={t.transactions.note} last>
          <input
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.transactions.optional}
            className="w-full bg-transparent text-right text-body outline-none placeholder:text-label-3"
            autoComplete="off"
          />
        </Field>
      </div>

      {pending && tx?.merchant && (
        <label className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-[12px] bg-card-2 px-4 py-2.5">
          <span className="text-body">
            {t.transactions.rememberRule} <span className="font-semibold">{tx.merchant}</span>
          </span>
          <Toggle checked={remember} onChange={setRemember} />
        </label>
      )}

      {tx &&
        (confirmDelete ? (
          <div className="mt-6 rounded-[12px] bg-red/15 p-4">
            <p className="text-subhead">{t.transactions.confirmDelete}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="plain" className="flex-1" onClick={() => setConfirmDelete(false)}>
                {t.common.cancel}
              </Button>
              <Button className="flex-1 !bg-red" onClick={destroy} disabled={remove.isPending}>
                {t.common.delete}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="destructive" className="mt-6 w-full" onClick={() => setConfirmDelete(true)}>
            {t.transactions.deleteTransaction}
          </Button>
        ))}
    </Sheet>
  );
}

function Group({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 flex items-center gap-1 px-1 text-subhead font-semibold text-label">
        {label}
        {icon}
      </p>
      {children}
    </div>
  );
}

export function AccountChips({
  accounts,
  selected,
  onSelect,
}: {
  accounts: Account[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    // Cada medio de pago es una tarjeta negra en miniatura, con sus últimos 4 dígitos grabados.
    <div className="grid grid-cols-3 gap-2">
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
              'press black-card flex h-16 min-w-0 flex-col justify-between rounded-[10px] px-2.5 py-2 text-left',
              on && 'ring-[1.5px] ring-accent',
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <Icon size={15} strokeWidth={1.9} className={on ? 'shrink-0 text-accent' : 'shrink-0 text-label-2'} />
              <span className={clsx('truncate text-footnote font-semibold', on ? 'text-label' : 'text-label-2')}>{a.name}</span>
            </span>
            <span className="tnum engraved text-caption tracking-[0.08em]">{a.last4 ? `•••• ${a.last4}` : ' '}</span>
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

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-accent' : 'bg-fill-2',
      )}
    >
      <span
        className="absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.5),0_3px_8px_rgb(0_0_0/0.35)] transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}
