import type es from '../es/nav';

const en: typeof es = {
  tabs: { home: 'Summary', transactions: 'Transactions', stats: 'Statistics', budget: 'Budget' },
  sections: 'Sections',
  addTransaction: 'Add transaction',
  toReview: (label, n) => `${label}, ${n} to review`,
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
};
export default en;
