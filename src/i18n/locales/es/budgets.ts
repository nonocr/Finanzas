// Textos en español del área «budgets». Fuente de verdad: el inglés (locales/en/budgets.ts) tiene el mismo tipo.
export default {
  title: 'Presupuesto',
  saved: 'Presupuesto guardado',
  removed: 'Presupuesto quitado',
  /** Resultado de copiar los presupuestos del mes anterior (`month` es el nombre de ese mes). */
  copied: (n: number, month: string) =>
    n === 1 ? 'Se copió 1 presupuesto' : n ? `Se copiaron ${n} presupuestos` : `No había presupuestos en ${month}`,
  copyFrom: (month: string) => `Copiar presupuestos de ${month}`,
  monthTotal: 'Total del mes',
  of: (amount: string) => `de ${amount}`,
  over: (amount: string) => `Te pasaste ${amount}`,
  left: (amount: string) => `Quedan ${amount}`,
  leftPct: (amount: string, pct: number) => `Quedan ${amount} · ${pct}%`,
  atLimit: 'Llegaste al límite',
  sourceSum: 'Es la suma de tus categorías y cuenta solo lo gastado en ellas. Toca para definir un total propio.',
  sourceAdjusted: (amount: string) => `Subió a la suma de tus categorías; habías definido ${amount}.`,
  sourceManual: 'Definido por ti. Toca para cambiarlo.',
  setTotal: 'Definir el total del mes',
  byCategory: 'Por categoría',
  unassigned: (amount: string) => `Sin asignar a categorías: ${amount}.`,
  noBudget: 'Sin presupuesto',
  /** Aviso de presupuesto (budgetAlert en src/lib/stats.ts). */
  alert: {
    list: (names: string[]) =>
      names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`,
    over: (names: string, n: number) => `${names} ${n === 1 ? 'llegó' : 'llegaron'} al límite de su presupuesto.`,
    near: (names: string, n: number) => `${names} ${n === 1 ? 'va' : 'van'} por encima del 80 %.`,
  },
};
