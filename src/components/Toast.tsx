import { CircleCheck } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

// transitions.dev · Toast open / close: entra lento, sale rápido.
const ToastContext = createContext<(msg: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setMsg(text);
    setOpen(true);
    timer.current = window.setTimeout(() => setOpen(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center"
        style={{ bottom: 'calc(var(--tabbar-h) + 20px)' }}
        role="status"
        aria-live="polite"
      >
        <div
          className={
            't-toast flex items-center gap-2 rounded-full bg-card-2 py-2.5 pr-5 pl-3.5 text-subhead font-semibold shadow-[0_8px_24px_rgb(0_0_0/0.5)]' +
            (open ? ' is-open' : '')
          }
        >
          <CircleCheck size={20} strokeWidth={2.25} className="text-green" />
          {msg}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
