-- Constancia de que cada persona aceptó los Términos de uso y la Política de privacidad, y de qué versión.
--
-- Por qué: la Ley 8968 de Costa Rica (art. 5) pide consentimiento expreso, «por escrito, ya sea en un documento
-- físico o electrónico», y el art. 14 y el 31 f) piden autorización expresa para pasar datos a bases de otros países
-- (los datos viven en Supabase, en Estados Unidos). Esta tabla es esa constancia electrónica: una fila por versión
-- aceptada, con la hora del servidor.
--
-- Cómo se llena:
--   - Al crear la cuenta: la app manda `legal_version` en los datos del registro (casilla marcada en «Crear cuenta») y
--     el trigger de abajo guarda la fila con source = 'registro'.
--   - Cuando cambia la versión (o la cuenta es anterior a esta migración): la app pide aceptar de nuevo y la persona
--     inserta su fila (source = 'app').
-- Nadie la cambia ni la borra a mano: se va sola al eliminar la cuenta (on delete cascade).
create table public.legal_acceptances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  -- La versión es la fecha de los documentos (src/lib/legal/version.ts), «2026-11-06».
  version     text not null check (version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  accepted_at timestamptz not null default now(),
  source      text not null default 'app' check (source in ('registro', 'app')),
  unique (user_id, version)
);

alter table public.legal_acceptances enable row level security;
create policy own_rows on public.legal_acceptances
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- Con dos pasos activos, una sesión que solo pasó la contraseña no lee ni escribe (como el resto de tablas).
create policy require_mfa on public.legal_acceptances
  as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));

-- Mínimos privilegios: la persona lee sus filas y agrega una versión. No elige el dueño, la hora ni el origen (los
-- pone la base), así que no puede fingir una aceptación de otra fecha ni hecha al registrarse. No cambia ni borra.
revoke all on public.legal_acceptances from anon, authenticated;
grant select on public.legal_acceptances to authenticated;
grant insert (version) on public.legal_acceptances to authenticated;

-- Al crear la cuenta: si el registro trae una versión válida, queda la constancia. Si no la trae (alguien que creó la
-- cuenta sin pasar por la app), no se guarda nada y la app pedirá aceptar al entrar.
create or replace function public.record_signup_legal_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version text := new.raw_user_meta_data ->> 'legal_version';
begin
  if v_version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    insert into public.legal_acceptances (user_id, version, source)
    values (new.id, v_version, 'registro')
    on conflict (user_id, version) do nothing;
  end if;
  return new;
end;
$$;
revoke execute on function public.record_signup_legal_acceptance() from public, anon, authenticated;

create trigger on_auth_user_created_legal
  after insert on auth.users
  for each row execute function public.record_signup_legal_acceptance();

-- Reversión:
--   drop trigger on_auth_user_created_legal on auth.users;
--   drop function public.record_signup_legal_acceptance();
--   drop table public.legal_acceptances;
