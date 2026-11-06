// Barra de pestañas, navegación de meses y botón de Ajustes.
export default {
  tabs: { home: 'Resumen', transactions: 'Movimientos', stats: 'Estadísticas', budget: 'Presupuesto' },
  sections: 'Secciones',
  addTransaction: 'Agregar movimiento',
  toReview: (label: string, n: number) => `${label}, ${n} por revisar`,
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
};
