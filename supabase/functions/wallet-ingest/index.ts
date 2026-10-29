// Recibe un pago desde la automatización de Wallet de Atajos de iOS, en el momento en que se paga.
// POST con header `Authorization: Bearer <token personal>` y JSON:
//   { "amount": "₡12.500,00", "merchant": "AUTOMERCADO", "card": "Visa BAC", "name": "..." }
// El token se crea desde Ajustes en la app (create_api_token) y aquí se valida por su hash.
// Para la versión con respaldo sin señal ver wallet-sync.
//
// Seguridad: cuerpo de máx. 8 KB, límite por IP, por intentos fallidos y por token, textos acotados
// (en ingestPayment) y errores genéricos (sin detalles de la base).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { authorizeWebhook, ingestPayment } from '../_shared/ingest.ts';
import { json, readBody } from '../_shared/security.ts';

const MAX_BODY_BYTES = 8 * 1024;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const auth = await authorizeWebhook(supabase, req, { perTokenPerMinute: 30 });
  if (auth instanceof Response) return auth;

  const raw = await readBody(req, MAX_BODY_BYTES);
  if (raw === null) return json({ error: 'payload_too_large' }, 413);
  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const result = await ingestPayment(supabase, auth.userId, body);
  if (!result.ok) {
    const status = result.error === 'invalid_amount' ? 422 : result.error === 'no_accounts' ? 409 : 500;
    return json({ error: result.error }, status);
  }

  await supabase.from('api_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', auth.tokenId);
  return json(result.duplicate ? { ok: true, duplicate: true, id: result.id } : { ok: true, id: result.id, status: result.status });
});
