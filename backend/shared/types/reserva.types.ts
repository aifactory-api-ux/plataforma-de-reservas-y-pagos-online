export type ReservationStatus = 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';

export interface Reserva {
  id: number;
  jugadorId: number;
  canchaId: number;
  tarifaId: number;
  inicio: Date;
  fin: Date;
  estado: ReservationStatus;
  creadaEn: Date;
  confirmadaEn: Date | null;
}

export interface CreateReservaInput {
  jugadorId: number;
  canchaId: number;
  tarifaId: number;
  inicio: Date;
  fin: Date;
}

export interface UpdateReservaInput {
  estado?: ReservationStatus;
  confirmadaEn?: Date | null;
}


