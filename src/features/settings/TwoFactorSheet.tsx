import clsx from 'clsx';
import { ChevronRight, Copy } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { cleanCode, MFA_ERRORS } from '../../lib/mfa';
import { isAppleMobile } from '../../lib/native';
import { supabase } from '../../lib/supabase';
import { Toggle } from '../transactions/TransactionSheet';
import { FormGroup, FormRow, TextInput } from './form';

type Enrollment = { factorId: string; qr: string; secret: string; uri: string };

const GOOGLE_AUTHENTICATOR = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2';

/** Pasos para configurarla en cada sistema. Sirve cualquier gestor o app que genere códigos TOTP de 6 dígitos. */
const GUIDES: { id: 'ios' | 'android'; title: string; app: string; steps: ReactNode[] }[] = [
  {
    id: 'ios',
    title: 'iPhone (iOS)',
    app: 'Te recomendamos la app Contraseñas, que ya viene en el iPhone.',
    steps: [
      <>Activa el interruptor de arriba.</>,
      <>
        Toca <b>Agregar a Contraseñas</b>. Se abre Contraseñas (en iOS 17, Ajustes → Contraseñas): elige la entrada donde
        guardaste tu contraseña de Finanzas, o crea una, y confirma que guarde el código.
      </>,
      <>
        Vuelve a Finanzas, escribe el código de 6 dígitos que muestra Contraseñas y toca <b>Activar</b>.
      </>,
      <>
        Desde una computadora: escanea el QR con la cámara del iPhone y toca «Agregar código de verificación».
      </>,
      <>Cuando entres en otro dispositivo, el código está en Contraseñas, en la entrada de Finanzas. En el iPhone el teclado suele sugerirlo solo.</>,
    ],
  },
  {
    id: 'android',
    title: 'Android',
    app: 'Te recomendamos Google Authenticator, gratis en Google Play.',
    steps: [
      <>
        Instala{' '}
        <a href={GOOGLE_AUTHENTICATOR} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">
          Google Authenticator
        </a>{' '}
        desde Google Play.
      </>,
      <>Activa el interruptor de arriba.</>,
      <>
        Toca <b>Abrir en mi autenticador</b>: Google Authenticator se abre y agrega Finanzas. Si no se abre, en Google
        Authenticator toca <b>+</b> → «Ingresar una clave de configuración», ponle de nombre «Finanzas» y pega la clave
        (tócala aquí para copiarla).
      </>,
      <>
        Escribe el código de 6 dígitos que aparece en Google Authenticator y toca <b>Activar</b>.
      </>,
      <>Desde una computadora: en Google Authenticator toca + → «Escanear un código QR» y apunta al QR.</>,
      <>Cuando entres en otro dispositivo, abre Google Authenticator y escribe el código de Finanzas.</>,
    ],
  },
];

