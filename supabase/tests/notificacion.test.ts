// Lector de notificaciones de compra (Android + MacroDroid). Los ejemplos imitan los formatos típicos de los bancos y
// de Google Wallet; cuando lleguen notificaciones reales, se agregan aquí tal cual.
import { describe, expect, it } from 'vitest';
import { parseUsdAmount } from '../functions/_shared/fx';
import { parseAmountToCents } from '../functions/_shared/money';
import { findPurchaseTime, parseNotification } from '../functions/_shared/notification';

describe('parseNotification: compras', () => {
  it.each([
    [
      'BAC Credomatic\nCompra aprobada en AUTOMERCADO ESCAZU por CRC 12,500.00 con su tarjeta VISA ****1234 el 05/11/2026 13:45.',
      { amount: 'CRC 12,500.00', merchant: 'AUTOMERCADO ESCAZU', card: 'Visa •••• 1234' },
    ],
    [
      'BN Alertas\nSe realizó una compra por ₡12.500,00 en AUTOMERCADO con la tarjeta terminada en 1234.',
      { amount: 'CRC 12.500,00', merchant: 'AUTOMERCADO', card: '•••• 1234' },
    ],
    ['AUTOMERCADO\n₡12.500,00 con Visa ••1234', { amount: 'CRC 12.500,00', merchant: 'AUTOMERCADO', card: 'Visa •••• 1234' }],
    [
      'Compra aprobada\nComercio: SODA LA ESQUINA, monto 4.500 colones, tarjeta xxxx5678',
      { amount: 'CRC 4.500', merchant: 'SODA LA ESQUINA', card: '•••• 5678' },
    ],
    ['Pago en línea\nCargo por USD 15.99 en NETFLIX.COM con su tarjeta ****1234', { amount: 'USD 15.99', merchant: 'NETFLIX.COM', card: '•••• 1234' }],
  ])('%s', (body, expected) => {
    expect(parseNotification(body)).toMatchObject({ ok: true, ...expected });
  });

  it('los montos salen en un formato que entienden los lectores de colones y dólares', () => {
    expect(parseAmountToCents('CRC 12,500.00')).toBe(1_250_000);
    expect(parseAmountToCents('CRC 12.500,00')).toBe(1_250_000);
    expect(parseUsdAmount('USD 15.99')).toBe(1599);
    expect(parseUsdAmount('CRC 12,500.00')).toBeNull();
  });

  it('una compra sin monto legible se guarda igual (monto 0, por revisar) si trae comercio o tarjeta', () => {
    expect(parseNotification('BAC\nCompra aprobada en UBER TRIP con su tarjeta ****1234')).toEqual({
      ok: true,
      amount: null,
      merchant: 'UBER TRIP',
      card: '•••• 1234',
      at: null,
    });
  });

  it('el título del banco no se confunde con el comercio', () => {
    const r = parseNotification('Google Wallet\n₡3.200 con Mastercard ••9876');
    expect(r).toEqual({ ok: true, amount: 'CRC 3.200', merchant: null, card: 'Mastercard •••• 9876', at: null });
  });
});

describe('parseNotification: lo que no es una compra se ignora', () => {
  it.each([
    ['BAC\nSu código de verificación es 482913', 'not_a_purchase'],
    ['Promerica\n¡Gana hasta ₡50.000 en premios este mes!', 'not_a_purchase'],
    ['BN\nRecibiste ₡25.000 por SINPE Móvil de JUAN PEREZ', 'income'],
    ['BAC\nDepósito acreditado a su cuenta por CRC 100,000.00', 'income'],
    ['BAC\nCompra rechazada en AMAZON por USD 20.00 con su tarjeta ****1234', 'declined'],
    ['BCR\nRetiro en cajero por ₡20.000 con tarjeta ****1234', 'withdrawal'],
    ['   ', 'empty'],
  ])('%s → %s', (body, reason) => {
    expect(parseNotification(body)).toEqual({ ok: false, reason });
  });
});

describe('findPurchaseTime (hora de la compra que trae el aviso)', () => {
  // 6 nov 2026, 9:00 de la mañana en Costa Rica (15:00 UTC).
  const NOW = Date.parse('2026-11-06T15:00:00Z');

  it('fecha día/mes/año y hora de 24 h, en hora de Costa Rica', () => {
    expect(findPurchaseTime('Compra aprobada ... el 05/11/2026 13:45.', NOW)).toBe('2026-11-05T19:45:00.000Z');
  });
  it('año de dos dígitos, guiones y a. m./p. m.', () => {
    expect(findPurchaseTime('compra 5-11-26 1:45 p. m.', NOW)).toBe('2026-11-05T19:45:00.000Z');
    expect(findPurchaseTime('compra 05/11/2026 12:10 a.m.', NOW)).toBe('2026-11-05T06:10:00.000Z');
  });
  it('solo la hora: hoy, o ayer si esa hora todavía no llega', () => {
    expect(findPurchaseTime('a las 08:30', NOW)).toBe('2026-11-06T14:30:00.000Z');
    // 23:50 del 5 de noviembre en Costa Rica = 05:50 UTC del 6.
    expect(findPurchaseTime('a las 23:50', NOW)).toBe('2026-11-06T05:50:00.000Z');
  });
  it('sin hora clara: null (se usa la hora de llegada)', () => {
    expect(findPurchaseTime('Compra en AUTOMERCADO por ₡12.500', NOW)).toBeNull();
    expect(findPurchaseTime('el 05/11/2026', NOW)).toBeNull();
    expect(findPurchaseTime('a las 27:99', NOW)).toBeNull();
  });
  it('el aviso completo la incluye', () => {
    const r = parseNotification('BAC\nCompra aprobada en SODA por CRC 2,000.00 con su tarjeta ****1234 el 05/11/2026 13:45.', NOW);
    expect(r).toMatchObject({ ok: true, at: '2026-11-05T19:45:00.000Z' });
  });
});