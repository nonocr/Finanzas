import { describe, expect, it } from 'vitest';
import { drillHref, matchesDrill, NO_CATEGORY, readDrill, readMonth } from './drill';
import type { Category, Transaction } from './types';

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

const nov = new Date(Date.UTC(2026, 10, 1));

describe('drillHref / readDrill / readMonth', () => {
  it('ida y vuelta de una categoría con su mes', () => {
    const href = drillHref({ kind: 'categoria', categoryId: 'super' }, nov);
    expect(href).toBe('/movimientos?categoria=super&mes=2026-11');
    const params = new URLSearchParams(href.split('?')[1]);
    expect(readDrill(params)).toEqual({ kind: 'categoria', categoryId: 'super' });
    expect(readMonth(params)).toEqual(nov);
  });

  it('sin categoría usa un valor propio y vuelve como null', () => {
    const href = drillHref({ kind: 'categoria', categoryId: null }, nov);
    expect(href).toContain(`categoria=${NO_CATEGORY}`);
    expect(readDrill(new URLSearchParams(href.split('?')[1]))).toEqual({ kind: 'categoria', categoryId: null });
  });

  it('el comercio se codifica (espacios, &, tildes)', () => {
    const merchant = 'Café & Té San José';
    const href = drillHref({ kind: 'comercio', merchant }, nov);
    expect(readDrill(new URLSearchParams(href.split('?')[1]))).toEqual({ kind: 'comercio', merchant });
  });

  it('sin filtro, comercio vacío o mes inválido no filtran', () => {
    expect(readDrill(new URLSearchParams(''))).toBeNull();
    expect(readDrill(new URLSearchParams('comercio=%20%20'))).toBeNull();
    expect(readMonth(new URLSearchParams('mes=2026-13'))).toBeNull();
    expect(readMonth(new URLSearchParams('mes=noviembre'))).toBeNull();
    expect(readMonth(new URLSearchParams(''))).toBeNull();
  });
});

describe('matchesDrill', () => {
  const cats = [cat('casa'), cat('luz', 'casa'), cat('super')];

  it('la categoría incluye sus subcategorías, como la dona', () => {
    const d = { kind: 'categoria', categoryId: 'casa' } as const;
    expect(matchesDrill(tx({ category_id: 'casa' }), d, cats)).toBe(true);
    expect(matchesDrill(tx({ category_id: 'luz' }), d, cats)).toBe(true);
    expect(matchesDrill(tx({ category_id: 'super' }), d, cats)).toBe(false);
    expect(matchesDrill(tx({ category_id: null }), d, cats)).toBe(false);
  });

  it('sin categoría: gastos e ingresos sin categoría, nunca transferencias', () => {
    const d = { kind: 'categoria', categoryId: null } as const;
    expect(matchesDrill(tx({ category_id: null }), d, cats)).toBe(true);
    expect(matchesDrill(tx({ category_id: 'super' }), d, cats)).toBe(false);
    expect(matchesDrill(tx({ type: 'transferencia', to_account_id: 'bank' }), d, cats)).toBe(false);
  });

  it('el comercio se compara igual que en «Dónde más gastas»', () => {
    const d = { kind: 'comercio', merchant: 'Automercado' } as const;
    expect(matchesDrill(tx({ merchant: '  AUTOMERCADO ' }), d, cats)).toBe(true);
    expect(matchesDrill(tx({ merchant: 'automercado' }), d, cats)).toBe(true);
    expect(matchesDrill(tx({ merchant: 'Automercado Escazú' }), d, cats)).toBe(false);
    expect(matchesDrill(tx({ merchant: null }), d, cats)).toBe(false);
  });
});
