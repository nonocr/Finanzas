// Reglas de contraseña: las mismas que exige Supabase Auth en el servidor (mínimo 8, minúscula, mayúscula y número).
// Validar aquí solo mejora el mensaje; quien decide es el servidor.

export interface PasswordCheck {
  ok: boolean;
  missing: string[];
}

export function checkPassword(pw: string): PasswordCheck {
  const missing: string[] = [];
  if (pw.length < 8) missing.push('8 caracteres');
  if (!/[a-z]/.test(pw)) missing.push('una minúscula');
  if (!/[A-Z]/.test(pw)) missing.push('una mayúscula');
  if (!/[0-9]/.test(pw)) missing.push('un número');
  if (pw.length > 72) missing.push('máximo 72 caracteres'); // límite de bcrypt
  return { ok: missing.length === 0, missing };
}
