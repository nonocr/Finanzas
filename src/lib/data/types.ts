// Tipos de las tablas de supabase/migrations. Montos en céntimos.
import { strings } from '../../i18n';

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
  /**
   * Pago de Wallet que llegó sin monto legible: `amount` es 0 (solo se permite por revisar) y aquí queda el texto que
   * mandó el iPhone ("" si vino vacío). Lo escribe solo el servidor.
   */
  amount_raw?: string | null;
  /** Gasto o ingreso fijo que lo generó (src/lib/finance/recurring.ts). */
  recurring_id?: string | null;
  /**
   * Pagado en dólares: `amount` son los colones convertidos y aquí queda lo que se pagó de verdad (céntimos de dólar)
   * con el tipo de cambio usado. Los tres van juntos o ninguno.
   */
  original_currency?: 'USD' | null;
  original_amount?: number | null;
  fx_rate?: number | null;
}

export interface Recurring {
  id: string;
  name: string;
  type: 'gasto' | 'ingreso';
  amount: number;
  account_id: string;
  category_id: string | null;
  frequency: Frequency;
  /** Próxima fecha de cobro, "2026-11-15" (día de calendario en Costa Rica). */
  next_date: string;
  /** Día del mes elegido; con él, un cobro del 31 vuelve al 31 después de febrero. */
  anchor_day: number | null;
  active: boolean;
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

/**
 * Constancia de que la persona aceptó los Términos y la Privacidad en esa versión (tabla legal_acceptances).
 * `registro`: al crear la cuenta; `app`: al aceptar una versión nueva dentro de la app.
 */
export interface LegalAcceptance {
  version: string;
  accepted_at: string;
  source: 'registro' | 'app';
}

/** Etiqueta del tipo de cuenta en el idioma actual (los textos viven en src/i18n/locales/<idioma>/accounts.ts). */
export const accountTypeLabel = (type: AccountType): string => strings().accounts.types[type];

/** Lo mismo como objeto, por compatibilidad: cada lectura sale del idioma actual. */
export const ACCOUNT_TYPE_LABEL: Readonly<Record<AccountType, string>> = {
  get efectivo() {
    return accountTypeLabel('efectivo');
  },
  get debito() {
    return accountTypeLabel('debito');
  },
  get credito() {
    return accountTypeLabel('credito');
  },
  get banco() {
    return accountTypeLabel('banco');
  },
  get ahorro() {
    return accountTypeLabel('ahorro');
  },
};
