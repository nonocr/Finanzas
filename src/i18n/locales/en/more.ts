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
  resetDemo: 'Reset sample data',
  signOut: 'Sign out',
  privacy: 'Privacy',
  deleteAccount: 'Delete account',
  demoNote:
    'Demo mode: this is sample data and it lives only in this browser. Connect Supabase to save your real data in the cloud.',
  exported: (n) => (n === 1 ? '1 transaction exported' : `${n} transactions exported`),
  csvHeader: ['date', 'type', 'amount', 'account', 'to', 'category', 'merchant', 'note', 'source', 'status', 'amount_usd', 'exchange_rate'],
  csvFile: (date) => `transactions-${date}.csv`,
};
export default en;
