import { useMemo, useState } from 'react';
import { AmountInput } from '../../components/AmountInput';
import { CategoryGrid } from '../../components/CategoryGrid';
import { Segmented } from '../../components/motion';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Button, CategoryIcon, EmptyState, Row, Screen, Section } from '../../components/ui';
import { crDay, isoDate } from '../../lib/dates';
import { formatCRC } from '../../lib/money';
import { useAccounts, useCategories, useDeleteRecurring, useLookups, useRecurring, useSaveRecurring } from '../../lib/queries';
import { monthlyAmount, parseDay, scheduleLabel } from '../../lib/recurring';
import type { Frequency, Recurring } from '../../lib/types';
import { AccountChips, PICKER_INPUT, Toggle } from '../transactions/TransactionSheet';
import { BackLink } from './MorePage';
import { FormGroup, FormHeader, FormRow, TextInput } from './form';

const shortDate = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const pillDate = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** «Hoy», «Mañana», «En 5 días» o la fecha si falta más de dos semanas. */
function whenLabel(next: string, today: Date) {
  const days = Math.round((parseDay(next).getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days <= 14) return `En ${days} días`;
  return shortDate.format(parseDay(next));
}

const signed = (r: Pick<Recurring, 'type' | 'amount'>) => (r.type === 'gasto' ? formatCRC(-r.amount) : formatCRC(r.amount, { sign: true }));

export function RecurringPage() {
  const { data: list = [], isLoading } = useRecurring();
  const { catMap } = useLookups();
  const [editing, setEditing] = useState<{ rec: Partial<Recurring>; key: number } | null>(null);
  const [open, setOpen] = useState(false);
  const today = crDay();

  const openEditor = (rec: Partial<Recurring>) => {
    setEditing((prev) => ({ rec, key: (prev?.key ?? 0) + 1 }));
    setOpen(true);
  };

  const active = list.filter((r) => r.active);
  const paused = list.filter((r) => !r.active);
  const perMonth = (type: Recurring['type']) => active.filter((r) => r.type === type).reduce((s, r) => s + monthlyAmount(r), 0);
  const gastos = perMonth('gasto');
  const ingresos = perMonth('ingreso');

  const row = (r: Recurring) => {
    const c = r.category_id ? catMap.get(r.category_id) : undefined;
    return (
      <Row
        key={r.id}
        onClick={() => openEditor(r)}
        leading={<CategoryIcon icon={c?.icon ?? null} color={c?.color ?? null} />}
        title={r.name}
        subtitle={`${r.active ? whenLabel(r.next_date, today) : 'En pausa'} · ${FREQ_SHORT[r.frequency]}`}
        trailing={<span className={'tnum font-semibold ' + (r.type === 'ingreso' ? 'text-green' : 'text-label')}>{signed(r)}</span>}
        chevron
      />
    );
  };

  return (
    <Screen title="Fijos" subtitle={<BackLink />}>
      <p className="px-1 text-subhead text-label-2">
        Alquiler, salario, suscripciones: el día que tocan se registran solos al abrir la app, y cuentan en el presupuesto como
        cualquier gasto.
      </p>

      {active.length > 0 && (
        <section className="machined mt-4 rounded-card bg-card p-4">
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-footnote text-label-2">Gastos fijos al mes</dt>
              <dd className="tnum engraved mt-1 text-title3 font-light">{formatCRC(gastos)}</dd>
            </div>
            <div>
              <dt className="text-footnote text-label-2">Ingresos fijos al mes</dt>
              <dd className="tnum mt-1 text-title3 font-light text-green">{formatCRC(ingresos)}</dd>
            </div>
          </dl>
        </section>
      )}

      <Section header="Próximos">
        {isLoading ? null : active.length === 0 ? (
          <EmptyState title="Aún no hay fijos" body="Agrega lo que pagas o recibes siempre igual, como el alquiler o el salario." />
        ) : (
          active.map(row)
        )}
      </Section>

      <Button variant="tinted" className="mt-6 w-full" onClick={() => openEditor({ type: 'gasto', frequency: 'mensual', active: true })}>
        Agregar gasto o ingreso fijo
      </Button>

      {paused.length > 0 && (
        <Section header="En pausa" footer="No se registran hasta que los reactives.">
          {paused.map(row)}
        </Section>
      )}

      {editing && <RecurringSheet key={editing.key} open={open} initial={editing.rec} onClose={() => setOpen(false)} />}
    </Screen>
  );
}

const FREQ_SHORT: Record<Frequency, string> = { semanal: 'Semanal', quincenal: 'Quincenal', mensual: 'Mensual', anual: 'Anual' };

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'semanal', label: 'Semana' },
  { value: 'quincenal', label: 'Quincena' },
  { value: 'mensual', label: 'Mes' },
  { value: 'anual', label: 'Año' },
];

