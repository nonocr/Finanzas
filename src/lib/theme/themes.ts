// Temas «Tarjetas de metal»: la misma tarjeta en diez metales. Todos oscuros. Cambian el matiz de los grafitos y el
// metal de la acción; los colores con significado (presupuesto, ingresos, categorías) no cambian.
//
// Cada tema es una receta en OKLCH (skill oklch), no una lista de colores a ojo:
//   - Todos comparten la misma escalera de claridad (L) por papel: el fondo, las tarjetas, el texto y el metal se ven
//     igual de claros en cualquier tema, así que el contraste es el mismo en todos.
//   - El matiz (hue) es lo único que cambia de un tema a otro.
//   - El croma va como porcentaje del máximo de ese matiz (no un número fijo): el mismo «tinte 14 %» se ve igual de
//     teñido en dorado que en azul. Cerca del negro y del blanco el máximo es pequeño, así que el tinte baja solo.
//   - Los metales de color usan una claridad algo menor que los neutros: el color se percibe más brillante que el gris
//     a igual L, y además a L muy alta casi no cabe croma (el azul y el rosa saldrían blancos).
//
// Para agregar un tema: una línea en RECIPES, su ícono (scripts/iconos/temas-iconos.mjs y scripts/iconos/iconos.ps1) y su alias en
// AndroidManifest.xml, IconoAppPlugin.java y ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES. Las pruebas avisan si
// algo falta o si el contraste no alcanza.
import { css, hex, lchAt, type Lch } from './oklch.ts';

export type ThemeId =
  | 'negra'
  | 'carbono'
  | 'titanio'
  | 'oro'
  | 'oro-rosa'
  | 'cobre'
  | 'sakura'
  | 'amatista'
  | 'zafiro'
  | 'esmeralda';

/** Claridad (L de OKLCH) de cada papel. */
type Ladder = {
  bg: number;
  card: number;
  card2: number;
  card3: number;
  sep: number;
  /** Gris de barras sin significado (días pasados, «sin categoría»). */
  muted: number;
  /** Rellenos translúcidos (días futuros, interruptor apagado, tecla elegida); van al 14 % y 24 %. */
  fill: number;
  label: number;
  label2: number;
  label3: number;
  /** Cifras grabadas en la tarjeta. */
  engraved: number;
  /** El metal de la acción, su degradado pulido y el texto que va encima. */
  accent: number;
  metalHi: number;
  metalLo: number;
  onAccent: number;
  /**
   * Solo el platino de Negra: el centro del disco + se aclara hacia el blanco y el canto superior brilla en blanco.
   * En los metales de color ese blanco lava el color; ahí el brillo sale del propio metal.
   */
  platinum?: true;
  /** Ícono de la app: fondo y las tres barras (oscura, clara, media). */
  icon: { bg: number; dark: number; light: number; mid: number };
};

/** La escalera de la tarjeta Negra original, medida en OKLCH. */
const BASE: Omit<Ladder, 'accent' | 'metalHi' | 'metalLo'> = {
  bg: 0.115,
  card: 0.178,
  card2: 0.223,
  card3: 0.282,
  sep: 0.262,
  muted: 0.411,
  fill: 0.65,
  label: 0.944,
  // Subido de 0.688 (la Negra original) a 0.74: APCA 47 → 56 sobre las tarjetas; se lee mejor de pie en una tienda.
  label2: 0.74,
  label3: 0.61,
  engraved: 0.877,
  onAccent: 0.145,
  icon: { bg: 0.155, dark: 0.45, light: 0.93, mid: 0.7 },
};
const NEUTRAL: Ladder = { ...BASE, accent: 0.896, metalHi: 0.965, metalLo: 0.834, platinum: true };
// Más oscuros que el platino: a L alta el metal de color se lavaba hacia el blanco. metalLo no baja de 0.73 para que
// el texto oscuro de los botones conserve APCA ≥ 54.
const COLORED: Ladder = { ...BASE, accent: 0.82, metalHi: 0.865, metalLo: 0.73 };
/**
 * Metales de piedra y de cobre (Oro rosa, Cobre, Sakura, Amatista, Zafiro, Esmeralda): aún más bajos y con el
 * degradado más corto, porque a la claridad de COLORED se veían pastel. Llevan más croma en la receta: lo que hace
 * «claro» a un color es en buena parte que esté pálido. El borde oscuro (0.72) es el mínimo para el texto oscuro.
 */
