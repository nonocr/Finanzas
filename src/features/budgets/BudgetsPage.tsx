import { Plus, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AmountSheet } from '../../components/AmountSheet';
import { MonthNav } from '../../components/MonthNav';
import { AnimatedAmount } from '../../components/motion';
import { hexOf } from '../../components/palette';
import { useToast } from '../../components/Toast';
import { budgetTone, Button, CategoryIcon, ProgressBar, Screen, Section } from '../../components/ui';
import { useT } from '../../i18n';
import { addMonths, crDay, isoDate, monthName, monthRange, startOfMonth } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import {
  useBudgetProgress,
  useBudgets,
  useCategories,
  useCopyBudgets,
  useDeleteBudget,
  useLookups,
  useSaveBudget,
  useTransactions,
} from '../../lib/queries';
import { budgetAlert, spendingByCategory, spentAgainstTotal, totalBudget, totals } from '../../lib/stats';
import type { Category } from '../../lib/types';

type Editing = { categoryId: string | null; name: string; cents: number; budgetId?: string; key: number } | null;

export function BudgetsPage() {
  const t = useT();
  const [month, setMonth] = useState(() => startOfMonth(crDay()));
  const monthIso = isoDate(month);
  const { data: progress = [] } = useBudgetProgress(monthIso);
  const { data: budgets = [] } = useBudgets(monthIso);
  const { data: categories = [] } = useCategories();
  const save = useSaveBudget();
  const remove = useDeleteBudget();
  const copy = useCopyBudgets();
  const toast = useToast();
  const [editing, setEditing] = useState<Editing>(null);
  const [open, setOpen] = useState(false);

  const { data: monthTxs = [] } = useTransactions(monthRange(month));
  const total = totalBudget(budgets);
  const { allCategories } = useLookups();
  const slices = useMemo(() => spendingByCategory(monthTxs, allCategories), [monthTxs, allCategories]);
  const spent = spentAgainstTotal(total, budgets, slices, totals(monthTxs).gastos);
  const byCat = useMemo(() => new Map(progress.filter((p) => p.category_id).map((p) => [p.category_id!, p])), [progress]);
  const expenseCats = categories.filter((c) => c.kind === 'gasto' && !c.parent_id);
  const withBudget = expenseCats.filter((c) => byCat.has(c.id));
  const without = expenseCats.filter((c) => !byCat.has(c.id));
  const alerts = withBudget.filter((c) => {
    const p = byCat.get(c.id)!;
    return p.spent / p.limit_amount >= 0.8;
  });
  const prevMonth = addMonths(month, -1);

  const edit = (categoryId: string | null, name: string) => {
    const b = budgets.find((x) => x.category_id === categoryId);
    // El total sin definir arranca desde la suma de categorías, que es lo que se está mostrando.
    const cents = b?.amount ?? (categoryId === null ? total.sum : 0);
    setEditing((prev) => ({ categoryId, name, cents, budgetId: b?.id, key: (prev?.key ?? 0) + 1 }));
    setOpen(true);
  };

  const onSave = async (cents: number) => {
    if (!editing) return;
    await save.mutateAsync({ category_id: editing.categoryId, month: monthIso, amount: cents });
    toast(t.budgets.saved);
    setOpen(false);
  };

  const onDelete = async () => {
    if (!editing?.budgetId) return;
    await remove.mutateAsync(editing.budgetId);
    toast(t.budgets.removed);
    setOpen(false);
  };

  const onCopy = async () => {
    const n = await copy.mutateAsync({ from: isoDate(prevMonth), to: monthIso });
    toast(t.budgets.copied(n, monthName(prevMonth)));
  };

  return (
    <Screen title={t.budgets.title}>
      <MonthNav month={month} onChange={setMonth} />

      <button type="button" onClick={() => edit(null, t.budgets.monthTotal)} className="press black-card mt-4 block w-full rounded-[18px] px-5 pt-5 pb-4 text-left">
        <p className="text-headline font-semibold">{t.budgets.monthTotal}</p>
        {total.limit ? (
          <>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <AnimatedAmount quietCurrency cents={spent} className="engraved text-[40px] leading-[46px] font-light tracking-[-0.03em]" />
              <span className="tnum text-subhead text-label-2">{t.budgets.of(formatCRC(total.limit))}</span>
            </p>
            <div className="mt-3">
              <ProgressBar value={spent / total.limit} />
            </div>
            <p className={'tnum mt-2 text-subhead font-semibold ' + budgetTone(spent / total.limit)}>
              {spent > total.limit ? t.budgets.over(formatCRC(spent - total.limit)) : t.budgets.left(formatCRC(total.limit - spent))}
            </p>
            <p className="mt-1 text-footnote text-label-2">
              {total.source === 'suma'
                ? t.budgets.sourceSum
                : total.source === 'ajustado'
                  ? t.budgets.sourceAdjusted(formatCRC(total.manual!))
                  : t.budgets.sourceManual}
            </p>
          </>
        ) : (
          <p className="mt-1 text-body text-accent">{t.budgets.setTotal}</p>
        )}
      </button>

      {alerts.length > 0 && (
        <div className="mt-3 flex gap-3 rounded-card bg-orange/15 p-4">
          <TriangleAlert size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-orange" />
          <p className="text-subhead">
            {budgetAlert(alerts.map((c) => ({ name: c.name, ratio: byCat.get(c.id)!.spent / byCat.get(c.id)!.limit_amount })))}
          </p>
        </div>
      )}

      {withBudget.length > 0 && (
        <Section
          header={t.budgets.byCategory}
          footer={
            total.source === 'manual' && total.manual! > total.sum
              ? t.budgets.unassigned(formatCRC(total.manual! - total.sum))
              : undefined
          }
        >
          {withBudget.map((c) => (
            <BudgetRow key={c.id} cat={c} spent={byCat.get(c.id)!.spent} limit={byCat.get(c.id)!.limit_amount} onClick={() => edit(c.id, c.name)} />
          ))}
        </Section>
      )}

      {without.length > 0 && (
        <Section header={t.budgets.noBudget}>
          {without.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => edit(c.id, c.name)}
              className="group flex w-full items-center gap-3 pl-4 text-left active:bg-card-2"
            >
              <CategoryIcon icon={c.icon} color={c.color} />
              <span className="flex min-h-11 flex-1 items-center justify-between py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                <span className="text-body">{c.name}</span>
                <Plus size={20} strokeWidth={2.25} className="text-accent" />
              </span>
            </button>
          ))}
        </Section>
      )}

      {budgets.length === 0 && (
        <Button variant="tinted" className="mt-6 w-full" onClick={onCopy} disabled={copy.isPending}>
          {t.budgets.copyFrom(monthName(prevMonth))}
        </Button>
      )}

      {editing && (
        <AmountSheet
          key={editing.key}
          open={open}
          title={editing.name}
          initialCents={editing.cents}
          onSave={onSave}
          onDelete={editing.budgetId ? onDelete : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </Screen>
  );
}

/** Una categoría con su presupuesto: también la usa la sección «Presupuestos» del Resumen. */
export function BudgetRow({ cat, spent, limit, onClick }: { cat: Category; spent: number; limit: number; onClick: () => void }) {
  const t = useT();
  const ratio = spent / limit;
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 pl-4 text-left active:bg-card-2">
      <CategoryIcon icon={cat.icon} color={cat.color} />
      <span className="min-w-0 flex-1 py-3 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-body">{cat.name}</span>
          <span className="tnum text-subhead text-label-2">
            <span className="font-semibold text-label">{formatCRC(spent)}</span> / {formatCRC(limit)}
          </span>
        </span>
        <span className="mt-2 block">
          <ProgressBar value={ratio} color={hexOf(cat.color)} />
        </span>
        <span className={'tnum mt-1 block text-footnote ' + (ratio >= 1 ? 'text-red' : ratio >= 0.8 ? 'text-orange' : 'text-label-2')}>
          {spent > limit
            ? t.budgets.over(formatCRC(spent - limit))
            : spent === limit
              ? t.budgets.atLimit
              : t.budgets.leftPct(formatCRC(limit - spent), Math.round(ratio * 100))}
        </span>
      </span>
    </button>
  );
}
