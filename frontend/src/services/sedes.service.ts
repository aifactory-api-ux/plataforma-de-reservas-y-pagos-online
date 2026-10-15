import { apiFetch } from './api';
import type { Sede, Cancha, Tarifa, Reserva } from '../types/models';
import type { CreateReservationRequest } from '../types/api';

export interface AgendaRow {
  id: string;
  hora: string;
  reservas: Array<{
    id: string;
    jugadorNombre: string;
    estado: Reserva['estado'];
    canchaId: number;
  }>;
}

export interface AgendaSedeResponse {
  sede: Sede;
  canchas: Cancha[];
  reservas: AgendaRow[];
  fecha: string;
}

export interface CreatePresencialRequest {
  jugadorNombre: string;
  jugadorTelefono: string;
  jugadorEmail?: string;
  canchaId: number;
  tarifaId: number;
  inicio: string;
  fin: string;
  esPagoManual: boolean;
}

class SedesService {
  async getSedes(): Promise<Sede[]> {
    return apiFetch.get<Sede[]>('/api/sedes');
  }

  async getSede(sedeId: number): Promise<Sede> {
    return apiFetch.get<Sede>(`/api/sedes/${sedeId}`);
  }

  async getCanchas(sedeId: number): Promise<Cancha[]> {
    return apiFetch.get<Cancha[]>(`/api/sedes/${sedeId}/canchas`);
  }

  async getTarifas(sedeId: number): Promise<Tarifa[]> {
    return apiFetch.get<Tarifa[]>(`/api/sedes/${sedeId}/tarifas`);
  }

  async getAgendaSede(sedeId: number, fecha: string): Promise<AgendaSedeResponse> {
    return apiFetch.get<AgendaSedeResponse>(`/api/sedes/${sedeId}/agenda?fecha=${fecha}`);
  }

  async createReservaPresencial(data: CreatePresencialRequest): Promise<Reserva> {
    return apiFetch.post<Reserva>('/api/reservas/presencial', data);
  }

  async updateReservaEstado(
    reservaId: number,
    estado: 'asistio' | 'no_asistio'
  ): Promise<Reserva> {
    return apiFetch.patch<Reserva>(`/api/reservas/${reservaId}/asistencia`, { estado });
  }

  async bloquearCancha(
    canchaId: number,
    inicio: string,
    fin: string,
    motivo: string
  ): Promise<void> {
    await apiFetch.post(`/api/sedes/${canchaId}/bloqueo`, {
      inicio,
      fin,
      motivo,
    });
  }

  async desbloquearCancha(bloqueoId: number): Promise<void> {
    await apiFetch.delete(`/api/sedes/bloqueo/${bloqueoId}`);
  }
}

export const sedesService = new SedesService();