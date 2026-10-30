// La copia local de los datos solo vive mientras la sesión sea de su dueña.
import { describe, expect, it } from 'vitest';
import { cacheAction } from './offline';

describe('cacheAction', () => {
  it('sin sesión se borra (cerró sesión, venció o se revocó desde otro dispositivo)', () => {
    expect(cacheAction('u1', null)).toBe('clear');
    expect(cacheAction(null, null)).toBe('clear');
  });
  it('si entra otra cuenta se borra: no ve la copia ni reenvía la cola de la anterior', () => {
    expect(cacheAction('u1', 'u2')).toBe('clear');
  });
  it('misma cuenta o copia sin dueño anotado (versiones anteriores): se conserva', () => {
    expect(cacheAction('u1', 'u1')).toBe('keep');
    expect(cacheAction(null, 'u1')).toBe('keep');
  });
});
