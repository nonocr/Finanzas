import type es from '../es/terms';

// English translation of es/terms.ts. The Spanish text is the source: keep both saying exactly the same thing.
const en: typeof es = {
  title: 'Terms of Use',
  updated: (date) => `Updated ${date}.`,
  intro: 'These terms are the rules for using Finanzas. Read them together with the [Privacy Policy](/privacidad), which explains what happens to your data.',
  sections: [
    {
      title: 'What Finanzas is',
      paragraphs: [
        'Finanzas is a free tool to record and review your personal finances in colones: expenses, income, transfers, budgets, and recurring expenses. It works on the web and as an app for iPhone and Android.',
        'It is a personal project: it is developed and run by a private individual, not a company or a financial institution (see "Who is responsible").',
      ],
    },
    {
      title: 'Acceptance',
      paragraphs: [
        'By creating your account and ticking the acceptance box, or by accepting a new version inside the app, you accept these terms and the Privacy Policy. A record is kept of the version you accepted and when.',
        "If you don't agree, don't create the account, or delete it from Settings → Delete account.",
      ],
    },
    {
      title: 'Your account',
      paragraphs: [
        "To create an account you must be 18 or older and use an email address that belongs to you. The account is personal: don't share it.",
        'Keep your password safe and, if you can, turn on two-step verification (Settings → Security). If you think someone got into your account, change your password and let us know.',
      ],
    },
    {
      title: 'What Finanzas is not',
      paragraphs: [
        "Finanzas **is not a bank or a financial institution**. It doesn't move money, make payments, or connect to your bank accounts, and it **doesn't give financial, accounting, tax, or investment advice**. The figures it shows come from what you record.",
        "The exchange rate for purchases in dollars is the Central Bank's reference rate (sell), taken from the public website of Costa Rica's Ministry of Finance. It is for information only and may differ from the one your bank applied; you can correct it on each transaction.",
        'Finanzas is not affiliated with or endorsed by Apple, Google, MacroDroid, any bank, the Central Bank, or the Ministry of Finance.',
      ],
    },
    {
      title: 'Automatic logging',
      paragraphs: [
        "Automatic logging depends on third-party tools (Apple Shortcuts and MacroDroid) and on each bank's notification format, which can change without notice. That's why it may miss payments, repeat them, or read them wrong. Check the transactions marked \"Review\" and make sure your records are complete.",
        "Your personal automatic logging key is like a password: don't share it. If it leaks, revoke it in Settings → Automatic tracking.",
      ],
    },
    {
      title: 'Acceptable use',
      paragraphs: [
        "Use Finanzas only to keep track of your own finances, and lawfully. Don't try to access other people's accounts or data, get around the service's limits, overload it, or use it to store information that isn't about your finances.",
        'If you find a security flaw, tell us privately (see "Who is responsible") instead of exploiting or publishing it.',
      ],
    },
    {
      title: 'Availability and changes',
      paragraphs: [
        "Finanzas is provided as is. Every effort is made to keep it working well, but it isn't guaranteed to always be available or free of errors. We recommend downloading your data from time to time (Settings → Export all my data).",
        'Features may change. If Finanzas were to shut down, you would be notified in advance by email and in the app so you can download your data.',
      ],
    },
    {
      title: 'Responsibility',
      paragraphs: [
        "The decisions you make with the app's information are yours. Finanzas is not responsible for errors in data you recorded or that arrived wrong through automatic logging, or for failures of the third-party services it depends on.",
        'Nothing in these terms limits the rights Costa Rican law gives you, including data protection rights and, where applicable, consumer protection rights.',
      ],
    },
    {
      title: 'Intellectual property',
      paragraphs: [
        '**Your data is yours.** Finanzas only uses it to provide the service, as the Privacy Policy explains.',
        'The app (its code, design, name, and icons) belongs to its developer. You may use it for your personal use, without copying, selling, or redistributing it. It includes third-party open-source components, governed by their own licenses: [list of licenses](https://finanzas-nono-0784.vercel.app/licencias.txt).',
      ],
    },
    {
      title: 'Ending the service for your account',
      paragraphs: [
        'You can delete your account whenever you want from Settings → Delete account or as explained on [this page](/eliminar-cuenta).',
        'If an account breaks these terms or puts the service or other people at risk, it may be suspended or deleted. Unless there is an urgent risk or the law prevents it, you will be told first by email so you can download your data.',
      ],
    },
    {
      title: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of the Republic of Costa Rica. If you have a complaint, write to us first to try to resolve it. This does not take away your right to go to the authorities or courts that apply to you under the law.',
      ],
    },
    {
      title: 'Changes to these terms',
      paragraphs: [
        "If these terms change, this page and its date are updated. If the change is significant, the app will ask you to accept it before you keep using it; if you don't accept it, you can download your data and delete your account.",
      ],
    },
  ],
};
export default en;