/** Uno de los dos instructivos: fila que se despliega con sus pasos. */
function Guide({ guide, open, onToggle }: { guide: (typeof GUIDES)[number]; open: boolean; onToggle: () => void }) {
  const id = `guia-${guide.id}`;
  return (
    <div className="group">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center gap-3 pl-4 text-left transition-colors active:bg-card"
      >
        <span className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
          <span className="min-w-0 flex-1 text-body">{guide.title}</span>
          <ChevronRight
            size={18}
            strokeWidth={2.25}
            className={clsx('shrink-0 text-label-3 transition-transform duration-250 motion-reduce:transition-none', open && 'rotate-90')}
          />
        </span>
      </button>
      {/* Se despliega con grid-rows (0fr → 1fr): la altura se anima sin medirla. */}
      <div
        id={id}
        className={clsx(
          'grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pt-1 pb-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
            <p className="text-subhead text-pretty text-label-2">{guide.app}</p>
            <ol className="mt-3 space-y-2.5">
              {guide.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-subhead text-pretty [&_b]:font-semibold [&_b]:text-label">
                  <span className="tnum not-money grid size-6 shrink-0 place-items-center rounded-full bg-card-3 text-footnote font-semibold text-label">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-label-2">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Verificación en dos pasos con un código de 6 dígitos (TOTP). Un interruptor la activa o desactiva; debajo, los
 * pasos para configurarla en iPhone (app Contraseñas) o Android (Google Authenticator). Sirve cualquier gestor o app
 * que genere códigos TOTP.
 */
export function TwoFactorSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [active, setActive] = useState<string | null | undefined>(undefined); // id del factor verificado
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [guide, setGuide] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    if (!open) return;
    void supabase.auth.mfa.listFactors().then(({ data }) => setActive(data?.totp.find((f) => f.status === 'verified')?.id ?? null));
  }, [open]);

  /** Borra inscripciones a medias (bloquean otra nueva) y empieza una. */
  const start = async () => {
    setBusy(true);
    setError(null);
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all ?? []) if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Autenticador', issuer: 'Finanzas' });
    setBusy(false);
    if (error || !data) return setError('No se pudo empezar. Revisa tu conexión e inténtalo de nuevo.');
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri });
  };

  const cancel = async () => {
    if (!enrollment) return;
    const { factorId } = enrollment;
    setEnrollment(null);
    setCode('');
    setError(null);
    await supabase.auth.mfa.unenroll({ factorId });
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
    setActive(enrollment.factorId);
    setEnrollment(null);
    setCode('');
  };

  const disable = async () => {
    if (!active || !confirm('¿Desactivar la verificación en dos pasos? Para entrar bastará la contraseña.')) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: active });
    setBusy(false);
    if (error) return setError('No se pudo desactivar. Vuelve a iniciar sesión e inténtalo de nuevo.');
    toast('Verificación en dos pasos desactivada');
    setActive(null);
  };

  const onSwitch = (on: boolean) => {
    if (busy) return;
    if (on) void start();
    else if (enrollment) void cancel();
    else void disable();
  };

  const close = () => {
    if (enrollment) void cancel(); // una inscripción a medias no se queda colgada
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      swipeToClose
      title="Dos pasos"
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={close}>
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
      {active !== undefined && (
        <>
          <FormGroup
            footer={
              active
                ? 'Activada: al entrar en un dispositivo nuevo, además de la contraseña se pide el código de 6 dígitos.'
                : 'Además de la contraseña, para entrar se pedirá un código de 6 dígitos que cambia cada 30 segundos. Si alguien averigua tu contraseña, igual no puede ver tus finanzas.'
            }
          >
            <div className="flex min-h-11 items-center gap-3 py-2 pr-4 pl-4">
              <span className="min-w-0 flex-1 text-body">Verificación en dos pasos</span>
              <Toggle checked={!!active || !!enrollment} onChange={onSwitch} label="Verificación en dos pasos" />
            </div>
          </FormGroup>

          {enrollment && (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void verify();
              }}
            >
              <FormGroup header="1. Guarda el código en tu autenticador">
                <a href={enrollment.uri} className="flex min-h-11 items-center px-4 text-body text-accent active:bg-card">
                  {isAppleMobile ? 'Agregar a Contraseñas' : 'Abrir en mi autenticador'}
                </a>
              </FormGroup>
              <div className="mt-4 flex justify-center">
                <img src={enrollment.qr} alt="Código QR para tu autenticador" className="size-44 rounded-[12px] bg-white p-2" />
              </div>
              <FormGroup className="mt-4" footer="O escribe esta clave a mano en tu autenticador (tócala para copiarla).">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center gap-3 px-4 text-left active:bg-card"
                  onClick={() => void navigator.clipboard?.writeText(enrollment.secret).then(() => toast('Clave copiada'))}
                >
                  <span className="tnum not-money min-w-0 flex-1 truncate font-mono text-subhead">{enrollment.secret}</span>
                  <Copy size={18} strokeWidth={2.25} className="shrink-0 text-accent" />
                </button>
              </FormGroup>
              <FormGroup header="2. Escribe el código que aparece">
                <FormRow label="Código" last>
                  <TextInput
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="tnum not-money tracking-[0.2em]"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(cleanCode(e.target.value))}
                  />
                </FormRow>
              </FormGroup>
              <button type="submit" hidden />
            </form>
          )}
          {error && (
            <p role="alert" className="mt-3 px-4 text-subhead text-red">
              {error}
            </p>
          )}

          <FormGroup
            header="Cómo configurarla"
            footer="Funciona con cualquier gestor de contraseñas o app que genere códigos TOTP de 6 dígitos (Microsoft Authenticator, 1Password, Bitwarden…)."
          >
            {GUIDES.map((g) => (
              <Guide key={g.id} guide={g} open={guide === g.id} onToggle={() => setGuide(guide === g.id ? null : g.id)} />
            ))}
          </FormGroup>
        </>
      )}
    </Sheet>
  );
}
