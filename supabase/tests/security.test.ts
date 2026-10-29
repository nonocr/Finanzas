// Pruebas de seguridad de la base: permisos, RLS, propiedad de referencias (IDOR), asignación de campos,
// validación y límite de frecuencia. Corren contra un PostgreSQL efímero con las migraciones reales.
import { beforeAll, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;
const TABLES = ['accounts', 'categories', 'transactions', 'budgets', 'recurring', 'merchant_rules', 'api_tokens'];

let t: Db;
let alice: string;
let bob: string;
let aliceAccount: string;
let bobAccount: string;
let bobCategory: string;
let bobTx: string;

beforeAll(async () => {
  t = await createDb();
  alice = await t.createUser('alice@example.com');
  bob = await t.createUser('bob@example.com');
  aliceAccount = (await t.as<{ id: string }>('authenticated', alice, 'select id from accounts'))[0].id;
  bobAccount = (await t.as<{ id: string }>('authenticated', bob, 'select id from accounts'))[0].id;
  bobCategory = (await t.as<{ id: string }>('authenticated', bob, "select id from categories where name = 'Súper'"))[0].id;
  bobTx = (
    await t.as<{ id: string }>(
      'authenticated',
      bob,
      `insert into transactions (amount, type, account_id, category_id) values (500000, 'gasto', $1, $2) returning id`,
      [bobAccount, bobCategory],
    )
  )[0].id;
}, 30_000);

describe('visitante sin sesión (anon)', () => {
  it.each(TABLES)('no puede leer %s', async (table) => {
    await expect(t.as('anon', null, `select * from ${table}`)).rejects.toThrow(/permission denied/);
  });

  it.each(TABLES)('no puede escribir en %s', async (table) => {
    await expect(t.as('anon', null, `delete from ${table}`)).rejects.toThrow(/permission denied/);
  });

  it('no puede ejecutar funciones', async () => {
    await expect(t.as('anon', null, "select copy_budgets('2026-09-01', '2026-10-01')")).rejects.toThrow(/permission denied/);
    await expect(t.as('anon', null, 'select create_api_token()')).rejects.toThrow(/permission denied/);
    await expect(t.as('anon', null, "select rate_limit_hit('x', 1, 60)")).rejects.toThrow(/permission denied/);
  });
});

describe('usuario autenticado: solo sus registros (RLS)', () => {
  it('recibe sus datos iniciales y no ve los de otro', async () => {
    const accounts = await t.as<{ user_id: string }>('authenticated', alice, 'select user_id from accounts');
    expect(accounts.length).toBe(1);
    expect(accounts.every((a) => a.user_id === alice)).toBe(true);
    expect(await t.as('authenticated', alice, 'select * from transactions where id = $1', [bobTx])).toEqual([]);
    expect(await t.as('authenticated', alice, 'select * from account_balances where account_id = $1', [bobAccount])).toEqual([]);
  });

  it('no puede modificar ni borrar registros de otro (IDOR por id)', async () => {
    await t.as('authenticated', alice, 'update transactions set amount = 1 where id = $1', [bobTx]);
    await t.as('authenticated', alice, 'delete from transactions where id = $1', [bobTx]);
    const still = await t.as<{ amount: string }>('authenticated', bob, 'select amount from transactions where id = $1', [bobTx]);
    expect(Number(still[0].amount)).toBe(500000);
  });

  it('no puede crear registros a nombre de otro', async () => {
    await expect(
      t.as('authenticated', alice, `insert into accounts (user_id, name, type) values ($1, 'X', 'efectivo')`, [bob]),
    ).rejects.toThrow(/row-level security/);
  });

  it('no puede apuntar a la cuenta o categoría de otro (IDOR por referencia)', async () => {
    await expect(
      t.as('authenticated', alice, `insert into transactions (amount, type, account_id) values (100, 'gasto', $1)`, [bobAccount]),
    ).rejects.toThrow(/cuenta no existe/);
    await expect(
      t.as(
        'authenticated',
        alice,
        `insert into transactions (amount, type, account_id, category_id) values (100, 'gasto', $1, $2)`,
        [aliceAccount, bobCategory],
      ),
    ).rejects.toThrow(/categoría no existe/);
    await expect(
      t.as(
        'authenticated',
        alice,
        `insert into transactions (amount, type, account_id, to_account_id) values (100, 'transferencia', $1, $2)`,
        [aliceAccount, bobAccount],
      ),
    ).rejects.toThrow(/destino no existe/);
    await expect(
      t.as('authenticated', alice, `insert into budgets (category_id, month, amount) values ($1, '2026-10-01', 100)`, [bobCategory]),
    ).rejects.toThrow(/categoría no existe/);
  });

  it('no puede cambiar el dueño de su propio registro (asignación de campos)', async () => {
    await expect(t.as('authenticated', alice, 'update accounts set user_id = $1', [bob])).rejects.toThrow(/dueño/);
  });

  it('no puede vaciar tablas ni escribir en las vistas calculadas', async () => {
    await expect(t.as('authenticated', alice, 'truncate transactions')).rejects.toThrow(/permission denied/);
    // Postgres rechaza escribir en estas vistas antes de mirar permisos; se verifica el permiso en sí.
    const privs = await t.db.query<{ p: boolean }>(
      `select bool_or(has_table_privilege('authenticated', v, p)) as p
       from unnest(array['account_balances', 'budget_progress']) v, unnest(array['INSERT', 'UPDATE', 'DELETE']) p`,
    );
    expect(privs.rows[0].p).toBe(false);
  });

  it('sigue pudiendo trabajar con lo suyo', async () => {
    const cat = (await t.as<{ id: string }>('authenticated', alice, "select id from categories where name = 'Comida'"))[0].id;
    const id = (
      await t.as<{ id: string }>(
        'authenticated',
        alice,
        `insert into transactions (amount, type, account_id, category_id, merchant) values (450000, 'gasto', $1, $2, 'Soda') returning id`,
        [aliceAccount, cat],
      )
    )[0].id;
    await t.as('authenticated', alice, 'update transactions set note = $2 where id = $1', [id, 'almuerzo']);
    await t.as('authenticated', alice, `insert into budgets (category_id, month, amount) values ($1, '2026-10-01', 1000000)`, [cat]);
    expect(await t.as('authenticated', alice, "select copy_budgets('2026-10-01', '2026-11-01') as n")).toEqual([{ n: 1 }]);
    const bal = await t.as<{ balance: string }>('authenticated', alice, 'select balance from account_balances');
    expect(Number(bal[0].balance)).toBe(-450000);
  });
});

describe('tokens del Atajo', () => {
  it('se crean solo con create_api_token y el hash no es legible', async () => {
    const token = (await t.as<{ t: string }>('authenticated', alice, 'select create_api_token($1) as t', ['iPhone']))[0].t;
    expect(token).toMatch(/^fz_[0-9a-f]{48}$/);
    expect(await t.as('authenticated', alice, 'select id, name from api_tokens')).toHaveLength(1);
    await expect(t.as('authenticated', alice, 'select token_hash from api_tokens')).rejects.toThrow(/permission denied/);
    await expect(
      t.as('authenticated', alice, "insert into api_tokens (name, token_hash) values ('x', 'y')"),
    ).rejects.toThrow(/permission denied/);
  });

  it('máximo 5 activos por usuario', async () => {
    for (let i = 0; i < 4; i++) await t.as('authenticated', alice, 'select create_api_token()');
    await expect(t.as('authenticated', alice, 'select create_api_token()')).rejects.toThrow(/5 tokens/);
    await t.as('authenticated', alice, 'delete from api_tokens where id = (select id from api_tokens limit 1)');
    await expect(t.as('authenticated', alice, 'select create_api_token()')).resolves.toBeDefined();
  });
});

describe('validación en la base', () => {
  it('rechaza textos demasiado largos y montos absurdos', async () => {
    await expect(
      t.as('authenticated', alice, `insert into transactions (amount, type, account_id, merchant) values (100, 'gasto', $1, $2)`, [
        aliceAccount,
        'x'.repeat(201),
      ]),
    ).rejects.toThrow(/transactions_merchant_len/);
    await expect(
      t.as('authenticated', alice, `insert into transactions (amount, type, account_id) values ($2, 'gasto', $1)`, [
        aliceAccount,
        '100000000000001',
      ]),
    ).rejects.toThrow(/transactions_amount_max/);
    await expect(t.as('authenticated', alice, `update accounts set name = $1`, ['n'.repeat(61)])).rejects.toThrow(/accounts_name_len/);
  });
});

describe('límite de frecuencia de los webhooks', () => {
  it('solo service_role lo usa, y corta al pasar el máximo', async () => {
    await expect(t.as('authenticated', alice, "select rate_limit_hit('k', 3, 60)")).rejects.toThrow(/permission denied/);
    const hits = [];
    for (let i = 0; i < 4; i++) hits.push((await t.as<{ ok: boolean }>('service_role', null, "select rate_limit_hit('k', 3, 60) as ok"))[0].ok);
    expect(hits).toEqual([true, true, true, false]);
    // Otra clave tiene su propio contador.
    expect((await t.as<{ ok: boolean }>('service_role', null, "select rate_limit_hit('otra', 3, 60) as ok"))[0].ok).toBe(true);
  });
});

describe('antes de la migración de seguridad (para mostrar qué se corrigió)', () => {
  it('anon tenía permisos sobre las tablas y se podía apuntar a cuentas ajenas', async () => {
    const old = await createDb({ upTo: '20261030999999' });
    const a = await old.createUser('a@example.com');
    const b = await old.createUser('b@example.com');
    const bAcc = (await old.as<{ id: string }>('authenticated', b, 'select id from accounts'))[0].id;
    // anon: sin error de permisos (solo RLS lo frenaba).
    await expect(old.as('anon', null, 'select * from transactions')).resolves.toEqual([]);
    // Un usuario podía registrar un gasto contra la cuenta de otro.
    await expect(
      old.as('authenticated', a, `insert into transactions (amount, type, account_id) values (100, 'gasto', $1)`, [bAcc]),
    ).resolves.toBeDefined();
    await old.db.close();
  }, 30_000);
});
