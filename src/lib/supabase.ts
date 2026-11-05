import { Preferences } from '@capacitor/preferences';
import { createClient } from '@supabase/supabase-js';
import { isNative } from './native';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Clave publicable (sb_publishable_…): pública por diseño; los datos los protegen RLS y la sesión.
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && publishableKey);

// Se lee antes de crear el cliente: al abrir el enlace de «olvidé mi contraseña», Supabase toma la sesión del
// fragmento (#access_token=…&type=recovery) y lo borra de la URL.
export const openedFromRecoveryLink = typeof location !== 'undefined' && location.hash.includes('type=recovery');

/**
 * Llegaste desde el enlace de «confirma tu correo». Supabase ya confirmó la cuenta antes de redirigir aquí, así que la
 * app no usa la sesión que viene en el enlace (podría ser la de otra persona armada a propósito): solo avisa y pide
 * entrar con correo y contraseña. 'expired': el enlace venció o ya se había usado.
 */
export const signupLinkNotice: 'confirmed' | 'expired' | null = (() => {
  if (typeof location === 'undefined' || !location.hash) return null;
  const params = new URLSearchParams(location.hash.slice(1));
  const notice = params.get('type') === 'signup' ? 'confirmed' : params.get('error_code') === 'otp_expired' ? 'expired' : null;
  // El token del enlace no debe quedarse en la barra de direcciones ni en el historial.
  if (notice) history.replaceState(null, '', location.pathname + location.search);
  return notice;
})();

// En la app nativa la sesión va al almacenamiento del sistema (UserDefaults / SharedPreferences): iOS puede borrar
// el localStorage del WebView si falta espacio, y eso cerraría la sesión sin aviso.
const nativeStorage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: (key: string, value: string) => Preferences.set({ key, value }),
  removeItem: (key: string) => Preferences.remove({ key }),
};

export const supabase = createClient(url ?? 'http://localhost', publishableKey ?? 'missing', {
  auth: {
    storage: isNative ? nativeStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    // La app solo recibe sesiones por enlace en «olvidé mi contraseña». Cualquier otro #access_token=… (por ejemplo,
    // un enlace armado con la sesión de otra persona para que registres datos en su cuenta) se ignora.
    detectSessionInUrl: (_url, params) => Boolean((params.access_token && params.type === 'recovery') || params.error_description),
  },
});

const PARTIAL_SIGN_OUT = 'finanzas-signout-parcial';
/** Cerrar sesión sin conexión solo cierra este teléfono; se anota para avisarlo en la pantalla de entrar. */
export function markPartialSignOut() {
  try {
    sessionStorage.setItem(PARTIAL_SIGN_OUT, '1');
  } catch {
    // sin almacenamiento: no se avisa
  }
}
export function takePartialSignOut(): boolean {
  try {
    const was = sessionStorage.getItem(PARTIAL_SIGN_OUT) === '1';
    sessionStorage.removeItem(PARTIAL_SIGN_OUT);
    return was;
  } catch {
    return false;
  }
}

const ACCOUNT_DELETED = 'finanzas-cuenta-borrada';
/** Borra la cuenta y todos sus datos (función delete_my_account en la base). Pide la contraseña otra vez. */
export async function deleteMyAccount(password: string): Promise<'deleted' | 'wrong_password' | 'rate_limited' | 'mfa_required' | 'error'> {
  const { data, error } = await supabase.rpc('delete_my_account', { p_password: password });
  if (error) return 'error';
  if (data === 'deleted') {
    try {
      sessionStorage.setItem(ACCOUNT_DELETED, '1');
    } catch {
      // sin almacenamiento: no se muestra el aviso
    }
    // La sesión ya no vale en el servidor: se cierra solo en este dispositivo.
    await supabase.auth.signOut({ scope: 'local' });
  }
  return data === 'deleted' || data === 'wrong_password' || data === 'rate_limited' || data === 'mfa_required' ? data : 'error';
}
export function takeAccountDeleted(): boolean {
  try {
    const was = sessionStorage.getItem(ACCOUNT_DELETED) === '1';
    sessionStorage.removeItem(ACCOUNT_DELETED);
    return was;
  } catch {
    return false;
  }
}

export const WALLET_SYNC_ENDPOINT = url ? `${url}/functions/v1/wallet-sync` : '';
