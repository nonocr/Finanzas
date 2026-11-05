// Compras en dólares. Sin dependencias: lo usan la app (Vite) y la Edge Function de Wallet (Deno).
//
// El tipo de cambio es el de referencia del BCCR, que el Ministerio de Hacienda publica en una API pública sin llave
// (la misma que usa la factura electrónica). Se usa el de VENTA: es el que aplica el banco cuando una tarjeta paga en
// dólares. El banco puede cobrar unos colones distinto; el tipo de cambio queda guardado y se puede corregir.
import { parseAmountToCents } from './money.ts';

export const USD_RATE_URL = 'https://api.hacienda.go.cr/indicadores/tc/dolar';

export interface UsdRate {
  /** Colones por dólar, venta. */
  rate: number;
  /** Día al que corresponde, "2026-11-05". */
  date: string;
}

/** Lee la respuesta de Hacienda ({"venta":{"fecha","valor"},…}). null si no tiene la forma o el valor es absurdo. */
export function parseUsdRate(body: unknown): UsdRate | null {
  const venta = (body as { venta?: { fecha?: unknown; valor?: unknown } } | null)?.venta;
  const rate = typeof venta?.valor === 'number' ? venta.valor : Number(venta?.valor);
  if (!Number.isFinite(rate) || !isSaneRate(rate)) return null;
  const date = typeof venta?.fecha === 'string' ? venta.fecha.slice(0, 10) : '';
  return { rate: Math.round(rate * 10_000) / 10_000, date };
}

/** Entre ₡100 y ₡5.000 por dólar: fuera de eso es un error de lectura, no un tipo de cambio. */
export const isSaneRate = (rate: number) => rate >= 100 && rate <= 5_000;

export async function fetchUsdRate(fetcher: typeof fetch = fetch, timeoutMs = 4_000): Promise<UsdRate | null> {
  try {
    const res = await fetcher(USD_RATE_URL, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
    return res.ok ? parseUsdRate(await res.json()) : null;
  } catch {
    return null;
  }
}

/** Céntimos de dólar × colones por dólar = céntimos de colón (US$12,99 a ₡454,41 → ₡5.902,79). */
export const usdToColonCents = (usdCents: number, rate: number) => Math.round(usdCents * rate);

const negative = (s: string) => /^[-−–(]/.test(s) || /[-−–)]$/.test(s);

/**
 * Monto en dólares estadounidenses tal como lo manda el iPhone ("$12.99", "US$12,99", "USD 12.99", "12.99 USD"), en
 * céntimos de dólar. null si no es un cargo en dólares: colones, otra moneda con $ (C$ córdobas, CA$, MX$…), otras
 * monedas o un reembolso (negativo).
 */
export function parseUsdAmount(v: unknown): number | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s || negative(s) || /₡|crc/i.test(s)) return null;
  const usdCode = /(^|[^\p{L}])usd(?!\p{L})/iu.test(s);
  const dollar = s.includes('$');
  if (!usdCode && !dollar) return null;
  // Letras antes del $ que no sean «US» o «U» (U$S): es otro dólar o el córdoba.
  if (dollar && /\p{L}\$/u.test(s) && !/(^|[^\p{L}])(US|U)\$/iu.test(s)) return null;
  // Cualquier otra palabra de 3 letras (EUR, MXN…) además de USD: no se adivina.
  const otherCodes = [...s.matchAll(/(^|[^\p{L}])(\p{L}{3})(?!\p{L})/gu)].map((m) => m[2].toLowerCase()).filter((c) => c !== 'usd');
  if (otherCodes.length) return null;
  return parseAmountToCents(s.replace(/u\$s|us\$|usd|\$/giu, ''));
}

const usd = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * 129900 → "US$1.299,00". Mismas convenciones que formatCRC (punto de miles, coma decimal, menos U+2212); el «US$»
 * no se confunde con colones.
 */
export const formatUSD = (cents: number) =>
  `${cents < 0 ? '−' : ''}US$${usd.format(Math.abs(cents) / 100).replace(/[\s  ]/g, '.')}`;

/** Tipo de cambio como se lee en Costa Rica: 454.41 → "₡454,41". */
export const formatRate = (rate: number) => `₡${usd.format(rate).replace(/[\s  ]/g, '.')}`;
