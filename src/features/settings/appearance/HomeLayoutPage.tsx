import clsx from 'clsx';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Row, Screen, Section } from '../../../components/ui';
import { useT } from '../../../i18n';
import { CARD_FIGURES, type HomeLayout, type HomeSection } from '../../../lib/prefs/prefs';
import { usePrefs, useSavePrefs } from '../../../lib/prefs/usePrefs';
import { Toggle } from '../../transactions/TransactionSheet';
import { BackLink } from '../MorePage';

/** Botón cuadrado de 44 px para subir o bajar una sección. */
function MoveButton({ dir, disabled, label, onClick }: { dir: 'up' | 'down'; disabled: boolean; label: string; onClick: () => void }) {
  const Icon = dir === 'up' ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="press grid size-11 place-items-center rounded-[10px] text-accent disabled:text-label-3 disabled:opacity-40"
    >
      <Icon size={20} strokeWidth={2.25} />
    </button>
  );
}

/** Ajustes → Resumen: qué secciones ver, en qué orden, y qué cifra lleva la tarjeta. Se guarda en la cuenta. */
export function HomeLayoutPage() {
  const t = useT();
  const layout = usePrefs().home;
  const save = useSavePrefs();
  const update = (patch: Partial<HomeLayout>) => save.mutate({ home: { ...layout, ...patch } });

  const move = (section: HomeSection, delta: -1 | 1) => {
    const order = [...layout.order];
    const i = order.indexOf(section);
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    update({ order });
  };
  const setVisible = (section: HomeSection, visible: boolean) =>
    update({ hidden: visible ? layout.hidden.filter((s) => s !== section) : [...layout.hidden, section] });

  return (
    <Screen title={t.appearance.homeTitle} subtitle={<BackLink />}>
      <Section header={t.appearance.cardShows} footer={t.appearance.cardShowsFooter}>
        <div role="radiogroup" aria-label={t.appearance.cardShows}>
          {CARD_FIGURES.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={layout.card === f}
              onClick={() => update({ card: f })}
              className="group flex w-full items-center gap-3 pl-4 text-left transition-colors active:bg-card-2"
            >
              <span className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                <span className="min-w-0 flex-1 text-body">{t.appearance.cardFigures[f]}</span>
                <Check size={20} strokeWidth={2.5} className={clsx('shrink-0 text-accent', layout.card !== f && 'invisible')} />
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section header={t.appearance.sectionsHeader} footer={t.appearance.sectionsFooter}>
        {layout.order.map((s, i) => {
          const visible = !layout.hidden.includes(s);
          const label = t.appearance.sections[s];
          return (
            <div key={s} className="group flex items-center gap-1 pl-4">
              <span className="flex min-h-[52px] min-w-0 flex-1 items-center gap-1 pr-3 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                <span className={clsx('min-w-0 flex-1 truncate text-body', !visible && 'text-label-3')}>{label}</span>
                <MoveButton dir="up" disabled={i === 0} label={t.appearance.moveUp(label)} onClick={() => move(s, -1)} />
                <MoveButton dir="down" disabled={i === layout.order.length - 1} label={t.appearance.moveDown(label)} onClick={() => move(s, 1)} />
                <span className="ml-2">
                  <Toggle checked={visible} onChange={(v) => setVisible(s, v)} label={t.appearance.show(label)} />
                </span>
              </span>
            </div>
          );
        })}
      </Section>

      <Section footer={t.appearance.pendingFooter}>
        <Row
          title={t.appearance.pending}
          trailing={<Toggle checked={layout.showPending} onChange={(v) => update({ showPending: v })} label={t.appearance.showPending} />}
        />
      </Section>
    </Screen>
  );
}
