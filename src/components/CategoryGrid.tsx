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
    <div className="grid grid-cols-4 gap-x-1 gap-y-2">
      {categories.map((c) => {
        const Icon = iconOf(c.icon);
        const on = c.id === selected;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? null : c.id)}
            className="press flex min-h-11 flex-col items-center gap-1 rounded-[12px] py-1"
          >
            <span
              className={clsx(
                'grid size-11 place-items-center rounded-[12px] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-[box-shadow,opacity,background-color] duration-150',
                on ? 'bg-fill-2' : 'bg-card-3',
                selected && !on && 'opacity-50',
              )}
              style={{
                color: colorOf(c.color),
                // Seleccionada: aro de platino separado por una línea del fondo de la hoja.
                boxShadow: on ? '0 0 0 2px var(--color-card), 0 0 0 3.5px var(--color-accent)' : undefined,
              }}
            >
              <Icon size={21} strokeWidth={1.9} />
            </span>
            <span
              lang="es"
              // Nombres largos («Entretenimiento») se parten con guion en dos líneas en vez de cortarse.
              className={clsx('line-clamp-2 w-full px-0.5 text-center text-caption hyphens-auto', on ? 'font-semibold text-label' : 'text-label-2')}
            >
              {c.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
