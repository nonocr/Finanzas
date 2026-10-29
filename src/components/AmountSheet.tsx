import { Delete } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { formatCRC } from '../lib/money';
import { Sheet } from './Sheet';
import { Button } from './ui';

/** Hoja para escribir un monto con teclado numérico (presupuestos, saldos). */
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
  const press = (k: string) =>
    setColones((v) => (k === 'del' ? v.slice(0, -1) : (v + k).replace(/^0+/, '').slice(0, 11)));

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
          className="min-h-11 text-body font-semibold text-blue disabled:text-label-3"
          disabled={!allowZero && cents <= 0}
          onClick={() => onSave(cents)}
        >
          Guardar
        </button>
      }
    >
      <p className={'tnum mt-2 text-center text-[52px] leading-[60px] font-bold tracking-[-0.02em] ' + (cents === 0 ? 'text-label-3' : '')}>
        {formatCRC(cents)}
      </p>
      {extra}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            aria-label={k === 'del' ? 'Borrar' : k}
            className="press grid h-12 place-items-center rounded-[10px] bg-card-2 text-title3 font-medium active:bg-card-3"
          >
            {k === 'del' ? <Delete size={22} strokeWidth={2} /> : k}
          </button>
        ))}
      </div>
      {onDelete && (
        <Button variant="destructive" className="mt-6 w-full" onClick={onDelete}>
          Quitar
        </Button>
      )}
    </Sheet>
  );
}
