// Textos en español del área «legal»: la política de privacidad (/privacidad). Los párrafos usan las marcas de <Rich>
// (**negrita**). Fuente de verdad: el inglés (locales/en/legal.ts) tiene el mismo tipo.
export default {
  title: 'Privacidad',
  updated: (date: string) => `Actualizada el ${date}.`,
  sections: [
    {
      title: 'En resumen',
      paragraphs: [
        'Finanzas guarda lo que tú registras para mostrártelo a ti. **No vende ni comparte tus datos**, no muestra publicidad y no usa herramientas de rastreo de terceros.',
      ],
    },
    {
      title: 'Qué se guarda',
      paragraphs: [
        '**Tu cuenta:** tu correo y tu contraseña. La contraseña se guarda cifrada; nadie puede leerla.',
        '**Lo que registras:** cuentas y tarjetas (nombre y, si lo escribes, los últimos 4 dígitos), movimientos, categorías, presupuestos, gastos fijos y reglas de comercios.',
        '**Si usas el Atajo de Apple Wallet:** el monto, el comercio y la tarjeta de cada pago que el Atajo envía, y una clave personal para el Atajo, guardada cifrada.',
        '**Si usas el registro automático en Android:** el texto de las notificaciones que MacroDroid envía, solo de las apps que tú elijas (tu banco, Google Wallet). De cada notificación de compra se guardan el monto, el comercio y los últimos 4 dígitos de la tarjeta; las que no son compras se descartan sin guardarse.',
        'Nunca se guardan números completos de tarjeta, PIN ni claves de tu banco.',
      ],
    },
    {
      title: 'Quién puede verlo',
      paragraphs: [
        'Solo tú. La base de datos separa la información de cada persona y no deja que nadie vea ni cambie la de otra.',
        'Quien administra la app tiene acceso técnico a la base de datos para mantenerla funcionando. No revisa tus datos, salvo que se lo pidas para resolver un problema.',
      ],
    },
    {
      title: 'Dónde se guarda',
      paragraphs: [
        'En **Supabase** (base de datos y cuentas de usuario), en servidores de Estados Unidos. La app se sirve desde **Vercel**. Los correos de la app (confirmar la cuenta, recuperar la contraseña) se envían por **Gmail**. Todas las conexiones van cifradas (HTTPS).',
        'Para las compras en dólares, la app consulta el tipo de cambio en el sitio público del Ministerio de Hacienda; esa consulta no lleva ningún dato tuyo.',
      ],
    },
    {
      title: 'Lo que puedes hacer',
      paragraphs: [
        '**Descargar tus datos:** Ajustes → Exportar movimientos (CSV).',
        '**Eliminar tu cuenta:** Ajustes → Eliminar cuenta. Se borran de inmediato tu cuenta y todo lo que registraste. Las copias de respaldo de la base, si las hay, se eliminan solas en un máximo de 30 días.',
        '**Pedir acceso, corrección o eliminación** de tus datos: responde a cualquier correo que te haya enviado Finanzas.',
      ],
    },
    {
      title: 'Cambios',
      paragraphs: ['Si esta política cambia, se actualiza esta página y su fecha.'],
    },
  ],
};
