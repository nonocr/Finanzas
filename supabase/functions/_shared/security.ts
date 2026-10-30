// Utilidades de seguridad para los webhooks del Atajo: límites de tamaño y frecuencia, y respuestas sin detalles internos.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
  });

export const tooMany = (retryAfterSeconds: number) =>
  json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfterSeconds) });

/**
 * IP del cliente para los límites por IP. Se prefiere la que pone el proxy (cf-connecting-ip, x-real-ip); la de
 * x-forwarded-for la puede escribir el propio cliente. Sea cual sea, se acota a caracteres de IP y 45 de largo, para
 * que una cabecera inventada no genere claves enormes en el limitador. Como una IP falsificada puede esquivar el
 * límite por IP, los intentos con token inválido tienen además un tope global (ver authorizeWebhook).
 */
export function clientIp(req: Request): string {
  const raw =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0] ??
    '';
  const ip = raw.trim().replace(/[^0-9a-fA-F:.]/g, '').slice(0, 45);
  return ip || 'desconocida';
}

/**
 * true si la petición entra en el límite; cuenta el intento. Si el limitador falla, la petición NO pasa: un error
 * provocado a propósito no debe servir para saltarse el límite.
 */
export async function withinLimit(supabase: SupabaseClient, key: string, max: number, windowSeconds: number) {
  const { data, error } = await supabase.rpc('rate_limit_hit', { p_key: key.slice(0, 200), p_max: max, p_window_seconds: windowSeconds });
  if (error) return false;
  return data === true;
}

/** Lee el cuerpo con un tope de bytes, por partes (no carga más de la cuenta en memoria); null si lo supera. */
export async function readBody(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > maxBytes) return null;
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(buf);
}

/** Texto acotado: recorta espacios, quita caracteres de control y limita la longitud. */
export function cleanText(v: unknown, max: number): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
  return s || null;
}
