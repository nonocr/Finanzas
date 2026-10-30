import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, crDay, monthName, startOfMonth } from '../lib/dates';
import { SoftText } from './motion';

export function MonthNav({ month, onChange }: { month: Date; onChange: (m: Date) => void }) {
  const current = startOfMonth(crDay());
  const isCurrent = month.getTime() >= current.getTime();
  const label = `${monthName(month)} ${month.getUTCFullYear()}`;
  return (
    <div className="flex items-center justify-between rounded-card bg-card px-1">
      <button
        type="button"
        aria-label="Mes anterior"
        className="press grid size-11 place-items-center text-accent"
        onClick={() => onChange(addMonths(month, -1))}
      >
        <ChevronLeft size={22} strokeWidth={2.25} />
      </button>
      <span className="text-headline font-semibold capitalize">
        <SoftText text={label} />
      </span>
      <button
        type="button"
        aria-label="Mes siguiente"
        className="press grid size-11 place-items-center text-accent disabled:text-label-3"
        disabled={isCurrent}
        onClick={() => onChange(addMonths(month, 1))}
      >
        <ChevronRight size={22} strokeWidth={2.25} />
      </button>
    </div>
  );
}
