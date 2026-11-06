// Lógica del webhook de Wallet (wallet-sync): autorizar el token y guardar un pago de la cola.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { fetchUsdRate, parseUsdAmount, type UsdRate, usdToColonCents } from './fx.ts';
import { parseAmountToCents } from './money.ts';
import { cleanText, clientIp, json, tooMany, withinLimit } from './security.ts';

const MAX_AMOUNT_CENTS = 100_000_000_000_000; // igual que el check de la base

/**
 * Pagos de Wallet guardados (no duplicados) desde `since`. null si la consulta falla: quien llama no debe seguir,
 * porque sin el conteo no se puede aplicar el tope diario.
 */
export async function walletSavedSince(supabase: SupabaseClient, userId: string, since: Date): Promise<number | null> {
  const { count, error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'wallet')
    .gte('created_at', since.toISOString());
  return error ? null : (count ?? 0);
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/**
 * Valida el token del Atajo con límites de frecuencia: tope general por IP, intentos fallidos por IP
 * y peticiones por token. Devuelve el dueño del token o la Response de error (401/429) para devolver tal cual.
 */
export async function authorizeWebhook(
  supabase: SupabaseClient,
  req: Request,
  opts: { perTokenPerMinute: number },
): Promise<{ userId: string; tokenId: string } | Response> {
  const ip = clientIp(req);
  if (!(await withinLimit(supabase, `wallet:ip:${ip}`, 60, 60))) return tooMany(60);

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token || token.length > 200) return json({ error: 'missing_token' }, 401);

  const { data } = await supabase.from('api_tokens').select('id, user_id').eq('token_hash', await sha256Hex(token)).maybeSingle();
  if (!data) {
    // Por IP y, como la IP se puede falsificar, también en total: adivinar un token queda acotado igual.
    if (!(await withinLimit(supabase, `wallet:badtoken:${ip}`, 10, 600))) return tooMany(600);
    if (!(await withinLimit(supabase, 'wallet:badtoken:total', 100, 600))) return tooMany(600);
    return json({ error: 'invalid_token' }, 401);
  }
  if (!(await withinLimit(supabase, `wallet:token:${data.id}`, opts.perTokenPerMinute, 60))) return tooMany(60);
  return { userId: data.user_id, tokenId: data.id };
}

export interface WalletPayment {
  amount?: unknown;
  merchant?: unknown;
  card?: unknown;
  name?: unknown;
  /** Momento del pago (ISO 8601), para pagos que llegan tarde desde la cola. */
  at?: unknown;
  /** Identificador del pago en el Atajo; si falta se deriva de los datos. */
  id?: unknown;
}

export type IngestResult =
  | { ok: true; id: string; status: string; duplicate?: boolean }
  | { ok: false; error: 'invalid_amount' | 'no_accounts' | 'insert_failed' };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;

/**
 * Fecha del pago si viene en ISO 8601 con zona y es razonable (no futura, no más vieja que 60 días).
 * `valid` dice si se pudo usar; si no, el pago queda con la hora de llegada.
 */
export function paymentTime(at: unknown, now = Date.now()): { date: Date; valid: boolean } {
  if (typeof at !== 'string' || !ISO_DATE.test(at.trim())) return { date: new Date(now), valid: false };
  const t = Date.parse(at.trim());
  if (Number.isNaN(t) || t > now + 5 * 60_000 || t < now - 60 * 86_400_000) return { date: new Date(now), valid: false };
  return { date: new Date(t), valid: true };
}

/**
 * Huella estable de un pago de la cola. Con fecha válida, la fecha real; sin ella, el texto tal como vino (no la hora
 * de llegada, que cambia en cada reenvío y duplicaría el pago).
 */
export function paymentFingerprint(p: WalletPayment, amount: number, merchant: string | null, card: string, time: { date: Date; valid: boolean }) {
  const when = time.valid ? time.date.toISOString() : `sin-fecha:${typeof p.at === 'string' ? p.at.trim().slice(0, 64) : ''}`;
  return sha256Hex([when, amount, merchant ?? '', card].join('|'));
}

