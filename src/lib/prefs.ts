// Preferencias de la persona (Ajustes): se guardan en su cuenta (tabla user_settings) para que la app se vea igual en
// cualquier dispositivo, y con una copia en este teléfono para aplicarlas antes del primer pintado (el tema y el modo
// discreto no pueden esperar a la red: los montos no deben verse ni un instante si el modo discreto está activo).
import { DEFAULT_THEME, themeById, type ThemeId } from './themes';

/** Secciones del Resumen que se pueden ordenar y ocultar (la tarjeta del periodo va siempre arriba). */
export const HOME_SECTIONS = ['semana', 'recientes', 'categorias', 'presupuestos'] as const;
export type HomeSection = (typeof HOME_SECTIONS)[number];

export const HOME_SECTION_LABEL: Record<HomeSection, string> = {
  semana: 'Esta semana',
  recientes: 'Recientes',
  categorias: 'Por categoría',
  presupuestos: 'Presupuestos',
};

/** Qué cifra lleva en grande la tarjeta del Resumen. */
export type CardFigure = 'gastado' | 'disponible' | 'balance';
export const CARD_FIGURE_LABEL: Record<CardFigure, string> = {
  gastado: 'Lo gastado',
  disponible: 'Lo que queda del presupuesto',
  balance: 'El balance (ingresos menos gastos)',
};

export type HomeLayout = {
  /** Orden de todas las secciones; las ocultas siguen aquí para recordar su lugar. */
  order: HomeSection[];
  hidden: HomeSection[];
  /** Los pagos de Wallet por revisar, arriba de todo. */
  showPending: boolean;
  card: CardFigure;
};

export type Prefs = {
  theme: ThemeId;
  /** Montos difuminados hasta tocarlos. */
  discreet: boolean;
  home: HomeLayout;
};

export const DEFAULT_PREFS: Prefs = {
  theme: DEFAULT_THEME,
  discreet: false,
  home: { order: [...HOME_SECTIONS], hidden: ['presupuestos'], showPending: true, card: 'gastado' },
};

const isSection = (v: unknown): v is HomeSection => HOME_SECTIONS.includes(v as HomeSection);

/**
 * Completa y valida lo que venga (de la base, de este teléfono o de una versión vieja de la app): lo desconocido se
 * ignora y lo que falta toma el valor por defecto. Una sección nueva de una versión futura aparece al final.
 */
export function normalizePrefs(raw: unknown): Prefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const h = (r.home && typeof r.home === 'object' ? r.home : {}) as Record<string, unknown>;
  const order = Array.isArray(h.order) ? [...new Set(h.order.filter(isSection))] : [];
  for (const s of HOME_SECTIONS) if (!order.includes(s)) order.push(s);
  const hidden = Array.isArray(h.hidden) ? [...new Set(h.hidden.filter(isSection))] : DEFAULT_PREFS.home.hidden;
  const card = h.card === 'disponible' || h.card === 'balance' ? h.card : 'gastado';
  return {
    theme: themeById(typeof r.theme === 'string' ? r.theme : null).id,
    discreet: r.discreet === true,
    home: { order, hidden, showPending: h.showPending !== false, card },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Copia en este teléfono
// ---------------------------------------------------------------------------------------------------------------

export const PREFS_KEY = 'finanzas-prefs';

export function readLocalPrefs(): Prefs {
  try {
    return normalizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}'));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writeLocalPrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    // modo privado: valen mientras la app siga abierta
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Modo discreto
// ---------------------------------------------------------------------------------------------------------------
// Con <html data-discreet>, src/index.css difumina los montos (.tnum) fuera de las hojas. Tocar uno los muestra todos
// por un minuto (y ese toque no abre nada); al salir de la app o pasado el minuto se vuelven a ocultar.

const REVEAL_MS = 60_000;
let revealTimer: ReturnType<typeof setTimeout> | undefined;

function hideAgain() {
  clearTimeout(revealTimer);
  delete document.documentElement.dataset.revealed;
}

export function applyDiscreet(on: boolean) {
  const root = document.documentElement;
  if (on) root.dataset.discreet = '';
  else delete root.dataset.discreet;
  hideAgain();
}

let listening = false;
function listenForReveal() {
  if (listening) return;
  listening = true;
  document.addEventListener(
    'click',
    (e) => {
      const root = document.documentElement;
      if (!('discreet' in root.dataset) || 'revealed' in root.dataset) return;
      const target = e.target instanceof Element ? e.target : null;
      if (!target?.closest('.tnum:not(.not-money)') || target.closest('[role="dialog"]')) return;
      // Este toque solo descubre los montos: no abre el movimiento ni navega.
      e.preventDefault();
      e.stopPropagation();
      root.dataset.revealed = '';
      clearTimeout(revealTimer);
      revealTimer = setTimeout(hideAgain, REVEAL_MS);
    },
    true,
  );
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hideAgain();
  });
}

/** Antes de montar React: modo discreto según la copia local (el tema lo aplica theme.ts). */
export function startPrefs() {
  applyDiscreet(readLocalPrefs().discreet);
  listenForReveal();
}
