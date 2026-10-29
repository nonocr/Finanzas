// Modo sin conexión.
// - La caché de React Query se guarda en el teléfono: sin internet se ve lo último que se cargó.
// - Guardar y borrar movimientos son mutaciones con defaults registrados: sin conexión quedan en pausa,
//   se guardan junto con la caché y se reanudan solas al volver la señal, aunque la app se haya cerrado.
// - Las listas se actualizan al instante (optimista) para que el movimiento se vea aunque no haya subido.
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { type Mutation, MutationCache, onlineManager, QueryClient } from '@tanstack/react-query';
import { api, isDemo } from './api';
import { isNetworkError } from './network';
import type { Transaction } from './types';

export const ERROR_EVENT = 'finanzas:error';
export const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// React Query asume "en línea" al arrancar y solo escucha cambios; si la app se abre sin señal,
// el primer intento fallaría. Se arranca con el estado real del teléfono.
onlineManager.setOnline(navigator.onLine);

export const queryClient = new QueryClient({
  defaultOptions: {
    // La demo vive en el teléfono: no depende de la red.
    queries: { staleTime: 30_000, gcTime: CACHE_MAX_AGE, refetchOnWindowFocus: true, networkMode: isDemo ? 'always' : 'online' },
    mutations: {
      networkMode: isDemo ? 'always' : 'online',
      // Sin señal no se descarta: se reintenta con espera creciente (hasta 1 min) hasta que llegue.
      retry: (_count, error) => isNetworkError(error),
      retryDelay: (attempt) => Math.min(60_000, 2_000 * 2 ** attempt),
    },
  },
  mutationCache: new MutationCache({
    // Un rechazo del servidor (no la falta de señal) se avisa con un toast global.
    onError: () => window.dispatchEvent(new CustomEvent(ERROR_EVENT)),
  }),
});

/** Se guardan en el teléfono todos los cambios sin terminar: en pausa o esperando reintento. */
export const shouldPersistMutation = (m: Mutation) => m.state.status === 'pending';

/** Al abrir la app, retoma los cambios que quedaron sin subir (en pausa o a medio reintento). */
export function resumePendingMutations() {
  for (const m of queryClient.getMutationCache().getAll()) {
    if (m.state.status === 'pending') m.continue().catch(() => {});
  }
}

const storage = (() => {
  try {
    const probe = '__finanzas__';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return undefined; // modo privado: sin persistencia, la app sigue funcionando
  }
})();

export const persister = createSyncStoragePersister({
  storage,
  key: isDemo ? 'finanzas-cache-demo' : 'finanzas-cache',
});

/** Borra la copia local (al cerrar sesión). */
export function clearOfflineCache() {
  queryClient.clear();
  try {
    localStorage.removeItem(isDemo ? 'finanzas-cache-demo' : 'finanzas-cache');
  } catch {
    // nada que borrar
  }
}

const MONEY_KEYS = [['transactions'], ['balances'], ['budget_progress']];
const refreshMoney = () => Promise.all(MONEY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

/** Aplica un cambio a todas las listas de movimientos en caché (por rango y la bandeja "por revisar"). */
function patchTransactionLists(apply: (list: Transaction[], key: readonly unknown[]) => Transaction[]) {
  for (const [key, list] of queryClient.getQueriesData<Transaction[]>({ queryKey: ['transactions'] })) {
    if (list) queryClient.setQueryData(key, apply(list, key));
  }
}

const inRange = (key: readonly unknown[], at: string) =>
  key[1] === 'pending' || (typeof key[1] === 'string' && typeof key[2] === 'string' && at >= key[1] && at < key[2]);

queryClient.setMutationDefaults(['saveTransaction'], {
  mutationFn: (tx: Transaction) => api.saveTransaction(tx),
  onMutate: async (tx: Transaction) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] });
    patchTransactionLists((list, key) => {
      const rest = list.filter((t) => t.id !== tx.id);
      const belongs = key[1] === 'pending' ? tx.status === 'por_revisar' : inRange(key, tx.occurred_at);
      return belongs ? [tx, ...rest].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)) : rest;
    });
  },
  onSettled: refreshMoney,
});

queryClient.setMutationDefaults(['deleteTransaction'], {
  mutationFn: (id: string) => api.deleteTransaction(id),
  onMutate: async (id: string) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] });
    patchTransactionLists((list) => list.filter((t) => t.id !== id));
  },
  onSettled: refreshMoney,
});

queryClient.setMutationDefaults(['saveMerchantRule'], {
  mutationFn: (r: { pattern: string; category_id: string }) => api.saveMerchantRule(r),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['merchant_rules'] }),
});
