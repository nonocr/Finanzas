import { parseAmountToCents } from '../../../supabase/functions/_shared/money.ts';

import { getLang, locale } from '../../i18n';

export { parseAmountToCents };

/**
 * Colones enteros (texto de dígitos, máx. 11) de un monto pegado en un campo de solo dígitos: "₡12.500,00" → "12500",
 * "1500,50" → "1501". Sin esto, el campo quitaba los separadores y multiplicaba por 100. null si no hay monto.
 */
export function pastedColones(text: string): string | null {
  const cents = parseAmountToCents(text);
  if (cents === null) return null;
  const colones = String(Math.round(cents / 100));
  return colones === '0' || colones.length > 11 ? null : colones;
}

// Formateadores por idioma (se crean una vez). Español: punto de miles y coma decimal (convención tica; Intl usa
// espacio fino en es-CR y se cambia por punto). Inglés: coma de miles y punto decimal.
const formatters = new Map<string, { whole: Intl.NumberFormat; cents: Intl.NumberFormat }>();
function numberFormats() {
  const loc = locale();
  let f = formatters.get(loc);
  if (!f) {
    f = {
      whole: new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }),
      cents: new Intl.NumberFormat(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
    formatters.set(loc, f);
  }
  return f;
}

/** Número con los separadores del idioma actual (sin moneda): 12350 → "12.350" / "12,350". */
export function formatNumber(n: number, fraction: 0 | 2 = 0): string {
  const f = numberFormats();
  const s = (fraction === 2 ? f.cents : f.whole).format(n);
  return getLang() === 'es' ? s.replace(/[\s  ]/g, '.') : s;
}

/**
 * Formatea céntimos como colones: 1235000 → "₡12.350" (español) o "₡12,350" (inglés).
 * Los céntimos solo aparecen cuando no son cero.
 */
export function formatCRC(cents: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(cents);
  const body = formatNumber(abs / 100, abs % 100 === 0 ? 0 : 2);
  const sign = cents < 0 ? '−' : opts.sign && cents > 0 ? '+' : '';
  return `${sign}₡${body}`;
}