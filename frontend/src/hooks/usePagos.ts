import { useState, useEffect, useCallback } from 'react';
import { pagosService } from '../services/pagos.service';
import type { Pago, Devolucion } from '../types/models';
import type { DevolucionRequest } from '../types/api';

interface UsePagosReturn {
  data: Pago[];
  loading: boolean;
  error: string | null;
  fetchPagos: () => Promise<void>;
  getPagoById: (pagoId: number) => Promise<Pago>;
  getPagosByReserva: (reservaId: number) => Promise<Pago[]>;
  requestDevolucion: (request: DevolucionRequest) => Promise<Devolucion>;
  conciliarPago: (pagoId: number) => Promise<Pago>;
}

const fetchPagosData = async (): Promise<Pago[]> => {
  return pagosService.getPagosPendientes();
};

const handlePagosError = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error al obtener pagos';
};

const updatePagosList = (pagos: Pago[], pagoId: number): Pago[] => {
  return pagos.filter(p => p.id !== pagoId);
};

export const usePagos = (): UsePagosReturn => {
  const [data, setData] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPagosData();
      setData(result);
    } catch (err) {
      setError(handlePagosError(err));
    } finally {
      setLoading(false);
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
    setData(prev => updatePagosList(prev, pagoId));
    return pago;
  }, []);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  return {
    data,
    loading,
    error,
    fetchPagos,
    getPagoById,
    getPagosByReserva,
    requestDevolucion,
    conciliarPago,
  };
};