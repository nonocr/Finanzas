import clsx from 'clsx';
import { ChartPie, House, List, PiggyBank, Plus, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEditor } from '../features/transactions/editor';

const TABS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Resumen', icon: House, end: true },
  { to: '/movimientos', label: 'Movimientos', icon: List },
  { to: '/estadisticas', label: 'Estadísticas', icon: ChartPie },
  { to: '/presupuesto', label: 'Presupuesto', icon: PiggyBank },
];

function Tab({ to, label, icon: Icon, end }: (typeof TABS)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
          isActive ? 'text-blue' : 'text-gray',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function TabBar() {
  const { openNew } = useEditor();
  return (
    <nav
      className="tabbar fixed inset-x-0 bottom-0 z-40 pb-[var(--safe-bottom)]"
      aria-label="Secciones"
    >
      <div className="mx-auto flex h-14 max-w-xl items-center px-2">
        <Tab {...TABS[0]} />
        <Tab {...TABS[1]} />
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => openNew()}
            aria-label="Agregar movimiento"
            className="press grid size-12 place-items-center rounded-full bg-blue text-white shadow-[0_4px_14px_rgb(10_132_255/0.35)]"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>
        <Tab {...TABS[2]} />
        <Tab {...TABS[3]} />
      </div>
    </nav>
  );
}
