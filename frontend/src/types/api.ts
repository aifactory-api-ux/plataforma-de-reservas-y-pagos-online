import type {
  Jugador,
  UsuarioPersonal,
  Reserva,
  ConsentimientoDatos
} from './models';

export type {
  Pago,
  Cancha,
  Sede,
  Tarifa,
  Clase,
  BloqueoJugador,
  Devolucion,
  AvailabilitySlot,
  Filters
} from './models';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Jugador | UsuarioPersonal;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ConsentimientoRequest {
  version: string;
  aceptado: boolean;
}

export interface CreateReservationRequest {
  canchaId: number;
  tarifaId: number;
  inicio: string;
  fin: string;
}

export interface AvailabilityRequest {
  sedeId: number;
  deporte: 'padel' | 'futbol7';
  fecha: string;
  rangoHorario?: 'manana' | 'tarde' | 'noche';
}

export interface WebpayInitRequest {
  reservaId: number;
  esParcial: boolean;
  compañeros?: string[];
}

export interface WebpayInitResponse {
  token: string;
  url: string;
}

export interface SplitPaymentRequest {
  reservaId: number;
  cantidadJugadores: number;
}

export interface JugadorResponse {
  jugador: Jugador;
  consentimiento: ConsentimientoDatos | null;
}

export interface ReservaResponse {
  reserva: Reserva;
  retentionExpiresAt?: string;
}

export interface CancelReservationRequest {
  reservaId: number;
  motivo?: string;
}

export interface DevolucionRequest {
  pagoId: number;
  monto: number;
  motivo: string;
}

export interface BloqueoJugadorRequest {
  jugadorId: number;
  motivo: string;
  inicio: string;
  fin: string;
}

export interface TarifaRequest {
  deporte: 'padel' | 'futbol7';
  duracionMinutos: number;
  franja: 'manana' | 'tarde' | 'noche';
  monto: number;
}

export interface CreateClaseRequest {
  canchaId: number;
  profesorId: number;
  inicio: string;
  fin: string;
  nombre: string;
  cupos: number;
  precio: number;
}

export interface InscripcionClaseRequest {
  claseId: number;
}

export interface AttendanceRequest {
  reservaId: number;
  estado: 'asistio' | 'no_asistio';
}

export interface ReportQueryParams {
  sedeId?: number;
  fechaInicio: string;
  fechaFin: string;
  tipo?: 'ingresos' | 'ocupacion' | 'noshows';
}

export interface ReporteIngresos {
  sedeId: number;
  periodo: { inicio: string; fin: string };
  totalIngresos: number;
  cantidadReservas: number;
  ocupacionPorcentaje: number;
}

export interface ReporteNoshows {
  sedeId: number;
  periodo: { inicio: string; fin: string };
  totalNoshows: number;
  reservas: Array<{
    reservaId: number;
    fecha: string;
    jugadorNombre: string;
  }>;
}

export interface UserManagementRequest {
  nombre: string;
  email: string;
  password?: string;
  rol: 'encargado' | 'profesor' | 'administrador';
  sedeId: number;
}

export interface apiFetch {
  (path: string, options?: RequestInit): Promise<any>;
}
