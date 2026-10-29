import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MonthNav } from '../../components/MonthNav';
import { Segmented } from '../../components/motion';
import { EmptyState, Screen, Section, Skeleton } from '../../components/ui';
import { crDay, crDayOf, dayLabel, isoDate, monthRange, startOfMonth } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import { useAccounts, useCategories, usePendingReview, useTransactions } from '../../lib/queries';
import type { Transaction } from '../../lib/types';
import { TransactionRow } from './TransactionRow';

type Filter = 'todos' | 'gastos' | 'ingresos' | 'revisar';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function TransactionsPage() {
  const [params, setParams] = useSearchParams();
  const filter = (params.get('filtro') as Filter) || 'todos';
  const setFilter = (f: Filter) => setParams(f === 'todos' ? {} : { filtro: f }, { replace: true });

  const [month, setMonth] = useState(() => startOfMonth(crDay()));
  const [query, setQuery] = useState('');
  const { data: monthTxs, isLoading } = useTransactions(monthRange(month));
  const { data: pending = [] } = usePendingReview();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const visible = useMemo(() => {
    let list: Transaction[] = filter === 'revisar' ? pending : (monthTxs ?? []);
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
  }, [filter, pending, monthTxs, query, catMap, accMap]);

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
                  : 'Sin movimientos este mes'
            }
            body={
              query
                ? 'Prueba con otro nombre o cambia el filtro.'
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
