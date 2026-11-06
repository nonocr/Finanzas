import { CircleCheck, Wallet } from 'lucide-react';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { cleanCode, needsMfaCode, verifyCode } from '../../lib/mfa';
import { isNative, platform, WEB_APP_URL } from '../../lib/native';
import { checkPassword } from '../../lib/password';
import { signupLinkNotice, supabase, takeAccountDeleted, takePartialSignOut } from '../../lib/supabase';
import { getLang, useT, type Strings } from '../../i18n';

// Correo + contraseña: funciona igual en la web, en la PWA instalada y en la app nativa, sin depender de que un
// enlace por correo abra la app correcta. Cualquiera puede crear su cuenta; Supabase pide confirmar el correo antes
// de entrar (el enlace abre el navegador, y luego se entra aquí con correo y contraseña).
// Si olvidas la contraseña, el enlace del correo abre el navegador: ahí pones la nueva y luego entras con ella.

/** Mensaje para un error de Supabase Auth, en el idioma actual. */
const authError = (t: Strings, code: string | undefined) => {
  const messages: Record<string, string> = t.auth.errors;
  return messages[code ?? ''] ?? t.common.genericError;
};

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
  const t = useT();
  return (
    <Field
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder={t.auth.codePlaceholder}
      className="tnum not-money min-h-[50px] w-full bg-transparent px-4 text-body tracking-[0.2em] outline-none placeholder:tracking-normal placeholder:text-label-3"
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
function whereLinkOpens(t: Strings) {
  if (platform === 'ios') return t.auth.whereLinkOpens.ios;
  if (platform === 'android') return t.auth.whereLinkOpens.android;
  return t.auth.whereLinkOpens.other;
}

type Mode = 'login' | 'signup' | 'forgot' | 'sent' | 'check';

export function LoginPage() {
  const t = useT();
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
    setError(authError(t, code));
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
      // El idioma va en los datos de la cuenta: el correo de confirmación y las categorías iniciales salen en ese idioma.
      const { error } = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: emailRedirect(), data: { lang: getLang() } } });
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
        title={t.auth[mode].title}
        subtitle={t.auth[mode].subtitle(email.trim(), whereLinkOpens(t))}
      >
        <p className="mt-4 text-footnote text-pretty text-label-2">{t.auth.noEmail}</p>
        <Button variant="tinted" className="mt-8 w-full" onClick={() => go('login')}>
          {t.auth[mode].button}
        </Button>
      </AuthLayout>
    );

  const title = t.auth.titles[mode];
  const subtitle = t.auth.subtitles[mode];

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {mode === 'login' && signupLinkNotice === 'confirmed' && <Notice tone="good">{t.auth.notices.confirmed}</Notice>}
      {mode === 'login' && signupLinkNotice === 'expired' && <Notice tone="warn">{t.auth.notices.expired}</Notice>}
      {mode === 'login' && accountDeleted && <Notice tone="good">{t.auth.notices.accountDeleted}</Notice>}
      {partialSignOut && mode === 'login' && <Notice tone="warn">{t.auth.notices.partialSignOut}</Notice>}
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
      >
        <Fields>
          <Field type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.auth.email} />
          {mode !== 'forgot' && (
            <Field
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.password}
            />
          )}
          {mode === 'signup' && (
            <Field type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t.auth.repeatPassword} />
          )}
        </Fields>
        {mode === 'signup' && !error && (
          <p className="mt-2 px-4 text-footnote text-label-2">
            {password && !strength.ok ? t.auth.missing(strength.missing) : confirm && password !== confirm ? t.auth.mismatch : t.auth.rules}
          </p>
        )}
        <ErrorText>{error}</ErrorText>
        {errorCode === 'email_not_confirmed' && (
          <Button variant="plain" className="mt-1 w-full text-body font-normal" disabled={busy || resent} onClick={() => void resend()}>
            {resent ? t.auth.resent : t.auth.resend}
          </Button>
        )}
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid}>
          {t.auth.submit[mode]}
        </Button>
        {mode === 'signup' && (
          <p className="mt-3 px-4 text-center text-footnote text-pretty text-label-2">
            {t.auth.privacyBefore}{' '}
            <Link to="/privacidad" className="text-accent underline underline-offset-2">
              {t.auth.privacyLink}
            </Link>
            {t.auth.privacyAfter}
          </p>
        )}
      </form>
      {mode === 'login' ? (
        <div className="mt-2 flex flex-col">
          <Button variant="plain" className="w-full text-body font-normal" onClick={() => go('forgot')}>
            {t.auth.forgotLink}
          </Button>
          <Button variant="plain" className="w-full text-body font-normal" onClick={() => go('signup')}>
            {t.auth.signupLink}
          </Button>
        </div>
      ) : (
        <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => go('login')}>
          {t.auth.haveAccount}
        </Button>
      )}
    </AuthLayout>
  );
}

/** Segundo paso del inicio de sesión: el código de 6 dígitos del autenticador. */
export function MfaPage() {
  const t = useT();
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
    <AuthLayout title={t.auth.mfa.title} subtitle={t.auth.mfa.subtitle}>
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
          {t.auth.mfa.verify}
        </Button>
      </form>
      <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => void supabase.auth.signOut({ scope: 'local' })}>
        {t.common.cancel}
      </Button>
    </AuthLayout>
  );
}

/** Llegaste desde el enlace del correo: poner una contraseña nueva (y el código, si tienes dos pasos). */
export function ResetPasswordPage({ onSaved, onDone }: { onSaved: () => void; onDone: () => void }) {
  const t = useT();
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
    if (error) return setError(authError(t, error.code));
    // La sesión del enlace no se queda abierta en el navegador: se cierra aquí al terminar.
    onSaved();
    setDone(true);
    await supabase.auth.signOut({ scope: 'local' });
  };

  if (done)
    return (
      <AuthLayout title={t.auth.reset.doneTitle} subtitle={t.auth.reset.doneSubtitle}>
        <Button variant="tinted" className="mt-8 w-full" onClick={onDone}>
          {t.auth.reset.signInHere}
        </Button>
      </AuthLayout>
    );

  return (
    <AuthLayout
      title={t.auth.reset.title}
      subtitle={
        <>
          {email && (
            <>
              {t.auth.reset.forBefore} <span className="font-semibold text-label">{email}</span>
              {t.auth.reset.forAfter}{' '}
            </>
          )}
          {t.auth.rules}
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
          <Field type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={t.auth.newPassword} />
          <Field type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t.auth.repeatPassword} />
        </Fields>
        {askCode && (
          <div className="mt-4">
            <Fields>
              <CodeField value={code} onChange={setCode} />
            </Fields>
            <p className="mt-2 px-4 text-footnote text-label-2">{t.auth.reset.codeHint}</p>
          </div>
        )}
        <ErrorText>
          {error ?? (next && !strength.ok ? t.auth.missing(strength.missing) : confirm && next !== confirm ? t.auth.mismatch : null)}
        </ErrorText>
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid || askCode === null}>
          {t.auth.reset.save}
        </Button>
      </form>
      <Button variant="plain" className="mt-2 w-full text-body font-normal" onClick={() => void supabase.auth.signOut({ scope: 'local' }).then(onDone)}>
        {t.common.cancel}
      </Button>
    </AuthLayout>
  );
}
