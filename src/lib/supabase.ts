import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

// Se lee antes de crear el cliente: al abrir el enlace de «olvidé mi contraseña», Supabase toma la sesión del
// fragmento (#access_token=…&type=recovery) y lo borra de la URL.
export const openedFromRecoveryLink = typeof location !== 'undefined' && location.hash.includes('type=recovery');

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing', {
  auth: {
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

export const WALLET_SYNC_ENDPOINT = url ? `${url}/functions/v1/wallet-sync` : '';
