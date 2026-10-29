import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Range } from './api';
import type { Account, Category, NewTransaction } from './types';

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: api.listAccounts });
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: api.listCategories });
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

export function useSaveTransaction() {
  const onSuccess = useInvalidate(MONEY_KEYS);
  return useMutation({ mutationFn: (tx: Partial<NewTransaction> & { id?: string }) => api.saveTransaction(tx), onSuccess });
}

export function useDeleteTransaction() {
  const onSuccess = useInvalidate(MONEY_KEYS);
  return useMutation({ mutationFn: api.deleteTransaction, onSuccess });
}

export function useSaveAccount() {
  const onSuccess = useInvalidate([['accounts'], ['balances']]);
  return useMutation({ mutationFn: (acc: Partial<Account>) => api.saveAccount(acc), onSuccess });
}

export function useSaveCategory() {
  const onSuccess = useInvalidate([['categories']]);
  return useMutation({ mutationFn: (cat: Partial<Category>) => api.saveCategory(cat), onSuccess });
}

export const useArchivedCategories = () =>
  useQuery({ queryKey: ['categories', 'archived'], queryFn: api.listArchivedCategories });

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

export function useSaveMerchantRule() {
  const onSuccess = useInvalidate([['merchant_rules']]);
  return useMutation({ mutationFn: api.saveMerchantRule, onSuccess });
}

export function useDeleteMerchantRule() {
  const onSuccess = useInvalidate([['merchant_rules']]);
  return useMutation({ mutationFn: api.deleteMerchantRule, onSuccess });
}

export function useCreateApiToken() {
  const onSuccess = useInvalidate([['api_tokens']]);
  return useMutation({ mutationFn: api.createApiToken, onSuccess });
}

export function useRevokeApiToken() {
  const onSuccess = useInvalidate([['api_tokens']]);
  return useMutation({ mutationFn: api.revokeApiToken, onSuccess });
}
