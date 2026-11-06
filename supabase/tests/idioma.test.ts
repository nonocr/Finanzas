// Cuentas nuevas en el idioma del registro (migración 20261108000000_idioma).
import { beforeAll, describe, expect, it } from 'vitest';
import { createDb } from './db';

type Db = Awaited<ReturnType<typeof createDb>>;
let t: Db;

beforeAll(async () => {
  t = await createDb();
}, 30_000);

const names = async (userId: string, table: 'accounts' | 'categories') =>
  (await t.as<{ name: string }>('authenticated', userId, `select name from ${table} order by ${table === 'categories' ? 'kind, ' : ''}sort`)).map((r) => r.name);

describe('datos iniciales según el idioma del registro', () => {
  it('sin idioma: en español, como siempre', async () => {
    const u = await t.createUser('sin-idioma@example.com');
    expect(await names(u, 'accounts')).toEqual(['Efectivo']);
    expect(await names(u, 'categories')).toContain('Súper');
    expect(await names(u, 'categories')).toHaveLength(13);
  });

  it("con lang 'es': en español", async () => {
    const u = await t.createUser('es@example.com', { lang: 'es' });
    expect(await names(u, 'categories')).toContain('Otros ingresos');
  });

  it("con lang 'en': cuenta y categorías en inglés, mismos íconos, colores y orden", async () => {
    const u = await t.createUser('en@example.com', { lang: 'en' });
    expect(await names(u, 'accounts')).toEqual(['Cash']);
    const cats = await t.as<{ name: string; kind: string; icon: string; color: string }>(
      'authenticated',
      u,
      'select name, kind, icon, color from categories order by kind, sort',
    );
    expect(cats).toHaveLength(13);
    expect(cats.find((c) => c.icon === 'shopping-cart')).toMatchObject({ name: 'Groceries', kind: 'gasto', color: 'c2' });
    expect(cats.map((c) => c.name)).toContain('Other income');
    expect(cats.some((c) => /[áéíóú]|Comida|Otros/.test(c.name))).toBe(false);
  });

  it('un idioma desconocido no rompe el registro: queda en español', async () => {
    const u = await t.createUser('fr@example.com', { lang: 'fr' });
    expect(await names(u, 'accounts')).toEqual(['Efectivo']);
  });
});
