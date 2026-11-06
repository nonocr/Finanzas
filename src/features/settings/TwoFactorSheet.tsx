import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Disclosure, NumberedSteps } from '../../components/Disclosure';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { useT } from '../../i18n';
import { Rich } from '../../i18n/Rich';
import { cleanCode, mfaError } from '../../lib/mfa';
import { isAppleMobile } from '../../lib/native';
import { supabase } from '../../lib/supabase';
import { Toggle } from '../transactions/TransactionSheet';
import { FormGroup, FormRow, TextInput } from './form';

type Enrollment = { factorId: string; qr: string; secret: string; uri: string };

/** Guías por sistema (los textos, en security.twoFactor.guides). Sirve cualquier gestor o app de códigos TOTP. */
const GUIDE_IDS = ['ios', 'android'] as const;

/**
 * Verificación en dos pasos con un código de 6 dígitos (TOTP). Un interruptor la activa o desactiva; debajo, los
 * pasos para configurarla en iPhone (app Contraseñas) o Android (Google Authenticator). Sirve cualquier gestor o app
 * que genere códigos TOTP.
 */
export function TwoFactorSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const tf = t.security.twoFactor;
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
    if (error || !data) return setError(tf.startFailed);
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
      return setError(mfaError(error.code) ?? tf.verifyFailed);
    }
    toast(tf.enabled);
    setActive(enrollment.factorId);
    setEnrollment(null);
    setCode('');
  };

  const disable = async () => {
    if (!active || !confirm(tf.confirmDisable)) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: active });
    setBusy(false);
    if (error) return setError(tf.disableFailed);
    toast(tf.disabled);
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
      title={tf.title}
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={close}>
          {enrollment ? t.common.cancel : t.common.close}
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
            {tf.activate}
          </button>
        )
      }
    >
      {active !== undefined && (
        <>
          <FormGroup footer={active ? tf.footerOn : tf.footerOff}>
            <div className="flex min-h-11 items-center gap-3 py-2 pr-4 pl-4">
              <span className="min-w-0 flex-1 text-body">{tf.label}</span>
              <Toggle checked={!!active || !!enrollment} onChange={onSwitch} label={tf.label} />
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
              <FormGroup header={tf.step1}>
                <a href={enrollment.uri} className="flex min-h-11 items-center px-4 text-body text-accent active:bg-card">
                  {isAppleMobile ? tf.addToPasswords : tf.openInAuthenticator}
                </a>
              </FormGroup>
              <div className="mt-4 flex justify-center">
                <img src={enrollment.qr} alt={tf.qrAlt} className="size-44 rounded-[12px] bg-white p-2" />
              </div>
              <FormGroup className="mt-4" footer={tf.manualKey}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center gap-3 px-4 text-left active:bg-card"
                  onClick={() => void navigator.clipboard?.writeText(enrollment.secret).then(() => toast(tf.keyCopied))}
                >
                  <span className="tnum not-money min-w-0 flex-1 truncate font-mono text-subhead">{enrollment.secret}</span>
                  <Copy size={18} strokeWidth={2.25} className="shrink-0 text-accent" />
                </button>
              </FormGroup>
              <FormGroup header={tf.step2}>
                <FormRow label={tf.code} last>
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

          <FormGroup header={tf.howTo} footer={tf.howToFooter}>
            {GUIDE_IDS.map((id) => {
              const g = tf.guides[id];
              return (
                <Disclosure key={id} title={g.title} open={guide === id} onToggle={() => setGuide(guide === id ? null : id)}>
                  <p className="text-subhead text-pretty text-label-2">{g.app}</p>
                  <div className="mt-3">
                    <NumberedSteps steps={g.steps.map((s, i) => <Rich key={i} text={s} />)} />
                  </div>
                </Disclosure>
              );
            })}
          </FormGroup>
        </>
      )}
    </Sheet>
  );
}
