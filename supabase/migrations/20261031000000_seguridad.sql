-- Endurecimiento de seguridad (auditoría 2026-10-31). No destructiva: no borra datos.
-- Para revertir: ver el bloque "REVERTIR" al final.
--
-- 1. Mínimos privilegios: anon (visitante sin sesión) no tiene ningún permiso; authenticated solo lo que usa la app.
-- 2. Propiedad de referencias: un registro solo puede apuntar a cuentas/categorías del mismo dueño (anti-IDOR),
--    y nadie puede cambiar el dueño de un registro.
-- 3. Validación en la base: longitudes y rangos, aunque el cliente ya valide.
-- 4. Límite de frecuencia para los webhooks del Atajo (tabla fuera del API + función solo para service_role).
-- 5. Máximo de tokens del Atajo por usuario y search_path fijo en funciones.

-- ---------------------------------------------------------------------------
-- 1. Privilegios
-- ---------------------------------------------------------------------------

-- Supabase da por defecto todos los permisos a anon y authenticated y confía solo en RLS. Se quita la red:
-- anon no necesita nada (la app exige sesión), y TRUNCATE/REFERENCES/TRIGGER no los usa nadie.
revoke all on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- Las vistas calculadas son de solo lectura.
revoke insert, update, delete on public.account_balances, public.budget_progress from authenticated;

-- Tokens del Atajo: el cliente ve nombre y fechas, nunca el hash; solo puede revocarlos (borrar).
-- Se crean únicamente con create_api_token().
revoke all on public.api_tokens from authenticated;
grant select (id, user_id, name, created_at, last_used_at) on public.api_tokens to authenticated;
grant delete on public.api_tokens to authenticated;

-- Funciones: nadie las ejecuta salvo a quien se le otorgan explícitamente.
revoke execute on all functions in schema public from public, anon;
grant execute on function public.create_api_token(text) to authenticated;
grant execute on function public.copy_budgets(date, date) to authenticated;
revoke execute on function public.handle_new_user() from authenticated;

-- Lo mismo para objetos que se creen en el futuro.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from public, anon;

-- search_path fijo (evita que otro esquema "suplante" tablas dentro de la función).
alter function public.copy_budgets(date, date) set search_path = public;

-- ---------------------------------------------------------------------------
-- 2. Propiedad de referencias
-- ---------------------------------------------------------------------------

create or replace function public.enforce_same_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'No se puede cambiar el dueño de un registro' using errcode = '42501';
  end if;

  -- Cada referencia debe pertenecer al mismo usuario que el registro (también para service_role).
  if tg_table_name in ('transactions', 'recurring') then
    if not exists (select 1 from accounts a where a.id = new.account_id and a.user_id = new.user_id) then
      raise exception 'La cuenta no existe' using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'transactions' then
    if new.to_account_id is not null
       and not exists (select 1 from accounts a where a.id = new.to_account_id and a.user_id = new.user_id) then
      raise exception 'La cuenta de destino no existe' using errcode = '42501';
    end if;
    if new.recurring_id is not null
       and not exists (select 1 from recurring r where r.id = new.recurring_id and r.user_id = new.user_id) then
      raise exception 'El recurrente no existe' using errcode = '42501';
    end if;
  end if;

  if tg_table_name in ('transactions', 'recurring', 'budgets', 'merchant_rules') then
    if new.category_id is not null
       and not exists (select 1 from categories c where c.id = new.category_id and c.user_id = new.user_id) then
      raise exception 'La categoría no existe' using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'categories' then
    if new.parent_id is not null
       and not exists (select 1 from categories c where c.id = new.parent_id and c.user_id = new.user_id) then
      raise exception 'La categoría superior no existe' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;
revoke execute on function public.enforce_same_owner() from public, anon, authenticated;

create trigger enforce_same_owner before insert or update on public.accounts
  for each row execute function public.enforce_same_owner();
create trigger enforce_same_owner before insert or update on public.categories
  for each row execute function public.enforce_same_owner();
