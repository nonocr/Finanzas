import type es from '../es/language';

const en: typeof es = {
  title: 'Language',
  row: 'Language',
  auto: 'Automatic',
  autoDetail: (name) => `Same as your phone (now: ${name})`,
  footer: 'Changes the text, dates and how amounts are written. Saved to your account.',
  names: { es: 'Español', en: 'English' },
};
export default en;
