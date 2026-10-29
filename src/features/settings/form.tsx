import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

/** Grupo de campos de formulario estilo iOS dentro de una hoja. */
export function FormGroup({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="overflow-hidden rounded-[12px] bg-card-2">{children}</div>
      {footer && <p className="mt-1.5 px-4 text-footnote text-label-2">{footer}</p>}
    </div>
  );
}

export function FormRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <label className="flex min-h-11 items-center pl-4">
      <span
        className={clsx(
          'flex min-h-11 flex-1 items-center gap-4 pr-4',
          !last && 'shadow-[inset_0_-0.5px_0_var(--color-sep)]',
        )}
      >
        <span className="shrink-0 text-body">{label}</span>
        <span className="flex min-w-0 flex-1 justify-end">{children}</span>
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
