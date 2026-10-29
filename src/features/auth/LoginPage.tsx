import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';

// Correo + contraseña: funciona dentro de la PWA instalada sin depender de enlaces por correo
// (en iPhone un enlace abriría Safari y la sesión quedaría fuera de la app).
// App de un solo usuario: el registro está cerrado en Supabase, así que aquí solo se entra.

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Falta confirmar el correo. Revisa tu bandeja de entrada.',
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError(MESSAGES[error.code ?? ''] ?? 'No se pudo entrar. Revisa tu conexión e inténtalo de nuevo.');
  };

  const valid = email.includes('@') && password.length > 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mb-8 grid size-16 place-items-center rounded-[16px] bg-green text-black">
        <Wallet size={34} strokeWidth={2} />
      </div>
      <h1 className="text-large-title font-bold">Finanzas</h1>
      <p className="mt-1 text-body text-label-2">Entra para ver tus gastos.</p>

      <form
        className="mt-8"
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            aria-label="Contraseña"
            className="min-h-[50px] w-full bg-transparent px-4 text-body outline-none placeholder:text-label-3"
          />
        </div>
        {error && <p className="mt-3 text-subhead text-red">{error}</p>}
        <Button type="submit" className="mt-4 w-full" disabled={busy || !valid}>
          Entrar
        </Button>
      </form>
    </main>
  );
}
