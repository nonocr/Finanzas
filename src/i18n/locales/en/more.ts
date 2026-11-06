import type es from '../es/more';

const en: typeof es = {
  accounts: 'Accounts and cards',
  categories: 'Categories',
  rules: 'Merchant rules',
  appearance: 'Appearance',
  theme: 'Theme',
  home: 'Summary',
  homeDetail: 'What to show and in what order',
  discreet: 'Discreet mode',
  discreetDetail: 'Hides amounts until tapped',
  automatic: 'Automatic',
  wallet: 'Automatic tracking',
  walletDetail: 'Card payments, iPhone and Android',
  recurring: 'Recurring expenses and income',
  recurringDetail: 'Rent, salary, subscriptions',
  security: 'Security',
  changePassword: 'Change password',
  twoFactor: 'Two-step verification',
  data: 'Data',
  exportCsv: 'Export transactions (CSV)',
  exportJson: 'Export all my data',
  exportJsonDetail: 'JSON file with everything your account stores',
  resetDemo: 'Reset sample data',
  signOut: 'Sign out',
  privacy: 'Privacy',
  terms: 'Terms of use',
  deleteAccount: 'Delete account',
  demoNote:
    'Demo mode: this is sample data and it lives only in this browser. Connect Supabase to save your real data in the cloud.',
  exported: (n) => (n === 1 ? '1 transaction exported' : `${n} transactions exported`),
  csvHeader: ['date', 'type', 'amount', 'account', 'to', 'category', 'merchant', 'note', 'source', 'status', 'amount_usd', 'exchange_rate'],
  csvFile: (date) => `transactions-${date}.csv`,
  exportedAll: 'Data exported',
  jsonFile: (date) => `finanzas-my-data-${date}.json`,
  jsonNotes: {
    amounts:
      'Amounts (amount, initial_balance, credit_limit) are in colón cents: 1250000 = ₡12,500.00. original_amount is in US cents and fx_rate is the exchange rate used.',
    dates: 'Dates and times are in UTC (ISO 8601). Costa Rica is 6 hours behind.',
    ids: 'The id, *_id and user_id fields are internal identifiers that link records to each other (for example, which account a transaction belongs to).',
    transactions:
      'type: gasto (expense), ingreso (income) or transferencia (transfer). source: manual, wallet (iPhone Shortcut or Android notification), recurrente (recurring) or import. status: confirmada (confirmed) or por_revisar (to review). external_id identifies an automatically logged payment so it is not duplicated; amount_raw keeps the amount text when it could not be read.',
    shortcut_keys: 'Automatic logging keys are listed without their value: the database only keeps a fingerprint (hash) that cannot be turned back into the key.',
    legal_acceptances: 'Versions of the Terms of Use and Privacy Policy you accepted, when, and where (registro: when you created your account; app: inside the app).',
    not_included:
      "Not included: your password (only a fingerprint that can't be reversed exists) and the technical session data kept by the account system (IP address and device type of each open session). You can request them by email.",
  },
};
export default en;
