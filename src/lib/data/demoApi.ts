// Modo demo: los mismos contratos que Supabase, guardados en localStorage.
// Los datos de ejemplo son sintéticos (6 meses de gastos típicos en colones).
import type { Api } from './api';
import { addDays, addMonths, crDay, crDayOf, crDayStartInstant, isoDate, startOfMonth } from '../format/dates';
import type {
  Account,
  AccountBalance,
  ApiToken,
  Budget,
  BudgetProgress,
  Category,
  MerchantRule,
  Recurring,
  Transaction,
} from './types';
import { usdToColonCents } from '../format/fx';
import { dueDates } from '../finance/recurring';

interface DemoDb {
  version: number;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  rules: MerchantRule[];
  tokens: ApiToken[];
  recurring: Recurring[];
}

const KEY = 'finanzas-demo';
const DEMO_PREFS_KEY = 'finanzas-demo-prefs';
const VERSION = 5;
const uid = () => crypto.randomUUID();

function load(): DemoDb | null {
  try {
    const raw = localStorage.getItem(KEY);
    const db = raw ? (JSON.parse(raw) as DemoDb) : null;
    return db?.version === VERSION ? db : null;
  } catch {
    return null;
  }
}

function persist(db: DemoDb) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // Sin almacenamiento (modo privado): la demo sigue en memoria.
  }
}

