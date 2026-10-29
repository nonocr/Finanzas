import { Plus, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AmountSheet } from '../../components/AmountSheet';
import { MonthNav } from '../../components/MonthNav';
import { AnimatedAmount } from '../../components/motion';
import { hexOf } from '../../components/palette';
import { useToast } from '../../components/Toast';
import { budgetTone, Button, CategoryIcon, ProgressBar, Screen, Section } from '../../components/ui';
import { addMonths, crDay, isoDate, monthName, startOfMonth } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import {
  useBudgetProgress,
  useBudgets,
  useCategories,
  useCopyBudgets,
  useDeleteBudget,
  useSaveBudget,
} from '../../lib/queries';
import type { Category } from '../../lib/types';

type Editing = { categoryId: string | null; name: string; cents: number; budgetId?: string; key: number } | null;

export function BudgetsPage() {
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

  const total = progress.find((p) => p.category_id === null);
  const byCat = useMemo(() => new Map(progress.filter((p) => p.category_id).map((p) => [p.category_id!, p])), [progress]);
  const expenseCats = categories.filter((c) => c.kind === 'gasto' && !c.parent_id);
  const withBudget = expenseCats.filter((c) => byCat.has(c.id));
  const without = expenseCats.filter((c) => !byCat.has(c.id));
  const alerts = withBudget.filter((c) => {
    const p = byCat.get(c.id)!;
    return p.spent / p.limit_amount >= 0.8;
  });
  const prevMonth = addMonths(month, -1);
  const sumCategories = withBudget.reduce((s, c) => s + byCat.get(c.id)!.limit_amount, 0);

  const edit = (categoryId: string | null, name: string) => {
    const b = budgets.find((x) => x.category_id === categoryId);
    setEditing((prev) => ({ categoryId, name, cents: b?.amount ?? 0, budgetId: b?.id, key: (prev?.key ?? 0) + 1 }));
    setOpen(true);
  };

  const onSave = async (cents: number) => {
    if (!editing) return;
    await save.mutateAsync({ category_id: editing.categoryId, month: monthIso, amount: cents });
    toast('Presupuesto guardado');
    setOpen(false);
  };

  const onDelete = async () => {
    if (!editing?.budgetId) return;
    await remove.mutateAsync(editing.budgetId);
    toast('Presupuesto quitado');
    setOpen(false);
  };

  const onCopy = async () => {
    const n = await copy.mutateAsync({ from: isoDate(prevMonth), to: monthIso });
    toast(n ? `Copiados ${n} presupuestos` : `No había presupuestos en ${monthName(prevMonth)}`);
  };

  return (
    <Screen title="Presupuesto">
      <MonthNav month={month} onChange={setMonth} />

      <button type="button" onClick={() => edit(null, 'Total del mes')} className="press mt-4 block w-full rounded-card bg-card p-4 text-left">
        <p className="text-subhead font-semibold text-label-2">Total del mes</p>
        {total ? (
          <>
            <p className="mt-1 flex items-baseline gap-2">
              <AnimatedAmount cents={total.spent} className="text-title1 font-bold" />
              <span className="tnum text-subhead text-label-2">de {formatCRC(total.limit_amount)}</span>
            </p>
            <div className="mt-3">
              <ProgressBar value={total.spent / total.limit_amount} />
            </div>
            <p className={'tnum mt-2 text-subhead font-semibold ' + budgetTone(total.spent / total.limit_amount)}>
              {total.spent > total.limit_amount
                ? `Te pasaste ${formatCRC(total.spent - total.limit_amount)}`
                : `Quedan ${formatCRC(total.limit_amount - total.spent)}`}
            </p>
          </>
        ) : (
          <p className="mt-1 text-body text-blue">Definir el total del mes</p>
        )}
      </button>

      {alerts.length > 0 && (
        <div className="mt-3 flex gap-3 rounded-card bg-orange/15 p-4">
          <TriangleAlert size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-orange" />
          <p className="text-subhead">
            {alerts.map((c) => c.name).join(', ')} {alerts.length === 1 ? 'va' : 'van'} por encima del 80% de su presupuesto.
          </p>
        </div>
      )}

      {withBudget.length > 0 && (
        <Section
          header="Por categoría"
          footer={
            total && sumCategories > total.limit_amount
              ? `Las categorías suman ${formatCRC(sumCategories)}, más que el total del mes.`
              : undefined
          }
        >
          {withBudget.map((c) => (
            <BudgetRow key={c.id} cat={c} spent={byCat.get(c.id)!.spent} limit={byCat.get(c.id)!.limit_amount} onClick={() => edit(c.id, c.name)} />
          ))}
        </Section>
      )}

      {without.length > 0 && (
        <Section header="Sin presupuesto">
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
                <Plus size={20} strokeWidth={2.25} className="text-blue" />
              </span>
            </button>
          ))}
        </Section>
      )}

      {progress.length === 0 && (
        <Button variant="tinted" className="mt-6 w-full" onClick={onCopy} disabled={copy.isPending}>
          Copiar presupuestos de {monthName(prevMonth)}
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

function BudgetRow({ cat, spent, limit, onClick }: { cat: Category; spent: number; limit: number; onClick: () => void }) {
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
            ? `Te pasaste ${formatCRC(spent - limit)}`
            : spent === limit
              ? 'Llegaste al límite'
              : `Quedan ${formatCRC(limit - spent)} · ${Math.round(ratio * 100)}%`}
        </span>
      </span>
    </button>
  );
}