create trigger enforce_same_owner before insert or update on public.transactions
  for each row execute function public.enforce_same_owner();
create trigger enforce_same_owner before insert or update on public.budgets
  for each row execute function public.enforce_same_owner();
create trigger enforce_same_owner before insert or update on public.recurring
  for each row execute function public.enforce_same_owner();
create trigger enforce_same_owner before insert or update on public.merchant_rules
  for each row execute function public.enforce_same_owner();

-- ---------------------------------------------------------------------------
-- 3. Validación de datos (máximos generosos: ₡1 billón = 1e14 céntimos)
-- ---------------------------------------------------------------------------

alter table public.transactions
  add constraint transactions_amount_max check (amount <= 100000000000000),
  add constraint transactions_merchant_len check (merchant is null or char_length(merchant) <= 200),
  add constraint transactions_note_len check (note is null or char_length(note) <= 500);

alter table public.accounts
  add constraint accounts_name_len check (char_length(name) <= 60),
  add constraint accounts_wallet_name_len check (wallet_name is null or char_length(wallet_name) <= 80),
  add constraint accounts_color_len check (color is null or char_length(color) <= 20),
  add constraint accounts_icon_len check (icon is null or char_length(icon) <= 40),
  add constraint accounts_initial_balance_range check (abs(initial_balance) <= 100000000000000),
  add constraint accounts_credit_limit_max check (credit_limit is null or credit_limit <= 100000000000000);

alter table public.categories
  add constraint categories_name_len check (char_length(name) <= 60),
  add constraint categories_icon_len check (icon is null or char_length(icon) <= 40),
  add constraint categories_color_len check (color is null or char_length(color) <= 20);

alter table public.budgets
  add constraint budgets_amount_max check (amount <= 100000000000000);

alter table public.recurring
  add constraint recurring_name_len check (char_length(name) <= 80),
  add constraint recurring_amount_max check (amount <= 100000000000000);

alter table public.merchant_rules
  add constraint merchant_rules_pattern_len check (char_length(pattern) <= 100);

alter table public.api_tokens
  add constraint api_tokens_name_len check (char_length(name) <= 60);

-- ---------------------------------------------------------------------------
-- 4. Límite de frecuencia para los webhooks (los llama el Atajo con un token propio)
-- ---------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         int not null default 0
);

-- Devuelve true si la petición entra en el límite (p_max por ventana de p_window_seconds) y la cuenta.
create or replace function public.rate_limit_hit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits int;
begin
  insert into private.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;

  -- Limpieza ocasional de ventanas viejas para que la tabla no crezca.
  if random() < 0.01 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max;
end;
$$;
revoke execute on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Tokens del Atajo: máximo 5 activos por usuario
-- ---------------------------------------------------------------------------

create or replace function public.create_api_token(p_name text default 'Atajo iPhone')
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  raw text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if (select count(*) from public.api_tokens where user_id = auth.uid()) >= 5 then
    raise exception 'Tienes 5 tokens activos; revoca uno antes de crear otro' using errcode = '54000';
  end if;
  raw := 'fz_' || encode(gen_random_bytes(24), 'hex');
  insert into public.api_tokens (user_id, name, token_hash)
  values (auth.uid(), left(coalesce(nullif(trim(p_name), ''), 'Atajo iPhone'), 60), encode(digest(raw, 'sha256'), 'hex'));
  return raw;
end;
$$;
revoke execute on function public.create_api_token(text) from public, anon;
grant execute on function public.create_api_token(text) to authenticated;

-- ---------------------------------------------------------------------------
-- REVERTIR (manual, si hiciera falta):
--   drop trigger enforce_same_owner on <cada tabla>; drop function public.enforce_same_owner();
--   alter table <tabla> drop constraint <cada constraint de la sección 3>;
--   drop function public.rate_limit_hit(text,int,int); drop schema private cascade;
--   grant all on all tables in schema public to anon, authenticated;  -- vuelve al default de Supabase
--   grant select, insert, update, delete on public.api_tokens to authenticated;
-- ---------------------------------------------------------------------------
