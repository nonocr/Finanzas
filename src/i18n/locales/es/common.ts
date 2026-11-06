// Textos compartidos por varias pantallas.
export default {
  cancel: 'Cancelar',
  close: 'Cerrar',
  save: 'Guardar',
  done: 'Listo',
  edit: 'Editar',
  delete: 'Eliminar',
  back: 'Volver',
  settings: 'Ajustes',
  seeAll: 'Ver todos',
  copy: 'Copiar',
  copied: (what: string) => `${what} copiado`,
  copyFailed: 'No se pudo copiar; mantén presionado para copiar',
  genericError: 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.',
  saveFailed: 'No se pudo guardar un cambio. Revisa Movimientos e inténtalo de nuevo.',
  offline: 'Sin conexión',
  offlineWaiting: (n: number) => `Sin conexión · ${n} ${n === 1 ? 'cambio espera' : 'cambios esperan'} para subir`,
  uploading: (n: number) => `Subiendo ${n} ${n === 1 ? 'cambio' : 'cambios'}…`,
  recurringRegistered: (n: number) => (n === 1 ? 'Se registró 1 movimiento fijo' : `Se registraron ${n} movimientos fijos`),
  noCategory: 'Sin categoría',
  /** Iniciales de lunes a domingo (en Costa Rica, K = miércoles). */
  weekdayInitials: ['L', 'M', 'K', 'J', 'V', 'S', 'D'],
};
