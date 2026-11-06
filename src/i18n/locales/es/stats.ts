// Textos en español del área «stats». Fuente de verdad: el inglés (locales/en/stats.ts) tiene el mismo tipo.
export default {
  title: 'Estadísticas',
  spent: 'Gastado',
  /** Cambio del gasto contra el mes anterior; `soFar`: el mes en curso se compara «a esta altura». */
  change: (pct: number, more: boolean, month: string, soFar: boolean) =>
    `${pct}% ${more ? 'más' : 'menos'} que ${month}${soFar ? ' a esta altura' : ''}`,
  income: 'Ingresos',
  savings: 'Ahorro',
  expenses: 'Gastos',
  byCategory: 'Por categoría',
  noExpenses: 'Sin gastos este mes',
  noExpensesSentence: 'Sin gastos este mes.',
  total: 'Total',
  lastMonths: 'Últimos 6 meses',
  /** Resumen en texto de cada barra del gráfico, para VoiceOver. */
  chartPoint: (month: string, expenses: string, income: string) => `${month}: gastos ${expenses}, ingresos ${income}`,
  methods: 'Efectivo y tarjeta',
  method: { tarjeta: 'Tarjeta', efectivo: 'Efectivo', otro: 'Otros' },
  merchants: 'Dónde más gastas',
  noMerchants: 'Sin comercios este mes',
  purchases: (n: number) => `${n} ${n === 1 ? 'compra' : 'compras'}`,
};
