import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Segmented } from '../../components/motion';
import { Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';

// Correo + contraseña: funciona dentro de la PWA instalada sin depender de enlaces por correo
// (en iPhone un enlace abriría Safari y la sesión quedaría fuera de la app).
type Mode = 'entrar' | 'crear';

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  user_already_exists: 'Ya existe una cuenta con ese correo. Entra con tu contraseña.',
  weak_password: 'La contraseña es muy débil; usa al menos 8 caracteres.',
  signup_disabled: 'El registro está cerrado. Entra con tu cuenta.',
  email_not_confirmed: 'Falta confirmar el correo. Revisa tu bandeja de entrada.',
};

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const creds = { email: email.trim(), password };
    const { error } =
      mode === 'entrar' ? await supabase.auth.signInWithPassword(creds) : await supabase.auth.signUp(creds);
    setBusy(false);
    if (error) setError(MESSAGES[error.code ?? ''] ?? 'No se pudo entrar. Revisa tu conexión e inténtalo de nuevo.');
  };

  const valid = email.includes('@') && password.length >= (mode === 'crear' ? 8 : 1);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mb-8 grid size-16 place-items-center rounded-[16px] bg-green text-black">
        <Wallet size={34} strokeWidth={2} />
      </div>
      <h1 className="text-large-title font-bold">Finanzas</h1>
      <p className="mt-1 text-body text-label-2">
        {mode === 'entrar' ? 'Entra para ver tus gastos.' : 'Crea tu cuenta; solo se hace una vez.'}
      </p>

      <Segmented
        className="mt-8"
        options={[
          { value: 'entrar', label: 'Entrar' },
          { value: 'crear', label: 'Crear cuenta' },
        ]}
        value={mode}
        onChange={(m) => {
          setMode(m);
          setError(null);
        }}
      />

      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
      >
        <div className="overflow-hidden rounded-[12px] bg-card">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            aria-label="Correo"
            className="min-h-[50px] w-full bg-transparent px-4 text-body outline-none placeholder:text-label-3"
          />
          <div className="ml-4 h-px bg-sep" />
          <input
            type="password"
            autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'crear' ? 'Contraseña (mínimo 8)' : 'Contraseña'}
            aria-label="Contraseña"
            className="min-h-[50px] w-full bg-transparent px-4 text-body outline-none placeholder:text-label-3"
          />
        </div>
        {error && <p className="mt-3 text-subhead text-red">{error}</p>}
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid}>
          {mode === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </Button>
      </form>
    </main>
  );
}
