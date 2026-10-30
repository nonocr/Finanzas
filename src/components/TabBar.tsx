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
          'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
          isActive ? 'font-semibold text-label' : 'font-medium text-label-2',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={23} strokeWidth={isActive ? 2 : 1.6} />
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
            className="press grid size-[52px] place-items-center rounded-full text-on-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.8),inset_0_-2px_3px_rgb(0_0_0/0.25),0_6px_16px_rgb(0_0_0/0.6),0_0_0_1px_#000] [background:radial-gradient(120%_120%_at_30%_20%,#ffffff_0%,#d7d7db_45%,#a9a9ae_100%)]"
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
