import type es from '../es/categories';

const en: typeof es = {
  title: 'Categories',
  expenses: 'Expenses',
  incomes: 'Income',
  new: 'New category',
  archived: 'Archived',
  archivedFooter: "They don't show up when you add transactions. Tap one to reactivate or delete it.",
  updated: 'Category updated',
  created: 'Category created',
  duplicate: 'A category with that name already exists',
  archivedToast: 'Category archived',
  reactivatedToast: 'Category reactivated',
  deleted: 'Category deleted',
  edit: 'Edit category',
  name: 'Name',
  namePlaceholder: 'Pets',
  color: 'Color',
  colorLabel: (key) => `Color ${key}`,
  icon: 'Icon',
  reactivate: 'Reactivate category',
  archive: 'Archive',
  deleteForever: 'Delete permanently',
  deleteUnused: 'It has no transactions. It will be deleted along with its budget and rules.',
  deleteUsed: (n) =>
    `${n} ${n === 1 ? 'transaction will be' : 'transactions will be'} left without a category; they won't be deleted. Its budget and rules will be deleted.`,
  cannotUndo: "This can't be undone.",
  archiveHelp: 'Archiving hides it but keeps its history; you can reactivate it anytime.',
};
export default en;
