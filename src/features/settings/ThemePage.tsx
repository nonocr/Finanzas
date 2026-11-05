import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Screen } from '../../components/ui';
import { isNative, platform } from '../../lib/native';
import { setTheme, useTheme } from '../../lib/theme';
import { THEMES, themeVars, type Theme } from '../../lib/themes';
import { BackLink } from './MorePage';

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
function ThemeCard({ theme, selected }: { theme: Theme; selected: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => setTheme(theme.id)}
      style={themeVars(theme.tokens) as CSSProperties}
      className={clsx(
        'press black-card relative flex aspect-[1.586] w-full flex-col justify-between rounded-[14px] p-3 text-left',
        selected && 'outline-2 outline-offset-2 outline-accent',
      )}
    >
      <Mark theme={theme} />
      {/* El chip de la tarjeta, en el metal de la acción de ese tema. */}
      <span className="metal block h-[20px] w-[28px] rounded-[5px]" aria-hidden="true" />
      <span className="engraved text-[12px] leading-4 font-semibold tracking-[0.12em] uppercase">{theme.name}</span>
      {selected && (
        <span className="metal absolute top-2.5 right-2.5 grid size-[22px] place-items-center rounded-full" aria-hidden="true">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function ThemePage() {
  const current = useTheme();
  const iconNote = !isNative
    ? ''
    : platform === 'ios'
      ? ' El ícono de la app cambia con la tarjeta; el iPhone te lo confirma con un aviso.'
      : ' El ícono de la app cambia con la tarjeta al salir de la app.';

  return (
    <Screen title="Tema" subtitle={<BackLink />}>
      <div role="radiogroup" aria-label="Tarjeta" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEMES.map((t) => (
          <ThemeCard key={t.id} theme={t} selected={t.id === current.id} />
        ))}
      </div>
      <p className="mt-4 px-1 text-footnote text-label-2">
        Cambia los grises y el metal de los botones. Los colores del presupuesto, los ingresos y las categorías no cambian.
        {iconNote}
      </p>
    </Screen>
  );
}
