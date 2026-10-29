// Tipos de las tablas de supabase/migrations. Montos en céntimos.

export type AccountType = 'efectivo' | 'debito' | 'credito' | 'banco' | 'ahorro';
export type CategoryKind = 'gasto' | 'ingreso';
export type TxType = 'gasto' | 'ingreso' | 'transferencia';
export type TxSource = 'manual' | 'wallet' | 'import' | 'recurrente';
export type TxStatus = 'confirmada' | 'por_revisar';
export type Frequency = 'semanal' | 'quincenal' | 'mensual' | 'anual';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  color: string | null;
  icon: string | null;
  last4: string | null;
  wallet_name: string | null;
  credit_limit: number | null;
  cutoff_day: number | null;
  payment_day: number | null;
  archived: boolean;
  sort: number;
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  archived: boolean;
  sort: number;
}

export interface Transaction {
  id: string;
  occurred_at: string;
  amount: number;
  type: TxType;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  merchant: string | null;
  note: string | null;
  source: TxSource;
  status: TxStatus;
}

export type NewTransaction = Omit<Transaction, 'id' | 'source' | 'status'> & Partial<Pick<Transaction, 'source' | 'status'>>;

export interface Budget {
  id: string;
  category_id: string | null;
  month: string;
  amount: number;
}

export interface BudgetProgress {
  budget_id: string;
  category_id: string | null;
  month: string;
  limit_amount: number;
  spent: number;
}

export interface AccountBalance {
  account_id: string;
  balance: number;
}

export interface MerchantRule {
  id: string;
  pattern: string;
  category_id: string;
  priority: number;
}

export interface ApiToken {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  credito: 'Crédito',
  banco: 'Banco',
  ahorro: 'Ahorro',
};
