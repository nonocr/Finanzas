// Constancia de aceptación de los Términos y la Privacidad (migración 20261109000000_aceptacion_legal).
import { beforeAll, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;
let t: Db;
let alice: string;
let bob: string;

type Row = { user_id: string; version: string; source: string };
const read = (userId: string, aal: 'aal1' | 'aal2' = 'aal1') =>
  t.as<Row>('authenticated', userId, 'select user_id, version, source from legal_acceptances order by version', [], aal);
const accept = (userId: string, version: string, aal: 'aal1' | 'aal2' = 'aal1') =>
  t.as('authenticated', userId, 'insert into legal_acceptances (version) values ($1)', [version], aal);

beforeAll(async () => {
  t = await createDb();
  alice = await t.createUser('alice@example.com', { lang: 'es', legal_version: '2026-11-06' });
  bob = await t.createUser('bob@example.com');
}, 30_000);

describe('aceptación legal', () => {
  it('al crear la cuenta desde la app queda la constancia, con origen «registro»', async () => {
    expect(await read(alice)).toEqual([{ user_id: alice, version: '2026-11-06', source: 'registro' }]);
  });

  it('sin versión en el registro no se guarda nada (la app pedirá aceptar al entrar)', async () => {
    expect(await read(bob)).toEqual([]);
    const carol = await t.createUser('carol@example.com', { legal_version: 'cualquier cosa' });
    expect((await t.db.query('select 1 from public.legal_acceptances where user_id = $1', [carol])).rows).toHaveLength(0);
  });

  it('la persona acepta una versión nueva desde la app, con origen «app» y la hora del servidor', async () => {
    await accept(bob, '2026-11-06');
    const rows = await t.as<{ source: string; recent: boolean }>(
      'authenticated',
      bob,
      "select source, accepted_at > now() - interval '1 minute' as recent from legal_acceptances",
    );
    expect(rows).toEqual([{ source: 'app', recent: true }]);
  });

  it('aceptar dos veces la misma versión no duplica', async () => {
    await expect(accept(bob, '2026-11-06')).rejects.toThrow(/duplicate key/);
    expect(await read(bob)).toHaveLength(1);
  });

  it('no se puede fingir la hora, el origen ni el dueño', async () => {
    await expect(
      t.as('authenticated', bob, "insert into legal_acceptances (version, accepted_at) values ('2026-12-01', '2020-01-01')"),
    ).rejects.toThrow(/permission denied/);
    await expect(
      t.as('authenticated', bob, "insert into legal_acceptances (version, source) values ('2026-12-01', 'registro')"),
    ).rejects.toThrow(/permission denied/);
    await expect(
      t.as('authenticated', bob, 'insert into legal_acceptances (user_id, version) values ($1, $2)', [alice, '2026-12-01']),
    ).rejects.toThrow(/permission denied/);
  });

  it('solo acepta versiones con forma de fecha', async () => {
    await expect(accept(bob, 'v2')).rejects.toThrow(/legal_acceptances_version_check/);
  });

  it('cada persona ve solo las suyas, y nadie las cambia ni las borra', async () => {
    expect((await read(alice)).every((r) => r.user_id === alice)).toBe(true);
    await expect(t.as('authenticated', alice, "update legal_acceptances set version = '2030-01-01'")).rejects.toThrow(/permission denied/);
    await expect(t.as('authenticated', alice, 'delete from legal_acceptances')).rejects.toThrow(/permission denied/);
  });

  it('un visitante sin sesión no ve nada', async () => {
    await expect(t.as('anon', null, 'select * from legal_acceptances')).rejects.toThrow(/permission denied/);
  });

  it('se van con la cuenta', async () => {
    const dave = await t.createUser('dave@example.com', { legal_version: '2026-11-06' });
    await t.db.query('delete from auth.users where id = $1', [dave]);
    expect((await t.db.query('select 1 from public.legal_acceptances where user_id = $1', [dave])).rows).toHaveLength(0);
  });

  it('con dos pasos activos, una sesión sin el código no lee ni escribe', async () => {
    await t.db.query("insert into auth.mfa_factors (user_id, status) values ($1, 'verified')", [alice]);
    expect(await read(alice, 'aal1')).toEqual([]);
    await expect(accept(alice, '2026-12-01', 'aal1')).rejects.toThrow(/row-level security/);
    expect(await read(alice, 'aal2')).toHaveLength(1);
  });
});
