import { clearOfflineCache } from '../data/offline';
import { markPartialSignOut, supabase } from '../data/supabase';

/**
 * Cierra la sesión en todos los dispositivos (scope global). Sin conexión eso falla y la sesión seguiría abierta aquí:
 * entonces se cierra al menos en este teléfono y la pantalla de entrar lo explica. La copia local de los datos no se
 * queda en el teléfono.
 */
export async function signOutEverywhere() {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) {
    markPartialSignOut();
    await supabase.auth.signOut({ scope: 'local' });
  }
  clearOfflineCache();
}
