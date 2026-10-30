import { onlineManager, useMutationState } from '@tanstack/react-query';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useSyncExternalStore } from 'react';

const useOnline = () =>
  useSyncExternalStore(
    (cb) => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
  );

/** Pastilla sobre la barra de pestañas: sin conexión y cuántos cambios esperan subir. */
export function OfflineBanner() {
  const online = useOnline();
  // Cambios sin terminar: en pausa (sin señal) o reintentando tras una señal intermitente.
  const pending = useMutationState({ filters: { status: 'pending' }, select: (m) => m.state.isPaused || m.state.failureCount > 0 });
  const waiting = pending.filter(Boolean).length;
  if (online && waiting === 0) return null;

  const text = !online
    ? waiting
      ? `Sin conexión · ${waiting} ${waiting === 1 ? 'cambio espera' : 'cambios esperan'} para subir`
      : 'Sin conexión'
    : `Subiendo ${waiting} ${waiting === 1 ? 'cambio' : 'cambios'}…`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
      style={{ bottom: 'calc(var(--tabbar-h) + 10px)' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-full bg-card-2 py-2 pr-4 pl-3 text-footnote font-semibold text-label shadow-[0_6px_18px_rgb(0_0_0/0.45)]">
        {online ? (
          <RefreshCw size={16} strokeWidth={2.25} className="animate-spin text-accent motion-reduce:animate-none" />
        ) : (
          <CloudOff size={16} strokeWidth={2.25} className="text-orange" />
        )}
        {text}
      </div>
    </div>
  );
}
