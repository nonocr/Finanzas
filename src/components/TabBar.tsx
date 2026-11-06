import clsx from 'clsx';
import { ChartPie, Gauge, House, List, Plus, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEditor } from '../features/transactions/editor';
import { useT } from '../i18n';
import { usePendingReview } from '../lib/data/queries';

type TabKey = 'home' | 'transactions' | 'stats' | 'budget';
// «tab» y no «key»: React se queda con la prop key y el componente no la recibiría.
const TABS: { to: string; tab: TabKey; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', tab: 'home', icon: House, end: true },
  { to: '/movimientos', tab: 'transactions', icon: List },
  { to: '/estadisticas', tab: 'stats', icon: ChartPie },
  { to: '/presupuesto', tab: 'budget', icon: Gauge },
];

function Tab({ to, tab: tabKey, icon: Icon, end, badge = 0 }: (typeof TABS)[number] & { badge?: number }) {
  const t = useT();
  const label = t.nav.tabs[tabKey];
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={badge ? t.nav.toReview(label, badge) : undefined}
      className={({ isActive }) =>
        clsx(
          'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
          isActive ? 'font-semibold text-label' : 'font-medium text-label-2',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            <Icon size={23} strokeWidth={isActive ? 2 : 1.6} />
            {badge > 0 && (
              // Contador en platino, como un remache: dice cuántos pagos esperan sin depender del rojo.
              <span className="metal tnum not-money absolute -top-1.5 left-[15px] grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[12px] leading-none font-bold shadow-[0_0_0_2px_var(--color-bg)]">
                {badge}
              </span>
            )}
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}

export function TabBar() {
  const t = useT();
  const { openNew } = useEditor();
  const { data: pending = [] } = usePendingReview();
  return (
    <nav
      className="tabbar fixed inset-x-0 bottom-0 z-40 pb-[var(--safe-bottom)]"
      aria-label={t.nav.sections}
    >
      <div className="mx-auto flex h-14 max-w-xl items-center px-2">
        <Tab {...TABS[0]} />
        <Tab {...TABS[1]} badge={pending.length} />
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => openNew()}
            aria-label={t.nav.addTransaction}
            className="press metal-disc grid size-[52px] place-items-center rounded-full"
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
