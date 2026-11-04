// Utilidades de seguridad de los webhooks del Atajo (corren igual en Deno y en Node).
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { ingestPayment, notAColonCharge, paymentFingerprint, paymentTime, walletSavedSince } from '../functions/_shared/ingest';
import { cleanText, clientIp, readBody, secretKey, withinLimit } from '../functions/_shared/security';

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

describe('secretKey', () => {
  const env = (vars: Record<string, string>) => (n: string) => vars[n];
  it('toma la clave secreta "default" de SUPABASE_SECRET_KEYS', () => {
    expect(secretKey(env({ SUPABASE_SECRET_KEYS: '{"default":"sb_secret_abc"}' }))).toBe('sb_secret_abc');
  });
  it('no cae a la clave antigua ni acepta algo que no sea una clave secreta', () => {
    expect(secretKey(env({ SUPABASE_SERVICE_ROLE_KEY: 'eyJ.x.y' }))).toBeNull();
    expect(secretKey(env({ SUPABASE_SECRET_KEYS: '{"default":"eyJ.x.y"}' }))).toBeNull();
    expect(secretKey(env({ SUPABASE_SECRET_KEYS: 'no es json' }))).toBeNull();
  });
});

describe('walletSavedSince (tope diario)', () => {
  /** Cliente falso que anota los filtros de la consulta y devuelve el resultado dado. */
  const fake = (result: { count: number | null; error: unknown }) => {
    const filters: string[] = [];
    const q = {
      select: () => q,
      eq: (c: string, v: string) => (filters.push(`${c}=${v}`), q),
      gte: (c: string, v: string) => (filters.push(`${c}>=${v}`), Promise.resolve(result)),
    };
    return { client: { from: () => q } as unknown as SupabaseClient, filters };
  };
  const since = new Date('2026-11-03T16:00:00Z');

  it('cuenta solo los pagos de Wallet del usuario desde la fecha dada', async () => {
    const { client, filters } = fake({ count: 7, error: null });
    expect(await walletSavedSince(client, 'u1', since)).toBe(7);
    expect(filters).toEqual(['user_id=u1', 'source=wallet', `created_at>=${since.toISOString()}`]);
  });
  it('si la consulta falla devuelve null (quien llama no sigue sin el conteo)', async () => {
    expect(await walletSavedSince(fake({ count: null, error: { message: 'timeout' } }).client, 'u1', since)).toBeNull();
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

describe('notAColonCharge (otra moneda o reembolso)', () => {
  it.each(['$12.50', 'USD 12.50', '12.50 usd', 'US$ 4', '€5,00', '-₡5.000', '−₡5.000', '(₡5.000)', '₡5.000-', -3])('%s sí', (v) => {
    expect(notAColonCharge(v)).toBe(true);
  });
  it.each(['₡12.500,00', 'CRC 12,500.00', '12.500 CRC', '12 500', '3,90', 1500, null, undefined])('%s no', (v) => {
    expect(notAColonCharge(v)).toBe(false);
  });
});

describe('ingestPayment', () => {
  type Row = Record<string, unknown>;
  /** Base en memoria con lo justo del cliente de Supabase que usa ingestPayment. */
  const fakeDb = (init: Record<string, Row[]>) => {
    const tables: Record<string, Row[]> = { transactions: [], merchant_rules: [], ...structuredClone(init) };
    let seq = 0;
    const from = (table: string) => {
      const filters: [string, unknown][] = [];
      let toInsert: Row | null = null;
      const rows = () => tables[table].filter((r) => filters.every(([c, v]) => r[c] === v));
      const b = {
        select: () => b,
        order: () => b,
        eq: (c: string, v: unknown) => (filters.push([c, v]), b),
        insert: (row: Row) => ((toInsert = row), b),
        maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
        single: async () => {
          if (!toInsert) return { data: rows()[0], error: null };
          const r = { id: `tx${++seq}`, ...toInsert };
          tables[table].push(r);
          return { data: r, error: null };
        },
        then: (ok: (v: unknown) => unknown) => Promise.resolve({ data: rows(), error: null }).then(ok),
      };
      return b;
    };
    return { client: { from } as unknown as SupabaseClient, tables };
  };
  const ACCOUNTS = [
    { id: 'cash', user_id: 'u', type: 'efectivo', name: 'Efectivo', last4: null, wallet_name: null, archived: false },
    { id: 'bac', user_id: 'u', type: 'credito', name: 'Visa BAC', last4: '4321', wallet_name: null, archived: false },
    { id: 'bn', user_id: 'u', type: 'debito', name: 'Débito BN', last4: null, wallet_name: 'Mi Débito', archived: false },
  ];
  const RULES = [{ user_id: 'u', pattern: 'automercado', category_id: 'super' }];

  it('tarjeta y regla conocidas: se confirma solo, en su cuenta y categoría', async () => {
    const { client, tables } = fakeDb({ accounts: ACCOUNTS, merchant_rules: RULES });
    const r = await ingestPayment(client, 'u', { amount: '₡12.500,00', merchant: 'AUTOMERCADO ESCAZU', card: 'Mi Débito', id: 'p1' });
    expect(r).toMatchObject({ ok: true, status: 'confirmada' });
    expect(tables.transactions[0]).toMatchObject({ amount: 1_250_000, account_id: 'bn', category_id: 'super', external_id: 'p1' });
  });

  it('empata la tarjeta por los últimos 4 dígitos', async () => {
    const { client, tables } = fakeDb({ accounts: ACCOUNTS, merchant_rules: RULES });
    await ingestPayment(client, 'u', { amount: '1.000', merchant: 'SODA', card: 'BAC Visa •• 4321' });
    expect(tables.transactions[0]).toMatchObject({ account_id: 'bac', status: 'por_revisar' });
  });

  it('tarjeta desconocida: primera tarjeta y por revisar, aunque la regla empate', async () => {
    const { client, tables } = fakeDb({ accounts: ACCOUNTS, merchant_rules: RULES });
    await ingestPayment(client, 'u', { amount: '1.000', merchant: 'AUTOMERCADO', card: 'Amex' });
    expect(tables.transactions[0]).toMatchObject({ account_id: 'bac', status: 'por_revisar' });
  });

  it.each(['$12.50', '-₡5.000'])('%s: monto 0, por revisar, con el texto original', async (amount) => {
    const { client, tables } = fakeDb({ accounts: ACCOUNTS, merchant_rules: RULES });
    const r = await ingestPayment(client, 'u', { amount, merchant: 'AUTOMERCADO', card: 'Mi Débito' });
    expect(r).toMatchObject({ ok: true, status: 'por_revisar' });
    expect(tables.transactions[0]).toMatchObject({ amount: 0, amount_raw: amount });
  });

  it('reenviar el mismo pago no lo duplica', async () => {
    const { client, tables } = fakeDb({ accounts: ACCOUNTS });
    const p = { amount: '₡900', merchant: 'BUS', at: new Date(Date.now() - 60_000).toISOString() };
    await ingestPayment(client, 'u', p);
    expect(await ingestPayment(client, 'u', p)).toMatchObject({ ok: true, duplicate: true });
    expect(tables.transactions).toHaveLength(1);
  });

  it('sin monto, comercio ni tarjeta se rechaza; sin cuentas activas avisa', async () => {
    expect(await ingestPayment(fakeDb({ accounts: ACCOUNTS }).client, 'u', { amount: 'abc' })).toEqual({ ok: false, error: 'invalid_amount' });
    expect(await ingestPayment(fakeDb({ accounts: [] }).client, 'u', { amount: '₡900', merchant: 'BUS' })).toEqual({
      ok: false,
      error: 'no_accounts',
    });
  });
});
