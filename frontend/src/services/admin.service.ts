import { apiFetch } from '../lib/api';
import type {
  UsuarioPersonal,
  Tarifa,
  BloqueoJugador,
  Jugador,
  Reserva,
  Pago,
  Sede,
  Cancha,
  Clase,
} from '../types/models';

export interface ReporteReservasParams {
  sedeId?: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface ReportePagosParams {
  sedeId?: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface ReporteNoShowsParams {
  sedeId?: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'encargado' | 'profesor' | 'administrador';
  sedeId: number;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  email?: string;
  rol?: 'encargado' | 'profesor' | 'administrador';
  activo?: boolean;
}

export interface CreateTarifaRequest {
  deporte: 'padel' | 'futbol7';
  duracionMinutos: number;
  franja: 'manana' | 'tarde' | 'noche';
  monto: number;
}

export interface UpdateTarifaRequest {
  monto?: number;
  duracionMinutos?: number;
  franja?: 'manana' | 'tarde' | 'noche';
}

export interface CreateBloqueoJugadorRequest {
  jugadorId: number;
  motivo: string;
  inicio: string;
  fin: string;
}

export interface EstadisticasResumen {
  totalReservas: number;
  reservasPagadas: number;
  reservasCanceladas: number;
  totalIngresos: number;
  porcentajeOcupacion: number;
  noShows: number;
}

class AdminService {
  async getUsuarios(): Promise<UsuarioPersonal[]> {
    return apiFetch.get<UsuarioPersonal[]>('/api/admin/usuarios');
  }

  async getUsuario(usuarioId: number): Promise<UsuarioPersonal> {
    return apiFetch.get<UsuarioPersonal>(`/api/admin/usuarios/${usuarioId}`);
  }

  async createUsuario(data: CreateUsuarioRequest): Promise<UsuarioPersonal> {
    return apiFetch.post<UsuarioPersonal>('/api/admin/usuarios', data);
  }

  async updateUsuario(usuarioId: number, data: UpdateUsuarioRequest): Promise<UsuarioPersonal> {
    return apiFetch.put<UsuarioPersonal>(`/api/admin/usuarios/${usuarioId}`, data);
  }

  async deactivateUsuario(usuarioId: number): Promise<void> {
    await apiFetch.delete(`/api/admin/usuarios/${usuarioId}`);
  }

  async getTarifas(deporte?: 'padel' | 'futbol7'): Promise<Tarifa[]> {
    const params = deporte ? `?deporte=${deporte}` : '';
    return apiFetch.get<Tarifa[]>(`/api/admin/tarifas${params}`);
  }

  async getTarifa(tarifaId: number): Promise<Tarifa> {
    return apiFetch.get<Tarifa>(`/api/admin/tarifas/${tarifaId}`);
  }

  async createTarifa(data: CreateTarifaRequest): Promise<Tarifa> {
    return apiFetch.post<Tarifa>('/api/admin/tarifas', data);
  }

  async updateTarifa(tarifaId: number, data: UpdateTarifaRequest): Promise<Tarifa> {
    return apiFetch.put<Tarifa>(`/api/admin/tarifas/${tarifaId}`, data);
  }

  async deleteTarifa(tarifaId: number): Promise<void> {
    await apiFetch.delete(`/api/admin/tarifas/${tarifaId}`);
  }

  async getJugadoresBloqueados(): Promise<Jugador[]> {
    return apiFetch.get<Jugador[]>('/api/admin/jugadores/bloqueados');
  }

  async getBloqueosJugadores(): Promise<BloqueoJugador[]> {
    return apiFetch.get<BloqueoJugador[]>('/api/admin/bloqueos-jugadores');
  }

  async createBloqueoJugador(data: CreateBloqueoJugadorRequest): Promise<BloqueoJugador> {
    return apiFetch.post<BloqueoJugador>('/api/admin/bloqueo-jugador', data);
  }

  async releaseBloqueoJugador(bloqueoId: number): Promise<void> {
    await apiFetch.delete(`/api/admin/bloqueo-jugador/${bloqueoId}`);
  }

  async getReporteReservasExcel(params: ReporteReservasParams): Promise<Blob> {
    const searchParams = new URLSearchParams({
      fechaInicio: params.fechaInicio,
      fechaFin: params.fechaFin,
    });
    if (params.sedeId) {
      searchParams.append('sedeId', params.sedeId.toString());
    }

    const response = await fetch(`/api/admin/reportes/reservas?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de reservas');
    }

    return response.blob();
  }

  async getReportePagosExcel(params: ReportePagosParams): Promise<Blob> {
    const searchParams = new URLSearchParams({
      fechaInicio: params.fechaInicio,
      fechaFin: params.fechaFin,
    });
    if (params.sedeId) {
      searchParams.append('sedeId', params.sedeId.toString());
    }

    const response = await fetch(`/api/admin/reportes/pagos?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de pagos');
    }

    return response.blob();
  }

  async getReporteNoShowsExcel(params: ReporteNoShowsParams): Promise<Blob> {
    const searchParams = new URLSearchParams({
      fechaInicio: params.fechaInicio,
      fechaFin: params.fechaFin,
    });
    if (params.sedeId) {
      searchParams.append('sedeId', params.sedeId.toString());
    }

    const response = await fetch(`/api/admin/reportes/no-shows?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de no-shows');
    }

    return response.blob();
  }

  async getEstadisticas(sedeId?: number): Promise<EstadisticasResumen> {
    const params = sedeId ? `?sedeId=${sedeId}` : '';
    return apiFetch.get<EstadisticasResumen>(`/api/admin/reportes/estadisticas${params}`);
  }

  async getSedes(): Promise<Sede[]> {
    return apiFetch.get<Sede[]>('/api/sedes');
  }

  async getCanchas(sedeId: number): Promise<Cancha[]> {
    return apiFetch.get<Cancha[]>(`/api/sedes/${sedeId}/canchas`);
  }

  async getClases(): Promise<Clase[]> {
    return apiFetch.get<Clase[]>('/api/clases');
  }
}

export const adminService = new AdminService();