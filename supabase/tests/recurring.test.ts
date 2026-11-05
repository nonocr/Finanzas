// Gastos e ingresos fijos contra la base real (migraciones en PGlite): la app genera cada cobro con un id fijo y lo
// inserta con «on conflict (id) do nothing», como hace supabase-js con upsert + ignoreDuplicates.
import { beforeAll, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;

let t: Db;
let alice: string;
let bob: string;
let aliceAccount: string;
let aliceCategory: string;
let aliceRec: string;

const TX_ID = '6d1c2f0a-9b3e-8c4d-9a1b-2c3d4e5f6a7b';
const insertGenerated = (user: string, recurring: string, account: string, id = TX_ID) =>
  t.as<{ id: string }>(
    'authenticated',
    user,
    `insert into transactions (id, occurred_at, amount, type, account_id, category_id, merchant, source, recurring_id)
     values ($1, '2026-11-01T12:00:00Z', 32000000, 'gasto', $2, null, 'Alquiler', 'recurrente', $3)
     on conflict (id) do nothing returning id`,
    [id, account, recurring],
  );

beforeAll(async () => {
  t = await createDb();
  alice = await t.createUser('alice@example.com');
  bob = await t.createUser('bob@example.com');
  aliceAccount = (await t.as<{ id: string }>('authenticated', alice, 'select id from accounts'))[0].id;
  aliceCategory = (await t.as<{ id: string }>('authenticated', alice, "select id from categories where name = 'Casa'"))[0].id;
  aliceRec = (
    await t.as<{ id: string }>(
      'authenticated',
      alice,
      `insert into recurring (name, type, amount, account_id, category_id, frequency, next_date, anchor_day)
       values ('Alquiler', 'gasto', 32000000, $1, $2, 'mensual', '2026-11-01', 1) returning id`,
      [aliceAccount, aliceCategory],
    )
  )[0].id;
}, 30_000);

describe('recurrentes', () => {
  it('guarda el día elegido y lo valida', async () => {
    const rows = await t.as<{ anchor_day: number }>('authenticated', alice, 'select anchor_day from recurring where id = $1', [aliceRec]);
    expect(rows[0].anchor_day).toBe(1);
    await expect(
      t.as('authenticated', alice, 'update recurring set anchor_day = 32 where id = $1', [aliceRec]),
    ).rejects.toThrow(/check constraint/);
  });

  it('insertar el mismo cobro dos veces deja uno solo', async () => {
    expect(await insertGenerated(alice, aliceRec, aliceAccount)).toEqual([{ id: TX_ID }]);
    expect(await insertGenerated(alice, aliceRec, aliceAccount)).toEqual([]);
    const n = await t.as<{ n: number }>('authenticated', alice, 'select count(*)::int as n from transactions where recurring_id = $1', [aliceRec]);
    expect(n[0].n).toBe(1);
  });

  it('otro usuario no puede colgar movimientos del recurrente ajeno', async () => {
    const bobAccount = (await t.as<{ id: string }>('authenticated', bob, 'select id from accounts'))[0].id;
    await expect(
      insertGenerated(bob, aliceRec, bobAccount, '7e2d3f1b-0c4f-8d5e-8b2c-3d4e5f6a7b8c'),
    ).rejects.toThrow(/recurrente no existe/);
  });

  it('un id que ya es de otro usuario no se pisa ni se revela', async () => {
    const bobAccount = (await t.as<{ id: string }>('authenticated', bob, 'select id from accounts'))[0].id;
    const bobRec = (
      await t.as<{ id: string }>(
        'authenticated',
        bob,
        `insert into recurring (name, type, amount, account_id, frequency, next_date) values ('X', 'gasto', 100, $1, 'mensual', '2026-11-01') returning id`,
        [bobAccount],
      )
    )[0].id;
    // Mismo id que el cobro de Alice: el insert choca y no hace nada.
    expect(await insertGenerated(bob, bobRec, bobAccount)).toEqual([]);
    const owner = await t.as<{ user_id: string; amount: string }>('service_role', null, 'select user_id, amount from transactions where id = $1', [TX_ID]);
    expect(owner[0].user_id).toBe(alice);
  });

  it('borrar el recurrente deja sus movimientos', async () => {
    await t.as('authenticated', alice, 'delete from recurring where id = $1', [aliceRec]);
    const rows = await t.as<{ recurring_id: string | null }>('authenticated', alice, 'select recurring_id from transactions where id = $1', [TX_ID]);
    expect(rows).toEqual([{ recurring_id: null }]);
  });
});
