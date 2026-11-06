import type es from '../es/rules';

const en: typeof es = {
  title: 'Rules',
  intro: 'When a Wallet payment comes in from a merchant that contains the text, it gets the category automatically.',
  newRule: 'New rule',
  merchant: 'Merchant',
  assignTo: 'Assign to',
  save: 'Save rule',
  saved: 'Rule saved',
  active: 'Active rules',
  emptyTitle: 'No rules yet',
  emptyBody: 'You can also create them when you confirm a Wallet payment.',
  archivedCategory: 'Archived category',
  deleteLabel: (pattern) => `Delete rule ${pattern}`,
  confirmDelete: (pattern) => `Delete the rule “${pattern}”? Payments you've already saved won't change.`,
};
export default en;
