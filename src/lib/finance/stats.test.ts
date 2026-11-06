import { describe, expect, it } from 'vitest';
import { crDay } from '../format/dates';
import {
  budgetAlert,
  donutCategories,
  monthlyTrend,
  spendingByCategory,
  spendingByDay,
  spendingByMethod,
  spentAgainstTotal,
  topMerchants,
  totalBudget,
  totals,
} from './stats';
import type { Account, Category, Transaction } from '../data/types';

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

  it('total del presupuesto: sin total definido es la suma de categorías', () => {
    expect(totalBudget([{ category_id: 'a', amount: 100 }, { category_id: 'b', amount: 50 }])).toEqual({
      limit: 150, manual: null, sum: 150, source: 'suma',
    });
  });

  it('total del presupuesto: el definido manda si alcanza', () => {
    expect(totalBudget([{ category_id: null, amount: 500 }, { category_id: 'a', amount: 100 }])).toMatchObject({
      limit: 500, source: 'manual',
    });
  });

  it('total del presupuesto: sube si las categorías lo superan', () => {
    expect(totalBudget([{ category_id: null, amount: 100 }, { category_id: 'a', amount: 80 }, { category_id: 'b', amount: 70 }])).toEqual({
      limit: 150, manual: 100, sum: 150, source: 'ajustado',
    });
  });

  it('total del presupuesto: nada definido', () => {
    expect(totalBudget([])).toEqual({ limit: null, manual: null, sum: 0, source: null });
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

describe('categorías archivadas en las estadísticas', () => {
  const comida = cat('comida');
  const ropa = { ...cat('ropa'), archived: true };
  const viejo = { ...cat('viejo'), archived: true };

  it('el gasto de una archivada conserva su categoría (no cae en "Sin categoría")', () => {
    const slices = spendingByCategory([tx({ category_id: 'ropa', amount: 700 }), tx({ amount: 300 })], [comida, ropa]);
    expect(slices.map((s) => s.categoryId)).toEqual(['ropa', null]);
  });

  it('la dona muestra las activas siempre y las archivadas solo si tienen gasto', () => {
    const slices = spendingByCategory([tx({ category_id: 'ropa', amount: 700 })], [comida, ropa, viejo]);
    expect(donutCategories([comida, ropa, viejo], slices).map((c) => c.id)).toEqual(['comida', 'ropa']);
  });
});

describe('gasto contra el total del mes', () => {
  const slices = spendingByCategory(
    [tx({ category_id: 'comida', amount: 40_000 }), tx({ category_id: 'casa', amount: 900_000 })],
    [cat('comida'), cat('casa')],
  );
  it('si el total es la suma de categorías, cuenta solo el gasto de esas categorías', () => {
    const budgets = [{ category_id: 'comida', amount: 50_000 }];
    expect(spentAgainstTotal(totalBudget(budgets), budgets, slices, 940_000)).toBe(40_000);
  });
  it('con un total propio cuenta todo el gasto', () => {
    const budgets = [
      { category_id: null, amount: 1_000_000 },
      { category_id: 'comida', amount: 50_000 },
    ];
    expect(spentAgainstTotal(totalBudget(budgets), budgets, slices, 940_000)).toBe(940_000);
  });
});

describe('budgetAlert', () => {
  it('separa lo que llegó al límite de lo que pasa del 80 %', () => {
    expect(
      budgetAlert([
        { name: 'Comida', ratio: 1.3 },
        { name: 'Casa', ratio: 1 },
        { name: 'Ropa', ratio: 0.85 },
      ]),
    ).toBe('Comida y Casa llegaron al límite de su presupuesto. Ropa va por encima del 80 %.');
    expect(budgetAlert([{ name: 'Comida', ratio: 1.01 }])).toBe('Comida llegó al límite de su presupuesto.');
  });
});
