import { useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { useT } from '../../i18n';
import { checkPassword } from '../../lib/password';
import { supabase } from '../../lib/supabase';
import { FormGroup, FormRow, TextInput } from './form';

/** Cambiar contraseña pidiendo la actual (el servidor también la exige: security_update_password_require_current_password). */
export function ChangePasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
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
      const errors: Record<string, string> = t.security.changePassword.errors;
      setError(errors[error.code ?? ''] ?? t.security.changePassword.failed);
      return;
    }
    toast(t.security.changePassword.updated);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={t.security.changePassword.title}
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          {t.common.cancel}
        </button>
      }
      trailing={
        <button
          type="button"
          className="press metal min-h-9 rounded-full px-4 text-body font-semibold disabled:bg-none disabled:bg-fill disabled:text-label-3 disabled:shadow-none"
          disabled={!valid || busy}
          onClick={submit}
        >
          {t.common.save}
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
          <FormRow label={t.security.changePassword.current} last>
            <TextInput type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </FormRow>
        </FormGroup>
        <FormGroup
          footer={
            next && !strength.ok ? t.auth.missing(strength.missing) : confirm && next !== confirm ? t.auth.mismatch : t.auth.rules
          }
        >
          <FormRow label={t.security.changePassword.next}>
            <TextInput type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </FormRow>
          <FormRow label={t.security.changePassword.repeat} last>
            <TextInput type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FormRow>
        </FormGroup>
        {error && <p className="mt-3 px-4 text-subhead text-red">{error}</p>}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
