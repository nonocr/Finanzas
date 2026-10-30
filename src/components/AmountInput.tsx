import clsx from 'clsx';
import { useEffect, useRef } from 'react';

const groups = new Intl.NumberFormat('es-CR');

/** Colones enteros → "12.500" (punto de miles, como se lee en Costa Rica). */
const pretty = (colones: string) => (colones ? groups.format(Number(colones)).replace(/[\s  ]/g, '.') : '');

/**
 * Monto grande que se escribe con el teclado numérico del teléfono (o el de la computadora).
 * Guarda colones enteros como texto de dígitos; el padre convierte a céntimos.
 */
export function AmountInput({
  value,
  onChange,
  autoFocus,
  tone,
  label = 'Monto',
}: {
  value: string;
  onChange: (digits: string) => void;
  autoFocus?: boolean;
  tone?: 'ingreso';
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Espera a que termine de subir la hoja; en iPhone el foco abre el teclado si viene del toque.
    if (!autoFocus) return;
    const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 60);
    return () => clearTimeout(t);
  }, [autoFocus]);

  const empty = value === '';
  return (
    <label
      className={clsx(
        'tnum flex items-baseline justify-center gap-1 text-[56px] leading-[62px] font-light tracking-[-0.035em]',
        empty ? 'text-label-3' : tone === 'ingreso' ? 'text-green' : 'engraved',
      )}
    >
      <span aria-hidden="true" className="text-[34px] text-label-2">₡</span>
      <input
        ref={input}
        aria-label={label}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        enterKeyHint="done"
        placeholder="0"
        value={pretty(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 11))}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="min-w-[1ch] bg-transparent text-left outline-none placeholder:text-label-3 [field-sizing:content]"
        style={{ width: `${Math.max(1, pretty(value).length || 1)}ch` }}
      />
    </label>
  );
}
