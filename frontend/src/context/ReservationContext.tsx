import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Reserva, AvailabilitySlot, Filters } from '../types/models';

interface CreateReservationInput {
  canchaId: number;
  tarifaId: number;
  inicio: string;
  fin: string;
}

interface ReservationState {
  currentReservation: Reserva | null;
  retencionExpiry: Date | null;
  availableSlots: AvailabilitySlot[];
  isLoading: boolean;
  error: string | null;
}

interface ReservationContextValue extends ReservationState {
  createReservation: (data: CreateReservationInput) => Promise<Reserva>;
  releaseRetention: () => void;
  setCurrentReservation: (reserva: Reserva | null) => void;
  fetchAvailability: (filters: Filters) => Promise<void>;
  clearError: () => void;
}

const ReservationContext = createContext<ReservationContextValue | undefined>(undefined);

const RETENTION_MINUTES = 10;

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ReservationState>({
    currentReservation: null,
    retencionExpiry: null,
    availableSlots: [],
    isLoading: false,
    error: null,
  });

  const createReservation = useCallback(async (data: CreateReservationInput): Promise<Reserva> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const reserva = await apiFetch.post<Reserva>('/api/reservas', data);

      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + RETENTION_MINUTES);

      setState(prev => ({
        ...prev,
        currentReservation: reserva,
        retencionExpiry: expiry,
        isLoading: false,
      }));

      return reserva;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la reserva';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const releaseRetention = useCallback(() => {
    if (state.currentReservation) {
      apiFetch
        .delete(`/api/reservas/${state.currentReservation.id}`)
        .catch(() => {});
    }
    setState(prev => ({
      ...prev,
      currentReservation: null,
      retencionExpiry: null,
    }));
  }, [state.currentReservation]);

  const setCurrentReservation = useCallback((reserva: Reserva | null) => {
    setState(prev => ({
      ...prev,
      currentReservation: reserva,
      retencionExpiry: reserva && reserva.estado === 'retenida' ? new Date(Date.now() + RETENTION_MINUTES * 60000) : null,
    }));
  }, []);

  const fetchAvailability = useCallback(async (filters: Filters) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        sedeId: filters.sedeId.toString(),
        deporte: filters.deporte,
        fecha: filters.fecha.toISOString().split('T')[0],
      });

      if (filters.rangoHorario) {
        params.append('franja', filters.rangoHorario);
      }

      const slots = await apiFetch.get<AvailabilitySlot[]>(`/api/disponibilidad?${params.toString()}`);

      setState(prev => ({
        ...prev,
        availableSlots: slots,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener disponibilidad';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <ReservationContext.Provider
      value={{
        ...state,
        createReservation,
        releaseRetention,
        setCurrentReservation,
        fetchAvailability,
        clearError,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservas = (): ReservationContextValue => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservas must be used within a ReservationProvider');
  }
  return context;
};

export default ReservationContext;
