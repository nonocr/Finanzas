import { describe, expect, it } from 'vitest';
import {
  centsToUsdInput,
  fetchUsdRate,
  formatRate,
  formatUSD,
  parseRateInput,
  parseUsdAmount,
  sanitizeUsdInput,
  usdInputToCents,
  usdToColonCents,
} from './fx';

describe('parseUsdAmount (lo que manda el iPhone)', () => {
  it.each([
    ['$12.99', 1299],
    ['US$12,99', 1299],
    ['US$ 4', 400],
    ['USD 1,234.56', 123456],
    ['12.99 USD', 1299],
    ['12,99 usd', 1299],
    ['USD12.99', 1299],
    ['U$S 10', 1000],
    ['$ 1.500,00', 150000],
  ])('%s → %i céntimos de dólar', (v, cents) => {
    expect(parseUsdAmount(v)).toBe(cents);
  });

  it.each(['₡12.500', 'CRC 12,500.00', '12.500', 'C$ 100', 'CA$12.00', 'MX$50', 'R$ 10', '€5,00', 'EUR 5', '-$12.50', '($12.50)', '$12.50-', '', 'USD', 12.5, null, undefined])(
    '%s no es un cargo en dólares',
    (v) => {
      expect(parseUsdAmount(v)).toBeNull();
    },
  );
});

describe('conversión y formato', () => {
  it('céntimos de dólar × tipo de cambio = céntimos de colón, redondeado', () => {
    expect(usdToColonCents(1299, 454.41)).toBe(590_279);
    expect(usdToColonCents(100, 505.555)).toBe(50_556);
  });

  it('formatUSD y formatRate usan punto de miles y coma decimal, como los colones', () => {
    expect(formatUSD(1299)).toBe('US$12,99');
    expect(formatUSD(129_900)).toBe('US$1.299,00');
    expect(formatUSD(-500)).toBe('−US$5,00');
    expect(formatRate(454.41)).toBe('₡454,41');
  });
});

describe('campo de dólares', () => {
  it.each([
    ['12', '12'],
    ['12,9', '12,9'],
    ['12.99', '12,99'],
    ['12,999', '12,99'],
    ['1,2,3', '1,23'],
    ['007', '7'],
    [',5', '0,5'],
    ['US$ 4', '4'],
  ])('%s → %s', (typed, shown) => {
    expect(sanitizeUsdInput(typed)).toBe(shown);
  });

  it('ida y vuelta entre texto y céntimos', () => {
    expect(usdInputToCents('12,99')).toBe(1299);
    expect(usdInputToCents('12,9')).toBe(1290);
    expect(usdInputToCents('12,')).toBe(1200);
    expect(usdInputToCents('')).toBe(0);
    expect(centsToUsdInput(1299)).toBe('12,99');
    expect(centsToUsdInput(1205)).toBe('12,05');
    expect(centsToUsdInput(1200)).toBe('12');
  });

  it('parseRateInput acepta coma o punto', () => {
    expect(parseRateInput('454,41')).toBe(454.41);
    expect(parseRateInput('454.41')).toBe(454.41);
    expect(parseRateInput('')).toBeNull();
    expect(parseRateInput('abc')).toBeNull();
  });
});

describe('fetchUsdRate (API de Hacienda)', () => {
  const reply = (body: unknown, ok = true) => (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;

  it('toma la venta y su fecha', async () => {
    const r = await fetchUsdRate(reply({ venta: { fecha: '2026-11-05', valor: 454.41 }, compra: { fecha: '2026-11-05', valor: 449.63 } }));
    expect(r).toEqual({ rate: 454.41, date: '2026-11-05' });
  });

  it('respuesta rara, error HTTP o sin red: null', async () => {
    expect(await fetchUsdRate(reply({ venta: { valor: 'x' } }))).toBeNull();
    expect(await fetchUsdRate(reply({ venta: { valor: 4.5 } }))).toBeNull();
    expect(await fetchUsdRate(reply({}, false))).toBeNull();
    expect(
      await fetchUsdRate((async () => {
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch),
    ).toBeNull();
  });
});
