import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from './api';
import { applyDiscreet, normalizePrefs, readLocalPrefs, writeLocalPrefs, type Prefs } from './prefs';
import { setTheme } from './theme';
import { resolveLang, setLang } from '../i18n';
import { isDemo } from './api';
import { syncAuthLang } from './supabase';

const KEY = ['prefs'];

/**
 * Lo guardado en la cuenta. Si la cuenta todavía no tiene nada (primera vez con esta versión, o cuenta nueva), se sube
 * lo que ya hay en este teléfono: así el tema que alguien eligió antes no se pierde.
 */
async function fetchPrefs(): Promise<Prefs> {
  const raw = await api.getPrefs();
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) {
    const local = readLocalPrefs();
    await api.savePrefs(local);
    return local;
  }
  return normalizePrefs(raw);
}

const prefsQuery = { queryKey: KEY, queryFn: fetchPrefs, placeholderData: readLocalPrefs, staleTime: 5 * 60_000 };

/** Las preferencias actuales (mientras llegan de la cuenta, las de este teléfono). */
export function usePrefs(): Prefs {
  return useQuery(prefsQuery).data ?? readLocalPrefs();
}

/** Aplica lo que viene de la cuenta: tema, modo discreto y la copia local para el próximo arranque. */
export function PrefsSync() {
  const { data, isPlaceholderData } = useQuery(prefsQuery);
  useEffect(() => {
    if (!data || isPlaceholderData) return;
    writeLocalPrefs(data);
    setLang(resolveLang(data.lang));
    if (!isDemo) void syncAuthLang(resolveLang(data.lang)).catch(() => {});
    setTheme(data.theme);
    if (data.discreet !== 'discreet' in document.documentElement.dataset) applyDiscreet(data.discreet);
  }, [data, isPlaceholderData]);
  return null;
}

/** Cambia una o varias preferencias: se aplica al instante y se guarda en la cuenta. */
export function useSavePrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Prefs>) => {
      const next = { ...(qc.getQueryData<Prefs>(KEY) ?? readLocalPrefs()), ...patch };
      qc.setQueryData(KEY, next);
      writeLocalPrefs(next);
      if (patch.lang) {
        setLang(resolveLang(patch.lang));
        if (!isDemo) void syncAuthLang(resolveLang(patch.lang)).catch(() => {});
      }
      if (patch.theme) setTheme(patch.theme);
      if (patch.discreet !== undefined) applyDiscreet(patch.discreet);
      await api.savePrefs(next);
    },
  });
}
