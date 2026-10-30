import { Copy, KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui';
import { cleanCode, MFA_ERRORS } from '../../lib/mfa';
import { supabase } from '../../lib/supabase';
import { FormGroup, FormRow, TextInput } from './form';

type Enrollment = { factorId: string; qr: string; secret: string; uri: string };

/**
 * Verificación en dos pasos con un código de 6 dígitos. En iPhone, «Agregar a Contraseñas» abre el enlace
 * otpauth:// y la app Contraseñas guarda el código (iOS 17 o más nuevo); también sirve cualquier autenticador.
 */
export function TwoFactorSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [active, setActive] = useState<string | null | undefined>(undefined); // id del factor verificado
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    void supabase.auth.mfa.listFactors().then(({ data }) => setActive(data?.totp.find((f) => f.status === 'verified')?.id ?? null));
  }, [open]);

  const start = async () => {
    setBusy(true);
    setError(null);
    // Una inscripción que quedó a medias bloquea otra con el mismo nombre: se borra primero.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all ?? []) if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'iPhone', issuer: 'Finanzas' });
    setBusy(false);
    if (error || !data) return setError('No se pudo empezar. Revisa tu conexión e inténtalo de nuevo.');
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri });
  };

  const verify = async () => {
    if (!enrollment || code.length !== 6) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code });
    setBusy(false);
    if (error) {
      setCode('');
      return setError(MFA_ERRORS[error.code ?? ''] ?? 'No se pudo verificar. Inténtalo de nuevo.');
    }
    toast('Verificación en dos pasos activada');
    onClose();
  };

  const disable = async () => {
    if (!active || !confirm('¿Desactivar la verificación en dos pasos? Para entrar bastará la contraseña.')) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: active });
    setBusy(false);
    if (error) return setError('No se pudo desactivar. Vuelve a iniciar sesión e inténtalo de nuevo.');
    toast('Verificación en dos pasos desactivada');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title="Dos pasos"
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          {enrollment ? 'Cancelar' : 'Cerrar'}
        </button>
      }
      trailing={
        enrollment && (
          <button
            type="button"
            className="press metal min-h-9 rounded-full px-4 text-body font-semibold disabled:bg-none disabled:bg-fill disabled:text-label-3 disabled:shadow-none"
            disabled={code.length !== 6 || busy}
            onClick={verify}
          >
            Activar
          </button>
        )
      }
    >
      {active === undefined ? null : active ? (
        <>
          <FormGroup footer="Al entrar en un dispositivo nuevo, además de la contraseña se pide el código de 6 dígitos de tu autenticador.">
            <FormRow label="Verificación en dos pasos" last>
              <span className="text-body text-green">Activada</span>
            </FormRow>
          </FormGroup>
          <Button variant="destructive" className="mt-6 w-full" disabled={busy} onClick={disable}>
            Desactivar
          </Button>
        </>
      ) : !enrollment ? (
        <>
          <div className="flex flex-col items-center px-4 pt-2 text-center">
            <span className="grid size-14 place-items-center rounded-[14px] bg-accent/12 text-accent">
              <KeyRound size={28} strokeWidth={2} />
            </span>
            <p className="mt-4 text-body text-pretty text-label-2">
              Además de la contraseña, para entrar se pedirá un código de 6 dígitos que cambia cada 30 segundos. Si alguien
              averigua tu contraseña, igual no puede ver tus finanzas.
            </p>
          </div>
          <Button className="mt-6 w-full" disabled={busy} onClick={start}>
            Configurar
          </Button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          <FormGroup
            header="1. Guarda el código"
            footer="En iPhone se guarda en la app Contraseñas. En otro dispositivo, escanea el QR con tu autenticador."
          >
            <a href={enrollment.uri} className="flex min-h-11 items-center px-4 text-body text-accent active:bg-card">
              Agregar a Contraseñas
            </a>
          </FormGroup>
          <div className="mt-4 flex justify-center">
            <img src={enrollment.qr} alt="Código QR para tu autenticador" className="size-44 rounded-[12px] bg-white p-2" />
          </div>
          <FormGroup className="mt-4" footer="O escribe esta clave a mano en tu autenticador.">
            <button
              type="button"
              className="flex min-h-11 w-full items-center gap-3 px-4 text-left active:bg-card"
              onClick={() => void navigator.clipboard?.writeText(enrollment.secret).then(() => toast('Clave copiada'))}
            >
              <span className="tnum min-w-0 flex-1 truncate font-mono text-subhead">{enrollment.secret}</span>
              <Copy size={18} strokeWidth={2.25} className="shrink-0 text-accent" />
            </button>
          </FormGroup>
          <FormGroup header="2. Escribe el código que aparece">
            <FormRow label="Código" last>
              <TextInput
                inputMode="numeric"
                autoComplete="one-time-code"
                className="tnum tracking-[0.2em]"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(cleanCode(e.target.value))}
              />
            </FormRow>
          </FormGroup>
          <button type="submit" hidden />
        </form>
      )}
      {error && <p className="mt-3 px-4 text-subhead text-red">{error}</p>}
    </Sheet>
  );
}
