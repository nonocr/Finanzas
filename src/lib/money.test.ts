import { describe, expect, it } from 'vitest';
import { formatCRC, parseAmountToCents } from './money';

describe('parseAmountToCents', () => {
  it.each([
    ['₡12.500,00', 1_250_000],
    ['₡12.500', 1_250_000],
    ['CRC 12,500.00', 1_250_000],
    ['12 500', 1_250_000],
    ['1.500', 150_000],
    ['1500,5', 150_050],
    ['1.234.567', 123_456_700],
    ['3,90', 390],
    ['₡ 850', 85_000],
  ])('%s → %i', (input, cents) => {
    expect(parseAmountToCents(input)).toBe(cents);
  });

  it('acepta números', () => {
    expect(parseAmountToCents(15750)).toBe(1_575_000);
  });

  it.each(['', 'abc', '0', '₡0,00', null, undefined])('rechaza %s', (input) => {
    expect(parseAmountToCents(input as string)).toBeNull();
  });
});

describe('formatCRC', () => {
  it('usa punto de miles y omite céntimos en cero', () => {
    expect(formatCRC(1_235_000)).toBe('₡12.350');
    expect(formatCRC(41_235_000)).toBe('₡412.350');
  });

  it('muestra céntimos cuando existen', () => {
    expect(formatCRC(150_050)).toBe('₡1.500,50');
  });

  it('signos', () => {
    expect(formatCRC(-420_000)).toBe('−₡4.200');
    expect(formatCRC(420_000, { sign: true })).toBe('+₡4.200');
  });
});
