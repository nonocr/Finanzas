import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useLang } from '../../i18n';
import { localizeAccount, localizeCategory } from '../finance/defaultNames';
import { api, type Range } from './api';
import { fetchUsdRate } from '../format/fx';
import { applyRecurring } from '../finance/recurring';
import type { Account, Category, Recurring, Transaction } from './types';

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

// Los nombres por defecto («Súper», «Efectivo»…) se muestran en el idioma de la app; los editados, tal cual (defaultNames.ts).
// Se traducen al leer (select), así todas las pantallas los ven igual; lo guardado no cambia.
function useLocalizedCategories() {
  const lang = useLang();
  return useCallback((rows: Category[]) => rows.map((c) => localizeCategory(c, lang)), [lang]);
}
function useLocalizedAccounts() {
  const lang = useLang();
  return useCallback((rows: Account[]) => rows.map((a) => localizeAccount(a, lang)), [lang]);
}

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: api.listAccounts, select: useLocalizedAccounts() });
export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: api.listCategories, select: useLocalizedCategories() });
export const useArchivedAccounts = () =>
  useQuery({ queryKey: ['accounts', 'archived'], queryFn: api.listArchivedAccounts, select: useLocalizedAccounts() });

/**
 * Todas las categorías y cuentas (activas y archivadas) por id, para mostrar movimientos viejos: archivar oculta una
 * categoría o cuenta al registrar, pero su historial sigue con su nombre.
 */
export function useLookups() {
  const { data: categories = [] } = useCategories();
  const { data: archivedCats = [] } = useArchivedCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: archivedAccs = [] } = useArchivedAccounts();
  const catMap = useMemo(() => new Map([...archivedCats, ...categories].map((c) => [c.id, c])), [categories, archivedCats]);
  const accMap = useMemo(() => new Map([...archivedAccs, ...accounts].map((a) => [a.id, a])), [accounts, archivedAccs]);
  return { catMap, accMap, allCategories: useMemo(() => [...catMap.values()], [catMap]) };
}
export const useBalances = () => useQuery({ queryKey: ['balances'], queryFn: api.listBalances });

export const useTransactions = (range: Range) =>
  useQuery({ queryKey: ['transactions', range.from, range.to], queryFn: () => api.listTransactions(range) });

export const usePendingReview = () => useQuery({ queryKey: ['transactions', 'pending'], queryFn: api.listPending });

export const useBudgets = (month: string) =>
  useQuery({ queryKey: ['budgets', month], queryFn: () => api.listBudgets(month) });

export const useBudgetProgress = (month: string) =>
  useQuery({ queryKey: ['budget_progress', month], queryFn: () => api.listBudgetProgress(month) });

export const useMerchantRules = () => useQuery({ queryKey: ['merchant_rules'], queryFn: api.listMerchantRules });
export const useApiTokens = () => useQuery({ queryKey: ['api_tokens'], queryFn: api.listApiTokens });

// ---------------------------------------------------------------------------
// Escrituras: cualquier cambio de movimientos refresca saldos y presupuestos.
// ---------------------------------------------------------------------------

const MONEY_KEYS = [['transactions'], ['balances'], ['budget_progress']];

function useInvalidate(keys: string[][]) {
  const qc = useQueryClient();
  return () => Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));
}

// Guardar/borrar movimientos y reglas usan los defaults de lib/data/offline.ts (cola sin conexión + listas optimistas).
export const useSaveTransaction = () => useMutation<void, Error, Transaction>({ mutationKey: ['saveTransaction'] });
export const useDeleteTransaction = () => useMutation<void, Error, string>({ mutationKey: ['deleteTransaction'] });

export function useSaveAccount() {
  const onSuccess = useInvalidate([['accounts'], ['balances']]);
  return useMutation({ mutationFn: (acc: Partial<Account>) => api.saveAccount(acc), onSuccess });
}

export function useSaveCategory() {
  const onSuccess = useInvalidate([['categories']]);
  return useMutation({ mutationFn: (cat: Partial<Category>) => api.saveCategory(cat), onSuccess });
}

export const useArchivedCategories = () =>
  useQuery({ queryKey: ['categories', 'archived'], queryFn: api.listArchivedCategories, select: useLocalizedCategories() });

