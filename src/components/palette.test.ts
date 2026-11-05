import { describe, expect, it } from 'vitest';
import { distance, fromHex } from '../lib/oklch';
import { CATEGORY_HEX } from './palette';

// El verde significa «ingreso» en toda la app. Un tinte de categoría de la misma familia (matiz a menos de 40°) se
// confunde con él en Estadísticas, donde la dona de categorías está junto a la cifra de ingresos.
const INCOME = fromHex('#a9bfae');
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

describe('tintes de categoría', () => {
  it.each(Object.entries(CATEGORY_HEX))('%s no se confunde con el verde de los ingresos', (_, hex) => {
    const tint = fromHex(hex);
    const sameFamily = tint[1] > 0.02 && hueGap(tint[2], INCOME[2]) < 40;
    expect(distance(tint, INCOME)).toBeGreaterThanOrEqual(sameFamily ? 0.085 : 0.04);
  });
});
