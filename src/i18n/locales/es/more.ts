// Textos en español del área «more». Fuente de verdad: el inglés (locales/en/more.ts) tiene el mismo tipo.
export default {
  accounts: 'Cuentas y tarjetas',
  categories: 'Categorías',
  rules: 'Reglas de comercios',
  appearance: 'Apariencia',
  theme: 'Tema',
  home: 'Resumen',
  homeDetail: 'Qué ver y en qué orden',
  discreet: 'Modo discreto',
  discreetDetail: 'Oculta los montos hasta tocarlos',
  automatic: 'Automático',
  wallet: 'Registro automático',
  walletDetail: 'Pagos con tarjeta, en iPhone y Android',
  recurring: 'Gastos e ingresos fijos',
  recurringDetail: 'Alquiler, salario, suscripciones',
  security: 'Seguridad',
  changePassword: 'Cambiar contraseña',
  twoFactor: 'Verificación en dos pasos',
  data: 'Datos',
  exportCsv: 'Exportar movimientos (CSV)',
  exportJson: 'Exportar todos mis datos',
  exportJsonDetail: 'Archivo JSON con todo lo que guarda tu cuenta',
  resetDemo: 'Reiniciar datos de ejemplo',
  signOut: 'Cerrar sesión',
  privacy: 'Privacidad',
  terms: 'Términos de uso',
  deleteAccount: 'Eliminar cuenta',
  demoNote:
    'Modo demo: los datos son de ejemplo y viven solo en este navegador. Conecta Supabase para guardar tus datos reales en la nube.',
  exported: (n: number) => `${n} movimientos exportados`,
  /** Encabezados de las columnas del CSV, en el orden en que se escriben. */
  csvHeader: ['fecha', 'tipo', 'monto', 'cuenta', 'hacia', 'categoria', 'comercio', 'nota', 'origen', 'estado', 'monto_usd', 'tipo_cambio'],
  csvFile: (date: string) => `movimientos-${date}.csv`,
  exportedAll: 'Datos exportados',
  jsonFile: (date: string) => `finanzas-mis-datos-${date}.json`,
  /**
   * Explicación que va dentro del archivo JSON, para que se entienda sin conocer la base de datos (la Ley 8968 pide que
   * el informe de acceso venga «exento de codificaciones» y con explicación de los términos técnicos).
   */
  jsonNotes: {
    amounts:
      'Los montos (amount, initial_balance, credit_limit) están en céntimos de colón: 1250000 = ₡12.500,00. original_amount está en centavos de dólar y fx_rate es el tipo de cambio usado.',
    dates: 'Las fechas y horas están en UTC (formato ISO 8601). En Costa Rica son 6 horas menos.',
    ids: 'Los campos id, *_id y user_id son identificadores internos que relacionan los registros entre sí (por ejemplo, a qué cuenta pertenece un movimiento).',
    transactions:
      'type: gasto, ingreso o transferencia. source: manual, wallet (Atajo de iPhone o notificación de Android), recurrente o import. status: confirmada o por_revisar. external_id identifica un pago del registro automático para no duplicarlo; amount_raw guarda el texto del monto cuando no se pudo leer.',
    shortcut_keys: 'Las claves del registro automático aparecen sin su valor: la base solo guarda una huella (hash) que no permite recuperarla.',
    legal_acceptances: 'Versiones de los Términos de uso y la Política de privacidad que aceptaste, cuándo y dónde (registro: al crear la cuenta; app: dentro de la app).',
    not_included:
      'No se incluyen tu contraseña (solo existe una huella que no permite recuperarla) ni los datos técnicos de sesión que guarda el sistema de cuentas (dirección IP y tipo de dispositivo de cada sesión abierta). Puedes pedirlos por correo.',
  },
};
