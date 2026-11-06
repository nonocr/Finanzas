// Filtro de Movimientos al tocar una categoría o un comercio en Estadísticas. Vive en la URL
// (?categoria=…&comercio=…&mes=2026-11) para que «atrás» y recargar la página lo conserven.
import type { Category, Transaction } from '../data/types';

/** Valor de `categoria` para los gastos sin categoría (la tajada gris de la dona). */
export const NO_CATEGORY = 'ninguna';

export type Drill =
  | { kind: 'categoria'; categoryId: string | null }
  | { kind: 'comercio'; merchant: string };

export function readDrill(params: URLSearchParams): Drill | null {
  const cat = params.get('categoria');
  if (cat) return { kind: 'categoria', categoryId: cat === NO_CATEGORY ? null : cat };
  const merchant = params.get('comercio')?.trim();
  if (merchant) return { kind: 'comercio', merchant };
  return null;
}

/** «2026-11» → día 1 de ese mes (medianoche UTC, como `startOfMonth`); null si no es válido. */
export function readMonth(params: URLSearchParams): Date | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(params.get('mes') ?? '');
  return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)) : null;
}

export function drillHref(drill: Drill, month: Date): string {
  const p = new URLSearchParams();
  if (drill.kind === 'categoria') p.set('categoria', drill.categoryId ?? NO_CATEGORY);
  else p.set('comercio', drill.merchant);
  p.set('mes', month.toISOString().slice(0, 7));
  return `/movimientos?${p}`;
}

/**
 * Misma agrupación que Estadísticas: una categoría incluye sus subcategorías (`spendingByCategory`) y el comercio
 * se compara sin mayúsculas ni espacios sobrantes (`topMerchants`). Así la lista suma lo mismo que la fila tocada.
 */
export function matchesDrill(t: Transaction, drill: Drill, categories: Category[]): boolean {
  if (drill.kind === 'comercio') return t.merchant?.trim().toUpperCase() === drill.merchant.toUpperCase();
  if (drill.categoryId === null) return t.category_id === null && t.type !== 'transferencia';
  if (t.category_id === drill.categoryId) return true;
  return categories.some((c) => c.id === t.category_id && c.parent_id === drill.categoryId);
}
