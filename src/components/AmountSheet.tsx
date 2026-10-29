import { useState, type ReactNode } from 'react';
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
  const [colones, setColones] = useState(initialCents ? String(Math.round(initialCents / 100)) : '');
  const cents = Number(colones || '0') * 100;
  const canSave = allowZero || cents > 0;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      leading={
        <button type="button" className="min-h-11 text-body text-blue" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button
          type="button"
          className="press min-h-9 rounded-full bg-blue px-4 text-body font-semibold text-white disabled:bg-fill disabled:text-label-3"
          disabled={!canSave}
          onClick={() => onSave(cents)}
        >
          Guardar
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
          Quitar
        </Button>
      )}
    </Sheet>
  );
}
