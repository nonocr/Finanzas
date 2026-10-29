import clsx from 'clsx';
import type { Category } from '../lib/types';
import { colorOf, iconOf } from './palette';

/** Todas las categorías visibles a la vez, en 4 columnas (sin deslizar de lado). */
export function CategoryGrid({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-x-1 gap-y-3">
      {categories.map((c) => {
        const Icon = iconOf(c.icon);
        const on = c.id === selected;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? null : c.id)}
            className="press flex min-h-11 flex-col items-center gap-1.5 rounded-[12px] py-1.5"
          >
            <span
              className={clsx(
                'grid size-12 place-items-center rounded-[14px] text-white transition-[box-shadow,opacity] duration-150',
                selected && !on && 'opacity-45',
              )}
              style={{
                background: colorOf(c.color),
                boxShadow: on ? '0 0 0 2px var(--color-card), 0 0 0 4px var(--color-label)' : undefined,
              }}
            >
              <Icon size={24} strokeWidth={2} />
            </span>
            <span className={clsx('w-full truncate px-0.5 text-center text-caption', on ? 'font-semibold text-label' : 'text-label-2')}>
              {c.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
