// Lógica común de los webhooks de Wallet: autorizar el token y guardar un pago.
// Lo usan wallet-ingest (un pago, en el momento) y wallet-sync (cola de pagos que no se pudieron enviar).
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { parseAmountToCents } from './money.ts';
import { cleanText, clientIp, json, tooMany, withinLimit } from './security.ts';

const DEDUPE_WINDOW_MS = 2 * 60 * 1000;
const MAX_AMOUNT_CENTS = 100_000_000_000_000; // igual que el check de la base

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
    if (!(await withinLimit(supabase, `wallet:badtoken:${ip}`, 10, 600))) return tooMany(600);
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

/** Fecha del pago si viene y es razonable (no futura, no más vieja que 60 días); si no, ahora. */
function paymentTime(at: unknown): Date {
  const now = Date.now();
  if (typeof at !== 'string' || !at.trim()) return new Date(now);
  const t = Date.parse(at.trim());
  if (Number.isNaN(t) || t > now + 5 * 60_000 || t < now - 60 * 86_400_000) return new Date(now);
  return new Date(t);
}

export async function ingestPayment(
  supabase: SupabaseClient,
  userId: string,
  p: WalletPayment,
  opts: { requireExternalId?: boolean } = {},
): Promise<IngestResult> {
  const amount = parseAmountToCents(typeof p.amount === 'number' || typeof p.amount === 'string' ? p.amount : null);
  if (!amount || amount > MAX_AMOUNT_CENTS) return { ok: false, error: 'invalid_amount' };
  const merchant = cleanText(p.merchant, 200);
  const card = cleanText(p.card, 100) ?? '';
  const occurred = paymentTime(p.at);

  // Los pagos de la cola siempre traen un id estable: reenviarlos no duplica.
  const providedId = cleanText(p.id, 128);
  const externalId = providedId
    ? providedId
    : opts.requireExternalId
        ? await sha256Hex([occurred.toISOString(), amount, merchant ?? '', card].join('|'))
        : null;

  if (externalId) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('external_id', externalId)
      .maybeSingle();
    if (existing) return { ok: true, id: existing.id, status: existing.status, duplicate: true };
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

  // Sin id estable (Atajo básico): evitar duplicados si se dispara dos veces seguidas.
  if (!externalId) {
    const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
    let dupQuery = supabase
      .from('transactions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('account_id', account.id)
      .eq('amount', amount)
      .eq('source', 'wallet')
      .gte('created_at', since)
      .limit(1);
    dupQuery = merchant ? dupQuery.eq('merchant', merchant) : dupQuery.is('merchant', null);
    const { data: dup } = await dupQuery;
    if (dup?.length) return { ok: true, id: dup[0].id, status: dup[0].status, duplicate: true };
  }

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
      note: card ? `Wallet · ${card}` : 'Wallet',
      source: 'wallet',
      status: categoryId && matched ? 'confirmada' : 'por_revisar',
      occurred_at: occurred.toISOString(),
      external_id: externalId,
    })
    .select('id, status')
    .single();
  if (error) {
    // Dos envíos simultáneos del mismo pago: el segundo choca con el índice único.
    if (externalId && error.code === '23505') {
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
