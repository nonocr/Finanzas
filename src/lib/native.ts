// La app corre igual en la web (PWA) y dentro de Capacitor (App Store / Google Play). Aquí vive lo que cambia.
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';

/**
 * iPhone o iPad (app nativa o navegador). La automatización de Apple Wallet con Atajos solo existe ahí: en Android o
 * en una computadora, Ajustes no la ofrece. (El iPad moderno se presenta como Mac; se reconoce por la pantalla táctil.)
 */
export const isAppleMobile =
  platform === 'ios' ||
  (typeof navigator !== 'undefined' &&
    (/iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)));

/**
 * La app web en producción. La app nativa no tiene dirección propia (capacitor://localhost), así que los enlaces
 * de los correos («olvidé mi contraseña») abren la web: es la única redirección permitida en Supabase.
 */
export const WEB_APP_URL = 'https://finanzas-nono-0784.vercel.app/';

export function startNative() {
  if (platform !== 'android') return;
  // Botón Atrás de Android: primero cierra la hoja abierta (Sheet se cierra con Escape), luego vuelve a la pantalla
  // anterior y, si ya no hay a dónde volver, manda la app al fondo como las apps nativas (sin perder lo abierto).
  void App.addListener('backButton', ({ canGoBack }) => {
    if (document.querySelector('[role="dialog"]')) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    else if (canGoBack) history.back();
    else void App.minimizeApp();
  });
}
