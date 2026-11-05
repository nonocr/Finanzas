// Tema elegido: se guarda en este teléfono y se aplica a <html> antes del primer pintado (main.tsx), así la app no
// parpadea con la tarjeta Negra al abrir. En la app nativa también cambia el ícono (IconoApp, código propio en
// ios/App/App/IconoApp.swift y android/…/IconoAppPlugin.java).
import { registerPlugin } from '@capacitor/core';
import { useSyncExternalStore } from 'react';
import { isNative } from './native';
import { DEFAULT_THEME, themeById, themeVars, type Theme, type ThemeId } from './themes';

const KEY = 'finanzas-theme';

function stored(): ThemeId {
  try {
    return themeById(localStorage.getItem(KEY)).id;
  } catch {
    return DEFAULT_THEME;
  }
}

let current: ThemeId = stored();
const listeners = new Set<() => void>();

function apply(theme: Theme) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(themeVars(theme.tokens))) root.style.setProperty(name, value);
  root.dataset.theme = theme.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.tokens.bg);
}

/** Antes de montar React: pinta la app con el tema guardado. */
export function startTheme() {
  apply(themeById(current));
}

interface IconoAppPlugin {
  /** null = el ícono principal. En Android se aplica al salir de la app; iOS lo cambia ya y muestra su aviso. */
  cambiar(options: { nombre: string | null }): Promise<{ cambiado: boolean }>;
}
const IconoApp = registerPlugin<IconoAppPlugin>('IconoApp');

export function setTheme(id: ThemeId) {
  if (id === current) return;
  current = id;
  const theme = themeById(id);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // modo privado: vale solo mientras la app siga abierta
  }
  apply(theme);
  for (const l of listeners) l();
  // El ícono es un adorno: si falla (p. ej. un iPhone sin íconos alternos), el tema ya quedó aplicado.
  if (isNative) IconoApp.cambiar({ nombre: theme.iconName }).catch(() => {});
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Tema actual; los componentes que pintan colores desde JS (gráficos) se vuelven a dibujar al cambiarlo. */
export function useTheme(): Theme {
  return themeById(useSyncExternalStore(subscribe, () => current));
}
