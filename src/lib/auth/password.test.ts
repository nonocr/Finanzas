import { describe, expect, it } from 'vitest';
import { checkPassword } from './password';

describe('checkPassword', () => {
  it('acepta una contraseña con minúscula, mayúscula, número y 8+ caracteres', () => {
    expect(checkPassword('Colones2026')).toEqual({ ok: true, missing: [] });
  });

  it('dice exactamente qué falta', () => {
    expect(checkPassword('abc').missing).toEqual(['8 caracteres', 'una mayúscula', 'un número']);
    expect(checkPassword('ABCDEFGH1').missing).toEqual(['una minúscula']);
  });

  it('rechaza más de 72 caracteres (bcrypt los ignoraría en silencio)', () => {
    expect(checkPassword('Aa1' + 'x'.repeat(70)).ok).toBe(false);
  });
});
