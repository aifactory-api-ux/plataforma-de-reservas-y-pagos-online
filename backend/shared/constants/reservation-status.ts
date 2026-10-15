export const RESERVATION_STATUS = {
  RETENIDA: 'retenida',
  PAGADA: 'pagada',
  CANCELADA: 'cancelada',
  ASISTIO: 'asistio',
  NO_ASISTIO: 'no_asistio',
} as const;

export type ReservationStatusType = typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatusType, string> = {
  [RESERVATION_STATUS.RETENIDA]: 'Retenida',
  [RESERVATION_STATUS.PAGADA]: 'Pagada',
  [RESERVATION_STATUS.CANCELADA]: 'Cancelada',
  [RESERVATION_STATUS.ASISTIO]: 'Asistió',
  [RESERVATION_STATUS.NO_ASISTIO]: 'No asistió',
};

export const RESERVATION_TIMEOUT_MINUTES = 10;

export const MAX_RESERVAS_FUTURAS = 3;

export const INASISTENCIAS_BLOQUEO_CANTIDAD = 3;

export const INASISTENCIAS_BLOQUEO_DIAS = 60;

export const BLOQUEO_DURACION_DIAS = 30;
