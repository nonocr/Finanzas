import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { useId, type ReactNode } from 'react';

/**
 * Fila que se despliega con su contenido (las guías por sistema: dos pasos, registro automático). Va dentro de un
 * grupo de filas; la altura se anima con grid-rows (0fr → 1fr), sin medir. Respeta «reducir movimiento».
 */
export function Disclosure({
  title,
  open,
  onToggle,
  pressClass = 'active:bg-card',
  children,
}: {
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Color al tocar: dentro de una hoja (grupo card-2) es card; en una página (grupo card) es card-2. */
  pressClass?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="group">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={clsx('flex w-full items-center gap-3 pl-4 text-left transition-colors', pressClass)}
      >
        <span className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
          <span className="min-w-0 flex-1 text-body">{title}</span>
          <ChevronRight
            size={18}
            strokeWidth={2.25}
            className={clsx('shrink-0 text-label-3 transition-transform duration-250 motion-reduce:transition-none', open && 'rotate-90')}
          />
        </span>
      </button>
      <div
        id={id}
        className={clsx(
          'grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="px-4 pt-1 pb-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Pasos numerados de una guía. */
export function NumberedSteps({ steps }: { steps: ReactNode[] }) {
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-subhead text-pretty [&_b]:font-semibold [&_b]:text-label">
          <span className="tnum not-money grid size-6 shrink-0 place-items-center rounded-full bg-card-3 text-footnote font-semibold text-label">
            {i + 1}
          </span>
          <span className="pt-0.5 text-label-2">{s}</span>
        </li>
      ))}
    </ol>
  );
}
