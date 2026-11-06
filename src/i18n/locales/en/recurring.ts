import type es from '../es/recurring';

/** 1 → "1st", 2 → "2nd", 15 → "15th", 22 → "22nd". */
const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${s}`;
};

const en: typeof es = {
  title: 'Recurring',
  intro:
    "Rent, salary, subscriptions: on the day they're due, they're added on their own when you open the app, and they count toward your budget like any other expense.",
  today: 'Today',
  tomorrow: 'Tomorrow',
  inDays: (n) => (n === 1 ? 'In 1 day' : `In ${n} days`),
  paused: 'Paused',
  expensesPerMonth: 'Recurring expenses per month',
  incomePerMonth: 'Recurring income per month',
  upcoming: 'Upcoming',
  emptyTitle: 'No recurring items yet',
  emptyBody: 'Add what you always pay or receive in the same amount, like rent or your salary.',
  add: 'Add recurring expense or income',
  pausedFooter: "They won't be added until you reactivate them.",
  frequency: { semanal: 'Weekly', quincenal: 'Twice a month', mensual: 'Monthly', anual: 'Yearly' },
  every: { semanal: 'Week', quincenal: 'Half month', mensual: 'Month', anual: 'Year' },
  schedule: {
    weekly: (weekday) => `Every ${weekday}`,
    biweekly: (d1, d2) => `On the ${ordinal(d1)} and the ${ordinal(d2)}`,
    monthly: (day) => `On the ${ordinal(day)} of every month`,
    yearly: (dayMonth) => `Every ${dayMonth}`,
  },
  changesSaved: 'Changes saved',
  added: (name) => `${name} added`,
  charged: (n) => (n === 1 ? '1 charge added' : `${n} charges added`),
  deleted: 'Recurring item deleted',
  edit: 'Edit recurring item',
  newIncome: 'New recurring income',
  newExpense: 'New recurring expense',
  expense: 'Expense',
  income: 'Income',
  name: 'Name',
  incomePlaceholder: 'Salary',
  expensePlaceholder: 'Rent',
  category: 'Category',
  depositTo: 'Goes into',
  paidWith: 'Paid with',
  repeatsEvery: 'Repeats every',
  pastDate: "That date has passed: when you save, the charges from then until today will be added too.",
  alreadyThisMonth: "If you already added it by hand this month, pick the date of the next charge.",
  nextCharge: 'Next charge',
  activeFooter: "While paused, nothing is added; what was already added doesn't change.",
  active: 'Active',
  confirmDelete: 'Delete this recurring item? The transactions it already added will stay.',
  delete: 'Delete recurring item',
};
export default en;
