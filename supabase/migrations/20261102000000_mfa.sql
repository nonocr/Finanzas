-- Verificación en dos pasos (TOTP) exigida también por la base, no solo por la app.
-- Si la usuaria tiene un factor verificado, una sesión que solo pasó la contraseña (aal1) no puede leer ni
-- escribir nada: hace falta el código del autenticador (aal2). Sin factores, todo sigue igual que antes.
-- Patrón recomendado por Supabase: políticas RESTRICTIVE que se suman (AND) a las de dueño.

create or replace function public.mfa_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status::text = 'verified'
      );
$$;
revoke execute on function public.mfa_ok() from public, anon;
grant execute on function public.mfa_ok() to authenticated, service_role;

-- `(select ...)` hace que Postgres la evalúe una vez por consulta y no por fila.
create policy require_mfa on public.accounts       as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
create policy require_mfa on public.categories     as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
create policy require_mfa on public.recurring      as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
create policy require_mfa on public.transactions   as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
create policy require_mfa on public.budgets        as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
create policy require_mfa on public.merchant_rules as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
create policy require_mfa on public.api_tokens     as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));

-- create_api_token es security definer (se salta RLS), así que revisa el segundo paso por su cuenta.
create or replace function public.create_api_token(p_name text default 'Atajo iPhone')
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  raw text;
begin
  if auth.uid() is null or not public.mfa_ok() then
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
--   drop policy require_mfa on <cada tabla>;
--   drop function public.mfa_ok();  -- después de restaurar create_api_token de 20261031000000_seguridad.sql
-- ---------------------------------------------------------------------------
