import { CircleCheck, Wallet } from 'lucide-react';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { cleanCode, needsMfaCode, verifyCode } from '../../lib/mfa';
import { isNative, platform, WEB_APP_URL } from '../../lib/native';
import { checkPassword } from '../../lib/password';
import { signupLinkNotice, supabase, takeAccountDeleted, takePartialSignOut } from '../../lib/supabase';

// Correo + contraseña: funciona igual en la web, en la PWA instalada y en la app nativa, sin depender de que un
// enlace por correo abra la app correcta. Cualquiera puede crear su cuenta; Supabase pide confirmar el correo antes
// de entrar (el enlace abre el navegador, y luego se entra aquí con correo y contraseña).
// Si olvidas la contraseña, el enlace del correo abre el navegador: ahí pones la nueva y luego entras con ella.

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Falta confirmar el correo. Abre el enlace que te enviamos.',
  over_email_send_rate_limit: 'Se alcanzó el límite de correos por hora. Inténtalo de nuevo en una hora.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
  same_password: 'La nueva contraseña es igual a la anterior.',
  weak_password: 'La contraseña es muy débil.',
  signup_disabled: 'Por ahora no se pueden crear cuentas nuevas.',
  email_address_invalid: 'Ese correo no es válido.',
  email_address_not_authorized: 'No se pudo enviar el correo a esa dirección.',
};
const GENERIC = 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.';

/** A dónde vuelve el enlace de los correos: la web de producción (la app nativa no tiene dirección propia). */
const emailRedirect = () => (isNative ? WEB_APP_URL : `${location.origin}/`);

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mb-8 grid size-16 place-items-center rounded-[16px] black-card text-accent">
        <Wallet size={34} strokeWidth={2} />
      </div>
      <h1 className="text-large-title font-bold">{title}</h1>
      <p className="mt-1 text-body text-pretty text-label-2">{subtitle}</p>
      {children}
    </main>
  );
}

function Fields({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[12px] bg-card [&>input+input]:shadow-[inset_0_0.5px_0_var(--color-sep)]">{children}</div>;
}

function Field(props: ComponentProps<'input'>) {
  return (
    <input
      required
      aria-label={props.placeholder}
      className="min-h-[50px] w-full bg-transparent px-4 text-body outline-none placeholder:text-label-3"
      {...props}
    />
  );
}

function CodeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="Código de 6 dígitos"
      className="tnum min-h-[50px] w-full bg-transparent px-4 text-body tracking-[0.2em] outline-none placeholder:tracking-normal placeholder:text-label-3"
      value={value}
      onChange={(e) => onChange(cleanCode(e.target.value))}
    />
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return children ? (
    <p role="alert" className="mt-3 text-subhead text-red">
      {children}
    </p>
  ) : null;
}

/** Aviso tranquilo arriba del formulario: buena noticia (con check) o algo a tener en cuenta (ámbar). */
function Notice({ tone, children }: { tone: 'good' | 'warn'; children: ReactNode }) {
  return tone === 'good' ? (
    <p role="status" className="machined mt-6 flex gap-2.5 rounded-[12px] bg-card p-4 text-subhead text-pretty">
      <CircleCheck size={20} strokeWidth={2.25} className="mt-px shrink-0 text-green" />
      <span>{children}</span>
    </p>
  ) : (
    <p role="status" className="mt-6 rounded-[12px] bg-orange/15 p-4 text-subhead text-pretty">
      {children}
    </p>
  );
}

/** Dónde se abre el enlace del correo, dicho según el dispositivo. */
function whereLinkOpens() {
  if (platform === 'ios') return 'Ábrelo en este iPhone; se abrirá en Safari.';
  if (platform === 'android') return 'Ábrelo en este teléfono; se abrirá en el navegador.';
  return 'Ábrelo en este dispositivo.';
}

