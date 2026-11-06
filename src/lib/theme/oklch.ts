// OKLCH: espacio de color perceptual (misma L = misma claridad a la vista, en cualquier matiz). Los temas se
// calculan aquí (src/lib/theme/themes.ts). Conversión de Björn Ottosson; contraste WCAG 2 y APCA-W3 0.0.98G-4g.
// Sin dependencias ni DOM: lo usan la app, las pruebas y scripts de Node (scripts/iconos/temas-iconos.mjs).

export type Lch = [l: number, c: number, h: number];
type Rgb = [number, number, number];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function linearRgb([L, C, H]: Lch): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (lch: Lch) => linearRgb(lch).every((c) => c >= -1e-6 && c <= 1 + 1e-6);

/** Croma máximo que cabe en sRGB para esa claridad y matiz. */
export function maxChroma(l: number, h: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut([l, mid, h])) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Color con un porcentaje del croma máximo de su matiz: la misma intensidad relativa en todos los matices. */
export function lchAt(l: number, chromaPct: number, h: number): Lch {
  return [l, (chromaPct / 100) * maxChroma(l, h), h];
}

const num = (x: number, digits: number) => {
  const s = x.toFixed(digits).replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
};

/** `oklch(L C H)` con 3 decimales en L y C (convención de la skill oklch). */
export function css([l, c, h]: Lch, alpha?: number): string {
  const body = c < 0.0005 ? `${num(l, 3)} 0 0` : `${num(l, 3)} ${num(c, 3)} ${num(h, 1)}`;
  return alpha === undefined ? `oklch(${body})` : `oklch(${body} / ${alpha})`;
}

/** Lee `oklch(L C H)` (el formato de css()). */
export function parse(value: string): Lch {
  const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)/.exec(value);
  if (!m) throw new Error(`No es oklch(): ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** De hex sRGB a OKLCH (para comparar con los colores fijos con significado: presupuesto, ingresos). */
export function fromHex(value: string): Lch {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(value.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const H = (Math.atan2(B, A) * 180) / Math.PI;
  return [L, Math.hypot(A, B), H < 0 ? H + 360 : H];
}

/** Distancia perceptual (ΔE en OKLab): ~0.02 apenas se nota; desde ~0.1 son colores claramente distintos. */
export function distance([l1, c1, h1]: Lch, [l2, c2, h2]: Lch): number {
  const ab = (c: number, h: number) => [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
  const [a1, b1] = ab(c1, h1);
  const [a2, b2] = ab(c2, h2);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function rgb(lch: Lch): Rgb {
  return linearRgb(lch).map((c) => Math.min(1, Math.max(0, toGamma(c)))) as Rgb;
}

/** Hex sRGB: para lo que no entiende oklch (meta theme-color, íconos nativos). */
export function hex(lch: Lch): string {
  return '#' + rgb(lch).map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
}

function luminance(lch: Lch) {
  const [r, g, b] = rgb(lch).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste WCAG 2 (1 a 21). */
export function wcag(a: Lch, b: Lch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Contraste APCA |Lc| (0 a ~106): texto normal pasa con 60, grande con 45, elementos de interfaz con 30. */
export function apca(text: Lch, background: Lch): number {
  const y = (lch: Lch) => {
    const [r, g, b] = rgb(lch).map((c) => c ** 2.4);
    const v = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
    return v > 0.022 ? v : v + (0.022 - v) ** 1.414;
  };
  const yt = y(text);
  const yb = y(background);
  if (Math.abs(yb - yt) < 0.0005) return 0;
  if (yb > yt) {
    const c = (yb ** 0.56 - yt ** 0.57) * 1.14;
    return c < 0.1 ? 0 : (c - 0.027) * 100;
  }
  const c = (yb ** 0.65 - yt ** 0.62) * 1.14;
  return c > -0.1 ? 0 : -(c + 0.027) * 100;
}
