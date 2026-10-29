import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryGrid } from '../../components/CategoryGrid';
import { useToast } from '../../components/Toast';
import { Button, CategoryIcon, EmptyState, Screen, Section } from '../../components/ui';
import { useCategories, useDeleteMerchantRule, useMerchantRules, useSaveMerchantRule } from '../../lib/queries';
import { BackLink } from './MorePage';
import { FormGroup, FormRow, TextInput } from './form';

export function RulesPage() {
  const { data: rules = [] } = useMerchantRules();
  const { data: categories = [] } = useCategories();
  const save = useSaveMerchantRule();
  const remove = useDeleteMerchantRule();
  const toast = useToast();
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const [pattern, setPattern] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const expenseCats = categories.filter((c) => c.kind === 'gasto' && !c.parent_id);

  const add = () => {
    if (!pattern.trim() || !categoryId) return;
    save.mutate({ pattern: pattern.trim().toUpperCase(), category_id: categoryId });
    setPattern('');
    setCategoryId(null);
    toast('Regla guardada');
  };

  return (
    <Screen title="Reglas" subtitle={<BackLink />}>
      <p className="px-1 text-subhead text-label-2">
        Cuando un pago de Wallet trae un comercio que contiene el texto, se le asigna la categoría automáticamente.
      </p>

      <Section header="Nueva regla">
        <div className="p-4">
          <FormGroup>
            <FormRow label="Comercio" last>
              <TextInput value={pattern} maxLength={100} onChange={(e) => setPattern(e.target.value)} placeholder="AUTOMERCADO" />
            </FormRow>
          </FormGroup>
          <p className="mt-4 mb-2 px-1 text-footnote font-semibold text-label-2 uppercase">Asignar a</p>
          <CategoryGrid categories={expenseCats} selected={categoryId} onSelect={setCategoryId} />
          <Button className="mt-4 w-full" disabled={!pattern.trim() || !categoryId || save.isPending} onClick={add}>
            Guardar regla
          </Button>
        </div>
      </Section>

      <Section header="Reglas activas">
        {rules.length === 0 ? (
          <EmptyState title="Aún no hay reglas" body="También puedes crearlas al confirmar un pago de Wallet." />
        ) : (
          rules.map((r) => {
            const c = catMap.get(r.category_id);
            return (
              <div key={r.id} className="group flex items-center gap-3 pl-4">
                <CategoryIcon icon={c?.icon ?? null} color={c?.color ?? null} />
                <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 py-1.5 pr-1 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold">{r.pattern}</span>
                    <span className="block text-subhead text-label-2">{c?.name ?? 'Categoría archivada'}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Borrar regla ${r.pattern}`}
                    onClick={() => remove.mutate(r.id)}
                    className="grid size-11 place-items-center text-red"
                  >
                    <Trash2 size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </Section>
    </Screen>
  );
}
