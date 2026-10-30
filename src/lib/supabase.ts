import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

// Se lee antes de crear el cliente: al abrir el enlace de «olvidé mi contraseña», Supabase toma la sesión del
// fragmento (#access_token=…&type=recovery) y lo borra de la URL.
export const openedFromRecoveryLink = typeof location !== 'undefined' && location.hash.includes('type=recovery');

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const WALLET_ENDPOINT = url ? `${url}/functions/v1/wallet-ingest` : '';
export const WALLET_SYNC_ENDPOINT = url ? `${url}/functions/v1/wallet-sync` : '';
