import type es from '../es/legal';

const en: typeof es = {
  title: 'Privacy',
  updated: (date) => `Updated ${date}.`,
  sections: [
    {
      title: 'In short',
      paragraphs: [
        "Finanzas stores what you record so it can show it to you. **It doesn't sell or share your data**, doesn't show ads, and doesn't use third-party tracking tools.",
      ],
    },
    {
      title: 'What is stored',
      paragraphs: [
        '**Your account:** your email and your password. The password is stored encrypted; no one can read it.',
        '**What you record:** accounts and cards (name and, if you enter them, the last 4 digits), transactions, categories, budgets, recurring expenses, and merchant rules.',
        '**If you use the Apple Wallet Shortcut:** the amount, merchant, and card of each payment the Shortcut sends, plus a personal key for the Shortcut, stored encrypted.',
        "**If you use automatic logging on Android:** the text of the notifications MacroDroid sends, only from the apps you choose (your bank, Google Wallet). For each purchase notification, the amount, the merchant, and the card's last 4 digits are stored; notifications that aren't purchases are discarded without being stored.",
        'Full card numbers, PINs, and bank passwords are never stored.',
      ],
    },
    {
      title: 'Who can see it',
      paragraphs: [
        "Only you. The database keeps each person's information separate and doesn't let anyone see or change someone else's.",
        "Whoever runs the app has technical access to the database to keep it working. They don't look at your data unless you ask them to, to fix a problem.",
      ],
    },
    {
      title: 'Where it is stored',
      paragraphs: [
        "In **Supabase** (database and user accounts), on servers in the United States. The app is served from **Vercel**. The app's emails (confirming your account, recovering your password) are sent through **Gmail**. All connections are encrypted (HTTPS).",
        "For purchases in dollars, the app looks up the exchange rate on the public website of Costa Rica's Ministry of Finance (Hacienda); that lookup doesn't include any of your data.",
      ],
    },
    {
      title: 'What you can do',
      paragraphs: [
        '**Download your data:** Settings → Export transactions (CSV).',
        '**Delete your account:** Settings → Delete account. Your account and everything you recorded are deleted immediately. Database backups, if any, are deleted automatically within 30 days at most.',
        '**Request access, correction, or deletion** of your data: reply to any email Finanzas has sent you.',
      ],
    },
    {
      title: 'Changes',
      paragraphs: ['If this policy changes, this page and its date are updated.'],
    },
  ],
};
export default en;
