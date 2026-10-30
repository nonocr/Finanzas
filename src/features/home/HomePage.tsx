import { ChevronRight, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Donut } from '../../components/Donut';
import { AnimatedAmount, Segmented, SoftText } from '../../components/motion';
import { hexOf } from '../../components/palette';
import { budgetTone, EmptyState, IconTile, ProgressBar, Screen, Section, Skeleton, Stamp } from '../../components/ui';
import { isDemo } from '../../lib/api';
import { crDay, isoDate, monthName, monthRange, startOfMonth, startOfWeek, weekRange, WEEKDAY_INITIALS } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import { useAccounts, useBudgets, useCategories, usePendingReview, useTransactions } from '../../lib/queries';
import { spendingByCategory, spendingByDay, totalBudget, totals } from '../../lib/stats';
import { TransactionRow } from '../transactions/TransactionRow';

type Period = 'semana' | 'mes';
const PERIOD_KEY = 'finanzas-home-period';

function readPeriod(): Period {
  const fromUrl = new URLSearchParams(location.search).get('p');
  if (fromUrl === 'semana' || fromUrl === 'mes') return fromUrl;
  try {
    return localStorage.getItem(PERIOD_KEY) === 'semana' ? 'semana' : 'mes';
  } catch {
    return 'mes';
  }
}

export function HomePage() {
  const [period, setPeriodState] = useState<Period>(readPeriod);
  const setPeriod = (p: Period) => {
    setPeriodState(p);
    try {
      localStorage.setItem(PERIOD_KEY, p);
    } catch {
      // preferencia opcional
    }
  };

  const today = crDay();
  const range = period === 'semana' ? weekRange(today) : monthRange(today);
  const month = isoDate(startOfMonth(today));
  const { data: txs, isLoading } = useTransactions(range);
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: budgets = [] } = useBudgets(month);
  const { data: pending = [] } = usePendingReview();

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const t = totals(txs ?? []);
  const slices = useMemo(() => spendingByCategory(txs ?? [], categories), [txs, categories]);
  const weekStart = startOfWeek(today);
  const days = spendingByDay(txs ?? [], weekStart, 7);
  const todayIdx = Math.round((today.getTime() - weekStart.getTime()) / 86_400_000);

  // Presupuesto total del mes; en vista semanal se prorratea a 7 días.
  // El total se adapta a las categorías (ver totalBudget).
  const monthLimit = totalBudget(budgets).limit;
  const daysInMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate();
  const limit =
    monthLimit === null
      ? null
      : period === 'mes'
        ? monthLimit
        : Math.round((monthLimit * 7) / daysInMonth / 100) * 100;
  const left = limit !== null ? limit - t.gastos : null;
  const ratio = limit ? t.gastos / limit : null;

  // Orden fijo de categorías para que la dona se transforme al cambiar de periodo.
  const expenseCats = categories.filter((c) => c.kind === 'gasto' && !c.parent_id);
  const amountOf = new Map(slices.map((s) => [s.categoryId, s.amount]));
  const segments = [
    ...expenseCats.map((c) => ({ key: c.id, value: amountOf.get(c.id) ?? 0, color: hexOf(c.color) })),
    { key: 'none', value: amountOf.get(null) ?? 0, color: '#48484a' },
  ];

  const recent = (txs ?? []).slice(0, 5);
  const title = period === 'mes' ? `Gastado en ${monthName(today)}` : 'Gastado esta semana';

  return (
    <Screen
      title="Resumen"
    >
      <Segmented
        options={[
          { value: 'semana', label: 'Semana' },
          { value: 'mes', label: 'Mes' },
        ]}
        value={period}
        onChange={setPeriod}
      />

      {/* La tarjeta negra: el periodo en metal mate, la cifra grabada y el presupuesto como ranura. */}
      <section className="black-card mt-5 rounded-[18px] px-5 pt-5 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-headline font-semibold">
            <SoftText text={title} />
          </p>
          {ratio !== null && (
            <p className={'tnum text-subhead font-semibold ' + budgetTone(ratio)}>
              <SoftText text={`${Math.round(ratio * 100)} %`} align="end" />
            </p>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="mt-4 h-12 w-52" />
        ) : (
          <AnimatedAmount cents={t.gastos} className="engraved mt-4 block text-[48px] leading-[52px] font-light tracking-[-0.035em]" />
        )}
        {left !== null && limit !== null ? (
          <>
            <p className="mt-2 text-subhead text-label-2">
              <SoftText
                text={
                  left >= 0
                    ? `Quedan ${formatCRC(left)} de ${formatCRC(limit)}`
                    : `Te pasaste ${formatCRC(-left)} de ${formatCRC(limit)}`
                }
              />
            </p>
            <div className="mt-3">
              <ProgressBar value={ratio ?? 0} />
            </div>
          </>
        ) : (
          <Link to="/presupuesto" className="mt-1 inline-flex min-h-11 items-center text-subhead font-semibold text-accent">
            Definir un presupuesto
          </Link>
        )}
        {/* Campos de tarjeta: etiqueta grabada pequeña y valor. */}
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-caption font-semibold tracking-[0.12em] text-label-2">INGRESOS</dt>
            <dd className="tnum engraved mt-1 text-headline font-medium">
              <SoftText text={formatCRC(t.ingresos)} />
            </dd>
          </div>
          <div>
            <dt className="text-caption font-semibold tracking-[0.12em] text-label-2">BALANCE</dt>
            <dd className={'tnum mt-1 text-headline font-medium ' + (t.neto < 0 ? 'text-red' : 'engraved')}>
              <SoftText text={formatCRC(t.neto, { sign: true })} />
            </dd>
          </div>
        </dl>
      </section>

      {pending.length > 0 && (
        <Link
          to="/movimientos?filtro=revisar"
          className="press machined mt-3 flex min-h-14 items-center gap-3 rounded-card bg-card px-4 py-3"
        >
          <IconTile icon={Smartphone} color="var(--color-accent)" size={36} />
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold">
              {pending.length === 1 ? '1 pago de Wallet' : `${pending.length} pagos de Wallet`}
            </span>
            <span className="tnum block text-subhead text-label-2">
              <Stamp>Revisar</Stamp>
              {formatCRC(pending.reduce((s, p) => s + p.amount, 0))} sin categoría
            </span>
          </span>
          <ChevronRight size={18} strokeWidth={2.25} className="text-label-3" />
        </Link>
      )}
      {period === 'semana' && (
        <Section header="Por día" className="mt-6">
          <WeekBars values={days} todayIndex={todayIdx} />
        </Section>
      )}

      <Section header="Por categoría" className="mt-6">
        <div className="flex items-center gap-5 p-4">
          <Donut segments={segments} size={148} thickness={18}>
            <span className="text-caption text-label-2">Total</span>
            <span className="tnum text-subhead font-semibold">
              <SoftText text={formatCRC(t.gastos)} />
            </span>
          </Donut>
          <ul className="min-w-0 flex-1 space-y-1.5">
            {slices.slice(0, 5).map((s) => {
              const c = s.categoryId ? catMap.get(s.categoryId) : undefined;
              return (
                <li key={s.categoryId ?? 'none'} className="flex items-center gap-2 text-subhead">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: c ? hexOf(c.color) : '#48484a' }} />
                  <span className="min-w-0 flex-1 truncate">{c?.name ?? 'Sin categoría'}</span>
                  <span className="tnum text-label-2">{Math.round(s.share * 100)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      <Section
        header="Recientes"
        action={
          <Link to="/movimientos" className="inline-flex min-h-11 items-center text-body text-accent">
            Ver todos
          </Link>
        }
      >
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        ) : recent.length ? (
          recent.map((tx) => <TransactionRow key={tx.id} tx={tx} categories={catMap} accounts={accMap} />)
        ) : (
          <EmptyState
            title={period === 'semana' ? 'Sin movimientos esta semana' : 'Sin movimientos este mes'}
            body="Toca + para registrar tu primer gasto."
          />
        )}
      </Section>

      {isDemo && (
        <p className="mt-4 px-4 text-footnote text-label-2">
          Datos de ejemplo. Conecta tu cuenta en Ajustes para ver tus movimientos reales.
        </p>
      )}
    </Screen>
  );
}

