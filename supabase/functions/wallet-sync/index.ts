// Recibe la cola de pagos de Wallet que el Atajo guardó en un archivo del iPhone (respaldo sin señal).
// POST con header `Authorization: Bearer <token personal>`. El cuerpo es el archivo tal cual:
// un pago por línea, cada línea un diccionario JSON del Atajo:
//   {"amount":"₡12.500,00","merchant":"AUTOMERCADO","card":"Visa BAC","name":"...","at":"2026-10-29T14:01:00-06:00"}
// También acepta un arreglo JSON o {"items":[...]}.
// Responde {"ok":true,...} cuando el archivo se procesó entero; el Atajo solo lo borra si ve "ok":true.
// Cada pago se identifica por su fecha y datos (external_id), así reenviar el archivo nunca duplica.
//
// Seguridad: cuerpo de máx. 256 KB y 200 pagos por envío, mismos límites de frecuencia que wallet-ingest,
// textos acotados y errores sin detalles internos.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { authorizeWebhook, ingestPayment, type WalletPayment } from '../_shared/ingest.ts';
import { json, readBody } from '../_shared/security.ts';

const MAX_BODY_BYTES = 256 * 1024;
const MAX_ITEMS = 200;

/** Saca los pagos del cuerpo: líneas JSON, arreglo o {items}. Las líneas ilegibles se reportan aparte. */
function parseQueue(text: string): { items: WalletPayment[]; unreadable: number } {
  const trimmed = text.trim();
  if (!trimmed) return { items: [], unreadable: 0 };
  try {
    const whole = JSON.parse(trimmed);
    if (Array.isArray(whole)) return { items: whole.filter(isObject), unreadable: whole.filter((x) => !isObject(x)).length };
    if (whole && Array.isArray(whole.items))
      return { items: whole.items.filter(isObject), unreadable: whole.items.filter((x: unknown) => !isObject(x)).length };
    if (isObject(whole)) return { items: [whole], unreadable: 0 };
  } catch {
    // no es un solo JSON: se lee línea por línea
  }
  const items: WalletPayment[] = [];
  let unreadable = 0;
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const v = JSON.parse(line);
      if (isObject(v)) items.push(v);
      else unreadable++;
    } catch {
      unreadable++;
    }
  }
  return { items, unreadable };
}

function isObject(v: unknown): v is WalletPayment {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // Por token: un envío por pago más reenvíos al conectarse a Wi‑Fi; 20 por minuto sobra.
  const auth = await authorizeWebhook(supabase, req, { perTokenPerMinute: 20 });
  if (auth instanceof Response) return auth;

  const raw = await readBody(req, MAX_BODY_BYTES);
  if (raw === null) return json({ error: 'payload_too_large' }, 413);
  const { items, unreadable } = parseQueue(raw);
  // Más pagos de los que caben en un envío: no se procesa nada (el Atajo conserva el archivo).
  if (items.length > MAX_ITEMS) return json({ error: 'too_many_items', max: MAX_ITEMS }, 413);

  let saved = 0;
  let duplicates = 0;
  const rejected: { index: number; error: string }[] = [];
  for (const [index, item] of items.entries()) {
    const r = await ingestPayment(supabase, auth.userId, item, { requireExternalId: true });
    if (r.ok) r.duplicate ? duplicates++ : saved++;
    // Un fallo del servidor, o no tener cuentas activas (se arregla en la app), no debe hacer que el Atajo borre el
    // archivo: se reintenta en el próximo envío y lo ya guardado no se duplica gracias a la huella.
    else if (r.error === 'insert_failed') return json({ ok: false, error: 'insert_failed' }, 500);
    else if (r.error === 'no_accounts') return json({ ok: false, error: 'no_accounts' }, 409);
    else rejected.push({ index, error: r.error });
  }

  if (items.length) {
    await supabase.from('api_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', auth.tokenId);
  }

  // ok:true = el archivo ya se puede borrar. Lo rechazado (monto ilegible) no mejoraría reenviándolo.
  return json({ ok: true, received: items.length, saved, duplicates, rejected, unreadable });
});
