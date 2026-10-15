import { useState, useEffect, useCallback } from 'react';
import { sedesService, AgendaSedeResponse } from '../services/sedes.service';
import type { Sede, Cancha, Tarifa } from '../types/models';

interface UseSedesReturn {
  sedes: Sede[];
  isLoading: boolean;
  error: string | null;
  fetchSedes: () => Promise<void>;
}

interface UseSedeDetailReturn {
  sede: Sede | null;
  canchas: Cancha[];
  tarifas: Tarifa[];
  isLoading: boolean;
  error: string | null;
  fetchSedeDetail: (sedeId: number) => Promise<void>;
}

interface UseAgendaSedeReturn {
  agenda: AgendaSedeResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchAgenda: (sedeId: number, fecha: Date) => Promise<void>;
  refetch: () => void;
}

export const useSedes = (): UseSedesReturn => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSedes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await sedesService.getSedes();
      setSedes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener sedes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSedes();
  }, [fetchSedes]);

  return { sedes, isLoading, error, fetchSedes };
};

export const useSedeDetail = (sedeId?: number): UseSedeDetailReturn => {
  const [sede, setSede] = useState<Sede | null>(null);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSedeDetail = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const [sedeData, canchasData, tarifasData] = await Promise.all([
        sedesService.getSede(id),
        sedesService.getCanchas(id),
        sedesService.getTarifas(id),
      ]);
      setSede(sedeData);
      setCanchas(canchasData);
      setTarifas(tarifasData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalle de sede';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sedeId) {
      fetchSedeDetail(sedeId);
    }
  }, [sedeId, fetchSedeDetail]);

  return { sede, canchas, tarifas, isLoading, error, fetchSedeDetail };
};

export const useAgendaSede = (sedeId?: number, fecha?: Date): UseAgendaSedeReturn => {
  const [agenda, setAgenda] = useState<AgendaSedeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSedeId, setCurrentSedeId] = useState<number | undefined>(sedeId);
  const [currentFecha, setCurrentFecha] = useState<Date | undefined>(fecha);

  const fetchAgenda = useCallback(async (id: number, date: Date) => {
    setIsLoading(true);
    setError(null);
    setCurrentSedeId(id);
    setCurrentFecha(date);

    try {
      const fechaStr = date.toISOString().split('T')[0];
      const data = await sedesService.getAgendaSede(id, fechaStr);
      setAgenda(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener agenda';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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

  return { agenda, isLoading, error, fetchAgenda, refetch };
};