// Textos en español del área «terms»: los Términos de uso (/terminos). Se aceptan junto con la Política de privacidad
// (misma versión: src/lib/legal/version.ts). Marcas de <Rich>. El inglés (locales/en/terms.ts) tiene el mismo tipo.
//
// Borrador preparado para revisión: los puntos marcados en docs/legal/revision-legal.md («Para revisión de una persona
// abogada») deben confirmarse antes de publicar en las tiendas.
export default {
  title: 'Términos de uso',
  updated: (date: string) => `Actualizados el ${date}.`,
  intro:
    'Estos términos son las reglas para usar Finanzas. Léelos junto con la [Política de privacidad](/privacidad), que explica qué pasa con tus datos.',
  sections: [
    {
      title: 'Qué es Finanzas',
      paragraphs: [
        'Finanzas es una herramienta gratuita para registrar y revisar tus finanzas personales en colones: gastos, ingresos, transferencias, presupuestos y gastos fijos. Funciona en la web y como app para iPhone y Android.',
        'Es un proyecto personal: lo desarrolla y lo administra una persona particular, no una empresa ni una entidad financiera (ver «Quién es responsable»).',
      ],
    },
    {
      title: 'Aceptación',
      paragraphs: [
        'Al crear tu cuenta marcando la casilla de aceptación, o al aceptar una versión nueva dentro de la app, aceptas estos términos y la Política de privacidad. Queda constancia de la versión que aceptaste y de cuándo.',
        'Si no estás de acuerdo, no crees la cuenta o elimínala desde Ajustes → Eliminar cuenta.',
      ],
    },
    {
      title: 'Tu cuenta',
      paragraphs: [
        'Para crear una cuenta debes tener 18 años o más y usar un correo que te pertenezca. La cuenta es personal: no la compartas.',
        'Cuida tu contraseña y, si puedes, activa la verificación en dos pasos (Ajustes → Seguridad). Si crees que alguien entró a tu cuenta, cambia la contraseña y avísanos.',
      ],
    },
    {
      title: 'Lo que Finanzas no es',
      paragraphs: [
        'Finanzas **no es un banco ni una entidad financiera**, no mueve dinero, no hace pagos, no se conecta a tus cuentas bancarias y **no da asesoría financiera, contable, tributaria ni de inversión**. Las cifras que muestra salen de lo que tú registras.',
        'El tipo de cambio para las compras en dólares es el de referencia del Banco Central (venta), tomado del sitio público del Ministerio de Hacienda. Es informativo y puede diferir del que aplicó tu banco; puedes corregirlo en cada movimiento.',
        'Finanzas no está afiliada a Apple, Google, MacroDroid, ningún banco, el Banco Central ni el Ministerio de Hacienda, ni cuenta con su respaldo.',
      ],
    },
    {
      title: 'Registro automático',
      paragraphs: [
        'El registro automático depende de herramientas de terceros (Atajos de Apple y MacroDroid) y del formato de las notificaciones de cada banco, que pueden cambiar sin aviso. Por eso puede omitir pagos, repetirlos o leerlos mal. Revisa los movimientos marcados «Revisar» y confirma que tus registros estén completos.',
        'Tu clave personal del registro automático es como una contraseña: no la compartas. Si se filtra, revócala en Ajustes → Registro automático.',
      ],
    },
    {
      title: 'Uso aceptable',
      paragraphs: [
        'Usa Finanzas solo para llevar tus propias finanzas y de forma legal. No intentes entrar a cuentas o datos de otras personas, saltarte los límites del servicio, sobrecargarlo, ni usarlo para guardar información que no sea de tus finanzas.',
        'Si encuentras una falla de seguridad, avísanos en privado (ver «Quién es responsable») en vez de aprovecharla o publicarla.',
      ],
    },
    {
      title: 'Disponibilidad y cambios',
      paragraphs: [
        'Finanzas se ofrece tal como está y se hace lo posible por que funcione bien, pero no se garantiza que esté siempre disponible ni libre de errores. Te recomendamos descargar tus datos de vez en cuando (Ajustes → Exportar todos mis datos).',
        'Las funciones pueden cambiar. Si Finanzas fuera a cerrar, se avisará con anticipación por correo y en la app para que puedas descargar tus datos.',
      ],
    },
    {
      title: 'Responsabilidad',
      paragraphs: [
        'Las decisiones que tomes con la información de la app son tuyas. Finanzas no responde por errores en los datos que registraste o que llegaron mal del registro automático, ni por fallas de los servicios de terceros de los que depende.',
        'Nada en estos términos limita los derechos que te reconoce la ley de Costa Rica, incluidos los de protección de datos y, cuando corresponda, los de protección al consumidor.',
      ],
    },
    {
      title: 'Propiedad intelectual',
      paragraphs: [
        '**Tus datos son tuyos.** Finanzas solo los usa para prestarte el servicio, como explica la Política de privacidad.',
        'La app (su código, diseño, nombre e íconos) pertenece a quien la desarrolla. Puedes usarla para tu uso personal, sin copiarla, venderla ni redistribuirla. Incluye componentes de código abierto de terceros, que se rigen por sus propias licencias: [lista de licencias](https://finanzas-nono-0784.vercel.app/licencias.txt).',
      ],
    },
    {
      title: 'Fin del servicio para tu cuenta',
      paragraphs: [
        'Puedes eliminar tu cuenta cuando quieras desde Ajustes → Eliminar cuenta o como explica [esta página](/eliminar-cuenta).',
        'Si una cuenta incumple estos términos o pone en riesgo el servicio o a otras personas, se puede suspender o eliminar. Salvo que haya un riesgo urgente o lo impida la ley, se avisará antes por correo para que puedas descargar tus datos.',
      ],
    },
    {
      title: 'Ley aplicable',
      paragraphs: [
        'Estos términos se rigen por las leyes de la República de Costa Rica. Si tienes un reclamo, escríbenos primero para intentar resolverlo. Esto no te quita el derecho de acudir a las autoridades o tribunales que te correspondan según la ley.',
      ],
    },
    {
      title: 'Cambios en estos términos',
      paragraphs: [
        'Si estos términos cambian, se actualizan esta página y su fecha. Si el cambio es importante, la app te pedirá aceptarlo antes de seguir usándola; si no lo aceptas, puedes descargar tus datos y eliminar tu cuenta.',
      ],
    },
  ],
};
