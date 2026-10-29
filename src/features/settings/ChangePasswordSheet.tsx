import { useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { checkPassword } from '../../lib/password';
import { supabase } from '../../lib/supabase';
import { FormGroup, FormRow, TextInput } from './form';

const ERRORS: Record<string, string> = {
  same_password: 'La nueva contraseña es igual a la actual.',
  weak_password: 'La contraseña es muy débil.',
  current_password_mismatch: 'La contraseña actual no es correcta.',
  current_password_required: 'Escribe tu contraseña actual.',
  reauthentication_needed: 'Vuelve a iniciar sesión e inténtalo de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
};

/** Cambiar contraseña pidiendo la actual (el servidor también la exige: security_update_password_require_current_password). */
export function ChangePasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const strength = checkPassword(next);
  const valid = current.length > 0 && strength.ok && next === confirm;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current });
    setBusy(false);
    if (error) {
      setError(ERRORS[error.code ?? ''] ?? 'No se pudo cambiar la contraseña. Revisa la actual e inténtalo de nuevo.');
      return;
    }
    toast('Contraseña actualizada');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title="Cambiar contraseña"
      leading={
        <button type="button" className="min-h-11 text-body text-blue" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button
          type="button"
          className="press min-h-9 rounded-full bg-blue px-4 text-body font-semibold text-white disabled:bg-fill disabled:text-label-3"
          disabled={!valid || busy}
          onClick={submit}
        >
          Guardar
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <FormGroup>
          <FormRow label="Actual" last>
            <TextInput type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </FormRow>
        </FormGroup>
        <FormGroup
          footer={
            next && !strength.ok
              ? `Le falta: ${strength.missing.join(', ')}.`
              : confirm && next !== confirm
                ? 'Las contraseñas no coinciden.'
                : 'Mínimo 8 caracteres, con minúscula, mayúscula y número.'
          }
        >
          <FormRow label="Nueva">
            <TextInput type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </FormRow>
          <FormRow label="Repetir" last>
            <TextInput type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FormRow>
        </FormGroup>
        {error && <p className="mt-3 px-4 text-subhead text-red">{error}</p>}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
