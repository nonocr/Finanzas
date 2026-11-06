import type es from '../es/security';

const en: typeof es = {
  changePassword: {
    title: 'Change password',
    current: 'Current',
    next: 'New',
    repeat: 'Repeat',
    errors: {
      same_password: 'The new password is the same as the current one.',
      weak_password: 'The password is too weak.',
      current_password_mismatch: "The current password isn't correct.",
      current_password_invalid: "The current password isn't correct.",
      insufficient_aal: 'Sign in again with your two-step code and try again.',
      current_password_required: 'Enter your current password.',
      reauthentication_needed: 'Sign in again and try again.',
      over_request_rate_limit: 'Too many attempts. Wait a few minutes.',
    },
    failed: "Couldn't change the password. Check your current one and try again.",
    updated: 'Password updated',
  },
  deleteAccount: {
    title: 'Delete account',
    errors: {
      wrong_password: "The password isn't correct.",
      rate_limited: 'Too many attempts. Wait 15 minutes and try again.',
      mfa_required: 'Sign in again with your two-step code and try again.',
      error: "Couldn't delete the account. Check your connection and try again.",
    },
    warning:
      "Your account and everything you recorded will be deleted **forever**: transactions, accounts, categories, budgets, recurring items, and rules. This can't be undone.",
    exportHint: 'If you want to keep your transactions, export them first.',
    export: 'Export transactions (CSV)',
    confirmFooter: "To confirm it's you.",
    password: 'Password',
    deleting: 'Deleting…',
    submit: 'Delete my account',
  },
  twoFactor: {
    title: 'Two-step',
    activate: 'Turn On',
    label: 'Two-step verification',
    footerOn: "On: when you sign in on a new device, you'll be asked for the 6-digit code in addition to your password.",
    footerOff:
      "In addition to your password, signing in will ask for a 6-digit code that changes every 30 seconds. Even if someone finds out your password, they still can't see your finances.",
    startFailed: "Couldn't get started. Check your connection and try again.",
    verifyFailed: "Couldn't verify. Try again.",
    enabled: 'Two-step verification turned on',
    confirmDisable: 'Turn off two-step verification? Your password alone will be enough to sign in.',
    disableFailed: "Couldn't turn it off. Sign in again and try again.",
    disabled: 'Two-step verification turned off',
    step1: '1. Save the code in your authenticator',
    addToPasswords: 'Add to Passwords',
    openInAuthenticator: 'Open in my authenticator',
    qrAlt: 'QR code for your authenticator',
    manualKey: 'Or type this key into your authenticator by hand (tap it to copy it).',
    keyCopied: 'Key copied',
    step2: '2. Enter the code it shows',
    code: 'Code',
    howTo: 'How to set it up',
    howToFooter:
      'Works with any password manager or app that generates 6-digit TOTP codes (Microsoft Authenticator, 1Password, Bitwarden…).',
    guides: {
      ios: {
        title: 'iPhone (iOS)',
        app: 'We recommend the Passwords app, which comes built into iPhone.',
        steps: [
          'Turn on the switch above.',
          'Tap **Add to Passwords**. Passwords opens (on iOS 17, Settings → Passwords): choose the entry where you saved your Finanzas password, or create one, and confirm that it saves the code.',
          'Go back to Finanzas, enter the 6-digit code Passwords shows, and tap **Turn On**.',
          'From a computer: scan the QR code with the iPhone camera and tap "Set Up Verification Code".',
          'When you sign in on another device, the code is in Passwords, in the Finanzas entry. On iPhone, the keyboard usually suggests it for you.',
        ],
      },
      android: {
        title: 'Android',
        app: 'We recommend Google Authenticator, free on Google Play.',
        steps: [
          'Install [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2) from Google Play.',
          'Turn on the switch above.',
          'Tap **Open in my authenticator**: Google Authenticator opens and adds Finanzas. If it doesn\'t open, in Google Authenticator tap **+** → "Enter a setup key", name it "Finanzas", and paste the key (tap it here to copy it).',
          'Enter the 6-digit code shown in Google Authenticator and tap **Turn On**.',
          'From a computer: in Google Authenticator tap + → "Scan a QR code" and point it at the QR code.',
          'When you sign in on another device, open Google Authenticator and enter the Finanzas code.',
        ],
      },
    },
  },
};
export default en;
