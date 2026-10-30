import { describe, expect, it } from 'vitest';
import { findSecrets } from './check-secrets.mjs';

// JWT de prueba armadas aquí (firma falsa): una con rol anon y otra con service_role.
const jwt = (payload) =>
  ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'firmaDePruebaNoValida123'].join('.');

describe('findSecrets', () => {
  it('permite la anon key (pública por diseño)', () => {
    expect(findSecrets(`VITE_SUPABASE_ANON_KEY=${jwt({ iss: 'supabase', role: 'anon' })}`)).toEqual([]);
  });

  it('detecta una service_role key', () => {
    const f = findSecrets(`KEY=${jwt({ iss: 'supabase', role: 'service_role' })}`);
    expect(f.map((x) => x.rule)).toEqual(['JWT con rol "service_role"']);
  });

  it('detecta tokens de administración, del Atajo y de GitHub', () => {
    const text = [`sbp_${'a1'.repeat(20)}`, `fz_${'b2'.repeat(24)}`, `ghp_${'C3'.repeat(18)}`].join('\n');
    expect(findSecrets(text).map((x) => x.rule)).toEqual([
      'Token de administración de Supabase',
      'Token del Atajo de Wallet',
      'Token de GitHub',
    ]);
  });

  it('no confunde nombres de variables ni textos normales', () => {
    expect(findSecrets("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')\nconst token = 'fz_' + encode(x)")).toEqual([]);
  });
});
