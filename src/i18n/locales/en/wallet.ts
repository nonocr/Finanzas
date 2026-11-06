import type es from '../es/wallet';

// El nombre del archivo se escribe tal cual (es el mismo en los dos idiomas); el del atajo va en inglés.
const QUEUE_FILE = 'finanzas-pendientes.txt';
const SEND_SHORTCUT = 'Finanzas · Send pending';
const MACRODROID = 'https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid';

const en: typeof es = {
  title: 'Automatic tracking',
  intro:
    'Your card payments get recorded on their own. On iPhone, with Apple Wallet and Shortcuts. On Android, with the purchase notifications from your bank or Google Wallet and the MacroDroid app.',
  demo: "You're in demo mode: the token works for practice, but real payments only arrive once you connect Supabase.",
  tokenNames: { ios: 'iPhone Shortcut', android: 'MacroDroid Android', other: 'Automatic tracking' },
  revokeConfirm: (name) =>
    `Revoke “${name}”? Whatever uses it (the Shortcut or MacroDroid) will stop recording payments until you give it another token.`,
  endpointPlaceholder: 'https://<your-project>.supabase.co/functions/v1/wallet-sync',
  tokenHeader: 'Your token',
  tokenFooter: "It's the key that proves the payments are yours. One per phone; if you lose one, revoke it.",
  copyNow: "Copy it now; for security, it won't be shown again.",
  token: 'Token',
  address: 'Address',
  copyToken: 'Copy token',
  copyAddress: 'Copy address',
  noToken: "You don't have a token yet",
  noTokenBody: 'Create one to connect your phone.',
  lastUsed: (date) => `Last payment received ${date}`,
  created: (date) => `Created ${date}`,
  revoke: 'Revoke',
  createToken: 'Create token',
  createAnother: 'Create another token',
  addressHeader: 'Address',
  forIphone: 'For iPhone (Shortcuts)',
  forAndroid: 'For Android (MacroDroid)',
  howHeader: 'How to set it up',
  howFooter: "Payments are sent encrypted, with your token, and they're never duplicated. If one arrives without a known category, it's left to review.",
  ios: 'iPhone (iOS)',
  iosIntro:
    "With the Shortcuts app, which comes with your iPhone. Each Apple Pay payment is saved to a file and sent; if there's no signal, it's sent later.",
  groupSend: 'Shortcut that sends the payments',
  groupWallet: 'Wallet automation',
  groupWifi: 'Resend when you connect to Wi‑Fi',
  sendSteps: [
    `In Shortcuts, on the “Shortcuts” tab, tap + to create a new shortcut. At the top, tap the name and call it \`${SEND_SHORTCUT}\`.`,
    `Add “Get File”. Tap “Folder” and choose the **Shortcuts** folder in iCloud Drive. In the path, type \`${QUEUE_FILE}\`. Turn off “Error If Not Found”.`,
    'Add “If”. Condition: “File” → “does not have any value”. Inside the If, add “Stop This Shortcut”.',
    'Below “End If”, add “Get Contents of URL” and paste the **iPhone address**. Under “Show More”: method POST; header `Authorization` = `Bearer ` + your token; Request Body “File”, and choose the “File” variable.',
    'Add another “If”. Condition: “Contents of URL” → “contains” → type `"ok":true` (with the quotes). Inside the If, add “Delete Files” with the “File” variable and turn off “Confirm Before Deleting”.',
    'Tap Done.',
  ],
  walletSteps: [
    'Automation tab → + → “Wallet”. Choose your cards, select “Run Immediately”, tap Next, then “New Blank Automation”.',
    'Add “Format Date”. Date: “Current Date”. Format: “ISO 8601”, and turn on “Include Time”.',
    'Add “Dictionary” with 5 Text items: `amount` → Amount, `merchant` → Merchant, `card` → Card or Pass, `name` → Name (variables from “Shortcut Input”), and `at` → “Formatted Date”.',
    `Add “Append to Text File”. Text: the “Dictionary” variable. Folder: Shortcuts. Path: \`${QUEUE_FILE}\`. Turn on “Make New Line”.`,
    `Add “Run Shortcut” and choose “${SEND_SHORTCUT}”. Turn off “Show When Run”. Tap Done.`,
  ],
  wifiSteps: [
    'Automation → + → “Wi‑Fi”. Choose “Any Network”, select “Run Immediately”, tap Next, then “New Blank Automation”.',
    `Add “Run Shortcut”, choose “${SEND_SHORTCUT}”, and tap Done.`,
  ],
  android: 'Android',
  androidIntro:
    'With MacroDroid, free on Google Play. It only reads notifications from the apps you choose and sends the purchase ones. It also catches purchases made with your physical card, if your bank notifies you about them.',
  androidSteps: [
    `Install [MacroDroid](${MACRODROID}) from Google Play (it's free) and open it.`,
    'Tap **Add Macro** and name it `Finanzas`.',
    "Under **Triggers**, tap + and search for “Notification Received”. Choose your bank's app and, if you pay with your phone, Google Wallet too. Leave the content set to “Any”. MacroDroid will ask for **notification access**: turn it on.",
    'Under **Actions**, tap + and search for “HTTP Request”. Method `POST`. In the URL, paste the **Android address** (above).',
    'In the headers, add one: name `Authorization`, value `Bearer ` followed by your token (with the space after “Bearer”).',
    'In the request body, choose the type `text/plain`. With the Magic Text button (…), insert the **notification title**, move to the next line, and insert the **notification text**. It should look like this: `[not_title]` on the first line and `[notification]` on the second.',
    "Save the macro with the ✓ and check that it's enabled.",
    "In your phone's settings, under Battery, turn off battery optimization for MacroDroid: otherwise Android may close it and it would stop sending.",
    'Done: after your next purchase, the payment shows up in Finanzas **to review**. Check the amount and merchant and confirm it with a tap.',
  ],
  androidNote: "If there's no signal at the moment of the purchase, MacroDroid won't resend it later: record that payment by hand.",
};
export default en;
