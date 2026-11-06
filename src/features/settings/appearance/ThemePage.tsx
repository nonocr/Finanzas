import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Screen } from '../../../components/ui';
import { useT } from '../../../i18n';
import { isNative, platform } from '../../../lib/platform/native';
import { useTheme } from '../../../lib/theme/theme';
import { useSavePrefs } from '../../../lib/prefs/usePrefs';
import { THEMES, themeVars, type Theme } from '../../../lib/theme/themes';
import { BackLink } from '../MorePage';

/** Las tres barras del ícono de la app, en los colores del ícono de ese tema. */
function Mark({ theme }: { theme: Theme }) {
  const [dark, light, mid] = theme.icon.bars;
  return (
    <svg viewBox="15 9 34 37" className="h-[22px] w-auto self-start" aria-hidden="true">
      <rect x="15" y="22" width="9" height="24" rx="2.5" fill={dark} />
      <rect x="27.5" y="9" width="9" height="37" rx="2.5" fill={light} />
      <rect x="40" y="17" width="9" height="29" rx="2.5" fill={mid} />
    </svg>
  );
}

/** Cada tema es una tarjeta en miniatura pintada con sus propios colores (las variables viven en el botón). */
function ThemeCard({ theme, selected, onPick }: { theme: Theme; selected: boolean; onPick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onPick}
      style={themeVars(theme.tokens) as CSSProperties}
      className={clsx(
        'press black-card relative flex aspect-[1.586] w-full flex-col justify-between rounded-[14px] p-3 text-left',
        selected && 'outline-2 outline-offset-2 outline-accent',
      )}
    >
      <Mark theme={theme} />
      {/* El chip de la tarjeta, en el metal de la acción de ese tema. */}
      <span className="metal block h-[20px] w-[28px] rounded-[5px]" aria-hidden="true" />
      <span className="engraved text-[12px] leading-4 font-semibold tracking-[0.12em] uppercase">{t.appearance.themes[theme.id]}</span>
      {selected && (
        <span className="metal absolute top-2.5 right-2.5 grid size-[22px] place-items-center rounded-full" aria-hidden="true">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function ThemePage() {
  const t = useT();
  const current = useTheme();
  const save = useSavePrefs();
  const iconNote = !isNative ? '' : platform === 'ios' ? t.appearance.iconNoteIos : t.appearance.iconNoteAndroid;

  return (
    <Screen title={t.appearance.themeTitle} subtitle={<BackLink />}>
      <div role="radiogroup" aria-label={t.appearance.card} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEMES.map((th) => (
          <ThemeCard key={th.id} theme={th} selected={th.id === current.id} onPick={() => save.mutate({ theme: th.id })} />
        ))}
      </div>
      <p className="mt-4 px-1 text-footnote text-label-2">
        {t.appearance.themeNote}
        {iconNote}
      </p>
    </Screen>
  );
}
