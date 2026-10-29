import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

/** Encabezado de grupo de formulario estilo iOS (nota en mayúsculas, alineada con el texto de las filas). */
export function FormHeader({ children }: { children: ReactNode }) {
  return <p className="mb-2 px-4 text-footnote font-semibold text-label-2 uppercase">{children}</p>;
}

/**
 * Grupo de campos de formulario estilo iOS dentro de una hoja. Entre grupos hay 24px; el pie va pegado a su
 * grupo (8px) para que se lea como parte de él y no del siguiente.
 */
export function FormGroup({
  children,
  header,
  footer,
  className,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('mt-6 first:mt-0', className)}>
      {header && <FormHeader>{header}</FormHeader>}
      <div className="overflow-hidden rounded-[12px] bg-card-2">{children}</div>
      {footer && <div className="mt-2 space-y-1.5 px-4 text-footnote text-pretty text-label-2">{footer}</div>}
    </div>
  );
}

/** Fila con etiqueta a la izquierda y valor a la derecha; una etiqueta larga se parte en dos líneas antes que apretar el campo. */
export function FormRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <label className="flex min-h-11 items-center pl-4">
      <span
        className={clsx(
          'flex min-h-11 flex-1 items-center gap-4 py-2.5 pr-4',
          !last && 'shadow-[inset_0_-0.5px_0_var(--color-sep)]',
        )}
      >
        <span className="min-w-0 text-body">{label}</span>
        <span className="flex min-w-24 flex-1 justify-end">{children}</span>
      </span>
    </label>
  );
}

export function TextInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      autoComplete="off"
      className={clsx('w-full bg-transparent text-right text-body outline-none placeholder:text-label-3', className)}
      {...props}
    />
  );
}

/** Entrada de colones enteros; guarda en céntimos. */
export function ColonesInput({
  cents,
  onChange,
  placeholder = '₡0',
}: {
  cents: number | null;
  onChange: (cents: number | null) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      inputMode="numeric"
      className="tnum"
      placeholder={placeholder}
      value={cents === null ? '' : '₡' + new Intl.NumberFormat('es-CR').format(cents / 100).replace(/[\s  ]/g, '.')}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
        onChange(digits ? Number(digits) * 100 : null);
      }}
    />
  );
}

export function DayInput({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <TextInput
      inputMode="numeric"
      className="tnum"
      placeholder="—"
      value={value ?? ''}
      onChange={(e) => {
        const n = Number(e.target.value.replace(/\D/g, '').slice(0, 2));
        onChange(n >= 1 && n <= 31 ? n : null);
      }}
    />
  );
}
