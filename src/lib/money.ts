import { parseAmountToCents } from '../../supabase/functions/_shared/money.ts';

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

const crc = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 });
const crcCents = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Formatea céntimos como colones: 1235000 → "₡12.350".
 * Los céntimos solo aparecen cuando no son cero. Usa punto de miles (convención tica).
 */
export function formatCRC(cents: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(cents);
  const body = (abs % 100 === 0 ? crc.format(abs / 100) : crcCents.format(abs / 100))
    // Intl usa espacio fino como separador de miles en es-CR; en Costa Rica se lee con punto.
    .replace(/[\s  ]/g, '.');
  const sign = cents < 0 ? '−' : opts.sign && cents > 0 ? '+' : '';
  return `${sign}₡${body}`;
}
