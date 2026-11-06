import { useState, type ReactNode } from 'react';
import { useT } from '../i18n';
import { AmountInput } from './AmountInput';
import { Sheet } from './Sheet';
import { Button } from './ui';

/** Hoja para escribir un monto con el teclado del teléfono (presupuestos). */
export function AmountSheet({
  open,
  title,
  initialCents,
  allowZero,
  extra,
  onSave,
  onDelete,
  onClose,
}: {
  open: boolean;
  title: string;
  initialCents: number;
  allowZero?: boolean;
  extra?: ReactNode;
  onSave: (cents: number) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onClose: () => void;
}) {
  const t = useT();
  const [colones, setColones] = useState(initialCents ? String(Math.round(initialCents / 100)) : '');
  const cents = Number(colones || '0') * 100;
  const canSave = allowZero || cents > 0;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={title}
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          {t.common.cancel}
        </button>
      }
      trailing={
        <button
          type="button"
          className="press metal min-h-9 rounded-full px-4 text-body font-semibold disabled:bg-none disabled:bg-fill disabled:text-label-3 disabled:shadow-none"
          disabled={!canSave}
          onClick={() => onSave(cents)}
        >
          {t.common.save}
        </button>
      }
    >
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) void onSave(cents);
        }}
      >
        <AmountInput value={colones} onChange={setColones} autoFocus />
      </form>
      {extra}
      {onDelete && (
        <Button variant="destructive" className="mt-8 w-full" onClick={onDelete}>
          {t.common.remove}
        </Button>
      )}
    </Sheet>
  );
}
