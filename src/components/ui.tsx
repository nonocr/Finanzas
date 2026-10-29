import clsx from 'clsx';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { colorOf, iconOf } from './palette';

/** Pantalla con título grande al estilo iOS. */
export function Screen({
  title,
  subtitle,
  trailing,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-xl px-4 pt-[calc(var(--safe-top)+12px)] pb-[calc(var(--tabbar-h)+32px)]">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {subtitle && <p className="text-footnote font-semibold text-label-2 uppercase">{subtitle}</p>}
          <h1 className="text-large-title font-bold tracking-[0.01em]">{title}</h1>
        </div>
        {trailing}
      </header>
      {children}
    </main>
  );
}

/** Grupo de filas con encabezado y pie, como las listas agrupadas de iOS. */
export function Section({
  header,
  footer,
  action,
  children,
  className,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx('mt-6 first:mt-0', className)}>
      {(header || action) && (
        <div className="mb-2 flex items-baseline justify-between px-4">
          <h2 className="text-title3 font-bold">{header}</h2>
          {action}
        </div>
      )}
      <div className="overflow-hidden rounded-card bg-card">{children}</div>
      {footer && <p className="mt-2 px-4 text-footnote text-label-2">{footer}</p>}
    </section>
  );
}

type RowProps = {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  to?: string;
  onClick?: () => void;
  destructive?: boolean;
};

/** Fila de lista; separador fino que empieza donde empieza el texto. */
export function Row({ leading, title, subtitle, trailing, chevron, to, onClick, destructive }: RowProps) {
  const body = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
        <span className="min-w-0 flex-1">
          <span className={clsx('block truncate text-body', destructive && 'text-red')}>{title}</span>
          {subtitle && <span className="block truncate text-subhead text-label-2">{subtitle}</span>}
        </span>
        {trailing && <span className="shrink-0 text-body text-label-2">{trailing}</span>}
        {chevron && <ChevronRight size={18} strokeWidth={2.25} className="shrink-0 text-label-3" />}
      </span>
    </>
  );
  const cls = 'group flex w-full items-center gap-3 pl-4 text-left transition-colors active:bg-card-2';
  if (to)
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  return <div className="group flex w-full items-center gap-3 pl-4">{body}</div>;
}

/** Ícono de categoría en cuadrito de color, como los de Ajustes de iOS. */
export function CategoryIcon({ icon, color, size = 30 }: { icon: string | null; color: string | null; size?: number }) {
  const Icon = iconOf(icon);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[8px] text-white"
      style={{ width: size, height: size, background: colorOf(color), borderRadius: size * 0.27 }}
    >
      <Icon size={size * 0.58} strokeWidth={2.25} />
    </span>
  );
}

export function IconTile({ icon: Icon, color, size = 30 }: { icon: LucideIcon; color: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center text-white"
      style={{ width: size, height: size, background: color, borderRadius: size * 0.27 }}
    >
      <Icon size={size * 0.58} strokeWidth={2.25} />
    </span>
  );
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx('rounded-card bg-card p-4', className)} {...props} />;
}

/** Una sola regla para el avance de un presupuesto: normal < 80 %, naranja desde 80 %, rojo al llegar al 100 %. */
export const budgetColor = (ratio: number, base = 'var(--color-green)') =>
  ratio >= 1 ? 'var(--color-red)' : ratio >= 0.8 ? 'var(--color-orange)' : base;
export const budgetTone = (ratio: number) => (ratio >= 1 ? 'text-red' : ratio >= 0.8 ? 'text-orange' : 'text-green');

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-fill">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ width: `${pct * 100}%`, background: budgetColor(value, color) }}
      />
    </div>
  );
}

export function Button({
  variant = 'filled',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: 'filled' | 'tinted' | 'plain' | 'destructive' }) {
  return (
    <button
      type="button"
      className={clsx(
        'press flex min-h-[50px] items-center justify-center gap-2 rounded-[12px] px-5 text-headline font-semibold disabled:opacity-40',
        variant === 'filled' && 'bg-blue text-white',
        variant === 'tinted' && 'bg-blue/15 text-blue',
        variant === 'plain' && 'text-blue',
        variant === 'destructive' && 'bg-red/15 text-red',
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-headline font-semibold">{title}</p>
      {body && <p className="mt-1 text-subhead text-label-2">{body}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-[8px] bg-card-2', className)} />;
}
