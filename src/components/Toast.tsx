import { CircleAlert, CircleCheck } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ERROR_EVENT } from '../lib/offline';

// transitions.dev · Toast open / close: entra lento, sale rápido.
type Tone = 'ok' | 'error';
const ToastContext = createContext<(msg: string, tone?: Tone) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const [tone, setTone] = useState<Tone>('ok');
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((text: string, t: Tone = 'ok') => {
    clearTimeout(timer.current);
    setMsg(text);
    setTone(t);
    setOpen(true);
    timer.current = window.setTimeout(() => setOpen(false), t === 'error' ? 4000 : 2200);
  }, []);

  // Un cambio que el servidor rechazó (con señal) se avisa aunque la hoja ya se haya cerrado.
  useEffect(() => {
    const onError = () => show('No se pudo guardar un cambio. Revisa Movimientos e inténtalo de nuevo.', 'error');
    window.addEventListener(ERROR_EVENT, onError);
    return () => window.removeEventListener(ERROR_EVENT, onError);
  }, [show]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
        // Por encima de la pastilla de "sin conexión", que vive justo sobre la barra de pestañas.
        style={{ bottom: 'calc(var(--tabbar-h) + 60px)' }}
        role="status"
        aria-live="polite"
      >
        <div
          className={
            't-toast flex items-center gap-2 rounded-full bg-card-2 py-2.5 pr-5 pl-3.5 text-subhead font-semibold shadow-[0_8px_24px_rgb(0_0_0/0.5)]' +
            (open ? ' is-open' : '')
          }
        >
          {tone === 'error' ? (
            <CircleAlert size={20} strokeWidth={2.25} className="shrink-0 text-red" />
          ) : (
            <CircleCheck size={20} strokeWidth={2.25} className="shrink-0 text-green" />
          )}
          {msg}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
