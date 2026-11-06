import { strings } from '../../i18n';
import { supabase } from '../data/supabase';

// Verificación en dos pasos con códigos de 6 dígitos (TOTP): la app Contraseñas de iPhone, Google Authenticator, etc.
// La base también la exige (migración 20261102000000_mfa): con un factor verificado, sin el código no se ve nada.

/** La sesión pasó la contraseña pero le falta el código (aal1 con un factor verificado). */
export async function needsMfaCode(): Promise<boolean> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.currentLevel === 'aal1' && data.nextLevel === 'aal2';
}

/** Factor TOTP verificado de la usuaria, si tiene uno. */
export async function verifiedTotp() {
  const { data } = await supabase.auth.mfa.listFactors();
  return data?.totp.find((f) => f.status === 'verified') ?? null;
}

/** Solo dígitos, máximo 6 (al pegar un código con espacios también funciona). */
export const cleanCode = (s: string) => s.replace(/\D/g, '').slice(0, 6);

/** Mensaje (en el idioma actual) para un código de error conocido del código de dos pasos, o null si no se conoce. */
export function mfaError(code: string | undefined): string | null {
  const errors: Record<string, string> = strings().auth.mfaErrors;
  return errors[code ?? ''] ?? null;
}

/** Sube la sesión a aal2 con el código del autenticador. Devuelve un mensaje de error o null. */
export async function verifyCode(code: string): Promise<string | null> {
  const factor = await verifiedTotp();
  if (!factor) return strings().auth.mfaNoFactor;
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (!error) return null;
  return mfaError(error.code) ?? strings().auth.mfaVerifyFailed;
}
