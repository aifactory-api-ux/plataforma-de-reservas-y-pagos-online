import { useState, useEffect, useCallback } from 'react';
import { sedesService, AgendaSedeResponse } from '../services/sedes.service';
import type { Sede, Cancha, Tarifa } from '../types/models';

interface UseSedesReturn {
  data: Sede[];
  loading: boolean;
  error: string | null;
  fetchSedes: () => Promise<void>;
  sedes: Sede[];
  isLoading: boolean;
}

interface UseSedeDetailReturn {
  data: { sede: Sede; canchas: Cancha[]; tarifas: Tarifa[] } | undefined;
  loading: boolean;
  error: string | null;
  fetchSedeDetail: (sedeId: number) => Promise<void>;
  sede: Sede | undefined;
  canchas: Cancha[];
  tarifas: Tarifa[];
  isLoading: boolean;
}

interface UseAgendaSedeReturn {
  data: AgendaSedeResponse | null;
  loading: boolean;
  error: string | null;
  fetchAgenda: (sedeId: number, fecha: Date) => Promise<void>;
  refetch: () => void;
  agenda: AgendaSedeResponse | null;
  isLoading: boolean;
}

export const useSedes = (): UseSedesReturn => {
  const [data, setData] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSedes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await sedesService.getSedes();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener sedes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSedes();
  }, [fetchSedes]);

  return { data, loading, error, fetchSedes, sedes: data, isLoading: loading };
};

export const useSedeDetail = (sedeId?: number): UseSedeDetailReturn => {
  const [data, setData] = useState<{ sede: Sede; canchas: Cancha[]; tarifas: Tarifa[] } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSedeDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const [sedeData, canchasData, tarifasData] = await Promise.all([
        sedesService.getSede(id),
        sedesService.getCanchas(id),
        sedesService.getTarifas(id),
      ]);
      setData({ sede: sedeData, canchas: canchasData, tarifas: tarifasData });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalle de sede';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sedeId) {
      fetchSedeDetail(sedeId);
    }
  }, [sedeId, fetchSedeDetail]);

  return { data, loading, error, fetchSedeDetail, sede: data?.sede, canchas: data?.canchas ?? [], tarifas: data?.tarifas ?? [], isLoading: loading };
};

export const useAgendaSede = (sedeId?: number, fecha?: Date): UseAgendaSedeReturn => {
  const [data, setData] = useState<AgendaSedeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSedeId, setCurrentSedeId] = useState<number | undefined>(sedeId);
  const [currentFecha, setCurrentFecha] = useState<Date | undefined>(fecha);

  const fetchAgenda = useCallback(async (id: number, date: Date) => {
    setLoading(true);
    setError(null);
    setCurrentSedeId(id);
    setCurrentFecha(date);

    try {
      const fechaStr = date.toISOString().split('T')[0];
      const result = await sedesService.getAgendaSede(id, fechaStr);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener agenda';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (currentSedeId && currentFecha) {
      fetchAgenda(currentSedeId, currentFecha);
    }
  }, [currentSedeId, currentFecha, fetchAgenda]);

  useEffect(() => {
    if (sedeId && fecha) {
      fetchAgenda(sedeId, fecha);
    }
  }, [sedeId, fecha, fetchAgenda]);

  return { data, loading, error, fetchAgenda, refetch, agenda: data, isLoading: loading };
};