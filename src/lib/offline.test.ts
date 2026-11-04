// La copia local de los datos solo vive mientras la sesión sea de su dueña.
import { beforeEach, describe, expect, it } from 'vitest';
import { cacheAction, queryClient } from './offline';
import type { Transaction } from './types';

const tx = (id: string, occurred_at: string, status: Transaction['status'] = 'confirmada'): Transaction => ({
  id, occurred_at, amount: 100, type: 'gasto', account_id: 'a', to_account_id: null, category_id: null,
  merchant: null, note: null, source: 'manual', status,
});
const OCT = ['transactions', '2026-10-01T06:00:00.000Z', '2026-11-01T06:00:00.000Z'];
const NOV = ['transactions', '2026-11-01T06:00:00.000Z', '2026-12-01T06:00:00.000Z'];
const PENDING = ['transactions', 'pending'];
const ids = (key: unknown[]) => (queryClient.getQueryData<Transaction[]>(key) ?? []).map((t) => t.id);
const onMutate = (key: string, vars: unknown) =>
  (queryClient.getMutationDefaults([key]).onMutate as (v: unknown) => Promise<unknown>)(vars);

// Las listas se actualizan al instante (antes de subir el cambio): así se ve lo guardado aunque no haya señal.
describe('cola sin conexión: listas optimistas', () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setQueryData(OCT, [tx('w', '2026-10-20T15:00:00Z', 'por_revisar'), tx('o', '2026-10-10T15:00:00Z')]);
    queryClient.setQueryData(NOV, [tx('n', '2026-11-02T15:00:00Z')]);
    queryClient.setQueryData(PENDING, [tx('w', '2026-10-20T15:00:00Z', 'por_revisar')]);
  });

  it('un movimiento nuevo entra en la lista de su mes, ordenado por fecha', async () => {
    await onMutate('saveTransaction', tx('x', '2026-10-15T15:00:00Z'));
    expect(ids(OCT)).toEqual(['w', 'x', 'o']);
    expect(ids(NOV)).toEqual(['n']);
  });

  it('cambiarle la fecha a otro mes lo saca de la lista vieja y lo pone en la nueva', async () => {
    await onMutate('saveTransaction', tx('o', '2026-11-05T15:00:00Z'));
    expect(ids(OCT)).toEqual(['w']);
    expect(ids(NOV)).toEqual(['o', 'n']);
  });

  it('confirmar un pago de Wallet lo saca de la bandeja "por revisar" y lo deja en su mes', async () => {
    await onMutate('saveTransaction', tx('w', '2026-10-20T15:00:00Z', 'confirmada'));
    expect(ids(PENDING)).toEqual([]);
    expect(ids(OCT)).toEqual(['w', 'o']);
  });

  it('borrar lo quita de todas las listas', async () => {
    await onMutate('deleteTransaction', 'w');
    expect(ids(OCT)).toEqual(['o']);
    expect(ids(PENDING)).toEqual([]);
  });
});

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
