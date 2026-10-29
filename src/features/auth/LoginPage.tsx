import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';

// Código de 6 dígitos por correo: en un iPhone el enlace mágico abriría Safari
// y no la app instalada, así que la sesión quedaría en el lugar equivocado.
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setError('No pudimos enviar el código. Revisa el correo e inténtalo de nuevo.');
    else setStep('code');
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
    setBusy(false);
    if (error) setError('El código no es válido o ya venció. Pide uno nuevo.');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mb-8 grid size-16 place-items-center rounded-[16px] bg-green text-black">
        <Wallet size={34} strokeWidth={2} />
      </div>
      <h1 className="text-large-title font-bold">Finanzas</h1>
      <p className="mt-1 text-body text-label-2">
        {step === 'email' ? 'Entra con tu correo; te enviamos un código.' : `Escribe el código que enviamos a ${email}.`}
      </p>

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 'email') void sendCode();
          else void verify();
        }}
      >
        {step === 'email' ? (
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="min-h-[50px] w-full rounded-[12px] bg-card px-4 text-body outline-none placeholder:text-label-3"
          />
        ) : (
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="tnum min-h-[50px] w-full rounded-[12px] bg-card px-4 text-center text-title2 tracking-[0.3em] outline-none placeholder:text-label-3"
          />
        )}
        {error && <p className="mt-3 text-subhead text-red">{error}</p>}
        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={busy || (step === 'email' ? !email.includes('@') : code.length !== 6)}
        >
          {step === 'email' ? 'Enviar código' : 'Entrar'}
        </Button>
        {step === 'code' && (
          <Button variant="plain" className="mt-2 w-full" onClick={() => setStep('email')}>
            Usar otro correo
          </Button>
        )}
      </form>
    </main>
  );
}
