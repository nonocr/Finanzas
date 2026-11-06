import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Donut } from '../../components/Donut';
import { MonthNav } from '../../components/MonthNav';
import { AnimatedAmount, SoftText } from '../../components/motion';
import { hexOf } from '../../components/palette';
import { CategoryIcon, EmptyState, Screen, Section } from '../../components/ui';
import { locale, useT } from '../../i18n';
import { addMonths, crDay, crDayStartInstant, monthName, startOfMonth } from '../../lib/dates';
import { drillHref } from '../../lib/drill';
import { formatCRC } from '../../lib/money';
import { useTheme } from '../../lib/theme';
import { useLookups, useTransactions } from '../../lib/queries';
import {
  changeVs,
  monthlyTrend,
  sameDaysLastMonth,
  spendingByCategory,
  spendingByMethod,
  topMerchants,
  totals,
  donutCategories,
} from '../../lib/stats';

// Mismo signo menos (U+2212) que formatCRC.
// Recharts pinta con atributos SVG, que no leen variables CSS: sus colores salen del tema en JS.
// Ingresos en verde y gastos en rojo apagado (--color-expense), iguales en todos los temas: son colores con significado.
// El rojo de los gastos es más oscuro y opaco que el de alarma, para que este siga avisando solo cuando hace falta.
const GREEN = '#a9bfae';
const EXPENSE = 'oklch(0.56 0.085 27)';
const formatPct = (ratio: number) => `${ratio < 0 ? '−' : ''}${Math.abs(Math.round(ratio * 100))}%`;

