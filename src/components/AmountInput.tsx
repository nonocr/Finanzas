import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { centsToUsdInput, sanitizeUsdInput } from '../lib/fx';
import { useLang, useT } from '../i18n';
import { formatNumber, parseAmountToCents, pastedColones } from '../lib/money';

/** Colones enteros → "12.500" (punto de miles, como se lee en Costa Rica; en inglés "12,500"). */
const pretty = (colones: string) => (colones ? formatNumber(Number(colones)) : '');

/**
 * Monto grande que se escribe con el teclado numérico del teléfono (o el de la computadora).
 * Guarda colones enteros como texto de dígitos; el padre convierte a céntimos.
 */
export function AmountInput({
  value,
  onChange,
  autoFocus,
  tone,
  label: labelProp,
  currency = 'CRC',
}: {
  value: string;
  onChange: (digits: string) => void;
  autoFocus?: boolean;
  tone?: 'ingreso';
  label?: string;
  /** En dólares el valor lleva coma decimal ("12,99"); en colones son colones enteros. */
  currency?: 'CRC' | 'USD';
}) {
  const t = useT();
  const lang = useLang();
  const label = labelProp ?? t.transactions.amount;
  const usd = currency === 'USD';
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Espera a que termine de subir la hoja; en iPhone el foco abre el teclado si viene del toque.
    if (!autoFocus) return;
    const timer = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 60);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const empty = value === '';
  // En dólares el valor guarda coma decimal; en inglés se muestra con punto (al escribir, el punto se toma como la coma).
  const shown = usd ? (lang === 'es' ? value : value.replace(',', '.')) : pretty(value);
  return (
    <label
      className={clsx(
        'tnum flex items-baseline justify-center gap-1 text-[56px] leading-[62px] font-light tracking-[-0.035em]',
        empty ? 'text-label-3' : tone === 'ingreso' ? 'text-green' : 'engraved',
      )}
    >
      <span aria-hidden="true" className="text-[34px] text-label-2">
        {usd ? 'US$' : '₡'}
      </span>
      <input
        ref={input}
        aria-label={usd ? t.transactions.amountInDollars(label) : label}
        inputMode={usd ? 'decimal' : 'numeric'}
        pattern={usd ? undefined : '[0-9]*'}
        autoComplete="off"
        enterKeyHint="done"
        placeholder="0"
        value={shown}
        onChange={(e) =>
          onChange(usd ? sanitizeUsdInput(e.target.value) : e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 11))
        }
        onPaste={(e) => {
          const text = e.clipboardData.getData('text');
          const usdCents = usd ? parseAmountToCents(text) : null;
          const v = usd ? (usdCents ? centsToUsdInput(usdCents) : null) : pastedColones(text);
          if (v === null) return;
          e.preventDefault();
          onChange(v);
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="min-w-[1ch] bg-transparent text-left outline-none placeholder:text-label-3 [field-sizing:content]"
        style={{ width: `${Math.max(1, shown.length || 1)}ch` }}
      />
    </label>
  );
}
