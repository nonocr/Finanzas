import { strings } from '../../i18n';

// Reglas de contraseña: las mismas que exige Supabase Auth en el servidor (mínimo 8, minúscula, mayúscula y número).
// Validar aquí solo mejora el mensaje; quien decide es el servidor.

export interface PasswordCheck {
  ok: boolean;
  missing: string[];
}

export function checkPassword(pw: string): PasswordCheck {
  const r = strings().auth.passwordRules;
  const missing: string[] = [];
  if (pw.length < 8) missing.push(r.length);
  if (!/[a-z]/.test(pw)) missing.push(r.lower);
  if (!/[A-Z]/.test(pw)) missing.push(r.upper);
  if (!/[0-9]/.test(pw)) missing.push(r.digit);
  if (pw.length > 72) missing.push(r.max); // límite de bcrypt
  return { ok: missing.length === 0, missing };
}
