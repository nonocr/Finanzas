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
  LegalAcceptance,
  MerchantRule,
  NewTransaction,
  Recurring,
  Transaction,
} from './types';

export interface Range {
  from: string;
  to: string;
}

export interface Api {
  listAccounts(): Promise<Account[]>;
  /** Cuentas archivadas: no se ofrecen al registrar, pero sus movimientos siguen mostrando su nombre. */
  listArchivedAccounts(): Promise<Account[]>;
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
  listArchivedCategories(): Promise<Category[]>;
  /** Cuántos movimientos usan la categoría (quedan sin categoría si se borra). */
  countCategoryUse(id: string): Promise<number>;
  /** Borra la categoría del todo: sus presupuestos y reglas se van con ella. */
  deleteCategory(id: string): Promise<void>;
  saveBudget(b: { category_id: string | null; month: string; amount: number }): Promise<void>;
  deleteBudget(id: string): Promise<void>;
  copyBudgets(from: string, to: string): Promise<number>;
  saveMerchantRule(r: { pattern: string; category_id: string }): Promise<void>;
  deleteMerchantRule(id: string): Promise<void>;
  createApiToken(name: string): Promise<string>;
  revokeApiToken(id: string): Promise<void>;
  listRecurring(): Promise<Recurring[]>;
  saveRecurring(r: Partial<Recurring>): Promise<void>;
  /** Borra el recurrente; los movimientos que ya generó se quedan. */
  deleteRecurring(id: string): Promise<void>;
  /** Inserta los movimientos cuyo id aún no existe y devuelve cuántos entraron (los repetidos se ignoran). */
  insertMissingTransactions(txs: Transaction[]): Promise<number>;
  /** Preferencias de la persona tal como estén guardadas (las valida normalizePrefs); {} si nunca guardó. */
  getPrefs(): Promise<unknown>;
  savePrefs(prefs: object): Promise<void>;
  /** Todos los presupuestos de todos los meses (para «Exportar todos mis datos»). */
  listAllBudgets(): Promise<Budget[]>;
  /** Versiones de los Términos y la Privacidad que la persona aceptó, de la más nueva a la más vieja. */
  listLegalAcceptances(): Promise<LegalAcceptance[]>;
  /** Deja constancia de que acepta esta versión. Aceptar otra vez la misma no hace nada. */
  acceptLegal(version: string): Promise<void>;
}

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

const supabaseApi: Api = {
  listAccounts: () => unwrap(supabase.from('accounts').select('*').eq('archived', false).order('sort')),
  listArchivedAccounts: () => unwrap(supabase.from('accounts').select('*').eq('archived', true).order('name')),
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
  // Con id (lo genera el teléfono) es un upsert: reintentar la misma escritura sin conexión no duplica.
  saveTransaction: async (tx) => {
    await unwrap(tx.id ? supabase.from('transactions').upsert(tx) : supabase.from('transactions').insert(tx));
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
  listArchivedCategories: () => unwrap(supabase.from('categories').select('*').eq('archived', true).order('name')),
  countCategoryUse: async (id) => {
    const { count, error } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('category_id', id);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },
  deleteCategory: async (id) => {
    await unwrap(supabase.from('categories').delete().eq('id', id));
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
  listRecurring: () =>
    unwrap(
      supabase
        .from('recurring')
        .select('id, name, type, amount, account_id, category_id, frequency, next_date, anchor_day, active')
        .order('next_date'),
    ),
  saveRecurring: async ({ id, ...r }) => {
    await unwrap(id ? supabase.from('recurring').update(r).eq('id', id) : supabase.from('recurring').insert(r));
  },
  deleteRecurring: async (id) => {
    await unwrap(supabase.from('recurring').delete().eq('id', id));
  },
  // insert … on conflict (id) do nothing: solo vuelven las filas que de verdad entraron.
  insertMissingTransactions: async (txs) => {
    if (txs.length === 0) return 0;
    const rows = await unwrap(
      supabase.from('transactions').upsert(txs, { onConflict: 'id', ignoreDuplicates: true }).select('id'),
    );
    return rows.length;
  },
  getPrefs: async () => {
    const row = await unwrap(supabase.from('user_settings').select('prefs').maybeSingle());
    return (row as { prefs: unknown } | null)?.prefs ?? {};
  },
  // Una fila por persona: el dueño lo pone la base (user_id = auth.uid()), así que no se manda.
  savePrefs: async (prefs) => {
    await unwrap(supabase.from('user_settings').upsert({ prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }));
  },
  listAllBudgets: () => unwrap(supabase.from('budgets').select('id, category_id, month, amount').order('month')),
  listLegalAcceptances: () =>
    unwrap(supabase.from('legal_acceptances').select('version, accepted_at, source').order('version', { ascending: false })),
  // La base pone el dueño, la hora y el origen (solo se puede mandar la versión). Si ya estaba aceptada, el índice
  // único la rechaza (23505): para quien acepta, eso es lo mismo que haberla guardado.
  acceptLegal: async (version) => {
    const { error } = await supabase.from('legal_acceptances').insert({ version });
    if (error && error.code !== '23505') throw new Error(error.message);
  },
};

// VITE_DEMO=1 fuerza la demo aunque haya Supabase configurado (para probar sin tocar datos reales).
export const isDemo = !supabaseConfigured || import.meta.env.VITE_DEMO === '1';
export const api: Api = isDemo ? createDemoApi() : supabaseApi;
