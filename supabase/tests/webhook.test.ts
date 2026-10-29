// Utilidades de seguridad de los webhooks del Atajo (corren igual en Deno y en Node).
import { describe, expect, it } from 'vitest';
import { cleanText, clientIp, readBody } from '../functions/_shared/security';

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
  });
  it('rechaza cuerpos que superan el tope (aunque mientan en content-length)', async () => {
    expect(await readBody(req('x'.repeat(200)), 100)).toBeNull();
    expect(await readBody(req('x', { 'content-length': '999999' }), 100)).toBeNull();
  });
});

describe('clientIp', () => {
  it('toma la primera IP de x-forwarded-for', () => {
    const r = new Request('https://x.test', { headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' } });
    expect(clientIp(r)).toBe('203.0.113.7');
  });
  it('sin cabecera no falla', () => {
    expect(clientIp(new Request('https://x.test'))).toBe('desconocida');
  });
});
