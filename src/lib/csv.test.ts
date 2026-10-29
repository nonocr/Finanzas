import { describe, expect, it } from 'vitest';
import { csvCell, csvRow } from './csv';

describe('csvCell', () => {
  it.each([
    ['=HYPERLINK("http://malo","clic")', `"'=HYPERLINK(""http://malo"",""clic"")"`],
    ['+1+1', "'+1+1"],
    ['-2+3', "'-2+3"],
    ['@SUM(A1)', "'@SUM(A1)"],
    ['\tTAB', "'\tTAB"],
  ])('neutraliza la fórmula %s', (input, out) => {
    expect(csvCell(input)).toBe(out);
  });

  it('pone comillas a comas, punto y coma, comillas y saltos de línea', () => {
    expect(csvCell('Soda, la esquina')).toBe('"Soda, la esquina"');
    expect(csvCell('dijo "hola"')).toBe('"dijo ""hola"""');
    expect(csvCell('a\nb')).toBe('"a\nb"');
  });

  it('deja intactos textos normales y números (aunque sean negativos)', () => {
    expect(csvCell('Automercado')).toBe('Automercado');
    expect(csvCell(-1250)).toBe('-1250');
    expect(csvCell(null)).toBe('');
  });

  it('arma filas', () => {
    expect(csvRow(['2026-10-29', 'gasto', '12500.00', '=1+1'])).toBe("2026-10-29,gasto,12500.00,'=1+1");
  });
});
