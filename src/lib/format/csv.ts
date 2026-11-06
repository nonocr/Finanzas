// Celdas CSV seguras: comillas cuando hace falta y sin inyección de fórmulas.
// Un comercio que empiece con = + - @ (o tabulador/retorno) se ejecutaría como fórmula al abrir el archivo en
// Excel o Numbers; se le antepone un apóstrofo para que se lea como texto (recomendación de OWASP). También con
// espacios delante (algunas hojas de cálculo los ignoran) y con los signos "anchos" ＝＋－＠ que se convierten en normales.
const FORMULA_START = /^[\s　]*[=+\-@＝＋－＠]|^[\t\r]/;

export function csvCell(v: string | number | null | undefined): string {
  if (v == null) return '';
  // Los números propios (montos) se dejan tal cual, aunque sean negativos.
  let s = String(v);
  if (typeof v === 'string' && FORMULA_START.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const csvRow = (cells: (string | number | null | undefined)[]) => cells.map(csvCell).join(',');
