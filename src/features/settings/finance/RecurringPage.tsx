import { useMemo, useState } from 'react';
import { AmountInput } from '../../../components/AmountInput';
import { CategoryGrid } from '../../../components/CategoryGrid';
import { Segmented } from '../../../components/motion';
import { Sheet } from '../../../components/Sheet';
import { useToast } from '../../../components/Toast';
import { Button, CategoryIcon, EmptyState, Row, Screen, Section } from '../../../components/ui';
import { useT, type Strings } from '../../../i18n';
import { crDay, isoDate, longDate, shortDate } from '../../../lib/format/dates';
import { formatCRC } from '../../../lib/format/money';
import { useAccounts, useCategories, useDeleteRecurring, useLookups, useRecurring, useSaveRecurring } from '../../../lib/data/queries';
import { monthlyAmount, parseDay, scheduleLabel } from '../../../lib/finance/recurring';
import type { Frequency, Recurring } from '../../../lib/data/types';
import { AccountChips, PICKER_INPUT, Toggle } from '../../transactions/TransactionSheet';
import { BackLink } from '../MorePage';
import { FormGroup, FormHeader, FormRow, TextInput } from '../form';

/** «Hoy», «Mañana», «En 5 días» o la fecha si falta más de dos semanas. */
function whenLabel(t: Strings, next: string, today: Date) {
  const days = Math.round((parseDay(next).getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return t.recurring.today;
  if (days === 1) return t.recurring.tomorrow;
  if (days <= 14) return t.recurring.inDays(days);
  return shortDate(parseDay(next));
}

const signed = (r: Pick<Recurring, 'type' | 'amount'>) => (r.type === 'gasto' ? formatCRC(-r.amount) : formatCRC(r.amount, { sign: true }));

export function RecurringPage() {
  const t = useT();
  const { data: list = [], isLoading } = useRecurring();
  const { catMap } = useLookups();
  const [editing, setEditing] = useState<{ rec: Partial<Recurring>; key: number } | null>(null);
  const [open, setOpen] = useState(false);
  const today = crDay();

  const openEditor = (rec: Partial<Recurring>) => {
    setEditing((prev) => ({ rec, key: (prev?.key ?? 0) + 1 }));
    setOpen(true);
  };

  const active = list.filter((r) => r.active);
  const paused = list.filter((r) => !r.active);
  const perMonth = (type: Recurring['type']) => active.filter((r) => r.type === type).reduce((s, r) => s + monthlyAmount(r), 0);
  const gastos = perMonth('gasto');
  const ingresos = perMonth('ingreso');

  const row = (r: Recurring) => {
    const c = r.category_id ? catMap.get(r.category_id) : undefined;
    return (
      <Row
        key={r.id}
        onClick={() => openEditor(r)}
        leading={<CategoryIcon icon={c?.icon ?? null} color={c?.color ?? null} />}
        title={r.name}
        subtitle={`${r.active ? whenLabel(t, r.next_date, today) : t.recurring.paused} · ${t.recurring.frequency[r.frequency]}`}
        trailing={<span className={'tnum font-semibold ' + (r.type === 'ingreso' ? 'text-green' : 'text-label')}>{signed(r)}</span>}
        chevron
      />
    );
  };

  return (
    <Screen title={t.recurring.title} subtitle={<BackLink />}>
      <p className="px-1 text-subhead text-label-2">
        {t.recurring.intro}
      </p>

      {active.length > 0 && (
        <section className="machined mt-4 rounded-card bg-card p-4">
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-footnote text-label-2">{t.recurring.expensesPerMonth}</dt>
              <dd className="tnum engraved mt-1 text-title3 font-light">{formatCRC(gastos)}</dd>
            </div>
            <div>
              <dt className="text-footnote text-label-2">{t.recurring.incomePerMonth}</dt>
              <dd className="tnum mt-1 text-title3 font-light text-green">{formatCRC(ingresos)}</dd>
            </div>
          </dl>
        </section>
      )}

      <Section header={t.recurring.upcoming}>
        {isLoading ? null : active.length === 0 ? (
          <EmptyState title={t.recurring.emptyTitle} body={t.recurring.emptyBody} />
        ) : (
          active.map(row)
        )}
      </Section>

      <Button variant="tinted" className="mt-6 w-full" onClick={() => openEditor({ type: 'gasto', frequency: 'mensual', active: true })}>
        {t.recurring.add}
      </Button>

      {paused.length > 0 && (
        <Section header={t.recurring.paused} footer={t.recurring.pausedFooter}>
          {paused.map(row)}
        </Section>
      )}

      {editing && <RecurringSheet key={editing.key} open={open} initial={editing.rec} onClose={() => setOpen(false)} />}
    </Screen>
  );
}

const FREQUENCIES: Frequency[] = ['semanal', 'quincenal', 'mensual', 'anual'];

function RecurringSheet({ open, initial, onClose }: { open: boolean; initial: Partial<Recurring>; onClose: () => void }) {
  const t = useT();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { accMap } = useLookups();
  const save = useSaveRecurring();
  const remove = useDeleteRecurring();
  const toast = useToast();
  const today = isoDate(crDay());

  const [type, setType] = useState<Recurring['type']>(initial.type ?? 'gasto');
  const [colones, setColones] = useState(initial.amount ? String(Math.round(initial.amount / 100)) : '');
  const [name, setName] = useState(initial.name ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(initial.category_id ?? null);
  const [accountId, setAccountId] = useState<string | null>(initial.account_id ?? null);
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency ?? 'mensual');
  const [date, setDate] = useState(initial.next_date ?? today);
  const [active, setActive] = useState(initial.active ?? true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Una cuenta archivada sigue a la vista si el fijo ya la usa.
  const choices = useMemo(() => {
    const extra = initial.account_id && !accounts.some((a) => a.id === initial.account_id) ? accMap.get(initial.account_id) : undefined;
    return extra ? [...accounts, extra] : accounts;
  }, [accounts, accMap, initial.account_id]);
  const account = choices.find((a) => a.id === accountId) ?? accounts[0];
  const cats = useMemo(() => categories.filter((c) => c.kind === type && !c.parent_id), [categories, type]);
  const cents = Number(colones || '0') * 100;
  const valid = cents > 0 && name.trim() !== '' && Boolean(account);
  // Al cambiar la fecha, el día elegido pasa a ser el de la fecha nueva; si no, se conserva (un 31 que hoy cae el 30).
  const anchor = date === initial.next_date && initial.anchor_day ? initial.anchor_day : parseDay(date).getUTCDate();
  const past = active && date < today;

  const submit = async () => {
    if (!valid || !account) return;
    const created = await save.mutateAsync({
      id: initial.id,
      name: name.trim(),
      type,
      amount: cents,
      account_id: account.id,
      category_id: categoryId,
      frequency,
      next_date: date,
      anchor_day: anchor,
      active,
    });
    const done = initial.id ? t.recurring.changesSaved : t.recurring.added(name.trim());
    toast(created > 0 ? `${done} · ${t.recurring.charged(created)}` : done);
    onClose();
  };

  const destroy = async () => {
    if (!initial.id) return;
    await remove.mutateAsync(initial.id);
    toast(t.recurring.deleted);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={initial.id ? t.recurring.edit : type === 'ingreso' ? t.recurring.newIncome : t.recurring.newExpense}
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
      <Segmented
        options={[
          { value: 'gasto', label: t.recurring.expense },
          { value: 'ingreso', label: t.recurring.income },
        ]}
        value={type}
        onChange={(k) => {
          if (k !== type) setCategoryId(null); // las categorías de gasto e ingreso son distintas
          setType(k);
        }}
      />

      <div className="mt-5">
        <AmountInput value={colones} onChange={setColones} autoFocus={!initial.id} tone={type === 'ingreso' ? 'ingreso' : undefined} />
      </div>

      <FormGroup className="mt-5">
        <FormRow label={t.recurring.name} last>
          <TextInput value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={type === 'ingreso' ? t.recurring.incomePlaceholder : t.recurring.expensePlaceholder} />
        </FormRow>
      </FormGroup>

      <div className="mt-6">
        <FormHeader>{t.recurring.category}</FormHeader>
        <CategoryGrid categories={cats} selected={categoryId} onSelect={setCategoryId} />
      </div>

      <div className="mt-6">
        <FormHeader>{type === 'ingreso' ? t.recurring.depositTo : t.recurring.paidWith}</FormHeader>
        <AccountChips accounts={choices} selected={account?.id} onSelect={setAccountId} />
      </div>

      <div className="mt-6">
        <FormHeader>{t.recurring.repeatsEvery}</FormHeader>
        <Segmented options={FREQUENCIES.map((f) => ({ value: f, label: t.recurring.every[f] }))} value={frequency} onChange={setFrequency} />
      </div>

      <FormGroup
        footer={
          <>
            <p>{scheduleLabel({ next_date: date, frequency, anchor_day: anchor })}.</p>
            {past ? (
              <p className="text-orange">{t.recurring.pastDate}</p>
            ) : (
              !initial.id && <p>{t.recurring.alreadyThisMonth}</p>
            )}
          </>
        }
      >
        <FormRow label={t.recurring.nextCharge} last>
          <span className="relative inline-flex">
            <span className="rounded-[8px] bg-card-3 px-3 py-1.5 text-body">{date === today ? t.recurring.today : longDate(parseDay(date))}</span>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label={t.recurring.nextCharge} className={PICKER_INPUT} />
          </span>
        </FormRow>
      </FormGroup>

      {initial.id && (
        <FormGroup footer={t.recurring.activeFooter}>
          <FormRow label={t.recurring.active} last>
            <span className="flex w-full justify-end">
              <Toggle checked={active} onChange={setActive} />
            </span>
          </FormRow>
        </FormGroup>
      )}

      {initial.id &&
        (confirmDelete ? (
          <div className="mt-6 rounded-[12px] bg-red/15 p-4">
            <p className="text-subhead">{t.recurring.confirmDelete}</p>
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
            {t.recurring.delete}
          </Button>
        ))}
    </Sheet>
  );
}
