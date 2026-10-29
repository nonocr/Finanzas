import { Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/** Rueda de ajustes fija arriba a la derecha en todas las pantallas (menos dentro de Ajustes). */
export function SettingsButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/mas')) return null;
  return (
    <Link
      to="/mas"
      aria-label="Ajustes"
      className="press tabbar fixed z-30 grid size-11 place-items-center rounded-full text-label-2"
      style={{ top: 'calc(var(--safe-top) + 12px)', right: 'max(16px, calc((100vw - 36rem) / 2 + 16px))' }}
    >
      <Settings size={22} strokeWidth={2} />
    </Link>
  );
}
