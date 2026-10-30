import { TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Donut } from '../../components/Donut';
import { MonthNav } from '../../components/MonthNav';
import { AnimatedAmount, SoftText } from '../../components/motion';
import { hexOf } from '../../components/palette';
import { CategoryIcon, EmptyState, Screen, Section } from '../../components/ui';
import { addMonths, crDay, crDayStartInstant, monthName, startOfMonth } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import { useAccounts, useCategories, useTransactions } from '../../lib/queries';
import {
  changeVs,
  monthlyTrend,
  sameDaysLastMonth,
  spendingByCategory,
  spendingByMethod,
  topMerchants,
  totals,
} from '../../lib/stats';

const compact = new Intl.NumberFormat('es-CR', { notation: 'compact', maximumFractionDigits: 1 });
// Mismo signo menos (U+2212) que formatCRC.
const formatPct = (ratio: number) => `${ratio < 0 ? '−' : ''}${Math.abs(Math.round(ratio * 100))}%`;

export function StatsPage() {
  const [month, setMonth] = useState(() => startOfMonth(crDay()));
  const firstMonth = addMonths(month, -5);
  // Una sola consulta de 6 meses; el mes elegido y el anterior salen de ahí.
  const { data: all = [] } = useTransactions({
    from: crDayStartInstant(firstMonth).toISOString(),
    to: crDayStartInstant(addMonths(month, 1)).toISOString(),
  });
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const { txs, prevTxs } = useMemo(() => {
    const inMonth = (m: Date) => {
      const from = crDayStartInstant(m).toISOString();
      const to = crDayStartInstant(addMonths(m, 1)).toISOString();
      return all.filter((t) => t.occurred_at >= from && t.occurred_at < to);
    };
    return { txs: inMonth(month), prevTxs: inMonth(addMonths(month, -1)) };
  }, [all, month]);

  const t = totals(txs);
  const today = crDay();
  const isCurrent = month.getTime() === startOfMonth(today).getTime();
  const daysElapsed = isCurrent ? today.getUTCDate() : 31;
  const prevComparable = sameDaysLastMonth(prevTxs, addMonths(month, -1), daysElapsed);
  const change = changeVs(t.gastos, prevComparable);

  const slices = useMemo(() => spendingByCategory(txs, categories), [txs, categories]);
  const trend = useMemo(
    () =>
      monthlyTrend(all, month, 6).map((p) => ({
        name: monthName(p.month).slice(0, 3),
        Gastos: p.gastos / 100,
        Ingresos: p.ingresos / 100,
      })),
    [all, month],
  );
  const methods = spendingByMethod(txs, accounts);
  const methodTotal = methods.efectivo + methods.tarjeta + methods.otro;
  const merchants = topMerchants(txs, 5);

  const expenseCats = categories.filter((c) => c.kind === 'gasto' && !c.parent_id);
  const amountOf = new Map(slices.map((s) => [s.categoryId, s.amount]));
  const segments = [
    ...expenseCats.map((c) => ({ key: c.id, value: amountOf.get(c.id) ?? 0, color: hexOf(c.color) })),
    { key: 'none', value: amountOf.get(null) ?? 0, color: '#48484a' },
  ];

  return (
    <Screen title="Estadísticas">
      <MonthNav month={month} onChange={setMonth} />

      <section className="mt-4 rounded-card bg-card p-4">
        <p className="text-subhead font-semibold text-label-2">Gastado</p>
        <AnimatedAmount cents={t.gastos} className="block text-[34px] leading-[41px] font-bold tracking-[-0.02em]" />
        {change !== null && (
          <p className={'mt-1 flex items-center gap-1 text-subhead font-semibold ' + (change > 0 ? 'text-red' : 'text-green')}>
            {change > 0 ? <TrendingUp size={18} strokeWidth={2.25} /> : <TrendingDown size={18} strokeWidth={2.25} />}
            <SoftText
              text={`${Math.abs(Math.round(change * 100))}% ${change > 0 ? 'más' : 'menos'} que ${monthName(addMonths(month, -1))}${isCurrent ? ' a esta altura' : ''}`}
            />
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t-[0.5px] border-sep pt-3">
          <div>
            <dt className="text-footnote text-label-2">Ingresos</dt>
            <dd className="tnum text-headline font-semibold text-green">
              <SoftText text={formatCRC(t.ingresos)} />
            </dd>
          </div>
          <div>
            <dt className="text-footnote text-label-2">Ahorro</dt>
            <dd className={'tnum text-headline font-semibold ' + (t.neto < 0 ? 'text-red' : 'text-label')}>
              <SoftText
                text={
                  t.ingresos
                    ? `${formatCRC(t.neto)} · ${formatPct(t.neto / t.ingresos)}`
                    : formatCRC(t.neto)
                }
              />
            </dd>
          </div>
        </dl>
      </section>

      <Section header="Por categoría">
        {slices.length === 0 ? (
          <EmptyState title="Sin gastos este mes" />
        ) : (
          <>
            <div className="flex justify-center py-5">
              <Donut segments={segments} size={180} thickness={22}>
                <span className="text-caption text-label-2">Total</span>
                <span className="tnum text-headline font-semibold">{formatCRC(t.gastos)}</span>
              </Donut>
            </div>
            {slices.map((s) => {
              const c = s.categoryId ? catMap.get(s.categoryId) : undefined;
              return (
                <div key={s.categoryId ?? 'none'} className="group flex items-center gap-3 pl-4">
                  <CategoryIcon icon={c?.icon ?? null} color={c?.color ?? null} />
                  <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                    <span className="min-w-0 flex-1 truncate text-body">{c?.name ?? 'Sin categoría'}</span>
                    <span className="tnum text-subhead text-label-2">{Math.round(s.share * 100)}%</span>
                    <span className="tnum w-24 text-right text-body font-semibold">{formatCRC(s.amount)}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Section>

      <Section header="Últimos 6 meses">
        <div
          className="h-56 px-2 pt-4 pb-2"
          role="img"
          // VoiceOver no puede leer las barras: se le da el resumen en texto.
          aria-label={trend.map((p) => `${p.name}: gastos ${formatCRC(p.Gastos * 100)}, ingresos ${formatCRC(p.Ingresos * 100)}`).join('. ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} barGap={2} barCategoryGap="22%">
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgb(235 235 245 / 0.6)', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fill: 'rgb(235 235 245 / 0.3)', fontSize: 11 }}
                tickFormatter={(v: number) => compact.format(v)}
              />
              <Tooltip
                cursor={{ fill: 'rgb(118 118 128 / 0.18)' }}
                contentStyle={{ background: '#2c2c2e', border: 0, borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}
                formatter={(v) => formatCRC(Number(v) * 100)}
              />
              <Bar dataKey="Ingresos" fill="#30d158" radius={[4, 4, 1, 1]} isAnimationActive={false} />
              <Bar dataKey="Gastos" fill="#ff9f0a" radius={[4, 4, 1, 1]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 px-4 pb-3 text-footnote text-label-2">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-green" />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-orange" />
            Gastos
          </span>
        </div>
      </Section>

      <Section header="Efectivo y tarjeta">
        <div className="p-4">
          {methodTotal === 0 ? (
            <p className="text-subhead text-label-2">Sin gastos este mes.</p>
          ) : (
            <>
              <div className="flex h-3 gap-[3px] overflow-hidden rounded-full">
                {(['tarjeta', 'efectivo', 'otro'] as const).map(
                  (k) =>
                    methods[k] > 0 && (
                      <div
                        key={k}
                        className="h-full transition-[flex-grow] duration-500 motion-reduce:transition-none"
                        style={{ flexGrow: methods[k], background: METHOD_COLOR[k] }}
                      />
                    ),
                )}
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2">
                {(['tarjeta', 'efectivo', 'otro'] as const).map((k) => (
                  <div key={k}>
                    <dt className="flex items-center gap-1.5 text-footnote text-label-2">
                      <span className="size-2.5 rounded-[3px]" style={{ background: METHOD_COLOR[k] }} />
                      {METHOD_LABEL[k]}
                    </dt>
                    <dd className="tnum text-subhead font-semibold">{formatCRC(methods[k])}</dd>
                    <dd className="tnum text-footnote text-label-2">{Math.round((methods[k] / methodTotal) * 100)}%</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </Section>

      <Section header="Dónde más gastas">
        {merchants.length === 0 ? (
          <EmptyState title="Sin comercios este mes" />
        ) : (
          merchants.map((m, i) => (
            <div key={m.merchant} className="group flex items-center gap-3 pl-4">
              <span className="tnum w-5 text-center text-subhead font-semibold text-label-3">{i + 1}</span>
              <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body">{m.merchant}</span>
                  <span className="block text-footnote text-label-2">
                    {m.count} {m.count === 1 ? 'compra' : 'compras'}
                  </span>
                </span>
                <span className="tnum text-body font-semibold">{formatCRC(m.amount)}</span>
              </div>
            </div>
          ))
        )}
      </Section>
    </Screen>
  );
}

const METHOD_LABEL = { tarjeta: 'Tarjeta', efectivo: 'Efectivo', otro: 'Otros' } as const;
const METHOD_COLOR = { tarjeta: '#0a84ff', efectivo: '#30d158', otro: '#8e8e93' } as const;
