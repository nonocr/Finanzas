import type es from '../es/legal';

// English translation of es/legal.ts. The Spanish text is the source: keep both saying exactly the same thing.
const en: typeof es = {
  updated: (date) => `Updated ${date}.`,

  owner: {
    title: 'Who is responsible',
    generic:
      'Finanzas is developed and run by a private individual in Costa Rica, who is responsible for the database and for how your data is handled. There is no company behind it.',
    named: (name) => `Responsible for the database and for how your data is handled: **${name}**.`,
    address: (address) => `Address: ${address}.`,
    contactGeneric:
      'For questions or to exercise your rights, reply from your account email to any email Finanzas has sent you (for example, the one confirming your account).',
    contactEmail: (email) => `For questions or to exercise your rights, write to **${email}** from your account email.`,
  },

  privacy: {
    title: 'Privacy Policy',
    intro: {
      title: 'In short',
      paragraphs: [
        "Finanzas stores what you record so it can show it to you. **It doesn't sell your data or hand it to anyone for their own use**, doesn't show ads, and doesn't use analytics or tracking tools.",
        'By creating your account you consent to what this policy explains, including that your data is stored on servers in the United States. You can withdraw your consent at any time by deleting your account.',
      ],
    },
    sections: [
      {
        title: 'What data is stored and why',
        paragraphs: [
          "**Your account:** your email, to sign in, confirm your account, recover your password, and tell you about security changes (for example, that your password changed). Your password is stored only as an encrypted fingerprint (hash): no one can read it. Also the app's language, so emails reach you in that language.",
          "**What you record:** accounts and cards (name, type, opening balance, credit limit, statement and payment days and, if you enter them, the last 4 digits or the name Wallet shows), transactions (amount, date, account, category, merchant, and note; if it was in dollars, also the dollar amount and the exchange rate), categories, budgets, recurring expenses and income, and merchant rules. They're used to show you your balances, statistics, and budget.",
          '**Your preferences:** theme, discreet mode, language, and how the Summary is laid out, so the app looks the same on all your devices.',
          '**Record of acceptance:** which version of these documents you accepted and when.',
          '**Security:** if you turn on two-step verification, the secret key of your authenticator app. For each open session, the account system also keeps the IP address and the browser or device type, to keep the session going and protect it. To stop abuse, the IP address that sends payments to automatic logging is used as an attempt counter, which is cleared periodically.',
          'Finanzas **never** asks for or stores full card numbers, PINs, or bank passwords, and it **does not connect to your bank**.',
        ],
      },
      {
        title: 'Automatic logging (optional)',
        paragraphs: [
          'Only if you set it up yourself in Settings → Automatic tracking:',
          "**iPhone Shortcut (Apple Wallet):** for each payment the Shortcut sends, the amount, merchant, the card's name in Wallet, and the date and time are stored. If the amount can't be read, the text as it arrived is also stored, so you can fix it.",
          "**Android:** the MacroDroid app, which you install and set up, sends the text of notifications from the apps you choose (your bank, Google Wallet). MacroDroid belongs to another company and has its own privacy policy. For each purchase notification, the amount, merchant, the card's network and last 4 digits, and the time are stored; the rest of the text is discarded, and notifications that aren't purchases aren't stored.",
          'Payments are sent with a personal key you create in the app. Only its encrypted fingerprint is stored, and you can revoke it at any time.',
        ],
      },
      {
        title: 'What is required',
        paragraphs: [
          "An account requires your email and a password: it can't be created without them. Everything else is up to you; if you don't record something, the app simply doesn't show it. Automatic logging and two-step verification are optional.",
        ],
      },
      {
        title: 'On your phone or browser',
        paragraphs: [
          "The app keeps on your device your session (so it doesn't ask for your password every time), a copy of your data to use offline (up to 7 days), changes that haven't been uploaded yet, and your appearance preferences. Signing out or deleting your account erases the copy of your data.",
          "Finanzas doesn't use cookies or advertising or analytics identifiers. What it keeps on your device is only what the app needs to work.",
        ],
      },
      {
        title: 'Who else is involved',
        paragraphs: [
          'Finanzas uses these providers to work. Each one handles the data to provide its service and under its own terms:',
          '**Supabase** hosts the database and accounts and runs automatic logging, on servers in the **United States** (Northern Virginia). [Supabase policy](https://supabase.com/privacy).',
          '**Vercel** delivers the web app and receives technical connection data, such as your IP address. [Vercel policy](https://vercel.com/legal/privacy-policy).',
          "**Google (Gmail)** sends the app's emails, so it receives your email address and the message content. [Google policy](https://policies.google.com/privacy).",
          "**Costa Rica's Ministry of Finance (Hacienda):** for purchases in dollars, the app looks up the exchange rate on its public website. Your device connects directly, so it receives your IP address like any website, but none of your account data.",
          'Apart from these providers, your data would only be handed to an authority if a law or a court order requires it.',
        ],
      },
      {
        title: 'Data outside Costa Rica',
        paragraphs: [
          "Your data is stored in the United States, outside Costa Rica. Costa Rica's Law 8968 requires your express authorization for that: you give it by ticking the box when you create your account or by accepting this policy in the app. If you don't agree, don't create the account, or delete it.",
        ],
      },
      {
        title: 'How long it is kept',
        paragraphs: [
          'For as long as you have the account. What you delete in the app is deleted from the database right away, and deleting the account deletes everything immediately.',
          'After deletion, the following may remain for a limited time: database backups, if the provider keeps them, until they expire; providers\' technical logs (for example, of connections); attempt counters, which are cleared periodically; and emails the app sent you or that you exchanged with Finanzas, in the email account that sends them.',
        ],
      },
      {
        title: 'How it is protected',
        paragraphs: [
          "All connections are encrypted (HTTPS). The database keeps each person's information separate and doesn't let anyone see or change someone else's. You can turn on two-step verification, and with it the database won't hand your data to a session that didn't pass the code. Passwords and automatic logging keys are stored only as encrypted fingerprints, and there are limits on repeated attempts.",
          "Whoever runs Finanzas has technical access to the database to keep it working, keeps it confidential, and doesn't look at your data unless you ask them to, to fix a problem, or the law requires it.",
          'No system is foolproof. If a security incident affects your data, you will be notified by email.',
        ],
      },
      {
        id: 'derechos',
        title: 'Your rights',
        paragraphs: [
          '**Access:** Settings → Export all my data downloads a file with everything your account stores. Transactions can also be exported as CSV.',
          '**Correction:** you can edit or delete any data in the app.',
          '**Deletion and withdrawing consent:** Settings → Delete account deletes your account and all your data. To stop using only automatic logging, revoke your key in Settings → Automatic tracking. [How to delete your account](/eliminar-cuenta).',
          "You can also request any of these by email (see \"Who is responsible\"). It's free, and you'll get an answer within five business days at most, as Law 8968 requires.",
          "If you believe your data wasn't handled properly, you can file a complaint with Costa Rica's **Data Protection Agency (Prodhab)**: [prodhab.go.cr](https://www.prodhab.go.cr).",
        ],
      },
      {
        title: 'Minors',
        paragraphs: ['Finanzas is for people aged 18 or older. If an account is found to belong to a minor, it is deleted along with its data.'],
      },
      {
        title: 'Changes',
        paragraphs: [
          'If this policy changes, this page and its date are updated. If the change affects what data is stored, why, with whom, or where, the app will ask you to accept it before you keep using it.',
        ],
      },
    ],
  },

  deletion: {
    title: 'Delete your Finanzas account',
    intro:
      "You can delete your Finanzas account and all your data whenever you want, at no cost. You don't need to install the app: you can also do it from a browser.",
    howTo: {
      title: 'From the app or a browser',
      paragraphs: (url) => [
        `1. Sign in to Finanzas in the app or in [the web version](${url}) with your email and password.`,
        '2. Tap **Settings**, then **Delete account**.',
        '3. Enter your password and confirm.',
        'If you forgot your password, use "Forgot your password?" on the sign-in screen. Before deleting your account you can download your data from Settings → Export all my data.',
      ],
    },
    sections: [
      {
        title: "If you can't sign in",
        paragraphs: [
          'Request deletion by email from your account\'s address (see "Who is responsible" below). Only the account for that email is deleted, so no one can delete someone else\'s. You\'ll get an answer within five business days at most.',
        ],
      },
      {
        title: 'What is deleted and what remains',
        paragraphs: [
          '**Deleted immediately:** your account and everything you recorded: accounts and cards, transactions, categories, budgets, recurring expenses and income, rules, automatic logging keys, preferences, two-step verification, your sessions, and the record of your acceptance of these documents.',
          "**May remain for a limited time:** database backups, if the provider keeps them, until they expire; providers' technical logs; attempt counters, which are cleared periodically; and emails the app sent you, in the email account that sends them.",
          "Deletion can't be undone.",
        ],
      },
    ],
  },

  signupConsent:
    'I accept the [Terms of Use](/terminos) and the [Privacy Policy](/privacidad), including that my data is stored on servers in the United States.',

  gate: {
    title: 'Terms and privacy',
    subtitle: (date) => `The Terms of Use and Privacy Policy were updated on ${date}. To keep using Finanzas, please review and accept them.`,
    consent:
      'I accept the [Terms of Use](/terminos) and the [Privacy Policy](/privacidad), including that my data is stored on servers in the United States.',
    accept: 'Accept and continue',
    declineHint: "If you don't agree, you can download your data and delete your account, or sign out.",
    export: 'Download my data',
    deleteAccount: 'Delete my account',
    signOut: 'Sign out',
    error: "Couldn't save. Check your connection and try again.",
  },
};
export default en;
