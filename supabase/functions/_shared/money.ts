// Montos en céntimos de colón. Sin dependencias: lo usan la app (Vite) y las Edge Functions (Deno).

/**
 * Convierte un monto escrito como texto a céntimos.
 * Acepta formatos de iOS/bancos: "₡12.500,00", "CRC 12,500.00", "12 500", "1.500", "1500,5".
 * Devuelve null si no hay un número válido mayor que cero.
 */
export function parseAmountToCents(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? Math.round(input * 100) : null;
  }

  const cleaned = input.replace(/[^\d.,]/g, '');
  if (!/\d/.test(cleaned)) return null;

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');
  let decimalSep: '.' | ',' | null = null;

  if (lastDot >= 0 && lastComma >= 0) {
    decimalSep = lastDot > lastComma ? '.' : ',';
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? '.' : ',';
    const occurrences = cleaned.split(sep).length - 1;
    const digitsAfter = cleaned.length - cleaned.lastIndexOf(sep) - 1;
    // Un solo separador seguido de 1–2 dígitos es decimal; con 3 dígitos o repetido, es de miles.
    if (occurrences === 1 && digitsAfter > 0 && digitsAfter <= 2) decimalSep = sep;
  }

  let intPart = cleaned;
  let fracPart = '';
  if (decimalSep) {
    const idx = cleaned.lastIndexOf(decimalSep);
    intPart = cleaned.slice(0, idx);
    fracPart = cleaned.slice(idx + 1);
  }
  intPart = intPart.replace(/[.,]/g, '');
  fracPart = (fracPart.replace(/[.,]/g, '') + '00').slice(0, 2);

  const cents = Number(intPart || '0') * 100 + Number(fracPart);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
