import { describe, expect, it } from 'vitest';
import { crDay } from './dates';
import { monthlyTrend, spendingByCategory, spendingByDay, spendingByMethod, topMerchants, totals } from './stats';
import type { Account, Category, Transaction } from './types';

let n = 0;
const tx = (p: Partial<Transaction>): Transaction => ({
  id: String(++n),
  occurred_at: '2026-10-29T18:00:00Z',
  amount: 100_000,
  type: 'gasto',
  account_id: 'cash',
  to_account_id: null,
  category_id: null,
  merchant: null,
  note: null,
  source: 'manual',
  status: 'confirmada',
  ...p,
});

const cat = (id: string, parent_id: string | null = null): Category => ({
  id, name: id, kind: 'gasto', icon: null, color: null, parent_id, archived: false, sort: 0,
});

const acct = (id: string, type: Account['type']): Account => ({
  id, name: id, type, initial_balance: 0, color: null, icon: null, last4: null, wallet_name: null,
  credit_limit: null, cutoff_day: null, payment_day: null, archived: false, sort: 0,
});

describe('stats', () => {
  it('totales ignoran transferencias', () => {
    const r = totals([
      tx({ amount: 500 }),
      tx({ type: 'ingreso', amount: 2000 }),
      tx({ type: 'transferencia', amount: 9999, to_account_id: 'x' }),
    ]);
    expect(r).toEqual({ gastos: 500, ingresos: 2000, neto: 1500 });
  });

  it('subcategorías suman a su padre', () => {
    const cats = [cat('comida'), cat('cafe', 'comida'), cat('super')];
    const r = spendingByCategory(
      [tx({ category_id: 'cafe', amount: 300 }), tx({ category_id: 'comida', amount: 200 }), tx({ category_id: 'super', amount: 500 })],
      cats,
    );
    expect(r.map((s) => [s.categoryId, s.amount, s.share])).toEqual([
      ['comida', 500, 0.5],
      ['super', 500, 0.5],
    ]);
  });

  it('gasto por día en hora de CR', () => {
    const monday = crDay(new Date('2026-10-26T12:00:00Z'));
    const r = spendingByDay(
      [
        tx({ occurred_at: '2026-10-27T05:30:00Z', amount: 100 }), // lunes 11:30 p. m. en CR
        tx({ occurred_at: '2026-10-29T18:00:00Z', amount: 200 }), // jueves
      ],
      monday,
      7,
    );
    expect(r).toEqual([100, 0, 0, 200, 0, 0, 0]);
  });

  it('tendencia mensual', () => {
    const r = monthlyTrend(
      [tx({ occurred_at: '2026-09-10T18:00:00Z', amount: 100 }), tx({ type: 'ingreso', amount: 900 })],
      crDay(new Date('2026-10-29T18:00:00Z')),
      3,
    );
    expect(r.map((p) => [p.month.toISOString().slice(0, 7), p.gastos, p.ingresos])).toEqual([
      ['2026-08', 0, 0],
      ['2026-09', 100, 0],
      ['2026-10', 0, 900],
    ]);
  });

  it('efectivo contra tarjeta', () => {
    const r = spendingByMethod(
      [tx({ account_id: 'cash', amount: 100 }), tx({ account_id: 'visa', amount: 300 }), tx({ account_id: 'deb', amount: 50 })],
      [acct('cash', 'efectivo'), acct('visa', 'credito'), acct('deb', 'debito')],
    );
    expect(r).toEqual({ efectivo: 100, tarjeta: 350, otro: 0 });
  });

  it('top comercios agrupa sin distinguir mayúsculas', () => {
    const r = topMerchants([
      tx({ merchant: 'Automercado', amount: 100 }),
      tx({ merchant: 'AUTOMERCADO ', amount: 200 }),
      tx({ merchant: 'Uber', amount: 50 }),
    ]);
    expect(r).toEqual([
      { merchant: 'Automercado', amount: 300, count: 2 },
      { merchant: 'Uber', amount: 50, count: 1 },
    ]);
  });
});
