// Temas «Tarjetas de metal»: la misma tarjeta negra en seis metales. Todos oscuros. Cambia el matiz de los grafitos y
// el metal de la acción (accent); los colores con significado (presupuesto, ingresos, categorías) no cambian.
//
// Los valores de «negra» repiten los de @theme en src/index.css (el primer pintado, antes de que corra JS).
// Los colores del ícono los usa también scripts/iconos.ps1 para dibujar los íconos de iOS y Android: si cambian,
// actualízalos allá y vuelve a generarlos.

export type ThemeId = 'negra' | 'titanio' | 'oro' | 'oro-rosa' | 'zafiro' | 'esmeralda';

export type ThemeTokens = {
  bg: string;
  card: string;
  card2: string;
  card3: string;
  sep: string;
  /** Rellenos translúcidos (r g b, sin alfa): días futuros, interruptor apagado, tecla elegida. */
  fillRgb: string;
  label: string;
  label2: string;
  label3: string;
  /** El metal de la acción y el texto que va encima. */
  accent: string;
  onAccent: string;
  /** Degradado del metal pulido (botones, píldora de guardar, disco de agregar). */
  metalHi: string;
  metalLo: string;
  /** Cifras grabadas en la tarjeta. */
  engraved: string;
  /** Gris neutro de barras sin significado (días pasados, «sin categoría», «otro»). */
  muted: string;
};

export type Theme = {
  id: ThemeId;
  name: string;
  tokens: ThemeTokens;
  /** Ícono de la app: fondo y las tres barras (oscura, clara, media), como en public/favicon.svg. */
  icon: { bg: string; bars: [string, string, string] };
  /** Nombre del ícono alterno en iOS (Assets.xcassets) y del alias en Android; null = el ícono principal. */
  iconName: string | null;
};

export const THEMES: Theme[] = [
  {
    id: 'negra',
    name: 'Negra',
    tokens: {
      bg: '#050505',
      card: '#111112',
      card2: '#1b1b1d',
      card3: '#29292c',
      sep: '#242427',
      fillRgb: '150 150 160',
      label: '#ececef',
      label2: '#9a9aa1',
      label3: '#7c7c83',
      accent: '#dcdce0',
      onAccent: '#0a0a0b',
      metalHi: '#f3f3f5',
      metalLo: '#c8c8cd',
      engraved: '#d6d6da',
      muted: '#4a4a4f',
    },
    icon: { bg: '#0b0b0c', bars: ['#54545a', '#e8e8ec', '#96969e'] },
    iconName: null,
  },
  {
    id: 'titanio',
    name: 'Titanio',
    tokens: {
      bg: '#040506',
      card: '#0f1113',
      card2: '#191c1f',
      card3: '#272a2e',
      sep: '#222529',
      fillRgb: '140 155 170',
      label: '#eaeef2',
      label2: '#98a0a8',
      label3: '#7a828b',
      accent: '#c9d1da',
      onAccent: '#090b0d',
      metalHi: '#eef2f6',
      metalLo: '#aeb8c3',
      engraved: '#d3d9df',
      muted: '#474c53',
    },
    icon: { bg: '#0a0c0e', bars: ['#4e565f', '#e6ecf2', '#9aa5b1'] },
    iconName: 'Titanio',
  },
  {
    id: 'oro',
    name: 'Oro',
    tokens: {
      bg: '#060504',
      card: '#12100d',
      card2: '#1d1a16',
      card3: '#2b2721',
      sep: '#26221d',
      fillRgb: '170 155 130',
      label: '#f0ece4',
      label2: '#a59d90',
      label3: '#867e72',
      // Champán pálido: más claro y menos saturado que el ámbar del presupuesto (#d4a04c), para no confundirse.
      accent: '#dcc896',
      onAccent: '#171207',
      metalHi: '#f3e6c4',
      metalLo: '#c3a86f',
      engraved: '#e0d6c2',
      muted: '#514a3f',
    },
    icon: { bg: '#0d0b08', bars: ['#6a5a3c', '#f0dfb5', '#c4a86c'] },
    iconName: 'Oro',
  },
  {
    id: 'oro-rosa',
    name: 'Oro rosa',
    tokens: {
      bg: '#060504',
      card: '#131010',
      card2: '#1e1a1a',
      card3: '#2c2627',
      sep: '#282223',
      fillRgb: '170 145 140',
      label: '#f2ebea',
      label2: '#a89a98',
      label3: '#897c7a',
      accent: '#e2bdb0',
      onAccent: '#1a0f0b',
      metalHi: '#f6dcd2',
      metalLo: '#c79686',
      engraved: '#e2d3cf',
      muted: '#524645',
    },
    icon: { bg: '#0e0b0a', bars: ['#6b5049', '#f3d9cf', '#c99a8c'] },
    iconName: 'OroRosa',
  },
  {
    id: 'zafiro',
    name: 'Zafiro',
    tokens: {
      bg: '#03050a',
      card: '#0d111a',
      card2: '#161b26',
      card3: '#222937',
      sep: '#1e2431',
      fillRgb: '130 150 190',
      label: '#e9edf5',
      label2: '#959db0',
      label3: '#778094',
      accent: '#b8c8e8',
      onAccent: '#070d1c',
      metalHi: '#e1e8f8',
      metalLo: '#91a6d0',
      engraved: '#d1d9ea',
      muted: '#3f4758',
    },
    icon: { bg: '#080b12', bars: ['#3f4c68', '#dfe7f8', '#8ea3cf'] },
    iconName: 'Zafiro',
  },
  {
    id: 'esmeralda',
    name: 'Esmeralda',
    tokens: {
      bg: '#030605',
      card: '#0d1311',
      card2: '#151d1a',
      card3: '#212b27',
      sep: '#1d2622',
      fillRgb: '130 170 155',
      label: '#e8f0ed',
      label2: '#93a39d',
      label3: '#76857f',
      // Jade claro y frío: se separa del salvia de los ingresos (#a9bfae), que es gris y cálido.
      accent: '#b0e0d0',
      onAccent: '#06130e',
      metalHi: '#d9f2e8',
      metalLo: '#83bba5',
      engraved: '#cfe0d9',
      muted: '#3d4a45',
    },
    icon: { bg: '#070c0a', bars: ['#3c5a4e', '#d6efe4', '#82b7a0'] },
    iconName: 'Esmeralda',
  },
];

export const DEFAULT_THEME: ThemeId = 'negra';

export function themeById(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Variables CSS de un tema: en <html> cambian toda la app; en un elemento, solo ese elemento (la vista previa). */
export function themeVars(t: ThemeTokens): Record<string, string> {
  return {
    '--color-bg': t.bg,
    '--color-card': t.card,
    '--color-card-2': t.card2,
    '--color-card-3': t.card3,
    '--color-sep': t.sep,
    '--color-fill': `rgb(${t.fillRgb} / 0.14)`,
    '--color-fill-2': `rgb(${t.fillRgb} / 0.24)`,
    '--color-label': t.label,
    '--color-label-2': t.label2,
    '--color-label-3': t.label3,
    '--color-accent': t.accent,
    '--color-on-accent': t.onAccent,
    '--color-metal-hi': t.metalHi,
    '--color-metal-lo': t.metalLo,
    '--color-engraved': t.engraved,
    '--color-muted': t.muted,
  };
}
