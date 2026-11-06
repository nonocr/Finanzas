// Dólares en la app: la lógica vive en supabase/functions/_shared/fx.ts, compartida con wallet-sync.
export { fetchUsdRate, formatRate, formatUSD, isSaneRate, parseUsdAmount, usdToColonCents, type UsdRate } from '../../../supabase/functions/_shared/fx.ts';

/**
 * Texto del campo de dólares: dígitos y una coma decimal con hasta 2 decimales ("12,99"). El punto que pone el
 * teclado de algunos idiomas se toma como la coma.
 */
export function sanitizeUsdInput(text: string): string {
  const s = text.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [int, ...rest] = s.split(',');
  const intPart = int.replace(/^0+(?=\d)/, '').slice(0, 9);
  if (rest.length === 0) return intPart;
  return `${intPart || '0'},${rest.join('').slice(0, 2)}`;
}

/** "12,99" → 1299 céntimos de dólar; "" → 0. */
export function usdInputToCents(text: string): number {
  const [int = '', frac = ''] = text.split(',');
  return Number(int || '0') * 100 + Number((frac + '00').slice(0, 2));
}

/** 1299 → "12,99"; 1200 → "12": el valor inicial del campo al editar un pago en dólares. */
export function centsToUsdInput(cents: number): string {
  const int = Math.floor(cents / 100);
  const frac = cents % 100;
  return frac ? `${int},${String(frac).padStart(2, '0')}` : String(int);
}

/** "454,41" o "454.41" → 454.41; null si no es un número. */
export function parseRateInput(text: string): number | null {
  const n = Number(text.replace(',', '.'));
  return text.trim() && Number.isFinite(n) ? n : null;
}
