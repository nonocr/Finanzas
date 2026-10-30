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
 * IP del cliente según el proxy de Supabase. Solo se usa para limitar intentos fallidos: si alguien la falsifica,
 * el límite por token (que no se puede falsificar) sigue aplicando.
 */
export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'desconocida').trim();
}

/** true si la petición entra en el límite; cuenta el intento. Si el limitador falla, deja pasar (no tumba el webhook). */
export async function withinLimit(supabase: SupabaseClient, key: string, max: number, windowSeconds: number) {
  const { data, error } = await supabase.rpc('rate_limit_hit', { p_key: key, p_max: max, p_window_seconds: windowSeconds });
  if (error) return true;
  return data === true;
}

/** Lee el cuerpo con un tope de bytes; null si lo supera. */
export async function readBody(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > maxBytes) return null;
  const buf = await req.arrayBuffer();
  if (buf.byteLength > maxBytes) return null;
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
