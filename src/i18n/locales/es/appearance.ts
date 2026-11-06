// Textos en español del área «appearance». Fuente de verdad: el inglés (locales/en/appearance.ts) tiene el mismo tipo.
export default {
  /** Nombre de cada tema, por su id (src/lib/theme/themes.ts). */
  themes: {
    negra: 'Negra',
    carbono: 'Carbono',
    titanio: 'Titanio',
    oro: 'Oro',
    'oro-rosa': 'Oro rosa',
    cobre: 'Cobre',
    sakura: 'Sakura',
    amatista: 'Amatista',
    zafiro: 'Zafiro',
    esmeralda: 'Esmeralda',
  },
  themeTitle: 'Tema',
  card: 'Tarjeta',
  themeNote: 'Cambia los grises y el metal de los botones. Los colores del presupuesto, los ingresos y las categorías no cambian.',
  iconNoteIos: ' El ícono de la app cambia con la tarjeta; el iPhone te lo confirma con un aviso.',
  iconNoteAndroid: ' El ícono de la app cambia con la tarjeta al salir de la app.',

  homeTitle: 'Resumen',
  /** Secciones del Resumen (HomeSection en src/lib/prefs/prefs.ts). */
  sections: {
    semana: 'Esta semana',
    recientes: 'Recientes',
    categorias: 'Por categoría',
    presupuestos: 'Presupuestos',
  },
  /** Qué cifra lleva en grande la tarjeta del Resumen (CardFigure en src/lib/prefs/prefs.ts). */
  cardFigures: {
    gastado: 'Lo gastado',
    disponible: 'Lo que queda del presupuesto',
    balance: 'El balance (ingresos menos gastos)',
  },
  cardShows: 'La tarjeta muestra',
  cardShowsFooter: 'La cifra grande de la tarjeta de arriba. «Lo que queda» necesita un presupuesto del mes.',
  sectionsHeader: 'Secciones',
  sectionsFooter: 'Usa las flechas para cambiar el orden. Las que apagues no se muestran, pero guardan su lugar.',
  moveUp: (section: string) => `Subir ${section}`,
  moveDown: (section: string) => `Bajar ${section}`,
  show: (section: string) => `Mostrar ${section}`,
  pendingFooter: 'Los pagos que llegan solos (Apple Wallet o notificaciones del banco) y falta confirmar aparecen arriba de todo.',
  pending: 'Pagos por revisar',
  showPending: 'Mostrar pagos por revisar',
};
