// Textos en español del área «rules». Fuente de verdad: el inglés (locales/en/rules.ts) tiene el mismo tipo.
export default {
  title: 'Reglas',
  intro: 'Cuando un pago de Wallet trae un comercio que contiene el texto, se le asigna la categoría automáticamente.',
  newRule: 'Nueva regla',
  merchant: 'Comercio',
  assignTo: 'Asignar a',
  save: 'Guardar regla',
  saved: 'Regla guardada',
  active: 'Reglas activas',
  emptyTitle: 'Aún no hay reglas',
  emptyBody: 'También puedes crearlas al confirmar un pago de Wallet.',
  archivedCategory: 'Categoría archivada',
  deleteLabel: (pattern: string) => `Borrar regla ${pattern}`,
  confirmDelete: (pattern: string) => `¿Borrar la regla «${pattern}»? Los pagos ya guardados no cambian.`,
};