type Mode = 'login' | 'signup' | 'forgot' | 'sent' | 'check';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [partialSignOut] = useState(takePartialSignOut);
  const [accountDeleted] = useState(takeAccountDeleted);

  const strength = checkPassword(password);
  const valid =
    email.includes('@') &&
    (mode === 'forgot' || (mode === 'login' && password.length > 0) || (mode === 'signup' && strength.ok && password === confirm));

  const fail = (code: string | undefined) => {
    setErrorCode(code ?? null);
    setError(MESSAGES[code ?? ''] ?? GENERIC);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    setErrorCode(null);
    const address = email.trim();
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: address, password });
      if (error) fail(error.code);
    } else if (mode === 'signup') {
      // Si el correo ya tenía cuenta, Supabase responde igual que si fuera nuevo (no revela quién está registrado):
      // por eso la pantalla siguiente no afirma que la cuenta se creó.
      const { error } = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: emailRedirect() } });
      if (error) fail(error.code);
      else go('check');
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: emailRedirect() });
      if (error) fail(error.code);
      else go('sent');
    }
    setBusy(false);
  };

  const resend = async () => {
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: emailRedirect() } });
    setBusy(false);
    if (error) fail(error.code);
    else {
      setResent(true);
      setError(null);
      setErrorCode(null);
    }
  };

  const go = (m: Mode) => {
    setMode(m);
    setError(null);
    setErrorCode(null);
    setResent(false);
    if (m !== 'check' && m !== 'sent') {
      setPassword('');
      setConfirm('');
    }
  };

  if (mode === 'sent' || mode === 'check')
    return (
      <AuthLayout
        title={mode === 'check' ? 'Confirma tu correo' : 'Revisa tu correo'}
        subtitle={
          mode === 'check'
            ? `Si ${email.trim()} no tenía cuenta, te llegará un enlace para confirmarla. ${whereLinkOpens()} Después entra aquí con tu correo y contraseña.`
            : `Si ${email.trim()} tiene cuenta, te llegará un enlace para poner una contraseña nueva. ${whereLinkOpens()}`
        }
      >
        <p className="mt-4 text-footnote text-pretty text-label-2">¿No llega? Revisa la carpeta de spam o de promociones.</p>
        <Button variant="tinted" className="mt-8 w-full" onClick={() => go('login')}>
          {mode === 'check' ? 'Ya la confirmé, entrar' : 'Volver a entrar'}
        </Button>
      </AuthLayout>
    );

  const title = { login: 'Finanzas', signup: 'Crear cuenta', forgot: 'Restablecer contraseña' }[mode];
  const subtitle = {
    login: 'Entra para ver tus gastos.',
    signup: 'Tus gastos, ingresos y presupuesto en colones. Solo tú ves tus datos.',
    forgot: 'Te enviaremos un enlace a tu correo para poner una contraseña nueva.',
  }[mode];

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {mode === 'login' && signupLinkNotice === 'confirmed' && <Notice tone="good">Tu correo quedó confirmado. Ya puedes entrar.</Notice>}
      {mode === 'login' && signupLinkNotice === 'expired' && (
        <Notice tone="warn">El enlace venció o ya se usó. Entra con tu correo y contraseña; si falta confirmarlo, te lo reenviamos.</Notice>
      )}
      {mode === 'login' && accountDeleted && <Notice tone="good">Tu cuenta y todos tus datos se eliminaron.</Notice>}
      {partialSignOut && mode === 'login' && (
        <Notice tone="warn">
          Cerraste sesión sin conexión, así que solo se cerró en este dispositivo. Para cerrarla en todos, entra con conexión
          y vuelve a tocar «Cerrar sesión».
        </Notice>
      )}
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
      >
        <Fields>
          <Field type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
          {mode !== 'forgot' && (
            <Field
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          )}
          {mode === 'signup' && (
            <Field type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repetir contraseña" />
          )}
        </Fields>
        {mode === 'signup' && !error && (
          <p className="mt-2 px-4 text-footnote text-label-2">
            {password && !strength.ok
              ? `Le falta: ${strength.missing.join(', ')}.`
              : confirm && password !== confirm
                ? 'Las contraseñas no coinciden.'
                : 'Mínimo 8 caracteres, con minúscula, mayúscula y número.'}
          </p>
        )}
        <ErrorText>{error}</ErrorText>
        {errorCode === 'email_not_confirmed' && (
          <Button variant="plain" className="mt-1 w-full text-body font-normal" disabled={busy || resent} onClick={() => void resend()}>
            {resent ? 'Te reenviamos el enlace' : 'Reenviar el correo de confirmación'}
          </Button>
        )}
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid}>
          {{ login: 'Entrar', signup: 'Crear cuenta', forgot: 'Enviar enlace' }[mode]}
        </Button>
        {mode === 'signup' && (
          <p className="mt-3 px-4 text-center text-footnote text-pretty text-label-2">
            Al crear tu cuenta aceptas la{' '}
            <Link to="/privacidad" className="text-accent underline underline-offset-2">
              política de privacidad
            </Link>
            .
          </p>
        )}
      </form>
      {mode === 'login' ? (
        <div className="mt-2 flex flex-col">
          <Button variant="plain" className="w-full text-body font-normal" onClick={() => go('forgot')}>
            ¿Olvidaste tu contraseña?
          </Button>
          <Button variant="plain" className="w-full text-body font-normal" onClick={() => go('signup')}>
            ¿No tienes cuenta? Crear una
          </Button>
        </div>
      ) : (
        <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => go('login')}>
          Ya tengo cuenta, entrar
        </Button>
      )}
    </AuthLayout>
  );
}

