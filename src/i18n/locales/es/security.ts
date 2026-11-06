// Textos en español del área «security»: cambiar contraseña, eliminar cuenta y verificación en dos pasos (Ajustes →
// Seguridad). Las guías usan las marcas de <Rich>. Fuente de verdad: el inglés (locales/en/security.ts) tiene el mismo tipo.
export default {
  changePassword: {
    title: 'Cambiar contraseña',
    current: 'Actual',
    next: 'Nueva',
    repeat: 'Repetir',
    /** Mensajes por código de error de Supabase Auth. */
    errors: {
      same_password: 'La nueva contraseña es igual a la actual.',
      weak_password: 'La contraseña es muy débil.',
      current_password_mismatch: 'La contraseña actual no es correcta.',
      current_password_invalid: 'La contraseña actual no es correcta.',
      insufficient_aal: 'Vuelve a iniciar sesión con tu código de dos pasos e inténtalo de nuevo.',
      current_password_required: 'Escribe tu contraseña actual.',
      reauthentication_needed: 'Vuelve a iniciar sesión e inténtalo de nuevo.',
      over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
    },
    failed: 'No se pudo cambiar la contraseña. Revisa la actual e inténtalo de nuevo.',
    updated: 'Contraseña actualizada',
  },
  deleteAccount: {
    title: 'Eliminar cuenta',
    errors: {
      wrong_password: 'La contraseña no es correcta.',
      rate_limited: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
      mfa_required: 'Vuelve a iniciar sesión con tu código de dos pasos e inténtalo de nuevo.',
      error: 'No se pudo eliminar la cuenta. Revisa tu conexión e inténtalo de nuevo.',
    },
    warning:
      'Se borran **para siempre** tu cuenta y todo lo que registraste: movimientos, cuentas, categorías, presupuestos, fijos y reglas. No se puede deshacer.',
    exportHint: 'Si quieres conservar tus movimientos, expórtalos antes.',
    export: 'Exportar movimientos (CSV)',
    confirmFooter: 'Para confirmar que eres tú.',
    password: 'Contraseña',
    deleting: 'Eliminando…',
    submit: 'Eliminar mi cuenta',
  },
  twoFactor: {
    title: 'Dos pasos',
    activate: 'Activar',
    label: 'Verificación en dos pasos',
    footerOn: 'Activada: al entrar en un dispositivo nuevo, además de la contraseña se pide el código de 6 dígitos.',
    footerOff:
      'Además de la contraseña, para entrar se pedirá un código de 6 dígitos que cambia cada 30 segundos. Si alguien averigua tu contraseña, igual no puede ver tus finanzas.',
    startFailed: 'No se pudo empezar. Revisa tu conexión e inténtalo de nuevo.',
    verifyFailed: 'No se pudo verificar. Inténtalo de nuevo.',
    enabled: 'Verificación en dos pasos activada',
    confirmDisable: '¿Desactivar la verificación en dos pasos? Para entrar bastará la contraseña.',
    disableFailed: 'No se pudo desactivar. Vuelve a iniciar sesión e inténtalo de nuevo.',
    disabled: 'Verificación en dos pasos desactivada',
    step1: '1. Guarda el código en tu autenticador',
    addToPasswords: 'Agregar a Contraseñas',
    openInAuthenticator: 'Abrir en mi autenticador',
    qrAlt: 'Código QR para tu autenticador',
    manualKey: 'O escribe esta clave a mano en tu autenticador (tócala para copiarla).',
    keyCopied: 'Clave copiada',
    step2: '2. Escribe el código que aparece',
    code: 'Código',
    howTo: 'Cómo configurarla',
    howToFooter:
      'Funciona con cualquier gestor de contraseñas o app que genere códigos TOTP de 6 dígitos (Microsoft Authenticator, 1Password, Bitwarden…).',
    /** Pasos para configurarla en cada sistema (marcas de <Rich>). */
    guides: {
      ios: {
        title: 'iPhone (iOS)',
        app: 'Te recomendamos la app Contraseñas, que ya viene en el iPhone.',
        steps: [
          'Activa el interruptor de arriba.',
          'Toca **Agregar a Contraseñas**. Se abre Contraseñas (en iOS 17, Ajustes → Contraseñas): elige la entrada donde guardaste tu contraseña de Finanzas, o crea una, y confirma que guarde el código.',
          'Vuelve a Finanzas, escribe el código de 6 dígitos que muestra Contraseñas y toca **Activar**.',
          'Desde una computadora: escanea el QR con la cámara del iPhone y toca «Agregar código de verificación».',
          'Cuando entres en otro dispositivo, el código está en Contraseñas, en la entrada de Finanzas. En el iPhone el teclado suele sugerirlo solo.',
        ],
      },
      android: {
        title: 'Android',
        app: 'Te recomendamos Google Authenticator, gratis en Google Play.',
        steps: [
          'Instala [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2) desde Google Play.',
          'Activa el interruptor de arriba.',
          'Toca **Abrir en mi autenticador**: Google Authenticator se abre y agrega Finanzas. Si no se abre, en Google Authenticator toca **+** → «Ingresar una clave de configuración», ponle de nombre «Finanzas» y pega la clave (tócala aquí para copiarla).',
          'Escribe el código de 6 dígitos que aparece en Google Authenticator y toca **Activar**.',
          'Desde una computadora: en Google Authenticator toca + → «Escanear un código QR» y apunta al QR.',
          'Cuando entres en otro dispositivo, abre Google Authenticator y escribe el código de Finanzas.',
        ],
      },
    },
  },
};
