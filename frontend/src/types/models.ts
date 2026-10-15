export type Deporte = 'padel' | 'futbol7';

export type EstadoReserva = 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';

export type EstadoPago = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';

export type EstadoCancha = 'disponible' | 'mantenimiento' | 'bloqueada';

export type RolUsuario = 'encargado' | 'profesor' | 'administrador';

export type FranjaHoraria = 'manana' | 'tarde' | 'noche';

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Cancha {
  id: number;
  sedeId: number;
  deporte: Deporte;
  techada: boolean;
  estado: EstadoCancha;
}

export interface Tarifa {
  id: number;
  deporte: Deporte;
  duracionMinutos: number;
  franja: FranjaHoraria;
  monto: number;
}

export interface Jugador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  inasistencias60Dias: number;
}

export interface ConsentimientoDatos {
  id: number;
  jugadorId: number;
  version: string;
  fechaConsentimiento: string;
  aceptado: boolean;
}

export interface UsuarioPersonal {
  id: number;
  sedeId: number;
  nombre: string;
  email: string;
  passwordHash?: string;
  rol: RolUsuario;
}

export interface Reserva {
  id: number;
  jugadorId: number;
  canchaId: number;
  tarifaId: number;
  inicio: string;
  fin: string;
  estado: EstadoReserva;
  creadaEn: string;
  confirmadaEn: string | null;
  jugador?: Jugador;
  cancha?: Cancha;
  tarifa?: Tarifa;
  pago?: Pago;
}

export interface Pago {
  id: number;
  reservaId: number;
  montoTotal: number;
  estado: EstadoPago;
  tokenTransbank: string | null;
  referenciaTransbank: string | null;
  pagadoEn: string | null;
  esParcial: boolean;
}

export interface Devolucion {
  id: number;
  pagoId: number;
  autorizadoPorId: number;
  monto: number;
  motivo: string;
  creadaEn: string;
}

export interface BloqueoCancha {
  id: number;
  canchaId: number;
  reservaId: number | null;
  inicio: string;
  fin: string;
  estado: 'activo' | 'liberado';
}

export interface BloqueoJugador {
  id: number;
  jugadorId: number;
  creadoPorId: number;
  motivo: string;
  inicio: string;
  fin: string;
}

export interface Clase {
  id: number;
  canchaId: number;
  profesorId: number;
  inicio: string;
  fin: string;
  nombre: string;
  cupos: number;
  precio: number;
}

export interface InscripcionClase {
  id: number;
  claseId: number;
  jugadorId: number;
  inscritaEn: string;
  estado: 'activa' | 'cancelada';
}

export interface AvailabilitySlot {
  canchaId: number;
  canchaNombre: string;
  hora: string;
  precio: number;
  disponible: boolean;
}

export interface Filters {
  sedeId: number;
  deporte: Deporte;
  fecha: Date;
  rangoHorario?: FranjaHoraria;
}

export type ReservationStatus = EstadoReserva;

export interface UserRole {
  type: 'jugador' | 'encargado' | 'profesor' | 'administrador';
}
