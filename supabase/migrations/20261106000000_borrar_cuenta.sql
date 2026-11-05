-- Borrar la propia cuenta desde la app (Ajustes → Eliminar cuenta). Con el registro abierto a cualquiera, cada
-- persona tiene que poder irse con sus datos; Apple y Google además lo exigen para publicar la app.
--
-- Borra el usuario de auth.users: todas sus tablas cuelgan de él con `on delete cascade` (cuentas, categorías,
-- movimientos, presupuestos, fijos, reglas y tokens del Atajo), y Auth se lleva sesiones y factores de dos pasos.
--
-- Pide la contraseña otra vez (una sesión abierta en un teléfono prestado no basta) y, si la cuenta tiene dos pasos,
-- una sesión que ya pasó el código (aal2). No lanza error ante una contraseña incorrecta: devuelve un estado, porque
-- un error desharía también la cuenta de intentos y el límite contra fuerza bruta no serviría.
create or replace function public.delete_my_account(p_password text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_hash text;
begin
  if v_uid is null then
    return 'no_session';
  end if;
  if not public.mfa_ok() then
    return 'mfa_required';
  end if;
  -- 5 intentos cada 15 minutos por cuenta.
  if not public.rate_limit_hit('borrar-cuenta:' || v_uid::text, 5, 900) then
    return 'rate_limited';
  end if;

  select u.encrypted_password into v_hash from auth.users u where u.id = v_uid;
  if v_hash is null or v_hash = '' or extensions.crypt(coalesce(p_password, ''), v_hash) <> v_hash then
    return 'wrong_password';
  end if;

  delete from auth.users where id = v_uid;
  return 'deleted';
end;
$$;

revoke execute on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;

-- Reversión:
--   drop function public.delete_my_account(text);
