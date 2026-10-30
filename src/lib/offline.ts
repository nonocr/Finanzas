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

/** Retoma los cambios que quedaron sin subir (en pausa o a medio reintento). Solo con la sesión de su dueña. */
export function resumePendingMutations() {
  for (const m of queryClient.getMutationCache().getAll()) {
    if (m.state.status === 'pending') m.continue().catch(() => {});
  }
}

// La copia local se restaura de forma asíncrona; quien decide qué hacer con ella espera a que termine.
let markRestored = () => {};
export const cacheRestored = new Promise<void>((resolve) => (markRestored = resolve));
export const onCacheRestored = () => markRestored();

// Compuerta de envío: un cambio en cola espera a que haya una sesión completa (con los dos pasos si los tiene).
// Así, aunque React Query reanude la cola al volver la señal, nada sale con una sesión a medias y nada se pierde
// por un rechazo de permisos: el cambio sigue en cola hasta que entres del todo.
let gateOpen = isDemo;
let openGate = () => {};
let gate = isDemo ? Promise.resolve() : new Promise<void>((resolve) => (openGate = resolve));
function setGate(open: boolean) {
  if (open && !gateOpen) openGate();
  else if (!open && gateOpen) gate = new Promise<void>((resolve) => (openGate = resolve));
  gateOpen = open;
}
const whenSessionReady = () => gate;

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

const CACHE_KEY = isDemo ? 'finanzas-cache-demo' : 'finanzas-cache';
/** Usuario al que pertenece la copia local; si entra otra cuenta, la copia no se le muestra. */
const OWNER_KEY = 'finanzas-cache-owner';
/** Todo lo que la app guarda en el teléfono sobre la cuenta (la demo tiene su propia clave y no se toca). */
const LOCAL_KEYS = [CACHE_KEY, OWNER_KEY, 'finanzas-last-account', 'finanzas-home-period'];

export const persister = createSyncStoragePersister({ storage, key: CACHE_KEY });

/** Borra la copia local de los datos y la cola de cambios (al cerrar sesión o si cambia la cuenta). */
export function clearOfflineCache() {
  queryClient.clear();
  try {
    for (const k of LOCAL_KEYS) localStorage.removeItem(k);
  } catch {
    // nada que borrar
  }
}

/** Qué hacer con la copia local según quién tiene la sesión. Sin sesión o con otra cuenta: se borra. */
export function cacheAction(owner: string | null, userId: string | null): 'clear' | 'keep' {
  return !userId || (owner !== null && owner !== userId) ? 'clear' : 'keep';
}

/**
 * Ajusta la copia local a la sesión actual: la borra si no hay sesión o es de otra cuenta, y solo reanuda la cola
 * de cambios cuando la sesión ya pasó los dos pasos (antes, la base los rechazaría y se perderían).
 */
export async function syncCacheWithSession(userId: string | null, fullyAuthenticated: boolean) {
  if (isDemo) return;
  await cacheRestored;
  let owner: string | null = null;
  try {
    owner = localStorage.getItem(OWNER_KEY);
  } catch {
    // sin almacenamiento: no hay copia que proteger
  }
  setGate(Boolean(userId) && fullyAuthenticated);
  if (cacheAction(owner, userId) === 'clear') clearOfflineCache();
  if (!userId) return;
  try {
    localStorage.setItem(OWNER_KEY, userId);
  } catch {
    // modo privado
  }
  if (fullyAuthenticated) resumePendingMutations();
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
  mutationFn: async (tx: Transaction) => {
    await whenSessionReady();
    return api.saveTransaction(tx);
  },
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
  mutationFn: async (id: string) => {
    await whenSessionReady();
    return api.deleteTransaction(id);
  },
  onMutate: async (id: string) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] });
    patchTransactionLists((list) => list.filter((t) => t.id !== id));
  },
  onSettled: refreshMoney,
});

queryClient.setMutationDefaults(['saveMerchantRule'], {
  mutationFn: async (r: { pattern: string; category_id: string }) => {
    await whenSessionReady();
    return api.saveMerchantRule(r);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['merchant_rules'] }),
});
