import { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/ui';
import { useT } from '../../../i18n';
import { Rich } from '../../../i18n/Rich';
import { clearOfflineCache } from '../../../lib/data/offline';
import { deleteMyAccount } from '../../../lib/data/supabase';
import { FormGroup, FormRow, TextInput } from '../form';

/**
 * Eliminar la cuenta y todos sus datos (función delete_my_account en la base). No se puede deshacer: pide la
 * contraseña y sugiere exportar antes. Al terminar, la sesión se cierra y la pantalla de entrar lo confirma.
 */
export function DeleteAccountSheet({ open, onClose, onExport }: { open: boolean; onClose: () => void; onExport: () => void }) {
  const t = useT();
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
    setError(t.security.deleteAccount.errors[result]);
    if (result === 'wrong_password') setPassword('');
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={t.security.deleteAccount.title}
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          {t.common.cancel}
        </button>
      }
    >
      <div className="px-1 text-body text-pretty text-label-2">
        <p className="[&_b]:font-semibold [&_b]:text-label">
          <Rich text={t.security.deleteAccount.warning} />
        </p>
        <p className="mt-3">{t.security.deleteAccount.exportHint}</p>
      </div>
      <Button variant="tinted" className="mt-4 w-full" onClick={onExport}>
        {t.security.deleteAccount.export}
      </Button>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <FormGroup footer={t.security.deleteAccount.confirmFooter}>
          <FormRow label={t.security.deleteAccount.password} last>
            <TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormRow>
        </FormGroup>
        {error && (
          <p role="alert" className="mt-3 px-4 text-subhead text-red">
            {error}
          </p>
        )}
        <Button type="submit" variant="destructive" className="mt-4 w-full" disabled={!password || busy}>
          {busy ? t.security.deleteAccount.deleting : t.security.deleteAccount.submit}
        </Button>
      </form>
    </Sheet>
  );
}
