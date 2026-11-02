// Actualización de la PWA en una sola apertura: el service worker nuevo queda en espera y, cuando no estorba
// (ver updateGate), se activa y la página se recarga con la versión nueva.
import { registerSW } from 'virtual:pwa-register';
import { queryClient } from './offline';
import { createUpdateGate } from './updateGate';

export const appUpdates = createUpdateGate({ isBusy: () => queryClient.isMutating() > 0, delayMs: 2000 });

export function startAppUpdates() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => appUpdates.ready(() => void updateSW(true)),
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // En iPhone la app suele quedar suspendida en vez de cerrarse: al volver a ella también se busca versión nueva.
      const check = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) registration.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', check);
      setInterval(check, 30 * 60_000);
    },
  });
}