// Generador pseudoaleatorio con semilla para que la demo sea estable.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function seed(): DemoDb {
  const rand = rng(42);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const between = (a: number, b: number) => Math.round((a + rand() * (b - a)) / 50) * 50 * 100;

  const acc = (name: string, type: Account['type'], extra: Partial<Account> = {}): Account => ({
    id: uid(), name, type, initial_balance: 0, color: null, icon: null, last4: null, wallet_name: null,
    credit_limit: null, cutoff_day: null, payment_day: null, archived: false, sort: 0, ...extra,
  });
  const efectivo = acc('Efectivo', 'efectivo', { initial_balance: 4_500_000, icon: 'banknote', color: 'c3', sort: 0 });
  const debito = acc('Débito BN', 'debito', { initial_balance: 85_000_000, last4: '4821', wallet_name: 'BN Débito', color: 'c2', sort: 1 });
  const visa = acc('Visa BAC', 'credito', {
    last4: '1934', wallet_name: 'Visa BAC', credit_limit: 150_000_000, cutoff_day: 15, payment_day: 2, color: 'c1', sort: 2,
  });
  const accounts = [efectivo, debito, visa];

  const cat = (name: string, kind: Category['kind'], icon: string, color: string, sort: number): Category => ({
    id: uid(), name, kind, icon, color, parent_id: null, archived: false, sort,
  });
  const categories = [
    cat('Comida', 'gasto', 'utensils', 'c1', 1),
    cat('Súper', 'gasto', 'shopping-cart', 'c2', 2),
    cat('Transporte', 'gasto', 'car', 'c3', 3),
    cat('Casa', 'gasto', 'house', 'c4', 4),
    cat('Servicios', 'gasto', 'zap', 'c5', 5),
    cat('Salud', 'gasto', 'heart-pulse', 'c6', 6),
    cat('Entretenimiento', 'gasto', 'film', 'c7', 7),
    cat('Suscripciones', 'gasto', 'repeat', 'c8', 8),
    cat('Ropa', 'gasto', 'shirt', 'c9', 9),
    cat('Otros', 'gasto', 'ellipsis', 'c10', 10),
    cat('Salario', 'ingreso', 'briefcase', 'c2', 1),
    cat('Extra', 'ingreso', 'sparkles', 'c5', 2),
    cat('Otros ingresos', 'ingreso', 'plus', 'c10', 3),
  ];
  const c = Object.fromEntries(categories.map((x) => [x.name, x.id]));

  const transactions: Transaction[] = [];
  const add = (day: Date, hour: number, p: Partial<Transaction>) =>
    transactions.push({
      id: uid(),
      occurred_at: new Date(crDayStartInstant(day).getTime() + hour * 3_600_000).toISOString(),
      amount: 0, type: 'gasto', account_id: visa.id, to_account_id: null, category_id: null,
      merchant: null, note: null, source: 'manual', status: 'confirmada', ...p,
    });

  const today = crDay();
  const firstMonth = addMonths(startOfMonth(today), -5);
  for (let d = firstMonth; d.getTime() <= today.getTime(); d = addDays(d, 1)) {
    const dom = d.getUTCDate();
    const card = () => (rand() < 0.7 ? visa.id : debito.id);
    if (dom === 15 || dom === 30) add(d, 8, { type: 'ingreso', amount: 68_000_000, account_id: debito.id, category_id: c['Salario'], merchant: 'Planilla' });
    if (dom === 1) add(d, 9, { amount: 32_000_000, account_id: debito.id, category_id: c['Casa'], merchant: 'Alquiler' });
    if (dom === 5) add(d, 10, { amount: between(14_000, 22_000), account_id: debito.id, category_id: c['Servicios'], merchant: 'ICE Electricidad' });
    if (dom === 8) add(d, 10, { amount: between(6_000, 9_000), account_id: debito.id, category_id: c['Servicios'], merchant: 'AyA' });
    if (dom === 12) add(d, 11, { amount: 1_490_000, category_id: c['Suscripciones'], merchant: 'Kölbi Internet' });
    if (dom === 18) add(d, 6, { amount: 699_000, category_id: c['Suscripciones'], merchant: 'Netflix' });
    if (dom === 3 && d.getUTCMonth() % 3 === 0) add(d, 7, { type: 'ingreso', amount: between(40_000, 90_000), account_id: debito.id, category_id: c['Extra'], merchant: 'Proyecto freelance' });
    if (dom === 2 && d.getTime() > firstMonth.getTime()) add(d, 12, { type: 'transferencia', amount: between(180_000, 260_000), account_id: debito.id, to_account_id: visa.id, note: 'Pago tarjeta' });
    if (dom === 6 || dom === 20) add(d, 13, { type: 'transferencia', amount: 6_000_000, account_id: debito.id, to_account_id: efectivo.id, note: 'Retiro cajero' });

    if (rand() < 0.42) add(d, 18, { amount: between(9_000, 38_000), account_id: card(), category_id: c['Súper'], merchant: pick(['Automercado', 'Walmart', 'Mas x Menos', 'Fresh Market', 'PriceSmart']) });
    if (rand() < 0.75) add(d, 12, { amount: between(2_500, 9_500), account_id: rand() < 0.4 ? efectivo.id : card(), category_id: c['Comida'], merchant: pick(['Soda La Esquina', 'Café Britt', 'Spoon', 'Rostipollos', 'Uber Eats', 'Panadería Musmanni']) });
    if (rand() < 0.5) add(d, 8, { amount: between(1_500, 6_500), account_id: rand() < 0.5 ? efectivo.id : card(), category_id: c['Transporte'], merchant: pick(['Uber', 'Bus Heredia', 'Gasolinera Delta', 'DiDi']) });
    if (rand() < 0.08) add(d, 20, { amount: between(5_000, 22_000), category_id: c['Entretenimiento'], merchant: pick(['Cinépolis', 'Steam', 'Teatro Nacional']) });
    if (rand() < 0.05) add(d, 16, { amount: between(12_000, 45_000), category_id: c['Ropa'], merchant: pick(['Zara', 'Simán', 'Ekono']) });
    if (rand() < 0.05) add(d, 10, { amount: between(4_000, 30_000), account_id: debito.id, category_id: c['Salud'], merchant: pick(['Farmacia Fischel', 'Clínica Bíblica', 'La Bomba']) });
  }

  // Dos pagos recientes de Wallet sin categoría, para la bandeja "por revisar".
  add(today, 13, { amount: 1_575_000, merchant: 'AUTOMERCADO ESCAZU', source: 'wallet', status: 'por_revisar', note: 'Wallet · Visa BAC' });
  add(today, 9, { amount: 390_000, merchant: 'STARBUCKS SAN PEDRO', source: 'wallet', status: 'por_revisar', note: 'Wallet · Visa BAC' });
  // Una compra en dólares: cuenta en colones y guarda lo pagado con el tipo de cambio.
  add(addDays(today, -2), 21, {
    amount: usdToColonCents(1999, 455), category_id: c['Entretenimiento'], merchant: 'Steam',
    original_currency: 'USD', original_amount: 1999, fx_rate: 455,
  });
  // Y uno que llegó sin monto (el datáfono no lo mandó): hay que completarlo al revisarlo.
  add(addDays(today, -1), 16, { amount: 0, amount_raw: '', merchant: 'ISHOP MULTIPLAZA', source: 'wallet', status: 'por_revisar', note: 'Wallet · Visa BAC' });

  const month = isoDate(startOfMonth(today));
  const budget = (category: string | null, amount: number): Budget => ({
    id: uid(), category_id: category ? c[category] : null, month, amount,
  });
  const budgets = [
    budget(null, 110_000_000),
    budget('Casa', 32_000_000),
    budget('Súper', 25_000_000),
    budget('Comida', 16_000_000),
    budget('Transporte', 6_000_000),
    budget('Servicios', 5_000_000),
    budget('Entretenimiento', 3_000_000),
  ];

  const rules: MerchantRule[] = [
    { id: uid(), pattern: 'NETFLIX', category_id: c['Suscripciones'], priority: 0 },
    { id: uid(), pattern: 'UBER', category_id: c['Transporte'], priority: 0 },
  ];

  // Los mismos fijos que trae el historial de ejemplo; la próxima fecha es la primera después de hoy, así que no se
  // repiten los movimientos ya sembrados.
  const fixed = (name: string, type: Recurring['type'], amount: number, account: Account, category: string, frequency: Recurring['frequency'], anchor: number): Recurring => {
    const prev = addMonths(startOfMonth(today), -1);
    const { next } = dueDates({ next_date: isoDate(prev), frequency, anchor_day: anchor }, today);
    return { id: uid(), name, type, amount, account_id: account.id, category_id: c[category], frequency, next_date: isoDate(next), anchor_day: anchor, active: true };
  };
  const recurring = [
    fixed('Planilla', 'ingreso', 68_000_000, debito, 'Salario', 'quincenal', 15),
    fixed('Alquiler', 'gasto', 32_000_000, debito, 'Casa', 'mensual', 1),
    fixed('Kölbi Internet', 'gasto', 1_490_000, visa, 'Suscripciones', 'mensual', 12),
    fixed('Netflix', 'gasto', 699_000, visa, 'Suscripciones', 'mensual', 18),
  ];

  return { version: VERSION, accounts, categories, transactions, budgets, rules, tokens: [], recurring };
}

