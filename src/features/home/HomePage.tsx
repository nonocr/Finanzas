import { ChevronRight, Smartphone } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Donut } from '../../components/Donut';
import { AnimatedAmount, Segmented, SoftText } from '../../components/motion';
import { hexOf } from '../../components/palette';
import { budgetTone, EmptyState, IconTile, ProgressBar, Screen, Section, Skeleton } from '../../components/ui';
import { useT } from '../../i18n';
import { isDemo } from '../../lib/api';
import { crDay, crDayOf, crShortDate, crTime, isoDate, monthName, monthRange, startOfMonth, startOfWeek, weekRange, weekdayInitials } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import type { HomeSection } from '../../lib/prefs';
import { useBudgetProgress, useBudgets, useLookups, usePendingReview, useTransactions } from '../../lib/queries';
import { usePrefs } from '../../lib/usePrefs';
import {
  donutCategories,
  spendingByCategory,
  spendingByDay,
  spentAgainstTotal,
  totalBudget,
  totals,
} from '../../lib/stats';
import type { Transaction } from '../../lib/types';
import { BudgetRow } from '../budgets/BudgetsPage';
import { useEditor } from '../transactions/editor';
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
  const t = useT();
  const [period, setPeriodState] = useState<Period>(readPeriod);
  const setPeriod = (p: Period) => {
    setPeriodState(p);
    try {
      localStorage.setItem(PERIOD_KEY, p);
    } catch {
      // preferencia opcional
    }
  };
  const layout = usePrefs().home;
  const navigate = useNavigate();

  const today = crDay();
  const range = period === 'semana' ? weekRange(today) : monthRange(today);
  const month = isoDate(startOfMonth(today));
  const { data: txs, isLoading } = useTransactions(range);
  // La semana tiene su propia consulta: puede empezar en el mes anterior (en Semana es la misma que la de arriba).
  const { data: weekTxs } = useTransactions(weekRange(today));
  const { catMap, accMap, allCategories: categories } = useLookups();
  const { data: budgets = [] } = useBudgets(month);
  const { data: progress = [] } = useBudgetProgress(month);
  const { data: pending = [] } = usePendingReview();
  const tot = totals(txs ?? []);
  const slices = useMemo(() => spendingByCategory(txs ?? [], categories), [txs, categories]);
  const weekStart = startOfWeek(today);
  const days = spendingByDay(weekTxs ?? [], weekStart, 7);
  const todayIdx = Math.round((today.getTime() - weekStart.getTime()) / 86_400_000);

  // Presupuesto total del mes; en vista semanal se prorratea a 7 días.
  // El total se adapta a las categorías (ver totalBudget).
  const total = totalBudget(budgets);
  const monthLimit = total.limit;
  const budgetSpent = spentAgainstTotal(total, budgets, slices, tot.gastos);
  const daysInMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate();
  const limit =
    monthLimit === null
      ? null
      : period === 'mes'
        ? monthLimit
        : Math.round((monthLimit * 7) / daysInMonth / 100) * 100;
  const left = limit !== null ? limit - budgetSpent : null;
  const ratio = limit ? budgetSpent / limit : null;

  // Orden fijo de categorías para que la dona se transforme al cambiar de periodo.
  const expenseCats = donutCategories(categories, slices);
  const amountOf = new Map(slices.map((s) => [s.categoryId, s.amount]));
  const segments = [
    ...expenseCats.map((c) => ({ key: c.id, value: amountOf.get(c.id) ?? 0, color: hexOf(c.color) })),
    { key: 'none', value: amountOf.get(null) ?? 0, color: 'var(--color-muted)' },
  ];

  const recent = (txs ?? []).slice(0, 5);
  const when = period === 'mes' ? t.home.inMonth(monthName(today)) : t.home.thisWeek;

  // La cifra grande de la tarjeta (Ajustes → Resumen). «Lo que queda» necesita un presupuesto: sin él, lo gastado.
  const figure = layout.card === 'disponible' && left === null ? 'gastado' : layout.card;
  const card =
    figure === 'disponible'
      ? { title: t.home.cardAvailable(when), cents: left!, fields: ['ingresos', 'balance'] as const }
      : figure === 'balance'
        ? { title: t.home.cardBalance(when), cents: tot.neto, fields: ['gastado', 'ingresos'] as const }
        : { title: t.home.cardSpent(when), cents: tot.gastos, fields: ['ingresos', 'balance'] as const };
  const FIELD = {
    gastado: { label: t.home.fieldSpent, cents: tot.gastos, sign: false },
    ingresos: { label: t.home.fieldIncome, cents: tot.ingresos, sign: false },
    balance: { label: t.home.fieldBalance, cents: tot.neto, sign: true },
  };

  // Presupuestos por categoría, los más cerca del límite primero.
  const budgetRows = progress
    .filter((p) => p.category_id && p.limit_amount > 0 && catMap.get(p.category_id))
    .sort((a, b) => b.spent / b.limit_amount - a.spent / a.limit_amount)
    .slice(0, 4);

  const sections: Record<HomeSection, ReactNode> = {
    semana: (
      <Section
        key="semana"
        header={t.home.sectionWeek}
        action={<span className="tnum text-body text-label-2">{formatCRC(days.reduce((a, b) => a + b, 0))}</span>}
      >
        <WeekBars values={days} todayIndex={todayIdx} />
      </Section>
    ),
    recientes: (
      <Section
        key="recientes"
        header={t.home.sectionRecent}
        action={
          <Link to="/movimientos" className="inline-flex min-h-11 items-center text-body text-accent">
            {t.common.seeAll}
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
            title={period === 'semana' ? t.home.noTxWeek : t.home.noTxMonth}
            body={t.home.firstExpense}
          />
        )}
      </Section>
    ),
    categorias: (
      <Section key="categorias" header={t.home.sectionCategories}>
        <div className="flex items-center gap-5 p-4">
          <Donut segments={segments} size={148} thickness={18}>
            <span className="text-caption text-label-2">{t.home.donutTotal}</span>
            <span className="tnum text-subhead font-semibold">
              <SoftText text={formatCRC(tot.gastos)} />
            </span>
          </Donut>
          <ul className="min-w-0 flex-1 space-y-1.5">
            {slices.slice(0, 5).map((s) => {
              const c = s.categoryId ? catMap.get(s.categoryId) : undefined;
              return (
                <li key={s.categoryId ?? 'none'} className="flex items-center gap-2 text-subhead">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: c ? hexOf(c.color) : 'var(--color-muted)' }} />
                  <span className="min-w-0 flex-1 truncate">{c?.name ?? t.common.noCategory}</span>
                  <span className="tnum not-money text-label-2">{Math.round(s.share * 100)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>
    ),
    presupuestos: (
      <Section
        key="presupuestos"
        header={t.home.sectionBudgets}
        action={
          <Link to="/presupuesto" className="inline-flex min-h-11 items-center text-body text-accent">
            {t.common.seeAll}
          </Link>
        }
      >
        {budgetRows.length ? (
          budgetRows.map((p) => (
            <BudgetRow
              key={p.budget_id}
              cat={catMap.get(p.category_id!)!}
              spent={p.spent}
              limit={p.limit_amount}
              onClick={() => navigate('/presupuesto')}
            />
          ))
        ) : (
          <EmptyState title={t.home.noBudgetsTitle} body={t.home.noBudgetsBody} />
        )}
      </Section>
    ),
  };

  return (
    <Screen title={t.nav.tabs.home}>
      {layout.showPending && pending.length > 0 && <PendingCard pending={pending} />}
      <Segmented
        options={[
          { value: 'semana', label: t.home.week },
          { value: 'mes', label: t.home.month },
        ]}
        value={period}
        onChange={setPeriod}
      />

      {/* La tarjeta negra: el periodo en metal mate, la cifra grabada y el presupuesto como ranura. */}
      <section className="black-card mt-5 rounded-[18px] px-5 pt-5 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-headline font-semibold">
            <SoftText text={card.title} />
          </p>
          {ratio !== null && (
            <p className={'tnum not-money text-subhead font-semibold ' + budgetTone(ratio)}>
              <SoftText text={`${Math.round(ratio * 100)} %`} align="end" />
            </p>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="mt-4 h-12 w-52" />
        ) : (
          <AnimatedAmount
            quietCurrency={card.cents >= 0}
            cents={card.cents}
            className={
              'mt-4 block text-[48px] leading-[52px] font-light tracking-[-0.035em] ' + (card.cents < 0 ? 'text-red' : 'engraved')
            }
          />
        )}
        {left !== null && limit !== null ? (
          <>
            <p className="tnum mt-2 text-subhead text-label-2">
              <SoftText
                text={
                  figure === 'disponible'
                    ? t.home.spentOf(formatCRC(budgetSpent), formatCRC(limit))
                    : left >= 0
                      ? t.home.leftOf(formatCRC(left), formatCRC(limit))
                      : t.home.overOf(formatCRC(-left), formatCRC(limit))
                }
              />
            </p>
            <div className="mt-3">
              <ProgressBar value={ratio ?? 0} />
            </div>
          </>
        ) : (
          <Link to="/presupuesto" className="mt-1 inline-flex min-h-11 items-center text-subhead font-semibold text-accent">
            {t.home.setBudget}
          </Link>
        )}
        {/* Campos de tarjeta: etiqueta grabada pequeña y valor. */}
        <dl className="mt-5 grid grid-cols-2 gap-3">
          {card.fields.map((f) => (
            <div key={f}>
              <dt className="text-caption font-semibold tracking-[0.12em] text-label-2">{FIELD[f].label}</dt>
              <dd className={'tnum mt-1 text-headline font-medium ' + (FIELD[f].cents < 0 ? 'text-red' : 'engraved')}>
                <SoftText text={formatCRC(FIELD[f].cents, { sign: FIELD[f].sign })} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6">{layout.order.filter((s) => !layout.hidden.includes(s)).map((s) => sections[s])}</div>

      {isDemo && (
        <p className="mt-4 px-4 text-footnote text-label-2">{t.home.demoNote}</p>
      )}
    </Screen>
  );
}

const MAX_PENDING_SHOWN = 3;

/** Hora si el pago es de hoy; si no, «ayer» o la fecha (antes solo salía la hora y un pago viejo parecía de hoy). */
function pendingWhen(at: string, yesterday: string) {
  const d = new Date(at);
  const days = Math.round((crDay().getTime() - crDayOf(at).getTime()) / 86_400_000);
  return days === 0 ? crTime(d) : days === 1 ? yesterday : crShortDate(d);
}

/**
 * Lo primero de la pantalla cuando hay pagos de Wallet sin confirmar: canto de platino, cada pago a un toque
 * y la acción en metal. Desaparece cuando no queda ninguno.
 */
function PendingCard({ pending }: { pending: Transaction[] }) {
  const t = useT();
  const { openEdit } = useEditor();
  const n = pending.length;
  return (
    <section className="machined mb-4 rounded-[18px] bg-card p-3.5 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-accent)_45%,transparent)]" aria-label={t.home.pendingLabel}>
      <div className="flex items-center gap-3">
        <IconTile icon={Smartphone} color="var(--color-accent)" size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-headline font-semibold">{t.home.pendingTitle(n)}</p>
          <p className="text-footnote text-label-2">{t.home.pendingBody}</p>
        </div>
      </div>
      {/* Como mucho 3 pagos a la vista: con más, el resto se revisa desde el botón y la tarjeta no crece. */}
      <ul className="mt-2.5 overflow-hidden rounded-[12px] bg-card-2">
        {pending.slice(0, MAX_PENDING_SHOWN).map((tx, i) => (
          <li key={tx.id}>
            <button
              type="button"
              onClick={() => openEdit(tx)}
              className={'press flex min-h-11 w-full items-center gap-3 px-3.5 py-1.5 text-left ' + (i ? 'shadow-[inset_0_0.5px_0_var(--color-sep)]' : '')}
            >
              <span className="min-w-0 flex-1 truncate text-subhead">{tx.merchant ?? t.home.walletPayment}</span>
              <span className="tnum not-money shrink-0 text-footnote text-label-2">{pendingWhen(tx.occurred_at, t.home.yesterday)}</span>
              {tx.amount === 0 ? (
                <span className="text-subhead text-label-2">{t.transactions.noAmount}</span>
              ) : (
                <span className="tnum text-subhead font-semibold">{formatCRC(-tx.amount)}</span>
              )}
              <ChevronRight size={16} strokeWidth={2.25} className="text-label-3" />
            </button>
          </li>
        ))}
      </ul>
      {n === 1 ? (
        <button type="button" onClick={() => openEdit(pending[0])} className="press metal mt-2.5 min-h-11 w-full rounded-full text-body font-semibold">
          {t.home.reviewNow}
        </button>
      ) : (
        <Link to="/movimientos?filtro=revisar" className="press metal mt-2.5 flex min-h-11 w-full items-center justify-center rounded-full text-body font-semibold">
          {t.home.reviewAll(n)}
        </Link>
      )}
    </section>
  );
}

const CHART_H = 92;

/** Franja de la semana: barras compactas, hoy en platino, días futuros apagados; el promedio en una línea discreta. */
function WeekBars({ values, todayIndex }: { values: number[]; todayIndex: number }) {
  const t = useT();
  const max = Math.max(...values, 1);
  const avg = values.slice(0, todayIndex + 1).reduce((a, b) => a + b, 0) / (todayIndex + 1);
  return (
    <div className="px-4 pt-4 pb-3">
      <div
        className="flex items-end gap-2.5"
        style={{ height: CHART_H }}
        role="img"
        aria-label={t.home.weekChartLabel(formatCRC(Math.round(avg / 100) * 100), formatCRC(values[todayIndex] ?? 0))}
      >
        {values.map((v, i) => (
          <div key={i} className="flex-1">
            <div
              className="rounded-t-[4px] rounded-b-[2px] transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                height: i > todayIndex ? 4 : Math.max(4, (v / max) * CHART_H),
                background: i === todayIndex ? 'var(--color-accent)' : i > todayIndex ? 'var(--color-fill)' : 'var(--color-muted)',
              }}
              title={formatCRC(v)}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2.5">
        {/* En inglés se repiten letras (T, S): la clave es la posición. */}
        {weekdayInitials().map((d, i) => (
          <span key={i} className={'flex-1 text-center text-caption ' + (i === todayIndex ? 'font-semibold text-label' : 'text-label-2')}>
            {d}
          </span>
        ))}
      </div>
      <p className="tnum mt-3 text-footnote text-label-2">
        {t.home.weekSummary(formatCRC(Math.round(avg / 100) * 100), formatCRC(values[todayIndex] ?? 0))}
      </p>
    </div>
  );
}