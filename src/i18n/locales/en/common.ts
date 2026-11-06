import type es from '../es/common';

const en: typeof es = {
  cancel: 'Cancel',
  close: 'Close',
  save: 'Save',
  done: 'Done',
  edit: 'Edit',
  delete: 'Delete',
  remove: 'Remove',
  back: 'Back',
  settings: 'Settings',
  seeAll: 'See all',
  copy: 'Copy',
  copied: (what) => `${what} copied`,
  copyFailed: "Couldn't copy; press and hold to copy",
  genericError: "Couldn't finish. Check your connection and try again.",
  saveFailed: "A change couldn't be saved. Check Transactions and try again.",
  offline: 'Offline',
  offlineWaiting: (n) => `Offline · ${n} ${n === 1 ? 'change is' : 'changes are'} waiting to upload`,
  uploading: (n) => `Uploading ${n} ${n === 1 ? 'change' : 'changes'}…`,
  recurringRegistered: (n) => (n === 1 ? '1 recurring transaction was added' : `${n} recurring transactions were added`),
  noCategory: 'No category',
  weekdayInitials: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};
export default en;
