import type es from '../es/budgets';

const en: typeof es = {
  title: 'Budget',
  saved: 'Budget saved',
  removed: 'Budget removed',
  copied: (n, month) => (n === 1 ? '1 budget copied' : n ? `${n} budgets copied` : `There were no budgets in ${month}`),
  copyFrom: (month) => `Copy budgets from ${month}`,
  monthTotal: 'Monthly total',
  of: (amount) => `of ${amount}`,
  over: (amount) => `${amount} over`,
  left: (amount) => `${amount} left`,
  leftPct: (amount, pct) => `${amount} left · ${pct}%`,
  atLimit: 'You reached the limit',
  sourceSum: "It's the sum of your categories and counts only what you spent in them. Tap to set your own total.",
  sourceAdjusted: (amount) => `Raised to the sum of your categories; you had set ${amount}.`,
  sourceManual: 'Set by you. Tap to change it.',
  setTotal: 'Set the monthly total',
  byCategory: 'By category',
  unassigned: (amount) => `Not assigned to categories: ${amount}.`,
  noBudget: 'No budget',
  alert: {
    list: (names) =>
      names.length <= 1
        ? names.join('')
        : names.length === 2
          ? `${names[0]} and ${names[1]}`
          : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`,
    over: (names, n) => `${names} ${n === 1 ? 'has' : 'have'} reached ${n === 1 ? 'its' : 'their'} budget limit.`,
    near: (names, n) => `${names} ${n === 1 ? 'is' : 'are'} over 80%.`,
  },
};
export default en;
