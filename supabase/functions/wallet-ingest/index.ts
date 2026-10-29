// Recibe pagos desde la automatización "Transacción" de Atajos de iOS.
// POST con header `Authorization: Bearer <token personal>` y JSON:
//   { "amount": "₡12.500,00", "merchant": "AUTOMERCADO", "card": "Visa BAC", "name": "..." }
// El token se crea desde Ajustes en la app (create_api_token) y aquí se valida por su hash.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { parseAmountToCents } from '../_shared/money.ts';

const DEDUPE_WINDOW_MS = 2 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'missing_token' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: tokenRow } = await supabase
    .from('api_tokens')
    .select('id, user_id')
    .eq('token_hash', await sha256Hex(token))
    .maybeSingle();
  if (!tokenRow) return json({ error: 'invalid_token' }, 401);
  const userId: string = tokenRow.user_id;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const amount = parseAmountToCents(body.amount as string | number);
  if (!amount) return json({ error: 'invalid_amount', received: body.amount }, 422);
  const merchant = String(body.merchant ?? '').trim() || null;
  const card = String(body.card ?? '').trim();

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, type, last4, wallet_name, name')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('sort');
  if (!accounts?.length) return json({ error: 'no_accounts' }, 409);

  // Empatar la tarjeta: nombre en Wallet, últimos 4 dígitos o nombre de la cuenta.
  const cardN = norm(card);
  const matched = cardN
    ? accounts.find((a) => a.wallet_name && norm(a.wallet_name) === cardN) ??
      accounts.find((a) => a.last4 && cardN.includes(a.last4)) ??
      accounts.find((a) => norm(a.name) === cardN)
    : undefined;
  // Sin coincidencia se usa la primera tarjeta y el movimiento queda por revisar.
  const account = matched ?? accounts.find((a) => a.type === 'credito' || a.type === 'debito') ?? accounts[0];
  const accountMatched = Boolean(matched);

  // Evitar duplicados si el Atajo se dispara dos veces.
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  let dupQuery = supabase
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('account_id', account.id)
    .eq('amount', amount)
    .eq('source', 'wallet')
    .gte('created_at', since)
    .limit(1);
  dupQuery = merchant ? dupQuery.eq('merchant', merchant) : dupQuery.is('merchant', null);
  const { data: dup } = await dupQuery;
  if (dup?.length) return json({ ok: true, duplicate: true, id: dup[0].id });

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
      status: categoryId && accountMatched ? 'confirmada' : 'por_revisar',
    })
    .select('id, status')
    .single();
  if (error) return json({ error: 'insert_failed', detail: error.message }, 500);

  await supabase.from('api_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenRow.id);

  return json({ ok: true, id: inserted.id, status: inserted.status });
});
