export type PagoStatus = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';

export interface Pago {
  id: number;
  reservaId: number;
  montoTotal: number;
  estado: PagoStatus;
  tokenTransbank: string | null;
  referenciaTransbank: string | null;
  pagadoEn: Date | null;
  esParcial: boolean;
}

export interface CreatePagoInput {
  reservaId: number;
  montoTotal: number;
  esParcial: boolean;
}

export interface UpdatePagoInput {
  estado?: PagoStatus;
  tokenTransbank?: string | null;
  referenciaTransbank?: string | null;
  pagadoEn?: Date | null;
}

export interface PagoWithRelations extends Pago {
  reserva?: import('./reserva.types').Reserva;
  devolucion?: Devolucion | null;
}

export interface Devolucion {
  id: number;
  pagoId: number;
  autorizadoPorId: number;
  monto: number;
  motivo: string;
  creadaEn: Date;
}

export interface CreateDevolucionInput {
  pagoId: number;
  autorizadoPorId: number;
  monto: number;
  motivo: string;
}
