// Textos en español del área «wallet». Fuente de verdad: el inglés (locales/en/wallet.ts) tiene el mismo tipo.
// Los pasos usan las marcas de <Rich>: **negrita**, `texto para escribir tal cual` y [enlace](https://…).

/** Archivo de la cola en iCloud Drive: se escribe tal cual, igual en los dos idiomas. */
const QUEUE_FILE = 'finanzas-pendientes.txt';
const SEND_SHORTCUT = 'Finanzas · Enviar pendientes';
const MACRODROID = 'https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid';

export default {
  title: 'Registro automático',
  intro:
    'Tus pagos con tarjeta se registran solos. En iPhone, con Apple Wallet y Atajos. En Android, con las notificaciones de compra de tu banco o de Google Wallet y la app MacroDroid.',
  demo: 'Estás en modo demo: el token sirve para practicar, pero los pagos reales llegan solo cuando conectes Supabase.',
  /** Nombre del token nuevo según el teléfono. */
  tokenNames: { ios: 'Atajo iPhone', android: 'MacroDroid Android', other: 'Registro automático' },
  revokeConfirm: (name: string) =>
    `¿Revocar «${name}»? Lo que lo usa (el Atajo o MacroDroid) deja de registrar pagos hasta que le pongas otro token.`,
  endpointPlaceholder: 'https://<tu-proyecto>.supabase.co/functions/v1/wallet-sync',
  tokenHeader: 'Tu token',
  tokenFooter: 'Es la clave que demuestra que los pagos son tuyos. Uno por teléfono; si pierdes uno, revócalo.',
  copyNow: 'Cópialo ahora; por seguridad no se vuelve a mostrar.',
  /** Lo que se copió (para el aviso «… copiado»). */
  token: 'Token',
  address: 'Dirección',
  copyToken: 'Copiar token',
  copyAddress: 'Copiar dirección',
  noToken: 'Aún no tienes token',
  noTokenBody: 'Créalo para conectar tu teléfono.',
  lastUsed: (date: string) => `Último pago recibido ${date}`,
  created: (date: string) => `Creado ${date}`,
  revoke: 'Revocar',
  createToken: 'Crear token',
  createAnother: 'Crear otro token',
  addressHeader: 'Dirección',
  forIphone: 'Para iPhone (Atajos)',
  forAndroid: 'Para Android (MacroDroid)',
  howHeader: 'Cómo configurarlo',
  howFooter: 'Los pagos se envían cifrados, con tu token, y nunca se duplican. Si llega uno sin categoría conocida, queda por revisar.',
  ios: 'iPhone (iOS)',
  iosIntro:
    'Con la app Atajos, que ya viene en el iPhone. Cada pago con Apple Pay se guarda en un archivo y se envía; si no hay señal, se envía después.',
  groupSend: 'Atajo que envía los pagos',
  groupWallet: 'Automatización de Wallet',
  groupWifi: 'Reenviar al conectarte a Wi‑Fi',
  sendSteps: [
    `En Atajos, pestaña «Atajos», toca + para crear un atajo nuevo. Arriba toca el nombre y ponle \`${SEND_SHORTCUT}\`.`,
    `Agrega «Obtener archivo». Toca «Carpeta» y elige la carpeta **Atajos** de iCloud Drive. En la ruta escribe \`${QUEUE_FILE}\`. Desactiva «Error si no se encuentra».`,
    'Agrega «Si». Condición: «Archivo» → «no tiene ningún valor». Dentro del Si agrega «Detener este atajo».',
    'Debajo de «Fin del Si» agrega «Obtener contenido de URL» y pega la **dirección para iPhone**. En «Mostrar más»: método POST; encabezado `Authorization` = `Bearer ` + tu token; cuerpo de la solicitud «Archivo» y elige la burbuja «Archivo».',
    'Agrega otro «Si». Condición: «Contenido de URL» → «contiene» → escribe `"ok":true` (con las comillas). Dentro del Si agrega «Eliminar archivos» con la burbuja «Archivo» y desactiva «Confirmar antes de eliminar».',
    'Toca Listo.',
  ],
  walletSteps: [
    'Pestaña Automatización → + → «Wallet». Elige tus tarjetas, marca «Ejecutar inmediatamente», Siguiente y «Nuevo atajo en blanco».',
    'Agrega «Formatear fecha». Fecha: «Fecha actual». Formato: «ISO 8601» y activa «Incluir hora».',
    'Agrega «Diccionario» con 5 elementos de tipo Texto: `amount` → Importe, `merchant` → Comercio, `card` → Tarjeta o pase, `name` → Nombre (burbujas de «Entrada del atajo») y `at` → «Fecha formateada».',
    `Agrega «Añadir a archivo de texto». Texto: la burbuja «Diccionario». Carpeta: Atajos. Ruta: \`${QUEUE_FILE}\`. Activa «Crear nueva línea».`,
    `Agrega «Ejecutar atajo» y elige «${SEND_SHORTCUT}». Desactiva «Mostrar al ejecutar». Toca Listo.`,
  ],
  wifiSteps: [
    'Automatización → + → «Wi‑Fi». Elige «Cualquier red», marca «Ejecutar inmediatamente», Siguiente y «Nuevo atajo en blanco».',
    `Agrega «Ejecutar atajo», elige «${SEND_SHORTCUT}» y toca Listo.`,
  ],
  android: 'Android',
  androidIntro:
    'Con MacroDroid, gratis en Google Play. Lee solo las notificaciones de las apps que elijas y envía las de compra. También capta las compras con la tarjeta física, si tu banco te avisa de ellas.',
  androidSteps: [
    `Instala [MacroDroid](${MACRODROID}) desde Google Play (es gratis) y ábrelo.`,
    'Toca **Añadir macro** y ponle de nombre `Finanzas`.',
    'En **Disparadores** toca + y busca «Notificación recibida». Elige la app de tu banco y, si pagas con el teléfono, también Google Wallet. Deja el contenido en «Cualquiera». MacroDroid te pedirá el **acceso a notificaciones**: actívalo.',
    'En **Acciones** toca + y busca «Solicitud HTTP». Método `POST`. En la URL pega la **dirección para Android** (arriba).',
    'En los encabezados agrega uno: nombre `Authorization`, valor `Bearer ` seguido de tu token (con el espacio después de «Bearer»).',
    'En el cuerpo de la solicitud elige el tipo `text/plain`. Con el botón de texto mágico (…) inserta el **título de la notificación**, pasa a la línea siguiente e inserta el **texto de la notificación**. Debe quedar así: `[not_title]` en la primera línea y `[notification]` en la segunda.',
    'Guarda la macro con el ✓ y revisa que quede activada.',
    'En los ajustes del teléfono, en Batería, quita la optimización de batería a MacroDroid: si no, Android la puede cerrar y dejaría de enviar.',
    'Listo: tras tu próxima compra, el pago aparece en Finanzas **por revisar**. Revisa monto y comercio y confírmalo con un toque.',
  ],
  androidNote: 'Sin señal en el momento de la compra, MacroDroid no la reenvía después: ese pago regístralo a mano.',
};