export function useDeleteCategory() {
  const onSuccess = useInvalidate([['categories'], ...MONEY_KEYS, ['budgets'], ['merchant_rules']]);
  return useMutation({ mutationFn: api.deleteCategory, onSuccess });
}

export function useSaveBudget() {
  const onSuccess = useInvalidate([['budgets'], ['budget_progress']]);
  return useMutation({ mutationFn: api.saveBudget, onSuccess });
}

export function useDeleteBudget() {
  const onSuccess = useInvalidate([['budgets'], ['budget_progress']]);
  return useMutation({ mutationFn: api.deleteBudget, onSuccess });
}

export function useCopyBudgets() {
  const onSuccess = useInvalidate([['budgets'], ['budget_progress']]);
  return useMutation({ mutationFn: (p: { from: string; to: string }) => api.copyBudgets(p.from, p.to), onSuccess });
}

export const useSaveMerchantRule = () =>
  useMutation<void, Error, { pattern: string; category_id: string }>({ mutationKey: ['saveMerchantRule'] });

export function useDeleteMerchantRule() {
  const onSuccess = useInvalidate([['merchant_rules']]);
  return useMutation({ mutationFn: api.deleteMerchantRule, onSuccess });
}

export function useCreateApiToken() {
  const onSuccess = useInvalidate([['api_tokens']]);
  return useMutation({ mutationFn: api.createApiToken, onSuccess });
}

/**
 * Tipo de cambio del dólar (BCCR, venta). Se pide solo al registrar en dólares; dura una hora y sin señal se usa
 * el último guardado. null si Hacienda no responde: el campo queda para escribirlo a mano.
 */
export const useUsdRate = (enabled: boolean) =>
  useQuery({
    queryKey: ['fx', 'USD'],
    queryFn: () => fetchUsdRate(),
    enabled,
    staleTime: 60 * 60 * 1000,
    networkMode: 'online',
  });

export const useRecurring = () => useQuery({ queryKey: ['recurring'], queryFn: api.listRecurring });

let recurringQueue: Promise<unknown> = Promise.resolve();

/**
 * Registra los cobros fijos vencidos. Al terminar refresca los fijos (su próxima fecha avanzó) y, si entró algún
 * movimiento, también listas, saldos y presupuestos. Las corridas van en fila: la que pide un fijo recién guardado
 * espera a la que ya estaba en curso y luego lee la lista de nuevo. No es una mutación para que un fallo en segundo
 * plano no salte como error en pantalla (se reintenta la próxima vez que se abra la app).
 */
export function runRecurring(qc: QueryClient): Promise<number> {
  const run = recurringQueue
    .catch(() => {})
    .then(() => applyRecurring(api))
    .then(async (created) => {
      await qc.invalidateQueries({ queryKey: ['recurring'] });
      if (created > 0) await Promise.all(MONEY_KEYS.map((queryKey) => qc.invalidateQueries({ queryKey })));
      return created;
    });
  recurringQueue = run;
  return run;
}

/**
 * Guardar un fijo también registra enseguida sus cobros si la fecha ya llegó (p. ej. uno que vence hoy). Devuelve
 * cuántos movimientos entraron; si eso falla, el fijo ya quedó guardado y el runner lo reintenta después.
 */
export function useSaveRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: Partial<Recurring>) => {
      await api.saveRecurring(r);
      return runRecurring(qc).catch(async () => {
        await qc.invalidateQueries({ queryKey: ['recurring'] });
        return 0;
      });
    },
  });
}

export function useDeleteRecurring() {
  const onSuccess = useInvalidate([['recurring'], ['transactions']]);
  return useMutation({ mutationFn: api.deleteRecurring, onSuccess });
}

export function useRevokeApiToken() {
  const onSuccess = useInvalidate([['api_tokens']]);
  return useMutation({ mutationFn: api.revokeApiToken, onSuccess });
}

// ---------------------------------------------------------------------------
// Términos y privacidad aceptados (src/lib/legal/version.ts)
// ---------------------------------------------------------------------------

export const useLegalAcceptances = () => useQuery({ queryKey: ['legal'], queryFn: api.listLegalAcceptances, staleTime: 5 * 60_000 });

export function useAcceptLegal() {
  const onSuccess = useInvalidate([['legal']]);
  return useMutation({ mutationFn: api.acceptLegal, onSuccess });
}
