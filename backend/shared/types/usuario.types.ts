export type UserRole = 'encargado' | 'profesor' | 'administrador';

export interface Jugador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  inasistencias60Dias: number;
}

export interface CreateJugadorInput {
  nombre: string;
  email: string;
  telefono: string;
}

export interface UpdateJugadorInput {
  nombre?: string;
  telefono?: string;
  bloqueado?: boolean;
  inasistencias60Dias?: number;
}

export interface UsuarioPersonal {
  id: number;
  sedeId: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: UserRole;
}

export interface CreateUsuarioPersonalInput {
  sedeId: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: UserRole;
}

export interface UpdateUsuarioPersonalInput {
  nombre?: string;
  email?: string;
  passwordHash?: string;
  rol?: UserRole;
}

export interface JugadorWithRelations extends Jugador {
  consentimientos?: ConsentimientoDatos[];
  reservas?: import('./reserva.types').Reserva[];
  bloqueos?: BloqueoJugador[];
}

export interface ConsentimientoDatos {
  id: number;
  jugadorId: number;
  version: string;
  fechaConsentimiento: Date;
  aceptado: boolean;
}

export interface CreateConsentimientoInput {
  jugadorId: number;
  version: string;
  aceptado: boolean;
}

export interface BloqueoJugador {
  id: number;
  jugadorId: number;
  creadoPorId: number;
  motivo: string;
  inicio: Date;
  fin: Date;
}

export interface CreateBloqueoJugadorInput {
  jugadorId: number;
  creadoPorId: number;
  motivo: string;
  inicio: Date;
  fin: Date;
}
