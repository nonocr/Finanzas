import type es from '../es/stats';

const en: typeof es = {
  title: 'Statistics',
  spent: 'Spent',
  change: (pct, more, month, soFar) => `${pct}% ${more ? 'more' : 'less'} than ${month}${soFar ? ' at this point' : ''}`,
  income: 'Income',
  savings: 'Savings',
  expenses: 'Expenses',
  byCategory: 'By category',
  noExpenses: 'No expenses this month',
  noExpensesSentence: 'No expenses this month.',
  total: 'Total',
  lastMonths: 'Last 6 months',
  chartPoint: (month, expenses, income) => `${month}: expenses ${expenses}, income ${income}`,
  methods: 'Cash and card',
  method: { tarjeta: 'Card', efectivo: 'Cash', otro: 'Other' },
  merchants: 'Where you spend the most',
  noMerchants: 'No merchants this month',
  purchases: (n) => `${n} ${n === 1 ? 'purchase' : 'purchases'}`,
};
export default en;
