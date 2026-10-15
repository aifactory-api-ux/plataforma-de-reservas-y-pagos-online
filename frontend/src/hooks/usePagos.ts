import { useState, useEffect, useCallback } from 'react';
import { pagosService } from '../services/pagos.service';
import type { Pago, Devolucion } from '../types/models';
import type { DevolucionRequest } from '../types/api';

interface UsePagosReturn {
  pagos: Pago[];
  isLoading: boolean;
  error: string | null;
  fetchPagos: () => Promise<void>;
  getPagoById: (pagoId: number) => Promise<Pago>;
  getPagosByReserva: (reservaId: number) => Promise<Pago[]>;
  requestDevolucion: (request: DevolucionRequest) => Promise<Devolucion>;
  conciliarPago: (pagoId: number) => Promise<Pago>;
}

export const usePagos = (): UsePagosReturn => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await pagosService.getPagosPendientes();
      setPagos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener pagos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPagoById = useCallback(async (pagoId: number): Promise<Pago> => {
    return pagosService.getPago(pagoId);
  }, []);

  const getPagosByReserva = useCallback(async (reservaId: number): Promise<Pago[]> => {
    return pagosService.getPagosByReserva(reservaId);
  }, []);

  const requestDevolucion = useCallback(async (request: DevolucionRequest): Promise<Devolucion> => {
    return pagosService.requestDevolucion(request);
  }, []);

  const conciliarPago = useCallback(async (pagoId: number): Promise<Pago> => {
    const pago = await pagosService.ConciliarPago(pagoId);
    setPagos(prev => prev.filter(p => p.id !== pagoId));
    return pago;
  }, []);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  return {
    pagos,
    isLoading,
    error,
    fetchPagos,
    getPagoById,
    getPagosByReserva,
    requestDevolucion,
    conciliarPago,
  };
};