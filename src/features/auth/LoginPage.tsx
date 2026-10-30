import { Wallet } from 'lucide-react';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Button } from '../../components/ui';
import { cleanCode, needsMfaCode, verifyCode } from '../../lib/mfa';
import { checkPassword } from '../../lib/password';
import { supabase } from '../../lib/supabase';

// Correo + contraseña: funciona dentro de la PWA instalada sin depender de enlaces por correo
// (en iPhone un enlace abriría Safari y la sesión quedaría fuera de la app).
// App de un solo usuario: el registro está cerrado en Supabase, así que aquí solo se entra.
// Si olvidas la contraseña, el enlace del correo abre Safari: ahí pones la nueva y luego entras con ella en la app.

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Falta confirmar el correo. Revisa tu bandeja de entrada.',
  over_email_send_rate_limit: 'Ya se envió un correo hace poco. Espera un rato antes de pedir otro.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
  same_password: 'La nueva contraseña es igual a la anterior.',
  weak_password: 'La contraseña es muy débil.',
};
const GENERIC = 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.';

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mb-8 grid size-16 place-items-center rounded-[16px] bg-green text-black">
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
  return children ? <p className="mt-3 text-subhead text-red">{children}</p> : null;
}

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'forgot' | 'sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin });
    setBusy(false);
    if (error) setError(MESSAGES[error.code ?? ''] ?? GENERIC);
    else if (mode === 'forgot') setMode('sent');
  };

  const go = (m: typeof mode) => {
    setMode(m);
    setError(null);
  };
  const valid = email.includes('@') && (mode === 'forgot' || password.length > 0);

  if (mode === 'sent')
    return (
      <AuthLayout
        title="Revisa tu correo"
        subtitle={`Si ${email.trim()} tiene cuenta, te llegará un enlace para poner una contraseña nueva. Ábrelo en este iPhone; se abrirá en Safari.`}
      >
        <Button variant="tinted" className="mt-8 w-full" onClick={() => go('login')}>
          Volver a entrar
        </Button>
      </AuthLayout>
    );

  return (
    <AuthLayout
      title={mode === 'login' ? 'Finanzas' : 'Restablecer contraseña'}
      subtitle={mode === 'login' ? 'Entra para ver tus gastos.' : 'Te enviaremos un enlace a tu correo para poner una contraseña nueva.'}
    >
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
      >
        <Fields>
          <Field type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
          {mode === 'login' && (
            <Field
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          )}
        </Fields>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid}>
          {mode === 'login' ? 'Entrar' : 'Enviar enlace'}
        </Button>
      </form>
      <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => go(mode === 'login' ? 'forgot' : 'login')}>
        {mode === 'login' ? '¿Olvidaste tu contraseña?' : 'Volver a entrar'}
      </Button>
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
    <AuthLayout title="Verificación" subtitle="Escribe el código de 6 dígitos de tu app de autenticación (Contraseñas en iPhone).">
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
export function ResetPasswordPage({ onDone }: { onDone: () => void }) {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [askCode, setAskCode] = useState<boolean | null>(null);

  useEffect(() => {
    void needsMfaCode().then(setAskCode);
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
    if (error) setError(MESSAGES[error.code ?? ''] ?? GENERIC);
    else setDone(true);
  };

  if (done)
    return (
      <AuthLayout
        title="Contraseña nueva lista"
        subtitle="Ya puedes entrar con ella en la app de tu pantalla de inicio. Esta página de Safari la puedes cerrar."
      >
        <Button variant="tinted" className="mt-8 w-full" onClick={onDone}>
          Seguir aquí
        </Button>
      </AuthLayout>
    );

  return (
    <AuthLayout title="Contraseña nueva" subtitle="Mínimo 8 caracteres, con minúscula, mayúscula y número.">
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
