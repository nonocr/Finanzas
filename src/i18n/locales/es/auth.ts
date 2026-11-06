// Textos en español del área «auth»: entrar, crear cuenta, restablecer contraseña, código de dos pasos y las reglas de
// contraseña. Fuente de verdad: el inglés (locales/en/auth.ts) tiene el mismo tipo.
export default {
  /** Mensajes por código de error de Supabase Auth. */
  errors: {
    invalid_credentials: 'Correo o contraseña incorrectos.',
    email_not_confirmed: 'Falta confirmar el correo. Abre el enlace que te enviamos.',
    over_email_send_rate_limit: 'Se alcanzó el límite de correos por hora. Inténtalo de nuevo en una hora.',
    over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
    same_password: 'La nueva contraseña es igual a la anterior.',
    weak_password: 'La contraseña es muy débil.',
    signup_disabled: 'Por ahora no se pueden crear cuentas nuevas.',
    email_address_invalid: 'Ese correo no es válido.',
    email_address_not_authorized: 'No se pudo enviar el correo a esa dirección.',
  },
  /** Dónde se abre el enlace del correo, según el dispositivo. */
  whereLinkOpens: {
    ios: 'Ábrelo en este iPhone; se abrirá en Safari.',
    android: 'Ábrelo en este teléfono; se abrirá en el navegador.',
    other: 'Ábrelo en este dispositivo.',
  },
  check: {
    title: 'Confirma tu correo',
    subtitle: (email: string, where: string) =>
      `Si ${email} no tenía cuenta, te llegará un enlace para confirmarla. ${where} Después entra aquí con tu correo y contraseña.`,
    button: 'Ya la confirmé, entrar',
  },
  sent: {
    title: 'Revisa tu correo',
    subtitle: (email: string, where: string) => `Si ${email} tiene cuenta, te llegará un enlace para poner una contraseña nueva. ${where}`,
    button: 'Volver a entrar',
  },
  noEmail: '¿No llega? Revisa la carpeta de spam o de promociones.',
  titles: { login: 'Finanzas', signup: 'Crear cuenta', forgot: 'Restablecer contraseña' },
  subtitles: {
    login: 'Entra para ver tus gastos.',
    signup: 'Tus gastos, ingresos y presupuesto en colones. Solo tú ves tus datos.',
    forgot: 'Te enviaremos un enlace a tu correo para poner una contraseña nueva.',
  },
  submit: { login: 'Entrar', signup: 'Crear cuenta', forgot: 'Enviar enlace' },
  notices: {
    confirmed: 'Tu correo quedó confirmado. Ya puedes entrar.',
    expired: 'El enlace venció o ya se usó. Entra con tu correo y contraseña; si falta confirmarlo, te lo reenviamos.',
    accountDeleted: 'Tu cuenta y todos tus datos se eliminaron.',
    partialSignOut:
      'Cerraste sesión sin conexión, así que solo se cerró en este dispositivo. Para cerrarla en todos, entra con conexión y vuelve a tocar «Cerrar sesión».',
  },
  email: 'Correo',
  password: 'Contraseña',
  newPassword: 'Nueva contraseña',
  repeatPassword: 'Repetir contraseña',
  /** Lo que le falta a la contraseña (ver passwordRules). */
  missing: (items: string[]) => `Le falta: ${items.join(', ')}.`,
  mismatch: 'Las contraseñas no coinciden.',
  rules: 'Mínimo 8 caracteres, con minúscula, mayúscula y número.',
  resend: 'Reenviar el correo de confirmación',
  resent: 'Te reenviamos el enlace',
  forgotLink: '¿Olvidaste tu contraseña?',
  signupLink: '¿No tienes cuenta? Crear una',
  haveAccount: 'Ya tengo cuenta, entrar',
  codePlaceholder: 'Código de 6 dígitos',
  mfa: {
    title: 'Verificación',
    subtitle: 'Escribe el código de 6 dígitos de tu app de autenticación.',
    verify: 'Verificar',
  },
  reset: {
    title: 'Contraseña nueva',
    /** «Para correo@ejemplo.com.» (el correo va resaltado entre las dos partes). */
    forBefore: 'Para',
    forAfter: '.',
    codeHint: 'Tienes verificación en dos pasos: escribe el código de tu autenticador.',
    save: 'Guardar contraseña',
    doneTitle: 'Contraseña nueva lista',
    doneSubtitle: 'Ya puedes entrar con ella en la app. Por seguridad, aquí se cerró la sesión; puedes cerrar esta página.',
    signInHere: 'Entrar aquí',
  },
  /** Reglas de contraseña que faltan (src/lib/auth/password.ts). */
  passwordRules: {
    length: '8 caracteres',
    lower: 'una minúscula',
    upper: 'una mayúscula',
    digit: 'un número',
    max: 'máximo 72 caracteres',
  },
  /** Errores del código de dos pasos (src/lib/auth/mfa.ts). */
  mfaErrors: {
    mfa_verification_failed: 'Código incorrecto o vencido. Prueba con el siguiente.',
    mfa_challenge_expired: 'El código venció. Prueba con el siguiente.',
    over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
  },
  mfaNoFactor: 'No hay verificación en dos pasos activada.',
  mfaVerifyFailed: 'No se pudo verificar. Revisa tu conexión e inténtalo de nuevo.',
};
