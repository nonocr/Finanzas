// Textos en español del área «legal»: la Política de privacidad (/privacidad), la página pública para eliminar la
// cuenta (/eliminar-cuenta), la casilla de aceptación de «Crear cuenta» y la pantalla que pide aceptar una versión
// nueva (LegalGate). Los Términos de uso están en terms.ts. Los párrafos usan las marcas de <Rich> (**negrita** y
// [enlace](/ruta) o [enlace](https://…)). El inglés (locales/en/legal.ts) tiene el mismo tipo.
//
// Antes de cambiar algo: cada afirmación de aquí está comprobada en el código o la configuración (ver
// docs/legal/revision-legal.md, «Qué datos trata Finanzas»). Si cambia lo que la app guarda, para qué, con quién o
// dónde, actualiza el texto y sube LEGAL_VERSION (src/lib/legal/version.ts).
export default {
  updated: (date: string) => `Actualizada el ${date}.`,

  /** Quién responde por los datos (src/lib/legal/owner.ts). Se usa en la privacidad, los términos y /eliminar-cuenta. */
  owner: {
    title: 'Quién es responsable',
    generic:
      'Finanzas la desarrolla y la administra una persona particular en Costa Rica, que es la responsable de la base de datos y de cómo se tratan tus datos. No hay una empresa detrás.',
    named: (name: string) => `Responsable de la base de datos y de cómo se tratan tus datos: **${name}**.`,
    address: (address: string) => `Dirección: ${address}.`,
    contactGeneric:
      'Para preguntas o para ejercer tus derechos, responde a cualquier correo que te haya enviado Finanzas (por ejemplo, el de confirmación de tu cuenta) desde el correo de tu cuenta.',
    contactEmail: (email: string) => `Para preguntas o para ejercer tus derechos, escribe a **${email}** desde el correo de tu cuenta.`,
  },

  privacy: {
    title: 'Política de privacidad',
    intro: {
      title: 'En resumen',
      paragraphs: [
        'Finanzas guarda lo que tú registras para mostrártelo a ti. **No vende tus datos ni los cede a nadie para que los use por su cuenta**, no muestra publicidad y no usa herramientas de analítica ni de rastreo.',
        'Al crear tu cuenta das tu consentimiento para lo que explica esta política, incluido que tus datos se guarden en servidores de Estados Unidos. Puedes retirarlo cuando quieras eliminando tu cuenta.',
      ],
    },
    sections: [
      {
        title: 'Qué datos se guardan y para qué',
        paragraphs: [
          '**Tu cuenta:** tu correo, para entrar, confirmar la cuenta, recuperar la contraseña y avisarte de cambios de seguridad (por ejemplo, que cambió tu contraseña). Tu contraseña se guarda solo como una huella cifrada (hash): nadie puede leerla. También el idioma de la app, para que los correos te lleguen en ese idioma.',
          '**Lo que registras:** cuentas y tarjetas (nombre, tipo, saldo inicial, límite de crédito, días de corte y pago y, si los escribes, los últimos 4 dígitos o el nombre que muestra Wallet), movimientos (monto, fecha, cuenta, categoría, comercio y nota; si fue en dólares, también el monto en dólares y el tipo de cambio), categorías, presupuestos, gastos e ingresos fijos y reglas de comercios. Sirven para mostrarte tus saldos, estadísticas y presupuesto.',
          '**Tus preferencias:** tema, modo discreto, idioma y cómo se arma el Resumen, para que la app se vea igual en todos tus dispositivos.',
          '**Constancia de aceptación:** qué versión de estos documentos aceptaste y cuándo.',
          '**Seguridad:** si activas la verificación en dos pasos, la clave secreta de tu app de autenticación. El sistema de cuentas guarda además, por cada sesión abierta, la dirección IP y el tipo de navegador o dispositivo, para mantener la sesión y protegerla. Para frenar abusos, la dirección IP de quien envía pagos al registro automático se usa como contador de intentos, que se borra periódicamente.',
          'Finanzas **nunca** pide ni guarda números completos de tarjeta, PIN ni claves de tu banco, y **no se conecta a tu banco**.',
        ],
      },
      {
        title: 'Registro automático (opcional)',
        paragraphs: [
          'Solo si lo configuras tú en Ajustes → Registro automático:',
          '**Atajo de iPhone (Apple Wallet):** de cada pago que el Atajo envía se guardan el monto, el comercio, el nombre de la tarjeta en Wallet y la fecha y hora. Si el monto no se puede leer, se guarda además el texto tal como llegó, para que lo corrijas.',
          '**Android:** la app MacroDroid, que tú instalas y configuras, envía el texto de las notificaciones de las apps que tú elijas (tu banco, Google Wallet). MacroDroid es de otra empresa y tiene su propia política de privacidad. De cada notificación de compra se guardan el monto, el comercio, la red y los últimos 4 dígitos de la tarjeta y la hora; el resto del texto se descarta, y las notificaciones que no son compras no se guardan.',
          'Para enviar pagos se usa una clave personal que creas en la app. Se guarda solo su huella cifrada y puedes revocarla en cualquier momento.',
        ],
      },
      {
        title: 'Qué es obligatorio',
        paragraphs: [
          'Para tener una cuenta son obligatorios tu correo y una contraseña: sin ellos no se puede crear. Todo lo demás lo decides tú; si no registras algo, la app simplemente no lo muestra. El registro automático y la verificación en dos pasos son opcionales.',
        ],
      },
      {
        title: 'En tu teléfono o navegador',
        paragraphs: [
          'La app guarda en tu dispositivo tu sesión (para no pedirte la contraseña cada vez), una copia de tus datos para usarla sin conexión (hasta 7 días), los cambios que aún no se han subido y tus preferencias de apariencia. Al cerrar sesión o eliminar la cuenta se borra la copia de tus datos.',
          'Finanzas no usa cookies ni identificadores de publicidad o analítica. Lo que guarda en el dispositivo es solo lo necesario para que la app funcione.',
        ],
      },
      {
        title: 'Quién más interviene',
        paragraphs: [
          'Finanzas usa estos proveedores para funcionar. Cada uno trata los datos para prestar su servicio y según sus propias condiciones:',
          '**Supabase** guarda la base de datos y las cuentas y ejecuta el registro automático, en servidores de **Estados Unidos** (Virginia del Norte). [Política de Supabase](https://supabase.com/privacy).',
          '**Vercel** entrega la app web y recibe datos técnicos de la conexión, como tu dirección IP. [Política de Vercel](https://vercel.com/legal/privacy-policy).',
          '**Google (Gmail)** envía los correos de la app, así que recibe tu correo y el contenido del mensaje. [Política de Google](https://policies.google.com/privacy).',
          '**Ministerio de Hacienda:** para las compras en dólares, la app consulta el tipo de cambio en su sitio público. Tu dispositivo se conecta directamente, así que recibe tu dirección IP como cualquier sitio web, pero ningún dato de tu cuenta.',
          'Fuera de estos proveedores, tus datos solo se entregarían a una autoridad si una ley o una orden judicial lo exige.',
        ],
      },
      {
        title: 'Datos fuera de Costa Rica',
        paragraphs: [
          'Tus datos se guardan en Estados Unidos, fuera de Costa Rica. La Ley 8968 pide tu autorización expresa para eso: la das al marcar la casilla al crear tu cuenta o al aceptar esta política en la app. Si no estás de acuerdo, no crees la cuenta, o elimínala.',
        ],
      },
      {
        title: 'Cuánto tiempo se guardan',
        paragraphs: [
          'Mientras tengas la cuenta. Lo que borras en la app se borra de la base en ese momento, y al eliminar la cuenta se borra todo de inmediato.',
          'Después de borrar pueden quedar, por un tiempo limitado: copias de respaldo de la base, si el proveedor las guarda, hasta que venzan; registros técnicos de los proveedores (por ejemplo, de conexiones); los contadores de intentos, que se borran periódicamente; y los correos que la app te envió o que intercambiaste con Finanzas, en la cuenta de correo que los envía.',
        ],
      },
      {
        title: 'Cómo se protegen',
        paragraphs: [
          'Todas las conexiones van cifradas (HTTPS). La base de datos separa la información de cada persona y no deja que nadie vea ni cambie la de otra. Puedes activar la verificación en dos pasos, y con ella la base no entrega tus datos a una sesión que no pasó el código. Las contraseñas y las claves del registro automático se guardan solo como huellas cifradas, y hay límites contra intentos repetidos.',
          'Quien administra Finanzas tiene acceso técnico a la base para mantenerla funcionando, guarda confidencialidad y no revisa tus datos salvo que se lo pidas para resolver un problema o que la ley lo exija.',
          'Ningún sistema es infalible. Si ocurre un incidente de seguridad que afecte tus datos, se te avisará por correo.',
        ],
      },
      {
        id: 'derechos',
        title: 'Tus derechos',
        paragraphs: [
          '**Acceso:** Ajustes → Exportar todos mis datos descarga un archivo con todo lo que guarda tu cuenta. Los movimientos también se pueden exportar en CSV.',
          '**Corrección:** puedes editar o borrar cualquier dato en la app.',
          '**Eliminación y retiro del consentimiento:** Ajustes → Eliminar cuenta borra tu cuenta y todos tus datos. Para dejar de usar solo el registro automático, revoca tu clave en Ajustes → Registro automático. [Cómo eliminar tu cuenta](/eliminar-cuenta).',
          'También puedes pedir cualquiera de estas cosas por correo (ver «Quién es responsable»). Es gratis y la respuesta llega en un máximo de cinco días hábiles, como manda la Ley 8968.',
          'Si crees que tus datos no se trataron bien, puedes presentar una denuncia ante la **Agencia de Protección de Datos de los Habitantes (Prodhab)**: [prodhab.go.cr](https://www.prodhab.go.cr).',
        ],
      },
      {
        title: 'Personas menores de edad',
        paragraphs: [
          'Finanzas es para personas de 18 años o más. Si se descubre que una cuenta es de una persona menor de edad, se elimina con sus datos.',
        ],
      },
      {
        title: 'Cambios',
        paragraphs: [
          'Si esta política cambia, se actualizan esta página y su fecha. Si el cambio afecta qué datos se guardan, para qué, con quién o dónde, la app te pedirá aceptarlo antes de seguir usándola.',
        ],
      },
    ],
  },

  /** /eliminar-cuenta: página pública (Google Play pide un enlace web para pedir la eliminación sin instalar la app). */
  deletion: {
    title: 'Eliminar tu cuenta de Finanzas',
    intro:
      'Puedes eliminar tu cuenta de Finanzas y todos tus datos cuando quieras, sin costo. No hace falta instalar la app: también se puede desde el navegador.',
    /** Pasos dentro de la app; `url` es la dirección de la versión web (WEB_APP_URL). */
    howTo: {
      title: 'Desde la app o el navegador',
      paragraphs: (url: string) => [
        `1. Entra a Finanzas en la app o en [la versión web](${url}) con tu correo y contraseña.`,
        '2. Toca **Ajustes** y luego **Eliminar cuenta**.',
        '3. Escribe tu contraseña y confirma.',
        'Si olvidaste la contraseña, usa «¿Olvidaste tu contraseña?» en la pantalla de entrar. Antes de eliminar la cuenta puedes descargar tus datos desde Ajustes → Exportar todos mis datos.',
      ],
    },
    sections: [
      {
        title: 'Si no puedes entrar',
        paragraphs: [
          'Pide la eliminación por correo desde la dirección de tu cuenta (ver «Quién es responsable», abajo). Solo se elimina la cuenta de ese correo, para que nadie pueda borrar la de otra persona. La respuesta llega en un máximo de cinco días hábiles.',
        ],
      },
      {
        title: 'Qué se borra y qué queda',
        paragraphs: [
          '**Se borra de inmediato:** tu cuenta y todo lo que registraste: cuentas y tarjetas, movimientos, categorías, presupuestos, gastos e ingresos fijos, reglas, claves del registro automático, preferencias, la verificación en dos pasos, tus sesiones y la constancia de aceptación de estos documentos.',
          '**Puede quedar por un tiempo limitado:** copias de respaldo de la base, si el proveedor las guarda, hasta que venzan; registros técnicos de los proveedores; contadores de intentos, que se borran periódicamente; y los correos que la app te envió, en la cuenta de correo que los envía.',
          'La eliminación no se puede deshacer.',
        ],
      },
    ],
  },

  /** Casilla de «Crear cuenta» (LoginPage). Sin marcarla no se puede crear la cuenta. */
  signupConsent:
    'Acepto los [Términos de uso](/terminos) y la [Política de privacidad](/privacidad), incluido que mis datos se guarden en servidores de Estados Unidos.',

  /** Pantalla que pide aceptar una versión nueva (o la primera, en cuentas anteriores a la constancia). */
  gate: {
    title: 'Términos y privacidad',
    subtitle: (date: string) =>
      `Los Términos de uso y la Política de privacidad se actualizaron el ${date}. Para seguir usando Finanzas, revísalos y acéptalos.`,
    consent:
      'Acepto los [Términos de uso](/terminos) y la [Política de privacidad](/privacidad), incluido que mis datos se guarden en servidores de Estados Unidos.',
    accept: 'Aceptar y continuar',
    declineHint: 'Si no estás de acuerdo, puedes descargar tus datos y eliminar tu cuenta, o cerrar sesión.',
    export: 'Descargar mis datos',
    deleteAccount: 'Eliminar mi cuenta',
    signOut: 'Cerrar sesión',
    error: 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.',
  },
};