const CHART_H = 144;

/** Barras por día al estilo de Salud: hoy resaltado, días futuros apagados. */
function WeekBars({ values, todayIndex }: { values: number[]; todayIndex: number }) {
  const max = Math.max(...values, 1);
  const avg = values.slice(0, todayIndex + 1).reduce((a, b) => a + b, 0) / (todayIndex + 1);
  return (
    <div className="p-4">
      <p className="text-footnote text-label-2">Promedio diario</p>
      <p className="tnum text-title3 font-bold">{formatCRC(Math.round(avg / 100) * 100)}</p>
      <div className="relative mt-4 flex items-end gap-2.5" style={{ height: CHART_H }} role="img" aria-label="Gasto por día de esta semana">
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-label-3"
          style={{ bottom: (avg / max) * CHART_H }}
          aria-hidden="true"
        />
        {values.map((v, i) => (
          <div key={i} className="flex-1">
            <div
              className="rounded-t-[5px] rounded-b-[2px] transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                height: i > todayIndex ? 4 : Math.max(4, (v / max) * CHART_H),
                background: i === todayIndex ? 'var(--color-accent)' : i > todayIndex ? 'var(--color-fill)' : '#4a4a4f',
              }}
              title={formatCRC(v)}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2.5">
        {WEEKDAY_INITIALS.map((d, i) => (
          <span
            key={d}
            className={'flex-1 text-center text-caption font-semibold ' + (i === todayIndex ? 'text-label' : 'text-label-3')}
          >
            {d}
          </span>
        ))}
      </div>
      <p className="tnum mt-3 text-footnote text-label-2">
        Hoy {formatCRC(values[todayIndex] ?? 0)}
      </p>
    </div>
  );
}