export function createDemoApi(): Api {
  let db = load() ?? seed();
  persist(db);
  const commit = () => persist(db);
  const ok = <T,>(v: T) => Promise.resolve(structuredClone(v));

  const balances = (): AccountBalance[] =>
    db.accounts.map((a) => ({
      account_id: a.id,
      balance: db.transactions.reduce((sum, t) => {
        if (t.account_id === a.id) return sum + (t.type === 'ingreso' ? t.amount : -t.amount);
        if (t.to_account_id === a.id) return sum + t.amount;
        return sum;
      }, a.initial_balance),
    }));

  const progress = (month: string): BudgetProgress[] => {
    const parentOf = new Map(db.categories.map((c) => [c.id, c.parent_id]));
    return db.budgets
      .filter((b) => b.month === month)
      .map((b) => ({
        budget_id: b.id,
        category_id: b.category_id,
        month: b.month,
        limit_amount: b.amount,
        spent: db.transactions
          .filter(
            (t) =>
              t.type === 'gasto' &&
              isoDate(startOfMonth(crDayOf(t.occurred_at))) === month &&
              (b.category_id === null ||
                t.category_id === b.category_id ||
                (t.category_id && parentOf.get(t.category_id) === b.category_id)),
          )
          .reduce((s, t) => s + t.amount, 0),
      }));
  };

  return {
    listAccounts: () => ok(db.accounts.filter((a) => !a.archived).sort((a, b) => a.sort - b.sort)),
    listArchivedAccounts: () => ok(db.accounts.filter((a) => a.archived).sort((a, b) => a.name.localeCompare(b.name))),
    listCategories: () => ok(db.categories.filter((c) => !c.archived).sort((a, b) => a.sort - b.sort)),
    listBalances: () => ok(balances()),
    listTransactions: (r) =>
      ok(
        db.transactions
          .filter((t) => t.occurred_at >= r.from && t.occurred_at < r.to)
          .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)),
      ),
    listPending: () =>
      ok(db.transactions.filter((t) => t.status === 'por_revisar').sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))),
    listBudgets: (month) => ok(db.budgets.filter((b) => b.month === month)),
    listBudgetProgress: (month) => ok(progress(month)),
    listMerchantRules: () => ok([...db.rules].sort((a, b) => b.priority - a.priority)),
    listApiTokens: () => ok(db.tokens),

    async saveTransaction({ id, ...tx }) {
      if (id && db.transactions.some((t) => t.id === id)) {
        db.transactions = db.transactions.map((t) => (t.id === id ? { ...t, ...tx } : t));
      } else
        db.transactions.push({
          id: id ?? uid(), occurred_at: new Date().toISOString(), amount: 0, type: 'gasto', account_id: db.accounts[0].id,
          to_account_id: null, category_id: null, merchant: null, note: null, source: 'manual', status: 'confirmada', ...tx,
        });
      commit();
    },
    async deleteTransaction(id) {
      db.transactions = db.transactions.filter((t) => t.id !== id);
      commit();
    },
    async saveAccount({ id, ...acc }) {
      if (id) db.accounts = db.accounts.map((a) => (a.id === id ? { ...a, ...acc } : a));
      else
        db.accounts.push({
          id: uid(), name: '', type: 'efectivo', initial_balance: 0, color: null, icon: null, last4: null, wallet_name: null,
          credit_limit: null, cutoff_day: null, payment_day: null, archived: false, sort: db.accounts.length, ...acc,
        });
      commit();
    },
    async saveCategory({ id, ...cat }) {
      if (id) db.categories = db.categories.map((c) => (c.id === id ? { ...c, ...cat } : c));
      else
        db.categories.push({
          id: uid(), name: '', kind: 'gasto', icon: 'ellipsis', color: 'c10', parent_id: null, archived: false,
          sort: db.categories.length, ...cat,
        });
      commit();
    },
    listArchivedCategories: () => ok(db.categories.filter((c) => c.archived).sort((a, b) => a.name.localeCompare(b.name))),
    countCategoryUse: (id) => ok(db.transactions.filter((t) => t.category_id === id).length),
    async deleteCategory(id) {
      // Igual que en la base: movimientos quedan sin categoría; presupuestos y reglas se borran.
      db.transactions = db.transactions.map((t) => (t.category_id === id ? { ...t, category_id: null } : t));
      db.budgets = db.budgets.filter((b) => b.category_id !== id);
      db.rules = db.rules.filter((r) => r.category_id !== id);
      db.categories = db.categories
        .filter((c) => c.id !== id)
        .map((c) => (c.parent_id === id ? { ...c, parent_id: null } : c));
      commit();
    },
    async saveBudget(b) {
      const existing = db.budgets.find((x) => x.month === b.month && x.category_id === b.category_id);
      if (existing) existing.amount = b.amount;
      else db.budgets.push({ id: uid(), ...b });
      commit();
    },
    async deleteBudget(id) {
      db.budgets = db.budgets.filter((b) => b.id !== id);
      commit();
    },
    async copyBudgets(from, to) {
      let n = 0;
      for (const b of db.budgets.filter((x) => x.month === from)) {
        if (db.budgets.some((x) => x.month === to && x.category_id === b.category_id)) continue;
        db.budgets.push({ ...b, id: uid(), month: to });
        n++;
      }
      commit();
      return n;
    },
    async saveMerchantRule(r) {
      const existing = db.rules.find((x) => x.pattern.toUpperCase() === r.pattern.toUpperCase());
      if (existing) existing.category_id = r.category_id;
      else db.rules.push({ id: uid(), priority: 0, ...r });
      commit();
    },
    async deleteMerchantRule(id) {
      db.rules = db.rules.filter((r) => r.id !== id);
      commit();
    },
    async createApiToken(name) {
      db.tokens.push({ id: uid(), name, created_at: new Date().toISOString(), last_used_at: null });
      commit();
      return 'fz_demo_' + uid().replace(/-/g, '');
    },
    async revokeApiToken(id) {
      db.tokens = db.tokens.filter((t) => t.id !== id);
      commit();
    },
    listRecurring: () => ok([...db.recurring].sort((a, b) => a.next_date.localeCompare(b.next_date))),
    async saveRecurring({ id, ...r }) {
      if (id) db.recurring = db.recurring.map((x) => (x.id === id ? { ...x, ...r } : x));
      else
        db.recurring.push({
          id: uid(), name: '', type: 'gasto', amount: 0, account_id: db.accounts[0].id, category_id: null,
          frequency: 'mensual', next_date: isoDate(crDay()), anchor_day: null, active: true, ...r,
        });
      commit();
    },
    async deleteRecurring(id) {
      // Igual que en la base (on delete set null): los movimientos generados se quedan.
      db.recurring = db.recurring.filter((r) => r.id !== id);
      db.transactions = db.transactions.map((t) => (t.recurring_id === id ? { ...t, recurring_id: null } : t));
      commit();
    },
    async insertMissingTransactions(txs) {
      const fresh = txs.filter((t) => !db.transactions.some((x) => x.id === t.id));
      db.transactions.push(...structuredClone(fresh));
      commit();
      return fresh.length;
    },
    // En la demo las preferencias viven en este navegador, como el resto de los datos.
    async getPrefs() {
      try {
        return JSON.parse(localStorage.getItem(DEMO_PREFS_KEY) ?? '{}');
      } catch {
        return {};
      }
    },
    async savePrefs(prefs) {
      try {
        localStorage.setItem(DEMO_PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // modo privado
      }
    },
  };
}

/** Borra la demo y la vuelve a generar. */
export function resetDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nada que borrar
  }
}
