import { onlineManager, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { runRecurring } from '../lib/data/queries';
import { useToast } from './Toast';
import { strings } from '../i18n';

/** Como mucho una revisión cada 15 minutos: los fijos cambian una vez al día. */
const MIN_GAP_MS = 15 * 60 * 1000;

/**
 * Registra los gastos e ingresos fijos que vencieron: al abrir la app, al volver a ella y al recuperar la señal.
 * Solo se monta con la sesión completa (App), así que nunca escribe con una sesión a medias.
 */
export function RecurringRunner() {
  const qc = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    let last = 0;
    const run = () => {
      if (document.visibilityState !== 'visible' || !onlineManager.isOnline()) return;
      if (Date.now() - last < MIN_GAP_MS) return;
      last = Date.now();
      runRecurring(qc)
        .then((n) => n > 0 && toast(strings().common.recurringRegistered(n)))
        .catch(() => (last = 0)); // sin red o rechazo: se intenta de nuevo en la próxima ocasión
    };
    run();
    document.addEventListener('visibilitychange', run);
    const unsubscribe = onlineManager.subscribe((online) => online && run());
    return () => {
      document.removeEventListener('visibilitychange', run);
      unsubscribe();
    };
  }, [qc, toast]);

  return null;
}
