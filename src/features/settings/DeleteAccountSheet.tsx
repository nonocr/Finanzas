import { useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/ui';
import { clearOfflineCache } from '../../lib/offline';
import { deleteMyAccount } from '../../lib/supabase';
import { FormGroup, FormRow, TextInput } from './form';

const ERRORS = {
  wrong_password: 'La contraseña no es correcta.',
  rate_limited: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
  mfa_required: 'Vuelve a iniciar sesión con tu código de dos pasos e inténtalo de nuevo.',
  error: 'No se pudo eliminar la cuenta. Revisa tu conexión e inténtalo de nuevo.',
} as const;

/**
 * Eliminar la cuenta y todos sus datos (función delete_my_account en la base). No se puede deshacer: pide la
 * contraseña y sugiere exportar antes. Al terminar, la sesión se cierra y la pantalla de entrar lo confirma.
 */
export function DeleteAccountSheet({ open, onClose, onExport }: { open: boolean; onClose: () => void; onExport: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    const result = await deleteMyAccount(password);
    if (result === 'deleted') {
      clearOfflineCache(); // la copia local de los datos tampoco se queda en el teléfono
      return; // la sesión ya se cerró: App muestra la pantalla de entrar
    }
    setBusy(false);
    setError(ERRORS[result]);
    if (result === 'wrong_password') setPassword('');
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title="Eliminar cuenta"
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          Cancelar
        </button>
      }
    >
      <div className="px-1 text-body text-pretty text-label-2">
        <p>
          Se borran <span className="font-semibold text-label">para siempre</span> tu cuenta y todo lo que registraste:
          movimientos, cuentas, categorías, presupuestos, fijos y reglas. No se puede deshacer.
        </p>
        <p className="mt-3">Si quieres conservar tus movimientos, expórtalos antes.</p>
      </div>
      <Button variant="tinted" className="mt-4 w-full" onClick={onExport}>
        Exportar movimientos (CSV)
      </Button>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <FormGroup footer="Para confirmar que eres tú.">
          <FormRow label="Contraseña" last>
            <TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormRow>
        </FormGroup>
        {error && (
          <p role="alert" className="mt-3 px-4 text-subhead text-red">
            {error}
          </p>
        )}
        <Button type="submit" variant="destructive" className="mt-4 w-full" disabled={!password || busy}>
          {busy ? 'Eliminando…' : 'Eliminar mi cuenta'}
        </Button>
      </form>
    </Sheet>
  );
}
