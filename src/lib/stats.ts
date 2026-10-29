import { crDayOf, startOfMonth } from './dates';
import type { Account, AccountType, Category, Transaction } from './types';

export interface Totals {
  gastos: number;
  ingresos: number;
  neto: number;
}

export function totals(txs: Transaction[]): Totals {
  let gastos = 0;
  let ingresos = 0;
  for (const t of txs) {
    if (t.type === 'gasto') gastos += t.amount;
    else if (t.type === 'ingreso') ingresos += t.amount;
  }
  return { gastos, ingresos, neto: ingresos - gastos };
}

export interface CategorySlice {
  categoryId: string | null;
  amount: number;
  count: number;
  share: number; // 0–1 del total de gastos
}

/** Gasto por categoría principal (las subcategorías suman a su padre), de mayor a menor. */
export function spendingByCategory(txs: Transaction[], categories: Category[]): CategorySlice[] {
  const parentOf = new Map(categories.map((c) => [c.id, c.parent_id ?? c.id]));
  const acc = new Map<string | null, { amount: number; count: number }>();
  let total = 0;
  for (const t of txs) {
    if (t.type !== 'gasto') continue;
    const key = t.category_id ? (parentOf.get(t.category_id) ?? t.category_id) : null;
    const cur = acc.get(key) ?? { amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    acc.set(key, cur);
    total += t.amount;
  }
  return [...acc.entries()]
    .map(([categoryId, v]) => ({ categoryId, ...v, share: total ? v.amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

/** Gasto por día para `days` días a partir de `start` (día de calendario CR). */
export function spendingByDay(txs: Transaction[], start: Date, days: number): number[] {
  const out = new Array<number>(days).fill(0);
  for (const t of txs) {
    if (t.type !== 'gasto') continue;
    const idx = Math.round((crDayOf(t.occurred_at).getTime() - start.getTime()) / 86_400_000);
    if (idx >= 0 && idx < days) out[idx] += t.amount;
  }
  return out;
}

export interface MonthPoint {
  month: Date;
  gastos: number;
  ingresos: number;
}

/** Totales por mes para los `months` meses que terminan en `lastMonth` (inclusive). */
export function monthlyTrend(txs: Transaction[], lastMonth: Date, months: number): MonthPoint[] {
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    points.push({
      month: new Date(Date.UTC(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth() - i, 1)),
      gastos: 0,
      ingresos: 0,
    });
  }
  const index = new Map(points.map((p, i) => [p.month.getTime(), i]));
  for (const t of txs) {
    if (t.type === 'transferencia') continue;
    const i = index.get(startOfMonth(crDayOf(t.occurred_at)).getTime());
    if (i === undefined) continue;
    if (t.type === 'gasto') points[i].gastos += t.amount;
    else points[i].ingresos += t.amount;
  }
  return points;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'otro';

const METHOD: Record<AccountType, PaymentMethod> = {
  efectivo: 'efectivo',
  debito: 'tarjeta',
  credito: 'tarjeta',
  banco: 'otro',
  ahorro: 'otro',
};

/** Efectivo contra tarjeta (débito + crédito) y otros medios. */
export function spendingByMethod(txs: Transaction[], accounts: Account[]): Record<PaymentMethod, number> {
  const typeOf = new Map(accounts.map((a) => [a.id, a.type]));
  const out: Record<PaymentMethod, number> = { efectivo: 0, tarjeta: 0, otro: 0 };
  for (const t of txs) {
    if (t.type !== 'gasto') continue;
    const type = typeOf.get(t.account_id);
    out[type ? METHOD[type] : 'otro'] += t.amount;
  }
  return out;
}

export interface MerchantTotal {
  merchant: string;
  amount: number;
  count: number;
}

export function topMerchants(txs: Transaction[], limit = 5): MerchantTotal[] {
  const acc = new Map<string, MerchantTotal>();
  for (const t of txs) {
    if (t.type !== 'gasto' || !t.merchant) continue;
    const key = t.merchant.trim().toUpperCase();
    const cur = acc.get(key) ?? { merchant: t.merchant.trim(), amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    acc.set(key, cur);
  }
  return [...acc.values()].sort((a, b) => b.amount - a.amount).slice(0, limit);
}

/** Cambio relativo contra el periodo anterior; null si antes no hubo gasto. */
export function changeVs(current: number, previous: number): number | null {
  return previous > 0 ? (current - previous) / previous : null;
}

/** Gasto acumulado del mismo número de días del mes anterior, para comparar "a esta altura". */
export function sameDaysLastMonth(prevMonthTxs: Transaction[], prevMonthStart: Date, daysElapsed: number): number {
  const byDay = spendingByDay(prevMonthTxs, prevMonthStart, 31);
  return byDay.slice(0, daysElapsed).reduce((a, b) => a + b, 0);
}
