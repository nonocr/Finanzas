// Base PostgreSQL efímera (PGlite, en memoria) que imita lo que Supabase tiene antes de nuestras migraciones:
// roles anon/authenticated/service_role, esquema auth con auth.uid() y los permisos por defecto de Supabase
// (todo concedido a anon y authenticated). Sirve para probar migraciones y políticas sin tocar producción.
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS = join(import.meta.dirname, '..', 'migrations');

const SUPABASE_BASELINE = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create schema extensions;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, encrypted_password text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create table auth.mfa_factors (id uuid primary key default gen_random_uuid(), user_id uuid not null, status text not null);
  grant usage on schema public, auth, extensions to anon, authenticated, service_role;
  grant execute on function auth.uid(), auth.jwt() to anon, authenticated, service_role;
  -- Defaults de Supabase: todo lo que se crea en public queda concedido a los roles del API.
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

export type Role = 'anon' | 'authenticated' | 'service_role';

export async function createDb(opts: { upTo?: string } = {}) {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_BASELINE);
  const files = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .filter((f) => !opts.upTo || f <= opts.upTo);
  for (const f of files) await db.exec(readFileSync(join(MIGRATIONS, f), 'utf8'));

  /** Crea un usuario como lo haría Supabase Auth (dispara handle_new_user). */
  async function createUser(email: string) {
    const r = await db.query<{ id: string }>('insert into auth.users (email) values ($1) returning id', [email]);
    return r.rows[0].id;
  }

  /** Ejecuta SQL como un rol del API, con el usuario de la sesión (o ninguno). `aal` imita el nivel de la sesión. */
  async function as<T = Record<string, unknown>>(
    role: Role,
    userId: string | null,
    sql: string,
    params: unknown[] = [],
    aal: 'aal1' | 'aal2' = 'aal1',
  ) {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? '']);
    await db.query("select set_config('request.jwt.claims', $1, false)", [userId ? JSON.stringify({ sub: userId, aal }) : '']);
    await db.exec(`set role ${role}`);
    try {
      return (await db.query<T>(sql, params)).rows;
    } finally {
      await db.exec('reset role');
    }
  }

  return { db, createUser, as };
}
