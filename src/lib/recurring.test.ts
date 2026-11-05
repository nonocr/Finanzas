import { describe, expect, it } from 'vitest';
import { isoDate } from './dates';
import {
  applyRecurring,
  dueDates,
  monthlyAmount,
  nextAfter,
  parseDay,
  quincenaDays,
  recurringTransaction,
  recurringTxId,
  scheduleLabel,
} from './recurring';
import type { Frequency, Recurring, Transaction } from './types';

const d = parseDay;
const seq = (start: string, frequency: Frequency, anchor: number | null, n: number) => {
  const out = [start];
  let cur = d(start);
  for (let i = 1; i < n; i++) {
    cur = nextAfter(cur, frequency, anchor);
    out.push(isoDate(cur));
  }
  return out;
};

const rec = (p: Partial<Recurring> = {}): Recurring => ({
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Alquiler',
  type: 'gasto',
  amount: 32_000_000,
  account_id: 'debito',
  category_id: 'casa',
  frequency: 'mensual',
  next_date: '2026-11-01',
  anchor_day: 1,
  active: true,
  ...p,
});

describe('nextAfter', () => {
  it('mensual: un 31 cae al último día de los meses cortos y vuelve al 31', () => {
    expect(seq('2026-01-31', 'mensual', 31, 5)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31']);
  });

  it('mensual: cruza el año', () => {
    expect(seq('2026-11-15', 'mensual', 15, 3)).toEqual(['2026-11-15', '2026-12-15', '2027-01-15']);
  });

  it('mensual sin día elegido usa el de la fecha', () => {
    expect(isoDate(nextAfter(d('2026-03-10'), 'mensual', null))).toBe('2026-04-10');
  });

  it('quincenal: el 15 y el 30, con febrero en el 28', () => {
    expect(seq('2027-01-15', 'quincenal', 15, 6)).toEqual([
      '2027-01-15', '2027-01-30', '2027-02-15', '2027-02-28', '2027-03-15', '2027-03-30',
    ]);
  });

  it('quincenal: un día después del 15 se empareja con el de 15 días antes', () => {
    expect(quincenaDays(20)).toEqual([5, 20]);
    expect(quincenaDays(1)).toEqual([1, 16]);
    expect(quincenaDays(31)).toEqual([16, 31]);
    expect(seq('2026-11-20', 'quincenal', 20, 4)).toEqual(['2026-11-20', '2026-12-05', '2026-12-20', '2027-01-05']);
  });

  it('semanal: cada 7 días', () => {
    expect(seq('2026-12-28', 'semanal', 28, 3)).toEqual(['2026-12-28', '2027-01-04', '2027-01-11']);
  });

  it('anual: un 29 de febrero vuelve en el año bisiesto', () => {
    expect(seq('2028-02-29', 'anual', 29, 5)).toEqual(['2028-02-29', '2029-02-28', '2030-02-28', '2031-02-28', '2032-02-29']);
  });
});

describe('dueDates', () => {
  it('nada vence antes de la fecha', () => {
    expect(dueDates(rec({ next_date: '2026-11-06' }), d('2026-11-05'))).toEqual({ dates: [], next: d('2026-11-06') });
  });

  it('el día del cobro cuenta, y los meses que faltaron también', () => {
    const { dates, next } = dueDates(rec({ next_date: '2026-09-01' }), d('2026-11-01'));
    expect(dates.map(isoDate)).toEqual(['2026-09-01', '2026-10-01', '2026-11-01']);
    expect(isoDate(next)).toBe('2026-12-01');
  });

  it('tiene tope por vez y deja la fecha donde quedó', () => {
    const { dates, next } = dueDates(rec({ next_date: '2020-01-01', frequency: 'semanal' }), d('2026-11-05'), 10);
    expect(dates).toHaveLength(10);
    expect(isoDate(next)).toBe('2020-03-11');
  });
});

describe('montos y textos', () => {
  it('monthlyAmount lleva cada frecuencia a un mes', () => {
    expect(monthlyAmount({ amount: 1_200_000, frequency: 'mensual' })).toBe(1_200_000);
    expect(monthlyAmount({ amount: 1_200_000, frequency: 'quincenal' })).toBe(2_400_000);
    expect(monthlyAmount({ amount: 1_200_000, frequency: 'anual' })).toBe(100_000);
    expect(monthlyAmount({ amount: 1_200_000, frequency: 'semanal' })).toBe(5_200_000);
  });

  it('scheduleLabel', () => {
    expect(scheduleLabel({ next_date: '2026-11-15', frequency: 'quincenal', anchor_day: 15 })).toBe('El 15 y el 30');
    expect(scheduleLabel({ next_date: '2026-11-30', frequency: 'mensual', anchor_day: 31 })).toBe('El 31 de cada mes');
    expect(scheduleLabel({ next_date: '2026-11-09', frequency: 'semanal', anchor_day: 9 })).toBe('Los lunes');
    expect(scheduleLabel({ next_date: '2027-03-03', frequency: 'anual', anchor_day: 3 })).toBe('Cada 3 de marzo');
  });
});

describe('ids y movimientos', () => {
  it('el id es un UUID estable por recurrente y fecha', async () => {
    const a = await recurringTxId('r1', '2026-11-01');
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(await recurringTxId('r1', '2026-11-01')).toBe(a);
    expect(await recurringTxId('r1', '2026-12-01')).not.toBe(a);
    expect(await recurringTxId('r2', '2026-11-01')).not.toBe(a);
  });

  it('el movimiento sale a las 6:00 de Costa Rica, marcado como recurrente', async () => {
    const tx = await recurringTransaction(rec(), d('2026-11-01'));
    expect(tx).toMatchObject({
      occurred_at: '2026-11-01T12:00:00.000Z',
      amount: 32_000_000,
      type: 'gasto',
      merchant: 'Alquiler',
      category_id: 'casa',
      account_id: 'debito',
      source: 'recurrente',
      status: 'confirmada',
      recurring_id: rec().id,
    });
  });
});

describe('applyRecurring', () => {
  function fakeApi(list: Recurring[]) {
    const txs: Transaction[] = [];
    return {
      txs,
      list,
      listRecurring: async () => structuredClone(list),
      insertMissingTransactions: async (rows: Transaction[]) => {
        const fresh = rows.filter((r) => !txs.some((t) => t.id === r.id));
        txs.push(...fresh);
        return fresh.length;
      },
      saveRecurring: async ({ id, ...p }: Partial<Recurring>) => {
        const i = list.findIndex((r) => r.id === id);
        list[i] = { ...list[i], ...p };
      },
    };
  }

  it('registra lo vencido, adelanta la fecha y no repite al correr otra vez', async () => {
    const api = fakeApi([rec({ next_date: '2026-10-01' }), rec({ id: 'r2', next_date: '2026-11-20' }), rec({ id: 'r3', next_date: '2026-01-01', active: false })]);
    const today = d('2026-11-05');
    expect(await applyRecurring(api, today)).toBe(2);
    expect(api.list[0].next_date).toBe('2026-12-01');
    expect(api.list[1].next_date).toBe('2026-11-20'); // aún no vence
    expect(api.list[2].next_date).toBe('2026-01-01'); // en pausa
    expect(await applyRecurring(api, today)).toBe(0);
    expect(api.txs).toHaveLength(2);
  });

  it('si la fecha no se alcanzó a guardar, el siguiente intento no duplica', async () => {
    const api = fakeApi([rec({ next_date: '2026-11-01' })]);
    api.saveRecurring = async () => {
      throw new Error('sin red');
    };
    await expect(applyRecurring(api, d('2026-11-05'))).rejects.toThrow();
    expect(api.txs).toHaveLength(1);
    const retry = fakeApi(api.list);
    retry.txs.push(...api.txs);
    expect(await applyRecurring(retry, d('2026-11-05'))).toBe(0);
    expect(retry.txs).toHaveLength(1);
    expect(retry.list[0].next_date).toBe('2026-12-01');
  });
});
