import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Segmented } from '../../components/motion';
import { CATEGORY_COLORS, ICONS } from '../../components/palette';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Button, CategoryIcon, Row, Screen, Section } from '../../components/ui';
import { api } from '../../lib/api';
import { useArchivedCategories, useCategories, useDeleteCategory, useSaveCategory } from '../../lib/queries';
import type { Category, CategoryKind } from '../../lib/types';
import { BackLink } from './MorePage';
import { FormGroup, FormRow, TextInput } from './form';

export function CategoriesPage() {
  const { data: categories = [] } = useCategories();
  const { data: archived = [] } = useArchivedCategories();
  const [kind, setKind] = useState<CategoryKind>('gasto');
  const [editing, setEditing] = useState<{ cat: Partial<Category>; key: number } | null>(null);
  const [open, setOpen] = useState(false);
  const list = categories.filter((c) => c.kind === kind);
  const archivedList = archived.filter((c) => c.kind === kind);

  const openEditor = (cat: Partial<Category>) => {
    setEditing((prev) => ({ cat, key: (prev?.key ?? 0) + 1 }));
    setOpen(true);
  };

  return (
    <Screen title="Categorías" subtitle={<BackLink />}>
      <Segmented
        options={[
          { value: 'gasto', label: 'Gastos' },
          { value: 'ingreso', label: 'Ingresos' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Section className="mt-4">
        {list.map((c) => (
          <Row key={c.id} onClick={() => openEditor(c)} leading={<CategoryIcon icon={c.icon} color={c.color} />} title={c.name} chevron />
        ))}
      </Section>
      <Button variant="tinted" className="mt-6 w-full" onClick={() => openEditor({ kind, icon: 'ellipsis', color: 'c10' })}>
        Nueva categoría
      </Button>

      {archivedList.length > 0 && (
        <Section header="Archivadas" footer="No aparecen al registrar movimientos. Tócalas para reactivarlas o eliminarlas.">
          {archivedList.map((c) => (
            <Row
              key={c.id}
              onClick={() => openEditor(c)}
              leading={
                <span className="opacity-50">
                  <CategoryIcon icon={c.icon} color={c.color} />
                </span>
              }
              title={<span className="text-label-2">{c.name}</span>}
              chevron
            />
          ))}
        </Section>
      )}
      {editing && <CategorySheet key={editing.key} open={open} initial={editing.cat} onClose={() => setOpen(false)} />}
    </Screen>
  );
}

function CategorySheet({ open, initial, onClose }: { open: boolean; initial: Partial<Category>; onClose: () => void }) {
  const save = useSaveCategory();
  const toast = useToast();
  const [cat, setCat] = useState<Partial<Category>>(initial);
  const set = (patch: Partial<Category>) => setCat((c) => ({ ...c, ...patch }));

  const submit = async () => {
    try {
      await save.mutateAsync({ ...cat, name: cat.name?.trim() });
      toast(initial.id ? 'Categoría actualizada' : 'Categoría creada');
      onClose();
    } catch {
      toast('Ya existe una categoría con ese nombre');
    }
  };

  const remove = useDeleteCategory();
  // Borrar es definitivo: el primer toque muestra cuántos movimientos quedarían sin categoría.
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const setArchived = async (archived: boolean) => {
    await save.mutateAsync({ id: initial.id, archived });
    toast(archived ? 'Categoría archivada' : 'Categoría reactivada');
    onClose();
  };

  const askDelete = async () => setConfirmDelete(await api.countCategoryUse(initial.id!));

  const destroy = async () => {
    await remove.mutateAsync(initial.id!);
    toast('Categoría eliminada');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial.id ? 'Editar categoría' : 'Nueva categoría'}
      leading={
        <button type="button" className="min-h-11 text-body text-blue" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button
          type="button"
          className="press min-h-9 rounded-full bg-blue px-4 text-body font-semibold text-white disabled:bg-fill disabled:text-label-3"
          disabled={!cat.name?.trim() || save.isPending}
          onClick={submit}
        >
          Guardar
        </button>
      }
    >
      <div className="flex justify-center py-4">
        <CategoryIcon icon={cat.icon ?? null} color={cat.color ?? null} size={64} />
      </div>
      <FormGroup>
        <FormRow label="Nombre" last>
          <TextInput value={cat.name ?? ''} maxLength={60} onChange={(e) => set({ name: e.target.value })} placeholder="Mascotas" />
        </FormRow>
      </FormGroup>

      <p className="mt-5 mb-2 px-1 text-footnote font-semibold text-label-2 uppercase">Color</p>
      <div className="grid grid-cols-5 gap-3 rounded-[12px] bg-card-2 p-4">
        {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
          <button
            key={key}
            type="button"
            aria-label={`Color ${key}`}
            aria-pressed={cat.color === key}
            onClick={() => set({ color: key })}
            className="press grid aspect-square place-items-center rounded-full"
            style={{ background: color }}
          >
            {cat.color === key && <Check size={20} strokeWidth={3} className="text-white" />}
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 px-1 text-footnote font-semibold text-label-2 uppercase">Ícono</p>
      <div className="grid grid-cols-6 gap-2 rounded-[12px] bg-card-2 p-3">
        {Object.entries(ICONS).map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={cat.icon === name}
            onClick={() => set({ icon: name })}
            className={clsx(
              'press grid aspect-square place-items-center rounded-[10px]',
              cat.icon === name ? 'bg-label text-black' : 'text-label-2',
            )}
          >
            <Icon size={22} strokeWidth={2} />
          </button>
        ))}
      </div>

      {initial.id && (
        <div className="mt-6 space-y-3">
          {initial.archived ? (
            <Button variant="tinted" className="w-full" onClick={() => setArchived(false)}>
              Reactivar categoría
            </Button>
          ) : (
            <Button variant="tinted" className="w-full" onClick={() => setArchived(true)}>
              Archivar
            </Button>
          )}
          {confirmDelete === null ? (
            <Button variant="destructive" className="w-full" onClick={askDelete}>
              Eliminar del todo
            </Button>
          ) : (
            <div className="rounded-[12px] bg-red/15 p-4">
              <p className="text-subhead">
                {confirmDelete === 0
                  ? 'No tiene movimientos. Se borrará junto con su presupuesto y sus reglas.'
                  : `${confirmDelete} ${confirmDelete === 1 ? 'movimiento quedará' : 'movimientos quedarán'} sin categoría; no se borran. Su presupuesto y sus reglas sí se borran.`}{' '}
                Esto no se puede deshacer.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="plain" className="flex-1" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </Button>
                <Button className="flex-1 !bg-red" onClick={destroy} disabled={remove.isPending}>
                  Eliminar
                </Button>
              </div>
            </div>
          )}
          <p className="px-1 text-footnote text-label-2">
            Archivar la oculta pero conserva su historial; puedes reactivarla cuando quieras.
          </p>
        </div>
      )}
    </Sheet>
  );
}