const DEEP: Ladder = { ...BASE, accent: 0.785, metalHi: 0.815, metalLo: 0.72 };
/** Carbono: negro puro (en pantallas OLED los píxeles se apagan) y un grafito más bajo y apagado. */
const CARBON: Ladder = {
  ...COLORED,
  bg: 0,
  card: 0.15,
  card2: 0.195,
  card3: 0.255,
  sep: 0.235,
  label: 0.92,
  engraved: 0.82,
  accent: 0.79,
  metalHi: 0.84,
  metalLo: 0.72,
  icon: { bg: 0, dark: 0.38, light: 0.8, mid: 0.6 },
};

type Recipe = {
  id: ThemeId;
  name: string;
  /** Matiz en grados de OKLCH. */
  hue: number;
  /** Tinte de fondos y grises, en % del croma máximo. */
  tint: number;
  /** Intensidad del metal de la acción, en % del croma máximo: es lo que distingue un metal de otro. */
  metal: number;
  ladder: Ladder;
  /** Nombre del ícono alterno en iOS (Assets.xcassets) y del alias en Android; null = el ícono principal. */
  iconName: string | null;
};

// En el orden del selector: neutros, cálidos, fríos.
const RECIPES: Recipe[] = [
  { id: 'negra', name: 'Negra', hue: 286, tint: 3, metal: 8, ladder: NEUTRAL, iconName: null },
  { id: 'carbono', name: 'Carbono', hue: 286, tint: 0, metal: 0, ladder: CARBON, iconName: 'Carbono' },
  { id: 'titanio', name: 'Titanio', hue: 235, tint: 9, metal: 20, ladder: COLORED, iconName: 'Titanio' },
  // Oro (88°) queda lejos del ámbar del presupuesto (77°, mucho más intenso y más oscuro).
  { id: 'oro', name: 'Oro', hue: 88, tint: 14, metal: 45, ladder: COLORED, iconName: 'Oro' },
  // Los tres cálidos se separan entre sí (ΔE ≥ 0.06): Oro rosa es el rosa suave, Cobre el intenso entre el rosa y el
  // ámbar del presupuesto (77°, del que queda a 40°), Sakura el rosa frío de flor de cerezo.
  // Esmeralda no se puede apagar tanto como los otros: el salvia de los ingresos tiene su misma claridad y, apagada,
  // se le parecería. Por eso conserva más croma.
  { id: 'oro-rosa', name: 'Oro rosa', hue: 20, tint: 14, metal: 31, ladder: DEEP, iconName: 'OroRosa' },
  { id: 'cobre', name: 'Cobre', hue: 37, tint: 14, metal: 70, ladder: DEEP, iconName: 'Cobre' },
  { id: 'sakura', name: 'Sakura', hue: 342, tint: 14, metal: 47, ladder: DEEP, iconName: 'Sakura' },
  { id: 'amatista', name: 'Amatista', hue: 305, tint: 14, metal: 60, ladder: DEEP, iconName: 'Amatista' },
  { id: 'zafiro', name: 'Zafiro', hue: 264, tint: 14, metal: 47, ladder: DEEP, iconName: 'Zafiro' },
  // Esmeralda: jade (178°) intenso, para no confundirse con el salvia de los ingresos (152°, casi gris), que es de su familia.
  { id: 'esmeralda', name: 'Esmeralda', hue: 178, tint: 14, metal: 80, ladder: DEEP, iconName: 'Esmeralda' },
];