function RecurringSheet({ open, initial, onClose }: { open: boolean; initial: Partial<Recurring>; onClose: () => void }) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { accMap } = useLookups();
  const save = useSaveRecurring();
  const remove = useDeleteRecurring();
  const toast = useToast();
  const today = isoDate(crDay());

  const [type, setType] = useState<Recurring['type']>(initial.type ?? 'gasto');
  const [colones, setColones] = useState(initial.amount ? String(Math.round(initial.amount / 100)) : '');
  const [name, setName] = useState(initial.name ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(initial.category_id ?? null);
  const [accountId, setAccountId] = useState<string | null>(initial.account_id ?? null);
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency ?? 'mensual');
  const [date, setDate] = useState(initial.next_date ?? today);
  const [active, setActive] = useState(initial.active ?? true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Una cuenta archivada sigue a la vista si el fijo ya la usa.
  const choices = useMemo(() => {
    const extra = initial.account_id && !accounts.some((a) => a.id === initial.account_id) ? accMap.get(initial.account_id) : undefined;
    return extra ? [...accounts, extra] : accounts;
  }, [accounts, accMap, initial.account_id]);
  const account = choices.find((a) => a.id === accountId) ?? accounts[0];
  const cats = useMemo(() => categories.filter((c) => c.kind === type && !c.parent_id), [categories, type]);
  const cents = Number(colones || '0') * 100;
  const valid = cents > 0 && name.trim() !== '' && Boolean(account);
  // Al cambiar la fecha, el día elegido pasa a ser el de la fecha nueva; si no, se conserva (un 31 que hoy cae el 30).
  const anchor = date === initial.next_date && initial.anchor_day ? initial.anchor_day : parseDay(date).getUTCDate();
  const past = active && date < today;

  const submit = async () => {
    if (!valid || !account) return;
    const created = await save.mutateAsync({
      id: initial.id,
      name: name.trim(),
      type,
      amount: cents,
      account_id: account.id,
      category_id: categoryId,
      frequency,
      next_date: date,
      anchor_day: anchor,
      active,
    });
    const done = initial.id ? 'Cambios guardados' : `${name.trim()} agregado`;
    toast(created > 0 ? `${done} · ${created === 1 ? '1 cobro registrado' : `${created} cobros registrados`}` : done);
    onClose();
  };

  const destroy = async () => {
    if (!initial.id) return;
    await remove.mutateAsync(initial.id);
    toast('Fijo eliminado');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      swipeToClose
      title={initial.id ? 'Editar fijo' : type === 'ingreso' ? 'Nuevo ingreso fijo' : 'Nuevo gasto fijo'}
      leading={
        <button type="button" className="min-h-11 text-body text-accent" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button
          type="button"
          className="press metal min-h-9 rounded-full px-4 text-body font-semibold disabled:bg-none disabled:bg-fill disabled:text-label-3 disabled:shadow-none"
          disabled={!valid || save.isPending}
          onClick={submit}
        >
          Guardar
        </button>
      }
    >
      <Segmented
        options={[
          { value: 'gasto', label: 'Gasto' },
          { value: 'ingreso', label: 'Ingreso' },
        ]}
        value={type}
        onChange={(t) => {
          if (t !== type) setCategoryId(null); // las categorías de gasto e ingreso son distintas
          setType(t);
        }}
      />

      <div className="mt-5">
        <AmountInput value={colones} onChange={setColones} autoFocus={!initial.id} tone={type === 'ingreso' ? 'ingreso' : undefined} />
      </div>

      <FormGroup className="mt-5">
        <FormRow label="Nombre" last>
          <TextInput value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={type === 'ingreso' ? 'Salario' : 'Alquiler'} />
        </FormRow>
      </FormGroup>

      <div className="mt-6">
        <FormHeader>Categoría</FormHeader>
        <CategoryGrid categories={cats} selected={categoryId} onSelect={setCategoryId} />
      </div>

      <div className="mt-6">
        <FormHeader>{type === 'ingreso' ? 'Entra a' : 'Se paga con'}</FormHeader>
        <AccountChips accounts={choices} selected={account?.id} onSelect={setAccountId} />
      </div>

      <div className="mt-6">
        <FormHeader>Se repite cada</FormHeader>
        <Segmented options={FREQ_OPTIONS} value={frequency} onChange={setFrequency} />
      </div>

      <FormGroup
        footer={
          <>
            <p>{scheduleLabel({ next_date: date, frequency, anchor_day: anchor })}.</p>
            {past ? (
              <p className="text-orange">La fecha ya pasó: al guardar se registran también los cobros desde entonces hasta hoy.</p>
            ) : (
              !initial.id && <p>Si este mes ya lo registraste a mano, elige la fecha del próximo cobro.</p>
            )}
          </>
        }
      >
        <FormRow label="Próximo cobro" last>
          <span className="relative inline-flex">
            <span className="rounded-[8px] bg-card-3 px-3 py-1.5 text-body">{date === today ? 'Hoy' : pillDate.format(parseDay(date))}</span>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Próximo cobro" className={PICKER_INPUT} />
          </span>
        </FormRow>
      </FormGroup>

      {initial.id && (
        <FormGroup footer="En pausa no se registra; lo que ya se registró no cambia.">
          <FormRow label="Activo" last>
            <span className="flex w-full justify-end">
              <Toggle checked={active} onChange={setActive} />
            </span>
          </FormRow>
        </FormGroup>
      )}

      {initial.id &&
        (confirmDelete ? (
          <div className="mt-6 rounded-[12px] bg-red/15 p-4">
            <p className="text-subhead">¿Eliminar este fijo? Los movimientos que ya registró se quedan.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="plain" className="flex-1" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 !bg-red" onClick={destroy} disabled={remove.isPending}>
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="destructive" className="mt-6 w-full" onClick={() => setConfirmDelete(true)}>
            Eliminar fijo
          </Button>
        ))}
    </Sheet>
  );
}
