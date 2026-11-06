// Gastos e ingresos fijos: alquiler, salario, suscripciones… Al abrir la app se registran solos los que ya vencieron.
//
// Cada cobro tiene un id fijo, derivado del recurrente y de su fecha, y se inserta con «si ya existe, no hagas nada».
// Por eso correrlo dos veces, a medias o en dos teléfonos a la vez nunca duplica. Si borras un cobro generado, no
// vuelve: la próxima fecha ya avanzó.
import type { Api } from '../data/api';
import { strings } from '../../i18n';
import { addDays, crDay, crInstant, dayMonth, isoDate, weekdayName } from '../format/dates';
import type { Frequency, Recurring, Transaction } from '../data/types';

/** Hora con la que se guarda un cobro fijo: temprano, para que el del día ya cuente al abrir la app. */
const RECURRING_TIME = '06:00';
/** Tope por recurrente y por vez (más de 5 años de un semanal): una fecha absurda no llena la base. */
const MAX_PER_RUN = 300;

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
/** Día `d` del mes (y, m), o el último si el mes es más corto. `m` puede pasarse de 11: Date.UTC lo acomoda. */
function clampedDay(y: number, m: number, d: number): Date {
  const first = new Date(Date.UTC(y, m, 1));
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(d, daysInMonth(first.getUTCFullYear(), first.getUTCMonth()))));
}

export const parseDay = (iso: string) => new Date(iso + 'T00:00:00Z');

/** Los dos días de una quincena: el elegido y el que queda a 15 días (15 → 15 y 30; 1 → 1 y 16; 20 → 5 y 20). */
export function quincenaDays(anchor: number): [number, number] {
  const other = anchor > 15 ? anchor - 15 : anchor + 15;
  return anchor < other ? [anchor, other] : [other, anchor];
}

/** Fecha del cobro que sigue a `day`. El día elegido (`anchor`) manda: después del 28 de febrero vuelve al 31. */
export function nextAfter(day: Date, frequency: Frequency, anchor: number | null): Date {
  const a = anchor ?? day.getUTCDate();
  const y = day.getUTCFullYear();
  const m = day.getUTCMonth();
  switch (frequency) {
    case 'semanal':
      return addDays(day, 7);
    case 'mensual':
      return clampedDay(y, m + 1, a);
    case 'anual':
      return clampedDay(y + 1, m, a);
    case 'quincenal': {
      for (const d of quincenaDays(a)) {
        const candidate = clampedDay(y, m, d);
        if (candidate.getTime() > day.getTime()) return candidate;
      }
      return clampedDay(y, m + 1, quincenaDays(a)[0]);
    }
  }
}

/** Fechas que ya vencieron (hasta hoy incluido) y la próxima fecha que queda pendiente. */
export function dueDates(rec: Pick<Recurring, 'next_date' | 'frequency' | 'anchor_day'>, today: Date, max = MAX_PER_RUN) {
  const dates: Date[] = [];
  let next = parseDay(rec.next_date);
  while (next.getTime() <= today.getTime() && dates.length < max) {
    dates.push(next);
    next = nextAfter(next, rec.frequency, rec.anchor_day);
  }
  return { dates, next };
}

/** Cuánto pesa al mes, para el resumen: un semanal son 52/12 cobros al mes y uno anual, 1/12. */
export function monthlyAmount(rec: Pick<Recurring, 'amount' | 'frequency'>): number {
  const perMonth = { semanal: 52 / 12, quincenal: 2, mensual: 1, anual: 1 / 12 }[rec.frequency];
  return Math.round((rec.amount * perMonth) / 100) * 100;
}

/** «el 15 y el 30», «el 1», «los lunes», «cada 3 de marzo»: cuándo se cobra, en palabras. */
export function scheduleLabel(rec: Pick<Recurring, 'next_date' | 'frequency' | 'anchor_day'>): string {
  const next = parseDay(rec.next_date);
  const a = rec.anchor_day ?? next.getUTCDate();
  const t = strings().recurring.schedule;
  switch (rec.frequency) {
    case 'semanal':
      return t.weekly(weekdayName(next));
    case 'quincenal': {
      const [d1, d2] = quincenaDays(a);
      return t.biweekly(d1, d2);
    }
    case 'mensual':
      return t.monthly(a);
    case 'anual':
      return t.yearly(dayMonth(next));
  }
}

/** Id fijo del cobro de un recurrente en una fecha: el mismo en cualquier teléfono y en cualquier intento. */
export async function recurringTxId(recurringId: string, day: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`recurrente:${recurringId}:${day}`)));
  bytes[6] = (bytes[6] & 0x0f) | 0x80; // versión 8 (formato propio, RFC 9562)
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC
  const hex = [...bytes.slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function recurringTransaction(rec: Recurring, day: Date): Promise<Transaction> {
  const date = isoDate(day);
  return {
    id: await recurringTxId(rec.id, date),
    occurred_at: crInstant(date, RECURRING_TIME),
    amount: rec.amount,
    type: rec.type,
    account_id: rec.account_id,
    to_account_id: null,
    category_id: rec.category_id,
    merchant: rec.name,
    note: null,
    source: 'recurrente',
    status: 'confirmada',
    recurring_id: rec.id,
  };
}

/**
 * Registra los cobros vencidos de todos los recurrentes activos y adelanta su próxima fecha. Devuelve cuántos
 * movimientos nuevos quedaron (los que ya existían no cuentan).
 */
export async function applyRecurring(api: Pick<Api, 'listRecurring' | 'insertMissingTransactions' | 'saveRecurring'>, today = crDay()) {
  let created = 0;
  for (const rec of await api.listRecurring()) {
    if (!rec.active) continue;
    const { dates, next } = dueDates(rec, today);
    if (dates.length === 0) continue;
    const txs = await Promise.all(dates.map((d) => recurringTransaction(rec, d)));
    // Primero los movimientos y después la fecha: si algo falla en medio, el próximo intento los repite sin duplicar.
    created += await api.insertMissingTransactions(txs);
    await api.saveRecurring({ id: rec.id, next_date: isoDate(next) });
  }
  return created;
}
