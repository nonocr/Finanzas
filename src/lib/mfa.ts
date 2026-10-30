import { supabase } from './supabase';

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

export const MFA_ERRORS: Record<string, string> = {
  mfa_verification_failed: 'Código incorrecto o vencido. Prueba con el siguiente.',
  mfa_challenge_expired: 'El código venció. Prueba con el siguiente.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
};

/** Sube la sesión a aal2 con el código del autenticador. Devuelve un mensaje de error o null. */
export async function verifyCode(code: string): Promise<string | null> {
  const factor = await verifiedTotp();
  if (!factor) return 'No hay verificación en dos pasos activada.';
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (!error) return null;
  return MFA_ERRORS[error.code ?? ''] ?? 'No se pudo verificar. Revisa tu conexión e inténtalo de nuevo.';
}