/** Texto del monto tal como llegó (acotado), para ver después qué formato no se pudo leer. "" si vino vacío. */
export function rawAmount(v: unknown): string {
  if (v == null) return '';
  const s = typeof v === 'string' ? v : typeof v === 'number' ? String(v) : JSON.stringify(v);
  return s.replace(/\s+/g, ' ').trim().slice(0, 64);
}

/**
 * El monto no es un cargo en colones: trae otra moneda ("$12.50", "USD 12.50", "€5") o es negativo (un reembolso).
 * El parser lo leería como colones positivos (₡12,50) y podría confirmarse solo con el monto equivocado; así queda
 * por revisar, sin monto y con el texto original para escribir el monto real.
 */
export function notAColonCharge(v: unknown): boolean {
  if (typeof v === 'number') return v < 0;
  if (typeof v !== 'string') return false;
  const s = v.trim();
  const foreign = /[$€£¥]/.test(s) || /(^|[^\p{L}])(?!crc(?!\p{L}))\p{L}{3}(?!\p{L})/iu.test(s);
  const negative = /^[-−–(]/.test(s) || /[-−–)]$/.test(s);
  return foreign || negative;
}

/** Tipo de cambio del día, una consulta por instancia de la función (se renueva cada hora). */
let rateCache: { at: number; value: Promise<UsdRate | null> } | null = null;
export function cachedUsdRate(now = Date.now()): Promise<UsdRate | null> {
  if (!rateCache || now - rateCache.at > 3_600_000) {
    const value = fetchUsdRate();
    rateCache = { at: now, value };
    // Un fallo no se guarda: el próximo pago vuelve a intentar.
    void value.then((r) => {
      if (r === null && rateCache?.value === value) rateCache = null;
    });
  }
  return rateCache.value;
}

export interface IngestOptions {
  /** Tipo de cambio para pagos en dólares (inyectable en pruebas). */
  usdRate?: () => Promise<UsdRate | null>;
  /**
   * El pago viene de una notificación de Android (texto interpretado, ver notification.ts): queda siempre por revisar y
   * un repetido se reconoce por monto y tarjeta en una ventana corta (el banco y Google Wallet pueden avisar del mismo
   * pago, o MacroDroid disparar dos veces), no por la huella exacta.
   */
  fromNotification?: boolean;
  /** Ahora (inyectable en pruebas). */
  now?: number;
}

/** Minutos dentro de los cuales una notificación con el mismo monto y tarjeta es el mismo pago. */
export const NOTIFICATION_DUPLICATE_MINUTES = 5;

