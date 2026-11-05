// Borrar la propia cuenta (migración 20261106000000_borrar_cuenta): pide la contraseña, respeta los dos pasos,
// limita los intentos y se lleva todos los datos de esa persona, sin tocar los de nadie más.
import { beforeEach, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;
const TABLES = ['accounts', 'categories', 'transactions', 'budgets', 'recurring', 'merchant_rules', 'api_tokens'];

let t: Db;
let alice: string;
let bob: string;

/** Usuario con contraseña (bcrypt, como la guarda Supabase Auth) y un movimiento propio. */
async function userWithData(email: string, password: string) {
  const id = await t.createUser(email);
  await t.db.query("update auth.users set encrypted_password = extensions.crypt($2, extensions.gen_salt('bf')) where id = $1", [id, password]);
  const account = (await t.as<{ id: string }>('authenticated', id, 'select id from accounts'))[0].id;
  await t.as('authenticated', id, `insert into transactions (amount, type, account_id) values (100000, 'gasto', $1)`, [account]);
  return id;
}

const deleteAs = async (userId: string | null, password: string, aal: 'aal1' | 'aal2' = 'aal1') =>
  (await t.as<{ r: string }>('authenticated', userId, 'select public.delete_my_account($1) as r', [password], aal))[0].r;

const count = async (table: string, userId: string) =>
  Number((await t.db.query<{ n: string }>(`select count(*) as n from public.${table} where user_id = $1`, [userId])).rows[0].n);

beforeEach(async () => {
  t = await createDb();
  alice = await userWithData('alice@example.com', 'Clave-de-Alice1');
  bob = await userWithData('bob@example.com', 'Clave-de-Bob1');
}, 30_000);

describe('borrar la propia cuenta', () => {
  it('con la contraseña correcta borra la cuenta y todos sus datos', async () => {
    expect(await count('transactions', alice)).toBe(1);
    expect(await deleteAs(alice, 'Clave-de-Alice1')).toBe('deleted');
    expect((await t.db.query('select 1 from auth.users where id = $1', [alice])).rows).toHaveLength(0);
    for (const table of TABLES) expect(await count(table, alice), table).toBe(0);
  });

  it('no toca los datos de nadie más', async () => {
    await deleteAs(alice, 'Clave-de-Alice1');
    expect(await count('transactions', bob)).toBe(1);
    expect(await count('accounts', bob)).toBeGreaterThan(0);
    expect((await t.db.query('select 1 from auth.users where id = $1', [bob])).rows).toHaveLength(1);
  });

  it('con una contraseña incorrecta no borra nada', async () => {
    expect(await deleteAs(alice, 'otra-cosa')).toBe('wrong_password');
    expect(await deleteAs(alice, '')).toBe('wrong_password');
    expect(await count('transactions', alice)).toBe(1);
  });

  it('solo se puede borrar la propia: la contraseña de otra persona no sirve', async () => {
    expect(await deleteAs(alice, 'Clave-de-Bob1')).toBe('wrong_password');
    expect(await count('transactions', bob)).toBe(1);
  });

  it('corta tras 5 intentos en 15 minutos, aunque después llegue la contraseña correcta', async () => {
    for (let i = 0; i < 5; i++) expect(await deleteAs(alice, `mala-${i}`)).toBe('wrong_password');
    expect(await deleteAs(alice, 'Clave-de-Alice1')).toBe('rate_limited');
    expect(await count('transactions', alice)).toBe(1);
  });

  it('con dos pasos activos exige una sesión que ya pasó el código', async () => {
    await t.db.query("insert into auth.mfa_factors (user_id, status) values ($1, 'verified')", [alice]);
    expect(await deleteAs(alice, 'Clave-de-Alice1', 'aal1')).toBe('mfa_required');
    expect(await deleteAs(alice, 'Clave-de-Alice1', 'aal2')).toBe('deleted');
  });

  it('sin sesión no hace nada, y un visitante anónimo ni siquiera puede llamarla', async () => {
    expect(await deleteAs(null, 'Clave-de-Alice1')).toBe('no_session');
    await expect(t.as('anon', null, "select public.delete_my_account('x')")).rejects.toThrow(/permission denied/);
  });
});
