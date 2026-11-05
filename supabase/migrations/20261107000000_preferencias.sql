-- Preferencias de cada persona (tema, modo discreto, cómo se arma el Resumen), guardadas en su cuenta: si entra
-- desde otro teléfono o la computadora, la app se ve igual. Una fila por usuario con un JSON pequeño; la app valida
-- y completa los valores (src/lib/prefs.ts), así que agregar una preferencia nueva no necesita migración.
create table public.user_settings (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  prefs      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_settings_prefs_object check (jsonb_typeof(prefs) = 'object'),
  -- Son unas pocas opciones: un tope evita que alguien use la tabla como almacén.
  constraint user_settings_prefs_size check (pg_column_size(prefs) <= 8192)
);

alter table public.user_settings enable row level security;
create policy own_rows on public.user_settings
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- Con dos pasos activos, una sesión que solo pasó la contraseña no lee ni escribe (como el resto de tablas).
create policy require_mfa on public.user_settings
  as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));

-- Mínimos privilegios: anon nada; la persona lee su fila y la crea o cambia, pero nunca el dueño (user_id lo pone
-- el default) ni la puede borrar (se va sola al eliminar la cuenta).
revoke all on public.user_settings from anon, authenticated;
grant select on public.user_settings to authenticated;
grant insert (prefs, updated_at), update (prefs, updated_at) on public.user_settings to authenticated;

-- Reversión:
--   drop table public.user_settings;