export async function ingestPayment(
  supabase: SupabaseClient,
  userId: string,
  p: WalletPayment,
  opts: IngestOptions = {},
): Promise<IngestResult> {
  const amountIn = typeof p.amount === 'number' || typeof p.amount === 'string' ? p.amount : null;
  // Un cargo en dólares se convierte con el tipo de cambio del BCCR. Si no se consigue, sigue como antes: monto 0 por
  // revisar, con el texto original para escribir los colones a mano.
  const usdCents = parseUsdAmount(amountIn);
  const fx = usdCents !== null ? await (opts.usdRate ?? cachedUsdRate)() : null;
  const parsed = usdCents !== null
    ? fx ? usdToColonCents(usdCents, fx.rate) : null
    : notAColonCharge(amountIn) ? null : parseAmountToCents(amountIn);
  const merchant = cleanText(p.merchant, 200);
  const card = cleanText(p.card, 100) ?? '';
  // Hay datáfonos (buses, algunos comercios) que no le pasan el monto al Atajo. El pago se guarda igual con monto 0,
  // por revisar, para completarlo en la app; descartarlo lo perdería, porque el Atajo borra la cola al ver "ok".
  // Solo se descarta si no trae nada con qué reconocerlo.
  const readable = parsed !== null && parsed <= MAX_AMOUNT_CENTS;
  const amountRaw = readable ? null : rawAmount(p.amount);
  if (!readable) {
    // Solo el texto del monto: el comercio y la tarjeta son datos del pago y no van a los registros.
    console.warn('wallet: monto ilegible', JSON.stringify({ amount: amountRaw }));
    if (!merchant && !card) return { ok: false, error: 'invalid_amount' };
  }
  const amount = readable ? (parsed ?? 0) : 0;
  const time = paymentTime(p.at, opts.now);
  const occurred = time.date;

  // Cada pago de la cola tiene un id estable (el del Atajo o su huella): reenviarlo no duplica. En dólares la huella
  // usa 0 (como antes de convertirlos): los colones cambian con el tipo de cambio y un reenvío al otro día duplicaría.
  const externalId =
    cleanText(p.id, 128) ?? (await paymentFingerprint(p, usdCents !== null ? 0 : amount, merchant, card, time));

  const { data: existing } = await supabase
    .from('transactions')
    .select('id, status')
    .eq('user_id', userId)
    .eq('external_id', externalId)
    .maybeSingle();
  if (existing) return { ok: true, id: existing.id, status: existing.status, duplicate: true };

  if (opts.fromNotification && amount > 0) {
    const since = new Date(occurred.getTime() - NOTIFICATION_DUPLICATE_MINUTES * 60_000).toISOString();
    const { data: recent } = await supabase
      .from('transactions')
      .select('id, status, note')
      .eq('user_id', userId)
      .eq('source', 'wallet')
      .eq('amount', amount)
      .gte('occurred_at', since);
    const last4 = /(\d{4})\s*$/.exec(card)?.[1] ?? null;
    const same = (recent ?? []).find((r: { note: string | null }) => {
      const other = /(\d{4})\s*$/.exec(r.note ?? '')?.[1] ?? null;
      return !last4 || !other || other === last4;
    });
    if (same) return { ok: true, id: same.id, status: same.status, duplicate: true };
  }

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, type, last4, wallet_name, name')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('sort');
  if (!accounts?.length) return { ok: false, error: 'no_accounts' };

  // Empatar la tarjeta: nombre en Wallet, últimos 4 dígitos o nombre de la cuenta.
  const cardN = norm(card);
  const matched = cardN
    ? (accounts.find((a) => a.wallet_name && norm(a.wallet_name) === cardN) ??
      accounts.find((a) => a.last4 && cardN.includes(a.last4)) ??
      accounts.find((a) => norm(a.name) === cardN))
    : undefined;
  // Sin coincidencia se usa la primera tarjeta y el movimiento queda por revisar.
  const account = matched ?? accounts.find((a) => a.type === 'credito' || a.type === 'debito') ?? accounts[0];

  // Categoría por reglas de comercio (mayor prioridad primero).
  let categoryId: string | null = null;
  if (merchant) {
    const { data: rules } = await supabase
      .from('merchant_rules')
      .select('pattern, category_id')
      .eq('user_id', userId)
      .order('priority', { ascending: false });
    const m = norm(merchant);
    categoryId = rules?.find((r) => m.includes(norm(r.pattern)))?.category_id ?? null;
  }

  const { data: inserted, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      type: 'gasto',
      account_id: account.id,
      category_id: categoryId,
      merchant,
      note: `${opts.fromNotification ? 'Notificación' : 'Wallet'}${card ? ` · ${card}` : ''}`,
      source: 'wallet',
      status: !opts.fromNotification && readable && categoryId && matched ? 'confirmada' : 'por_revisar',
      occurred_at: occurred.toISOString(),
      external_id: externalId,
      amount_raw: amountRaw,
      ...(readable && fx && usdCents !== null
        ? { original_currency: 'USD', original_amount: usdCents, fx_rate: fx.rate }
        : {}),
    })
    .select('id, status')
    .single();
  if (error) {
    // Dos envíos simultáneos del mismo pago: el segundo choca con el índice único.
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('external_id', externalId)
        .maybeSingle();
      if (existing) return { ok: true, id: existing.id, status: existing.status, duplicate: true };
    }
    // Sin el mensaje de la base: no se filtran detalles internos al cliente.
    return { ok: false, error: 'insert_failed' };
  }
  return { ok: true, id: inserted.id, status: inserted.status };
}
