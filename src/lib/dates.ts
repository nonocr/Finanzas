// Rangos de fecha en hora de Costa Rica (UTC−6, sin horario de verano).
const CR_OFFSET_MS = -6 * 60 * 60 * 1000;

/** Fecha "de calendario" en Costa Rica, como Date UTC a medianoche de ese día. */
export function crDay(d: Date = new Date()): Date {
  const local = new Date(d.getTime() + CR_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

/** Convierte un día de calendario CR (medianoche UTC) al instante real en que empieza en CR. */
export function crDayStartInstant(day: Date): Date {
  return new Date(day.getTime() - CR_OFFSET_MS);
}

export function addDays(day: Date, n: number): Date {
  return new Date(day.getTime() + n * 86_400_000);
}

export function startOfMonth(day: Date): Date {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
}

export function addMonths(day: Date, n: number): Date {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + n, 1));
}

/** Semana de lunes a domingo. */
export function startOfWeek(day: Date): Date {
  const dow = (day.getUTCDay() + 6) % 7; // 0 = lunes
  return addDays(day, -dow);
}

/** Rango [desde, hasta) como instantes ISO para consultar `occurred_at`. */
export function monthRange(day: Date): { from: string; to: string } {
  const start = startOfMonth(day);
  return { from: crDayStartInstant(start).toISOString(), to: crDayStartInstant(addMonths(start, 1)).toISOString() };
}

export function weekRange(day: Date): { from: string; to: string } {
  const start = startOfWeek(day);
  return { from: crDayStartInstant(start).toISOString(), to: crDayStartInstant(addDays(start, 7)).toISOString() };
}

/** Día de calendario CR (medianoche UTC) de un instante guardado en la base. */
export function crDayOf(iso: string): Date {
  return crDay(new Date(iso));
}

/** "2026-10-01" para la columna `month` de budgets. */
export function isoDate(day: Date): string {
  return day.toISOString().slice(0, 10);
}

const monthFmt = new Intl.DateTimeFormat('es-CR', { month: 'long', timeZone: 'UTC' });
const dayFmt = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', timeZone: 'UTC' });
const shortFmt = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const monthName = (day: Date) => monthFmt.format(day);
export const dayLabel = (day: Date) => dayFmt.format(day);
export const shortDate = (day: Date) => shortFmt.format(day);

/** Iniciales de la semana en español de Costa Rica (K = miércoles). */
export const WEEKDAY_INITIALS = ['L', 'M', 'K', 'J', 'V', 'S', 'D'] as const;
