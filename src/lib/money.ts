export { parseAmountToCents } from '../../supabase/functions/_shared/money.ts';

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
