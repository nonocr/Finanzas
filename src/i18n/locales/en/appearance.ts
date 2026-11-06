import type es from '../es/appearance';

const en: typeof es = {
  themes: {
    negra: 'Black',
    carbono: 'Carbon',
    titanio: 'Titanium',
    oro: 'Gold',
    'oro-rosa': 'Rose gold',
    cobre: 'Copper',
    sakura: 'Sakura',
    amatista: 'Amethyst',
    zafiro: 'Sapphire',
    esmeralda: 'Emerald',
  },
  themeTitle: 'Theme',
  card: 'Card',
  themeNote: "Changes the grays and the metal of the buttons. The colors for budget, income, and categories don't change.",
  iconNoteIos: ' The app icon changes with the card; your iPhone confirms it with a message.',
  iconNoteAndroid: ' The app icon changes with the card when you leave the app.',

  homeTitle: 'Summary',
  sections: {
    semana: 'This week',
    recientes: 'Recent',
    categorias: 'By category',
    presupuestos: 'Budgets',
  },
  cardFigures: {
    gastado: 'Amount spent',
    disponible: "What's left of the budget",
    balance: 'Balance (income minus expenses)',
  },
  cardShows: 'The card shows',
  cardShowsFooter: "The big figure on the card at the top. “What's left” needs a budget for the month.",
  sectionsHeader: 'Sections',
  sectionsFooter: "Use the arrows to change the order. The ones you turn off aren't shown, but they keep their place.",
  moveUp: (section) => `Move ${section} up`,
  moveDown: (section) => `Move ${section} down`,
  show: (section) => `Show ${section}`,
  pendingFooter: "Payments that come in on their own (Apple Wallet or bank notifications) and still need confirming appear at the very top.",
  pending: 'Payments to review',
  showPending: 'Show payments to review',
};
export default en;
