import { describe, expect, it } from 'vitest';
import { crDay, isoDate, monthRange, startOfWeek, weekRange } from './dates';

describe('fechas en hora de Costa Rica', () => {
  it('a las 11 p. m. del 31 en CR sigue siendo 31 aunque en UTC ya sea el 1', () => {
    expect(isoDate(crDay(new Date('2026-11-01T05:00:00Z')))).toBe('2026-10-31');
  });

  it('la semana empieza el lunes', () => {
    expect(isoDate(startOfWeek(crDay(new Date('2026-10-29T18:00:00Z'))))).toBe('2026-10-26');
    expect(isoDate(startOfWeek(crDay(new Date('2026-11-01T18:00:00Z'))))).toBe('2026-10-26');
  });

  it('el rango del mes empieza a medianoche de CR', () => {
    expect(monthRange(crDay(new Date('2026-10-15T12:00:00Z')))).toEqual({
      from: '2026-10-01T06:00:00.000Z',
      to: '2026-11-01T06:00:00.000Z',
    });
  });

  it('el rango de la semana cubre 7 días', () => {
    expect(weekRange(crDay(new Date('2026-10-29T18:00:00Z')))).toEqual({
      from: '2026-10-26T06:00:00.000Z',
      to: '2026-11-02T06:00:00.000Z',
    });
  });
});
