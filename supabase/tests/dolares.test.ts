// Compras en dólares contra la base (migraciones en PGlite): los tres campos van juntos y validados.
import { beforeAll, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;
let t: Db;
let alice: string;
let cash: string;
let bank: string;

const insert = (cols: string, values: string, params: unknown[] = []) =>
  t.as<{ id: string }>('authenticated', alice, `insert into transactions (${cols}) values (${values}) returning id`, params);

beforeAll(async () => {
  t = await createDb();
  alice = await t.createUser('alice@example.com');
  cash = (await t.as<{ id: string }>('authenticated', alice, 'select id from accounts'))[0].id;
  bank = (await t.as<{ id: string }>('authenticated', alice, "insert into accounts (name, type) values ('BN', 'debito') returning id"))[0].id;
}, 30_000);

describe('dólares', () => {
  it('un gasto en dólares guarda colones, dólares y tipo de cambio', async () => {
    const [{ id }] = await insert(
      'amount, type, account_id, original_currency, original_amount, fx_rate',
      `590279, 'gasto', $1, 'USD', 1299, 454.41`,
      [cash],
    );
    const rows = await t.as<{ amount: string; original_amount: string; fx_rate: string }>(
      'authenticated',
      alice,
      'select amount, original_amount, fx_rate from transactions where id = $1',
      [id],
    );
    expect(rows[0]).toMatchObject({ original_amount: 1299 });
    expect(Number(rows[0].fx_rate)).toBe(454.41);
  });

  it('los tres campos van juntos', async () => {
    await expect(insert('amount, type, account_id, original_currency, original_amount', `100, 'gasto', $1, 'USD', 1`, [cash])).rejects.toThrow(
      /original_all_or_none/,
    );
    await expect(insert('amount, type, account_id, fx_rate', `100, 'gasto', $1, 450`, [cash])).rejects.toThrow(/original_all_or_none/);
  });

  it('solo dólares, con montos y tipo de cambio razonables', async () => {
    await expect(
      insert('amount, type, account_id, original_currency, original_amount, fx_rate', `100, 'gasto', $1, 'EUR', 1, 500`, [cash]),
    ).rejects.toThrow(/original_currency/);
    await expect(
      insert('amount, type, account_id, original_currency, original_amount, fx_rate', `100, 'gasto', $1, 'USD', 0, 500`, [cash]),
    ).rejects.toThrow(/original_amount/);
    await expect(
      insert('amount, type, account_id, original_currency, original_amount, fx_rate', `100, 'gasto', $1, 'USD', 1, 0.5`, [cash]),
    ).rejects.toThrow(/fx_rate/);
  });

  it('una transferencia no lleva moneda de origen', async () => {
    await expect(
      insert(
        'amount, type, account_id, to_account_id, original_currency, original_amount, fx_rate',
        `100, 'transferencia', $1, $2, 'USD', 1, 500`,
        [cash, bank],
      ),
    ).rejects.toThrow(/original_not_transfer/);
  });
});
