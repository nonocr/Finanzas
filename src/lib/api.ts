// Acceso a datos. Con Supabase configurado usa la base real; si no, un modo demo
// en el navegador (localStorage) con los mismos contratos, para probar la app sin backend.
import { createDemoApi } from './demoApi';
import { supabase, supabaseConfigured } from './supabase';
import type {
  Account,
  AccountBalance,
  ApiToken,
  Budget,
  BudgetProgress,
  Category,
  MerchantRule,
  NewTransaction,
  Transaction,
} from './types';

export interface Range {
  from: string;
  to: string;
}

export interface Api {
  listAccounts(): Promise<Account[]>;
  listCategories(): Promise<Category[]>;
  listBalances(): Promise<AccountBalance[]>;
  listTransactions(range: Range): Promise<Transaction[]>;
  listPending(): Promise<Transaction[]>;
  listBudgets(month: string): Promise<Budget[]>;
  listBudgetProgress(month: string): Promise<BudgetProgress[]>;
  listMerchantRules(): Promise<MerchantRule[]>;
  listApiTokens(): Promise<ApiToken[]>;
  saveTransaction(tx: Partial<NewTransaction> & { id?: string }): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  saveAccount(acc: Partial<Account>): Promise<void>;
  saveCategory(cat: Partial<Category>): Promise<void>;
  saveBudget(b: { category_id: string | null; month: string; amount: number }): Promise<void>;
  deleteBudget(id: string): Promise<void>;
  copyBudgets(from: string, to: string): Promise<number>;
  saveMerchantRule(r: { pattern: string; category_id: string }): Promise<void>;
  deleteMerchantRule(id: string): Promise<void>;
  createApiToken(name: string): Promise<string>;
  revokeApiToken(id: string): Promise<void>;
}

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

const supabaseApi: Api = {
  listAccounts: () => unwrap(supabase.from('accounts').select('*').eq('archived', false).order('sort')),
  listCategories: () => unwrap(supabase.from('categories').select('*').eq('archived', false).order('sort')),
  listBalances: () => unwrap(supabase.from('account_balances').select('*')),
  listTransactions: (r) =>
    unwrap(
      supabase
        .from('transactions')
        .select('*')
        .gte('occurred_at', r.from)
        .lt('occurred_at', r.to)
        .order('occurred_at', { ascending: false }),
    ),
  listPending: () =>
    unwrap(supabase.from('transactions').select('*').eq('status', 'por_revisar').order('occurred_at', { ascending: false })),
  listBudgets: (month) => unwrap(supabase.from('budgets').select('*').eq('month', month)),
  listBudgetProgress: (month) => unwrap(supabase.from('budget_progress').select('*').eq('month', month)),
  listMerchantRules: () => unwrap(supabase.from('merchant_rules').select('*').order('priority', { ascending: false })),
  listApiTokens: () =>
    unwrap(supabase.from('api_tokens').select('id, name, created_at, last_used_at').order('created_at')),
  saveTransaction: async ({ id, ...tx }) => {
    await unwrap(id ? supabase.from('transactions').update(tx).eq('id', id) : supabase.from('transactions').insert(tx));
  },
  deleteTransaction: async (id) => {
    await unwrap(supabase.from('transactions').delete().eq('id', id));
  },
  saveAccount: async ({ id, ...acc }) => {
    await unwrap(id ? supabase.from('accounts').update(acc).eq('id', id) : supabase.from('accounts').insert(acc));
  },
  saveCategory: async ({ id, ...cat }) => {
    await unwrap(id ? supabase.from('categories').update(cat).eq('id', id) : supabase.from('categories').insert(cat));
  },
  saveBudget: async (b) => {
    await unwrap(supabase.from('budgets').upsert(b, { onConflict: 'user_id,category_id,month' }));
  },
  deleteBudget: async (id) => {
    await unwrap(supabase.from('budgets').delete().eq('id', id));
  },
  copyBudgets: (from, to) => unwrap(supabase.rpc('copy_budgets', { p_from: from, p_to: to })),
  saveMerchantRule: async (r) => {
    await unwrap(supabase.from('merchant_rules').upsert(r, { onConflict: 'user_id,pattern' }));
  },
  deleteMerchantRule: async (id) => {
    await unwrap(supabase.from('merchant_rules').delete().eq('id', id));
  },
  createApiToken: (name) => unwrap(supabase.rpc('create_api_token', { p_name: name })),
  revokeApiToken: async (id) => {
    await unwrap(supabase.from('api_tokens').delete().eq('id', id));
  },
};

export const isDemo = !supabaseConfigured;
export const api: Api = isDemo ? createDemoApi() : supabaseApi;
