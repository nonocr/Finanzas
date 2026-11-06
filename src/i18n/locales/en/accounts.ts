import type es from '../es/accounts';

/** 1 → "1st", 2 → "2nd", 15 → "15th", 22 → "22nd". */
const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${s}`;
};

const en: typeof es = {
  title: 'Accounts',
  netWorth: 'Net worth',
  cashAndBanks: 'Cash and banks',
  creditCards: 'Credit cards',
  types: {
    efectivo: 'Cash',
    debito: 'Debit',
    credito: 'Credit',
    banco: 'Bank',
    ahorro: 'Savings',
  },
  kinds: {
    debito: 'Debit card',
    credito: 'Credit card',
    efectivo: 'Cash',
    banco: 'Bank account',
    ahorro: 'Savings',
  },
  paymentIn: (days) => (days === 1 ? 'Payment due in 1 day' : `Payment due in ${days} days`),
  cutoffOn: (day) => `statement closes on the ${ordinal(day)}`,
  upToDate: 'Paid off',
  ofLimit: (pct) => `${pct}% of limit`,
  add: 'Add card or account',
  archived: 'Archived',
  archivedFooter: "They don't show up when you add transactions or in your net worth. Tap one to reactivate it.",
  fallbackCardName: (credit, last4) => `${credit ? 'Credit' : 'Debit'} •${last4}`,
  updated: 'Account updated',
  added: (name) => `${name} added`,
  archivedToast: 'Account archived',
  reactivatedToast: 'Account reactivated',
  edit: 'Edit account',
  new: 'New account',
  type: 'Type',
  sameName: (name) => `You already have an account called “${name}”. Give it a different name.`,
  sameLast4: (name, last4) => `“${name}” also ends in ${last4}. Give them different names so you don't mix them up.`,
  savedAsBefore: "It'll be saved as ",
  savedAsAfter: '.',
  last4Help:
    'The last 4 digits tell it apart from your other cards, so Wallet payments land on the right one. The name is optional.',
  last4: 'Last 4 digits',
  name: 'Name',
  namePlaceholder: 'e.g. Visa BAC',
  creditDetails: 'Debt, limit and dates',
  currentBalance: 'Current balance',
  optional: 'Optional',
  creditBalanceFooter: 'What you owe today. Each purchase with the card raises it and each payment (Transfer) lowers it.',
  balanceFooter: 'What it has today. Each expense lowers it and each income raises it, including the ones from Wallet.',
  creditInFavor: 'Credit balance',
  currentDebt: 'Current debt',
  overpaid: 'You overpaid (credit balance)',
  overdrawn: 'Negative (overdrawn)',
  datesFooter: "With the dates, we'll tell you how many days are left to pay.",
  limit: 'Limit',
  cutoffDay: 'Statement closing day',
  paymentDay: 'Payment due day',
  walletNameFooter: "Only if the card has a different name in Apple Wallet and doesn't show the last 4 digits.",
  walletName: 'Name in Wallet',
  reactivate: 'Reactivate account',
  archive: 'Archive account',
};
export default en;
