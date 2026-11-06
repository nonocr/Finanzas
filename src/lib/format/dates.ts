import { locale, strings } from '../../i18n';

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

/** Hora "HH:MM" (24 h) en Costa Rica de un instante, para el campo de hora. */
export function crTimeOf(iso: string | Date): string {
  return new Date(new Date(iso).getTime() + CR_OFFSET_MS).toISOString().slice(11, 16);
}

/** Instante ISO de un día "2026-11-02" y una hora "06:01" en Costa Rica. */
export function crInstant(date: string, time: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Date(crDayStartInstant(new Date(date + 'T00:00:00Z')).getTime() + (h * 60 + m) * 60_000).toISOString();
}

/** "2026-10-01" para la columna `month` de budgets. */
export function isoDate(day: Date): string {
  return day.toISOString().slice(0, 10);
}

// Fechas en el idioma actual (los formateadores se crean una vez por idioma).
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function fmt(key: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const id = `${locale()}|${key}`;
  let f = dateFormatters.get(id);
  if (!f) dateFormatters.set(id, (f = new Intl.DateTimeFormat(locale(), opts)));
  return f;
}

export const monthName = (day: Date) => fmt('month', { month: 'long', timeZone: 'UTC' }).format(day);
export const dayLabel = (day: Date) => fmt('day', { weekday: 'long', day: 'numeric', timeZone: 'UTC' }).format(day);
export const shortDate = (day: Date) => fmt('short', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(day);
/** "5 nov 2026" / "Nov 5, 2026" (un día de calendario guardado como medianoche UTC). */
export const longDate = (day: Date) => fmt('long', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(day);
/** Hora de un instante real en Costa Rica: "1:45 p. m." / "1:45 PM". */
export const crTime = (instant: Date) => fmt('time', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Costa_Rica' }).format(instant);
/** Fecha corta de un instante real en Costa Rica. */
export const crShortDate = (instant: Date) => fmt('crshort', { day: 'numeric', month: 'short', timeZone: 'America/Costa_Rica' }).format(instant);
/** Hora "HH:MM" de un campo (sin zona): "1:45 p. m." / "1:45 PM". */
export const clockTime = (hhmm: string) => fmt('clock', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(`1970-01-01T${hhmm}:00Z`));
/** Nombre del día de la semana: "jueves" / "Thursday". */
export const weekdayName = (day: Date) => fmt('weekday', { weekday: 'long', timeZone: 'UTC' }).format(day);
/** Día y mes largos: "5 de noviembre" / "November 5". */
export const dayMonth = (day: Date) => fmt('daymonth', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(day);

/** Iniciales de la semana, de lunes a domingo, en el idioma actual (en español de Costa Rica, K = miércoles). */
export const weekdayInitials = (): readonly string[] => strings().common.weekdayInitials;