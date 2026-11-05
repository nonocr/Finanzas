// Preferencias en la cuenta (migración 20261107000000_preferencias): cada persona ve y cambia solo las suyas.
import { beforeAll, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;
let t: Db;
let alice: string;
let bob: string;

const upsert = (userId: string, prefs: object, aal: 'aal1' | 'aal2' = 'aal1') =>
  t.as(
    'authenticated',
    userId,
    `insert into user_settings (prefs) values ($1::jsonb)
     on conflict (user_id) do update set prefs = excluded.prefs, updated_at = now()`,
    [JSON.stringify(prefs)],
    aal,
  );
const read = async (userId: string, aal: 'aal1' | 'aal2' = 'aal1') =>
  (await t.as<{ user_id: string; prefs: Record<string, unknown> }>('authenticated', userId, 'select user_id, prefs from user_settings', [], aal));

beforeAll(async () => {
  t = await createDb();
  alice = await t.createUser('alice@example.com');
  bob = await t.createUser('bob@example.com');
}, 30_000);

describe('preferencias', () => {
  it('cada persona guarda y lee las suyas', async () => {
    await upsert(alice, { theme: 'oro', discreet: true });
    await upsert(bob, { theme: 'zafiro' });
    expect(await read(alice)).toEqual([{ user_id: alice, prefs: { theme: 'oro', discreet: true } }]);
    expect(await read(bob)).toEqual([{ user_id: bob, prefs: { theme: 'zafiro' } }]);
  });

  it('guardar de nuevo reemplaza (una sola fila por persona)', async () => {
    await upsert(alice, { theme: 'cobre' });
    const rows = await read(alice);
    expect(rows).toHaveLength(1);
    expect(rows[0].prefs).toEqual({ theme: 'cobre' });
  });

  it('nadie puede escribir ni cambiar las de otra persona', async () => {
    await t.as('authenticated', alice, `update user_settings set prefs = '{"hack":1}'`);
    expect((await read(bob))[0].prefs).toEqual({ theme: 'zafiro' });
    await expect(
      t.as('authenticated', alice, 'insert into user_settings (user_id, prefs) values ($1, $2::jsonb)', [bob, '{}']),
    ).rejects.toThrow(/permission denied/);
    await expect(t.as('authenticated', alice, 'update user_settings set user_id = $1', [bob])).rejects.toThrow(/permission denied/);
  });

  it('no se borran a mano, pero se van con la cuenta', async () => {
    await expect(t.as('authenticated', alice, 'delete from user_settings')).rejects.toThrow(/permission denied/);
    const carol = await t.createUser('carol@example.com');
    await upsert(carol, { theme: 'oro' });
    await t.db.query('delete from auth.users where id = $1', [carol]);
    expect((await t.db.query('select 1 from public.user_settings where user_id = $1', [carol])).rows).toHaveLength(0);
  });

  it('solo acepta un objeto JSON pequeño', async () => {
    await expect(upsert(alice, [1, 2] as unknown as object)).rejects.toThrow(/user_settings_prefs_object/);
    await expect(upsert(alice, { relleno: 'x'.repeat(10_000) })).rejects.toThrow(/user_settings_prefs_size/);
  });

  it('un visitante sin sesión no ve nada', async () => {
    await expect(t.as('anon', null, 'select * from user_settings')).rejects.toThrow(/permission denied/);
  });

  it('con dos pasos activos, una sesión sin el código no lee ni escribe', async () => {
    await t.db.query("insert into auth.mfa_factors (user_id, status) values ($1, 'verified')", [bob]);
    expect(await read(bob, 'aal1')).toEqual([]);
    await expect(upsert(bob, { theme: 'oro' }, 'aal1')).rejects.toThrow(/row-level security/);
    expect((await read(bob, 'aal2'))[0].prefs).toEqual({ theme: 'zafiro' });
  });
});
