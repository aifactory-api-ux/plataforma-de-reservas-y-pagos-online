import { apiFetch } from './api';
import type {
  CreateReservationRequest,
  AvailabilityRequest,
  AvailabilitySlot,
  ReservaResponse,
} from '../types/api';
import type { Reserva } from '../types/models';

export interface MisReservasResponse {
  reservas: Reserva[];
}

class ReservasService {
  async createReservation(data: CreateReservationRequest): Promise<Reserva> {
    const response = await apiFetch.post<ReservaResponse>('/reservas', data);
    return response.reserva;
  }

  async getReserva(reservaId: number): Promise<Reserva> {
    return apiFetch.get<Reserva>(`/reservas/${reservaId}`);
  }

  async cancelReservation(reservaId: number, motivo?: string): Promise<void> {
    if (motivo) {
      await apiFetch.patch(`/reservas/${reservaId}`, { estado: 'cancelada', motivo });
    } else {
await apiFetch.delete(`/reservas/${reservaId}`);
    }
  }

  async getMyReservas(): Promise<Reserva[]> {
    const response = await apiFetch.get<MisReservasResponse>('/reservas/mis-reservas');
    return response.reservas;
  }

  async getDisponibilidad(filters: AvailabilityRequest): Promise<AvailabilitySlot[]> {
    const params = new URLSearchParams({
      sedeId: filters.sedeId.toString(),
      deporte: filters.deporte,
      fecha: filters.fecha,
    });

    if (filters.rangoHorario) {
      params.append('franja', filters.rangoHorario);
    }

    return apiFetch.get<AvailabilitySlot[]>(`/disponibilidad?${params.toString()}`);
  }

  async releaseRetention(reservaId: number): Promise<void> {
    await apiFetch.delete(`/api/reservas/${reservaId}`);
  }

  async updateReservationStatus(
    reservaId: number,
    estado: 'asistio' | 'no_asistio'
  ): Promise<Reserva> {
    return apiFetch.patch<Reserva>(`/reservas/${reservaId}/asistencia`, {
      estado,
    });
  }

  async checkSlotDisponibilidad(
    canchaId: number,
    inicio: string,
    fin: string
  ): Promise<{ disponible: boolean }> {
    return apiFetch.post<{ disponible: boolean }>('/reservas/check-disponibilidad', {
      canchaId,
      inicio,
      fin,
    });
  }
}

export const reservasService = new ReservasService();