export function StatsPage() {
  const t = useT();
  const [month, setMonth] = useState(() => startOfMonth(crDay()));
  const compact = new Intl.NumberFormat(locale(), { notation: 'compact', maximumFractionDigits: 1 });
  const firstMonth = addMonths(month, -5);
  // Una sola consulta de 6 meses; el mes elegido y el anterior salen de ahí.
  const { data: all = [] } = useTransactions({
    from: crDayStartInstant(firstMonth).toISOString(),
    to: crDayStartInstant(addMonths(month, 1)).toISOString(),
  });
  const { catMap, accMap, allCategories: categories } = useLookups();
  const tk = useTheme().tokens;

  const { txs, prevTxs } = useMemo(() => {
    const inMonth = (m: Date) => {
      const from = crDayStartInstant(m).toISOString();
      const to = crDayStartInstant(addMonths(m, 1)).toISOString();
      return all.filter((t) => t.occurred_at >= from && t.occurred_at < to);
    };
    return { txs: inMonth(month), prevTxs: inMonth(addMonths(month, -1)) };
  }, [all, month]);

  const tot = totals(txs);
  const today = crDay();
  const isCurrent = month.getTime() === startOfMonth(today).getTime();
  const daysElapsed = isCurrent ? today.getUTCDate() : 31;
  const prevComparable = sameDaysLastMonth(prevTxs, addMonths(month, -1), daysElapsed);
  const change = changeVs(tot.gastos, prevComparable);

  const slices = useMemo(() => spendingByCategory(txs, categories), [txs, categories]);
  const points = useMemo(() => monthlyTrend(all, month, 6), [all, month]);
  // Los nombres de los meses van fuera del useMemo: cambian con el idioma.
  const trend = points.map((p) => ({
    name: monthName(p.month).slice(0, 3),
    Gastos: p.gastos / 100,
    Ingresos: p.ingresos / 100,
  }));
  const methods = spendingByMethod(txs, [...accMap.values()]);
  const methodTotal = methods.efectivo + methods.tarjeta + methods.otro;
  const merchants = topMerchants(txs, 5);

  const expenseCats = donutCategories(categories, slices);
  const amountOf = new Map(slices.map((s) => [s.categoryId, s.amount]));
  const segments = [
    ...expenseCats.map((c) => ({ key: c.id, value: amountOf.get(c.id) ?? 0, color: hexOf(c.color) })),
    { key: 'none', value: amountOf.get(null) ?? 0, color: 'var(--color-muted)' },
  ];

  return (
    <Screen title={t.stats.title}>
      <MonthNav month={month} onChange={setMonth} />

      <section className="machined mt-4 rounded-card bg-card p-4">
        <p className="text-subhead font-semibold text-label-2">{t.stats.spent}</p>
        <AnimatedAmount quietCurrency cents={tot.gastos} className="engraved block text-[40px] leading-[46px] font-light tracking-[-0.03em]" />
        {change !== null && (
          <p className={'mt-1 flex items-center gap-1 text-subhead font-semibold ' + (change > 0 ? 'text-red' : 'text-green')}>
            {change > 0 ? <TrendingUp size={18} strokeWidth={2.25} /> : <TrendingDown size={18} strokeWidth={2.25} />}
            <SoftText
              text={t.stats.change(Math.abs(Math.round(change * 100)), change > 0, monthName(addMonths(month, -1)), isCurrent)}
            />
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t-[0.5px] border-sep pt-3">
          <div>
            <dt className="text-footnote text-label-2">{t.stats.income}</dt>
            <dd className="tnum text-headline font-semibold text-green">
              <SoftText text={formatCRC(tot.ingresos)} />
            </dd>
          </div>
          <div>
            <dt className="text-footnote text-label-2">{t.stats.savings}</dt>
            <dd className={'tnum text-headline font-semibold ' + (tot.neto < 0 ? 'text-red' : 'text-label')}>
              <SoftText
                text={
                  // Con ingresos mínimos el porcentaje sale absurdo (−32378 %): solo se muestra si es legible.
                  tot.ingresos && Math.abs(tot.neto / tot.ingresos) <= 9.99
                    ? `${formatCRC(tot.neto)} · ${formatPct(tot.neto / tot.ingresos)}`
                    : formatCRC(tot.neto)
                }
              />
            </dd>
          </div>
        </dl>
      </section>

      <Section header={t.stats.byCategory}>
        {slices.length === 0 ? (
          <EmptyState title={t.stats.noExpenses} />
        ) : (
          <>
            <div className="flex justify-center py-5">
              <Donut segments={segments} size={180} thickness={22}>
                <span className="text-caption text-label-2">{t.stats.total}</span>
                <span className="tnum text-headline font-semibold">{formatCRC(tot.gastos)}</span>
              </Donut>
            </div>
            {slices.map((s) => {
              const c = s.categoryId ? catMap.get(s.categoryId) : undefined;
              return (
                <Link
                  key={s.categoryId ?? 'none'}
                  to={drillHref({ kind: 'categoria', categoryId: s.categoryId }, month)}
                  className="group flex items-center gap-3 pl-4 transition-colors active:bg-card-2"
                >
                  <CategoryIcon icon={c?.icon ?? null} color={c?.color ?? null} />
                  <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-3 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                    <span className="min-w-0 flex-1 truncate text-body">{c?.name ?? t.common.noCategory}</span>
                    <span className="tnum not-money text-subhead text-label-2">{Math.round(s.share * 100)}%</span>
                    <span className="tnum w-24 text-right text-body font-semibold">{formatCRC(s.amount)}</span>
                    <ChevronRight size={16} strokeWidth={2.25} className="shrink-0 text-label-3" />
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </Section>

      <Section header={t.stats.lastMonths}>
        <div
          className="h-56 px-2 pt-4 pb-2"
          role="img"
          // VoiceOver no puede leer las barras: se le da el resumen en texto.
          aria-label={trend.map((p) => t.stats.chartPoint(p.name, formatCRC(p.Gastos * 100), formatCRC(p.Ingresos * 100))).join('. ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} barGap={2} barCategoryGap="22%">
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: tk.label2, fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fill: tk.label3, fontSize: 12 }}
                tickFormatter={(v: number) => compact.format(v)}
              />
              <Tooltip
                cursor={{ fill: tk.fill }}
                contentStyle={{ background: tk.card2, border: `1px solid ${tk.card3}`, borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: tk.label, fontWeight: 600, textTransform: 'capitalize' }}
                formatter={(v) => formatCRC(Number(v) * 100)}
              />
              <Bar dataKey="Ingresos" name={t.stats.income} fill={GREEN} radius={[4, 4, 1, 1]} isAnimationActive={false} />
              <Bar dataKey="Gastos" name={t.stats.expenses} fill={EXPENSE} radius={[4, 4, 1, 1]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 px-4 pb-3 text-footnote text-label-2">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-green" />
            {t.stats.income}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-expense" />
            {t.stats.expenses}
          </span>
        </div>
      </Section>

      <Section header={t.stats.methods}>
        <div className="p-4">
          {methodTotal === 0 ? (
            <p className="text-subhead text-label-2">{t.stats.noExpensesSentence}</p>
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
                      {t.stats.method[k]}
                    </dt>
                    <dd className="tnum text-subhead font-semibold">{formatCRC(methods[k])}</dd>
                    <dd className="tnum not-money text-footnote text-label-2">{Math.round((methods[k] / methodTotal) * 100)}%</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </Section>

      <Section header={t.stats.merchants}>
        {merchants.length === 0 ? (
          <EmptyState title={t.stats.noMerchants} />
        ) : (
          merchants.map((m, i) => (
            <Link
              key={m.merchant}
              to={drillHref({ kind: 'comercio', merchant: m.merchant }, month)}
              className="group flex items-center gap-3 pl-4 transition-colors active:bg-card-2"
            >
              <span className="tnum not-money w-5 text-center text-subhead font-semibold text-label-3">{i + 1}</span>
              <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-3 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body">{m.merchant}</span>
                  <span className="block text-footnote text-label-2">
                    {t.stats.purchases(m.count)}
                  </span>
                </span>
                <span className="tnum text-body font-semibold">{formatCRC(m.amount)}</span>
                <ChevronRight size={16} strokeWidth={2.25} className="shrink-0 text-label-3" />
              </div>
            </Link>
          ))
        )}
      </Section>
    </Screen>
  );
}

// Tarjeta en el metal del tema, efectivo en el mismo metal más oscuro (dos tonos de una familia) y «otros» en un gris
// apagado: es el tramo menos importante y no debe llevarse la vista. Aquí no hay ingresos cerca: el metal no compite.
const METHOD_COLOR = {
  tarjeta: 'var(--color-accent)',
  efectivo: 'color-mix(in oklch, var(--color-accent) 65%, var(--color-bg))',
  otro: 'var(--color-muted)',
} as const;
