// Idiomas de la app. El español es la fuente: cada texto vive en src/i18n/locales/es/<área>.ts y el inglés en
// src/i18n/locales/en/<área>.ts con el MISMO tipo (si falta una traducción o sobra una clave, la app no compila).
//
// En componentes:      const t = useT();  …  <h1>{t.home.title}</h1>   ·   {t.home.pending(n)}
// Fuera de React:      strings().auth.errors.generic   (lee el idioma actual; los componentes se redibujan solos)
//
// Los valores pueden ser texto o funciones (plurales, montos, nombres): `(n: number) => string`.
import { useSyncExternalStore } from 'react';
import { es } from './es';
import { en } from './en';

export type Lang = 'es' | 'en';
export type Strings = typeof es;
/** Lo que se elige en Ajustes: un idioma o «Automático» (el del teléfono). */
export type LangPref = 'auto' | Lang;

const DICTS: Record<Lang, Strings> = { es, en };

/** Locale de Intl para fechas y números. Costa Rica en español; Estados Unidos en inglés. */
export const LOCALES: Record<Lang, string> = { es: 'es-CR', en: 'en-US' };

/** Idioma del teléfono o navegador entre los que la app tiene; si ninguno coincide, español. */
export function deviceLang(): Lang {
  const prefs = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]);
  for (const l of prefs) {
    const base = l?.toLowerCase().split('-')[0];
    if (base === 'es' || base === 'en') return base;
  }
  return 'es';
}

export const resolveLang = (pref: LangPref): Lang => (pref === 'auto' ? deviceLang() : pref);

let current: Lang = 'es';
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

/** Cambia el idioma de toda la app (lo llama prefs al arrancar y cuando cambia la preferencia). */
export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang === 'es' ? 'es-CR' : 'en';
  for (const l of listeners) l();
}

/** Textos del idioma actual, fuera de React. */
export function strings(): Strings {
  return DICTS[current];
}

/** Locale de Intl del idioma actual. */
export function locale(): string {
  return LOCALES[current];
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Textos del idioma actual; el componente se redibuja al cambiar de idioma. */
export function useT(): Strings {
  return DICTS[useSyncExternalStore(subscribe, getLang, getLang)];
}

/** El idioma actual, para lo que formatea fechas o números dentro de un componente. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}