export type ThemeTokens = {
  bg: string;
  card: string;
  card2: string;
  card3: string;
  sep: string;
  fill: string;
  fill2: string;
  muted: string;
  label: string;
  label2: string;
  label3: string;
  engraved: string;
  accent: string;
  onAccent: string;
  metalHi: string;
  metalLo: string;
  /** Centro del disco + (el punto más claro del metal). */
  metalPeak: string;
  /** Canto superior que brilla en los botones de metal. */
  metalGlint: string;
};

export type Theme = {
  id: ThemeId;
  name: string;
  tokens: ThemeTokens;
  /** Los mismos colores en OKLCH numérico, para medir contraste. */
  lch: Record<Exclude<keyof ThemeTokens, 'fill' | 'fill2' | 'metalPeak' | 'metalGlint'>, Lch>;
  /** Fondo en hex: la barra del navegador (meta theme-color) no entiende oklch en todos lados. */
  bgHex: string;
  /** Ícono de la app en hex (lo dibujan scripts/iconos/iconos.ps1 y Xcode/Android): fondo y barras oscura, clara, media. */
  icon: { bg: string; bars: [string, string, string] };
  iconName: string | null;
};

function build(r: Recipe): Theme {
  const L = r.ladder;
  const at = (l: number, pct: number) => lchAt(l, Math.min(pct, 95), r.hue);
  const surface = (l: number) => at(l, r.tint);
  const text = (l: number) => at(l, r.tint * 0.7);
  const lch = {
    bg: surface(L.bg),
    card: surface(L.card),
    card2: surface(L.card2),
    card3: surface(L.card3),
    sep: surface(L.sep),
    muted: surface(L.muted),
    label: text(L.label),
    label2: text(L.label2),
    label3: text(L.label3),
    engraved: text(L.engraved),
    accent: at(L.accent, r.metal),
    metalHi: at(L.metalHi, r.metal * (L.platinum ? 0.8 : 0.9)),
    metalLo: at(L.metalLo, r.metal * 1.15),
    // El texto sobre el metal lleva un poco de su matiz: se ve grabado en ese metal, no gris encima.
    onAccent: at(L.onAccent, r.tint * 2),
  };
  const fill = surface(L.fill);
  const tokens = Object.fromEntries(Object.entries(lch).map(([k, v]) => [k, css(v)])) as Omit<
    ThemeTokens,
    'fill' | 'fill2' | 'metalPeak' | 'metalGlint'
  >;
  const metalPeak = L.platinum ? css(at(0.985, r.metal * 0.5)) : css(lch.metalHi);
  const metalGlint = L.platinum ? 'oklch(1 0 0 / 0.85)' : css(at(Math.min(L.metalHi + 0.06, 0.95), r.metal * 0.6), 0.7);
  return {
    id: r.id,
    name: r.name,
    tokens: { ...tokens, fill: css(fill, 0.14), fill2: css(fill, 0.24), metalPeak, metalGlint },
    lch,
    bgHex: hex(lch.bg),
    icon: {
      bg: hex(surface(L.icon.bg)),
      bars: [hex(at(L.icon.dark, r.metal * 0.7)), hex(at(L.icon.light, r.metal * 0.8)), hex(at(L.icon.mid, r.metal * 1.1))],
    },
    iconName: r.iconName,
  };
}

export const THEMES: Theme[] = RECIPES.map(build);

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
    '--color-fill': t.fill,
    '--color-fill-2': t.fill2,
    '--color-label': t.label,
    '--color-label-2': t.label2,
    '--color-label-3': t.label3,
    '--color-accent': t.accent,
    '--color-on-accent': t.onAccent,
    '--color-metal-hi': t.metalHi,
    '--color-metal-lo': t.metalLo,
    '--color-metal-peak': t.metalPeak,
    '--color-metal-glint': t.metalGlint,
    '--color-engraved': t.engraved,
    '--color-muted': t.muted,
  };
}