/** Segundo paso del inicio de sesión: el código de 6 dígitos del autenticador. */
export function MfaPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const err = await verifyCode(code);
    setBusy(false);
    if (err) {
      setError(err);
      setCode('');
    }
    // Si sale bien, Supabase emite MFA_CHALLENGE_VERIFIED y App muestra la app.
  };

  return (
    <AuthLayout title="Verificación" subtitle="Escribe el código de 6 dígitos de tu app de autenticación.">
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) void submit();
        }}
      >
        <Fields>
          <CodeField value={code} onChange={setCode} />
        </Fields>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="mt-4 w-full" disabled={busy || code.length !== 6}>
          Verificar
        </Button>
      </form>
      <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => void supabase.auth.signOut({ scope: 'local' })}>
        Cancelar
      </Button>
    </AuthLayout>
  );
}

/** Llegaste desde el enlace del correo: poner una contraseña nueva (y el código, si tienes dos pasos). */
export function ResetPasswordPage({ onSaved, onDone }: { onSaved: () => void; onDone: () => void }) {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [askCode, setAskCode] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void needsMfaCode().then(setAskCode);
    // Se muestra a qué cuenta corresponde el enlace: si no es tu correo, no pongas nada y cancela.
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  const strength = checkPassword(next);
  const valid = strength.ok && next === confirm && (!askCode || code.length === 6);

  const submit = async () => {
    setBusy(true);
    setError(null);
    // Con dos pasos activos, Supabase exige el código antes de cambiar la contraseña.
    const codeErr = askCode ? await verifyCode(code) : null;
    if (codeErr) {
      setBusy(false);
      setError(codeErr);
      setCode('');
      return;
    }
    if (askCode) setAskCode(false);
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) return setError(MESSAGES[error.code ?? ''] ?? GENERIC);
    // La sesión del enlace no se queda abierta en el navegador: se cierra aquí al terminar.
    onSaved();
    setDone(true);
    await supabase.auth.signOut({ scope: 'local' });
  };

  if (done)
    return (
      <AuthLayout
        title="Contraseña nueva lista"
        subtitle="Ya puedes entrar con ella en la app. Por seguridad, aquí se cerró la sesión; puedes cerrar esta página."
      >
        <Button variant="tinted" className="mt-8 w-full" onClick={onDone}>
          Entrar aquí
        </Button>
      </AuthLayout>
    );

  return (
    <AuthLayout
      title="Contraseña nueva"
      subtitle={
        <>
          {email && (
            <>
              Para <span className="font-semibold text-label">{email}</span>.{' '}
            </>
          )}
          Mínimo 8 caracteres, con minúscula, mayúscula y número.
        </>
      }
    >
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
      >
        <Fields>
          <Field type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nueva contraseña" />
          <Field type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repetir contraseña" />
        </Fields>
        {askCode && (
          <div className="mt-4">
            <Fields>
              <CodeField value={code} onChange={setCode} />
            </Fields>
            <p className="mt-2 px-4 text-footnote text-label-2">Tienes verificación en dos pasos: escribe el código de tu autenticador.</p>
          </div>
        )}
        <ErrorText>
          {error ??
            (next && !strength.ok
              ? `Le falta: ${strength.missing.join(', ')}.`
              : confirm && next !== confirm
                ? 'Las contraseñas no coinciden.'
                : null)}
        </ErrorText>
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid || askCode === null}>
          Guardar contraseña
        </Button>
      </form>
      <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => void supabase.auth.signOut({ scope: 'local' }).then(onDone)}>
        Cancelar
      </Button>
    </AuthLayout>
  );
}
