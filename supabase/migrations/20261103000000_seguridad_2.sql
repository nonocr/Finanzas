-- Segunda auditoría de seguridad (2026-10-30). No destructiva: no borra ni cambia datos.
-- Para revertir: ver el bloque "REVERTIR" al final.
--
-- 1. Objetos futuros: hoy una tabla nueva le daría a `authenticated` todos los permisos (incluido TRUNCATE) y a
--    `anon` las secuencias. Desde ahora, cada tabla o función nueva tiene que conceder a mano lo que la app use.
-- 2. search_path con pg_temp al final en las funciones propias (nadie puede "suplantar" un objeto con uno temporal).
-- 3. La huella de Wallet (external_id) solo la asigna el servidor: desde la app no se puede poner ni cambiar.
-- 4. El limitador de los webhooks limpia sus filas viejas antes (1 hora en vez de 1 día) y con índice.

-- ---------------------------------------------------------------------------
-- 1. Privilegios por defecto de objetos futuros (los crea el rol `postgres`, el de las migraciones)
-- ---------------------------------------------------------------------------

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. search_path de las funciones propias
-- ---------------------------------------------------------------------------

alter function public.create_api_token(text) set search_path = public, extensions, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.enforce_same_owner() set search_path = public, pg_temp;
alter function public.copy_budgets(date, date) set search_path = public, pg_temp;

-- ---------------------------------------------------------------------------
-- 3. La huella de Wallet solo la pone el servidor (service_role, en wallet-sync)
-- ---------------------------------------------------------------------------

-- Si la app pudiera escribirla, alguien con la sesión abierta podría "reservar" la huella de un pago futuro y ese
-- pago se tomaría por duplicado. La app nunca la usa: al editar un pago de Wallet la reenvía igual, y eso se permite.
create or replace function public.protect_wallet_id()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if (tg_op = 'INSERT' and new.external_id is not null)
       or (tg_op = 'UPDATE' and new.external_id is distinct from old.external_id) then
      raise exception 'La huella de Wallet solo la asigna el servidor' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.protect_wallet_id() from public, anon, authenticated;

create trigger protect_wallet_id before insert or update on public.transactions
  for each row execute function public.protect_wallet_id();

-- ---------------------------------------------------------------------------
-- 4. Limpieza del limitador de frecuencia
-- ---------------------------------------------------------------------------

create index if not exists rate_limits_window_start_idx on private.rate_limits (window_start);

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
  values (left(p_key, 200), now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;

  -- Ninguna ventana dura más de 10 minutos: lo de hace más de una hora ya no cuenta y se borra.
  if random() < 0.05 then
    delete from private.rate_limits where window_start < now() - interval '1 hour';
  end if;

  return v_hits <= p_max;
end;
$$;
revoke execute on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- ---------------------------------------------------------------------------
-- REVERTIR (manual, si hiciera falta):
--   drop trigger protect_wallet_id on public.transactions; drop function public.protect_wallet_id();
--   alter default privileges in schema public grant all on tables to authenticated;
--   alter default privileges in schema public grant execute on functions to authenticated;
--   (search_path e índice no necesitan revertirse; rate_limit_hit: ver 20261031000000_seguridad.sql)
-- ---------------------------------------------------------------------------
