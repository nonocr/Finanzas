import { Search, Smartphone, Store, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MonthNav } from '../../components/MonthNav';
import { Segmented } from '../../components/motion';
import { CategoryIcon, EmptyState, IconTile, Screen, Section, Skeleton } from '../../components/ui';
import { crDay, crDayOf, dayLabel, isoDate, monthRange, startOfMonth } from '../../lib/dates';
import { type Drill, matchesDrill, readDrill, readMonth } from '../../lib/drill';
import { formatCRC } from '../../lib/money';
import { useLookups, usePendingReview, useTransactions } from '../../lib/queries';
import type { Category, Transaction } from '../../lib/types';
import { TransactionRow } from './TransactionRow';

type Filter = 'todos' | 'gastos' | 'ingresos' | 'revisar';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function TransactionsPage() {
  const [params, setParams] = useSearchParams();
  const filter = (params.get('filtro') as Filter) || 'todos';
  // Cambiar de pestaña no borra la categoría o el comercio que se tocó en Estadísticas.
  const setFilter = (f: Filter) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (f === 'todos') next.delete('filtro');
        else next.set('filtro', f);
        return next;
      },
      { replace: true },
    );
  const drill = useMemo(() => readDrill(params), [params]);
  const clearDrill = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('categoria');
        next.delete('comercio');
        next.delete('mes');
        return next;
      },
      { replace: true },
    );

  const [month, setMonth] = useState(() => readMonth(params) ?? startOfMonth(crDay()));
  const [query, setQuery] = useState('');
  const { data: monthTxs, isLoading } = useTransactions(monthRange(month));
  const { data: pending = [] } = usePendingReview();
  const { catMap, accMap, allCategories } = useLookups();

  const visible = useMemo(() => {
    let list: Transaction[] = filter === 'revisar' ? pending : (monthTxs ?? []);
    if (drill) list = list.filter((t) => matchesDrill(t, drill, allCategories));
    if (filter === 'gastos') list = list.filter((t) => t.type === 'gasto');
    if (filter === 'ingresos') list = list.filter((t) => t.type === 'ingreso');
    const q = norm(query.trim());
    if (q) {
      list = list.filter((t) => {
        const cat = t.category_id ? catMap.get(t.category_id)?.name : '';
        return norm([t.merchant, t.note, cat, accMap.get(t.account_id)?.name].filter(Boolean).join(' ')).includes(q);
      });
    }
    return list;
  }, [filter, pending, monthTxs, drill, query, catMap, accMap, allCategories]);

  const groups = useMemo(() => {
    const byDay = new Map<string, Transaction[]>();
    for (const t of visible) {
      const k = isoDate(crDayOf(t.occurred_at));
      byDay.set(k, [...(byDay.get(k) ?? []), t]);
    }
    return [...byDay.entries()];
  }, [visible]);

  return (
    <Screen title="Movimientos">
      <div className="space-y-3">
        {filter !== 'revisar' && <MonthNav month={month} onChange={setMonth} />}
        {drill && (
          <DrillChip
            drill={drill}
            category={drill.kind === 'categoria' && drill.categoryId ? catMap.get(drill.categoryId) : undefined}
            spent={visible.filter((t) => t.type === 'gasto').reduce((s, t) => s + t.amount, 0)}
            count={visible.length}
            onClear={clearDrill}
          />
        )}
        <label className="flex min-h-11 items-center gap-2 rounded-[10px] bg-fill px-2.5">
          <Search size={18} strokeWidth={2} className="shrink-0 text-label-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar comercio, categoría o nota"
            className="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-label-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" aria-label="Borrar búsqueda" onClick={() => setQuery('')} className="grid size-8 place-items-center text-label-2">
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </label>
        <Segmented
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'gastos', label: 'Gastos' },
            { value: 'ingresos', label: 'Ingresos' },
            { value: 'revisar', label: pending.length ? `Revisar (${pending.length})` : 'Revisar' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {pending.length > 0 && filter !== 'revisar' && (
          <button
            type="button"
            onClick={() => setFilter('revisar')}
            className="press machined flex min-h-12 w-full items-center gap-3 rounded-[12px] bg-card px-3.5 py-2 text-left shadow-[inset_0_0_0_1px_rgb(220_220_224/0.45)]"
          >
            <Smartphone size={20} strokeWidth={2} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1 text-body">
              {pending.length === 1 ? '1 pago de Wallet espera revisión' : `${pending.length} pagos de Wallet esperan revisión`}
            </span>
            <span className="text-body font-semibold text-accent">Revisar</span>
          </button>
        )}
        {filter === 'revisar' && pending.length > 0 && (
          <p className="px-1 text-subhead text-label-2">Toca cada pago, elige su categoría y confírmalo. Si alguno llegó sin monto, escríbelo ahí mismo.</p>
        )}
      </div>

      {isLoading && filter !== 'revisar' ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-6 rounded-card bg-card">
          <EmptyState
            title={
              query
                ? 'Nada coincide con tu búsqueda'
                : filter === 'revisar'
                  ? 'Todo al día'
                  : drill
                    ? 'Nada aquí este mes'
                    : 'Sin movimientos este mes'
            }
            body={
              query
                ? 'Prueba con otro nombre o cambia el filtro.'
                : drill && filter !== 'revisar'
                  ? 'Cambia de mes o quita el filtro para ver todo.'
                  : filter === 'revisar'
                  ? 'Los pagos que lleguen de Apple Wallet sin categoría aparecerán aquí.'
                  : 'Toca + para registrar un gasto o ingreso.'
            }
          />
        </div>
      ) : (
        groups.map(([day, list]) => {
          const spent = list.filter((t) => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);
          return (
            <Section
              key={day}
              header={<span className="text-headline font-semibold capitalize">{dayLabel(new Date(day + 'T00:00:00Z'))}</span>}
              action={spent > 0 && <span className="tnum text-subhead text-label-2">{formatCRC(-spent)}</span>}
            >
              {list.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} categories={catMap} accounts={accMap} />
              ))}
            </Section>
          );
        })
      )}
    </Screen>
  );
}

/** Lo que se tocó en Estadísticas, con lo que suma en el mes y la equis para volver a ver todo. */
function DrillChip({
  drill,
  category,
  spent,
  count,
  onClear,
}: {
  drill: Drill;
  category: Category | undefined;
  spent: number;
  count: number;
  onClear: () => void;
}) {
  const name = drill.kind === 'comercio' ? drill.merchant : (category?.name ?? 'Sin categoría');
  return (
    <div className="machined flex min-h-14 items-center gap-3 rounded-[12px] bg-card py-2 pr-1 pl-3">
      {drill.kind === 'comercio' ? (
        <IconTile icon={Store} color="var(--color-label-2)" />
      ) : (
        <CategoryIcon icon={category?.icon ?? null} color={category?.color ?? null} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold">{name}</p>
        <p className="tnum text-footnote text-label-2">
          {count === 1 ? '1 movimiento' : `${count} movimientos`}
          {spent > 0 && ` · ${formatCRC(-spent)}`}
        </p>
      </div>
      <button type="button" aria-label={`Quitar el filtro ${name}`} onClick={onClear} className="press grid size-11 shrink-0 place-items-center text-label-2">
        <X size={18} strokeWidth={2.25} />
      </button>
    </div>
  );
}
