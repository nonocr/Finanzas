// Utilidades de seguridad de los webhooks del Atajo (corren igual en Deno y en Node).
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { paymentFingerprint, paymentTime } from '../functions/_shared/ingest';
import { cleanText, clientIp, readBody, withinLimit } from '../functions/_shared/security';

describe('cleanText', () => {
  it('recorta, quita caracteres de control y limita la longitud', () => {
    expect(cleanText('  AUTO\u0000MERCADO\n ', 200)).toBe('AUTO MERCADO');
    expect(cleanText('x'.repeat(500), 200)).toHaveLength(200);
  });
  it('vacío o ausente es null', () => {
    expect(cleanText('   ', 10)).toBeNull();
    expect(cleanText(undefined, 10)).toBeNull();
    expect(cleanText(null, 10)).toBeNull();
  });
  it('convierte no-texto a texto sin romperse', () => {
    expect(cleanText({ a: 1 }, 50)).toBe('[object Object]');
  });
});

describe('readBody', () => {
  const req = (body: string, headers: Record<string, string> = {}) =>
    new Request('https://x.test', { method: 'POST', body, headers });

  it('acepta cuerpos dentro del tope', async () => {
    expect(await readBody(req('{"a":1}'), 100)).toBe('{"a":1}');
    expect(await readBody(req('₡12.500'), 100)).toBe('₡12.500');
  });
  it('rechaza cuerpos que superan el tope (aunque mientan en content-length)', async () => {
    expect(await readBody(req('x'.repeat(200)), 100)).toBeNull();
    expect(await readBody(req('x', { 'content-length': '999999' }), 100)).toBeNull();
  });
  it('corta un cuerpo enviado por partes sin leerlo entero', async () => {
    let pulled = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        pulled++;
        c.enqueue(new Uint8Array(64));
        if (pulled > 1000) c.close();
      },
    });
    const r = new Request('https://x.test', { method: 'POST', body: stream, duplex: 'half' } as RequestInit);
    expect(await readBody(r, 256)).toBeNull();
    expect(pulled).toBeLessThan(20);
  });
});

describe('clientIp', () => {
  it('prefiere la IP que pone el proxy sobre la de x-forwarded-for (que escribe el cliente)', () => {
    const r = new Request('https://x.test', {
      headers: { 'cf-connecting-ip': '198.51.100.4', 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    });
    expect(clientIp(r)).toBe('198.51.100.4');
  });
  it('sin cabecera del proxy usa x-forwarded-for', () => {
    const r = new Request('https://x.test', { headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' } });
    expect(clientIp(r)).toBe('203.0.113.7');
  });
  it('una cabecera inventada no genera claves enormes ni raras', () => {
    const r = new Request('https://x.test', { headers: { 'x-forwarded-for': 'a'.repeat(5000) + '<script>' } });
    expect(clientIp(r).length).toBeLessThanOrEqual(45);
    expect(clientIp(r)).toMatch(/^[0-9a-fA-F:.]+$/);
  });
  it('sin cabecera no falla', () => {
    expect(clientIp(new Request('https://x.test'))).toBe('desconocida');
  });
});

describe('withinLimit', () => {
  const fake = (result: { data: unknown; error: unknown }) => ({ rpc: async () => result }) as unknown as SupabaseClient;
  it('deja pasar dentro del límite y corta al pasarlo', async () => {
    expect(await withinLimit(fake({ data: true, error: null }), 'k', 1, 60)).toBe(true);
    expect(await withinLimit(fake({ data: false, error: null }), 'k', 1, 60)).toBe(false);
  });
  it('si el limitador falla, no deja pasar (un error provocado no salta el límite)', async () => {
    expect(await withinLimit(fake({ data: null, error: { message: 'index row size exceeds' } }), 'k', 1, 60)).toBe(false);
  });
});

describe('fecha y huella de los pagos de la cola', () => {
  const now = Date.parse('2026-10-30T16:00:00Z');

  it('acepta ISO 8601 con zona, como lo genera el Atajo', () => {
    expect(paymentTime('2026-10-30T10:01:00-06:00', now)).toEqual({ date: new Date('2026-10-30T16:01:00Z'), valid: true });
    expect(paymentTime('2026-10-30T15:00:00.123Z', now).valid).toBe(true);
  });
  it('rechaza formatos ambiguos, futuros o de hace más de 60 días', () => {
    expect(paymentTime('Oct 30 2026', now).valid).toBe(false);
    expect(paymentTime('2026-10-30', now).valid).toBe(false);
    expect(paymentTime('2026-10-31T16:00:00Z', now).valid).toBe(false);
    expect(paymentTime('2026-01-01T00:00:00Z', now).valid).toBe(false);
    expect(paymentTime(undefined, now).valid).toBe(false);
  });
  it('sin fecha válida la huella es la misma en cada reenvío (no duplica)', async () => {
    const p = { at: 'basura' };
    const a = await paymentFingerprint(p, 100, 'SODA', 'Visa', paymentTime(p.at, now));
    const b = await paymentFingerprint(p, 100, 'SODA', 'Visa', paymentTime(p.at, now + 3_600_000));
    expect(a).toBe(b);
  });
  it('con fecha válida, dos pagos distintos tienen huellas distintas', async () => {
    const t1 = paymentTime('2026-10-30T10:01:00-06:00', now);
    const t2 = paymentTime('2026-10-30T10:02:00-06:00', now);
    expect(await paymentFingerprint({}, 100, 'SODA', 'Visa', t1)).not.toBe(await paymentFingerprint({}, 100, 'SODA', 'Visa', t2));
  });
});
