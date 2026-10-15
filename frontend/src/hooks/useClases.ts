import { useState, useEffect, useCallback } from 'react';
import { clasesService, MisClasesProfesorResponse } from '../services/clases.service';
import type { Clase, InscripcionClase } from '../types/models';
import type { CreateClaseRequest } from '../types/api';

interface UseMisClasesReturn {
  data: MisClasesProfesorResponse;
  loading: boolean;
  error: string | null;
  fetchClases: () => Promise<void>;
}

interface UseClaseDetailReturn {
  data: { clase: Clase | null; inscripciones: InscripcionClase[] };
  loading: boolean;
  error: string | null;
  fetchClaseDetail: (claseId: number) => Promise<void>;
}

interface UseCrearClaseReturn {
  loading: boolean;
  error: string | null;
  crearClase: (data: CreateClaseRequest) => Promise<Clase>;
}

const fetchClasesData = async (profesorId: number): Promise<MisClasesProfesorResponse> => {
  return clasesService.getMisClases(profesorId);
};

const handleClasesError = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error al obtener clases';
};

const handleClaseDetailError = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error al obtener detalle de clase';
};

const handleCrearClaseError = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error al crear clase';
};

export const useMisClases = (profesorId?: number): UseMisClasesReturn => {
  const [data, setData] = useState<MisClasesProfesorResponse>({ clases: [], clasesCompletas: [], clasesDisponibles: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfesorId, setCurrentProfesorId] = useState<number | undefined>(profesorId);

  const fetchClases = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchClasesData(id);
      setData(result);
    } catch (err) {
      setError(handleClasesError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profesorId) {
      setCurrentProfesorId(profesorId);
      fetchClases(profesorId);
    }
  }, [profesorId, fetchClases]);

  return {
    data,
    loading,
    error,
    fetchClases: () => currentProfesorId ? fetchClases(currentProfesorId) : Promise.resolve(),
  };
};

export const useClaseDetail = (claseId?: number): UseClaseDetailReturn => {
  const [data, setData] = useState<{ clase: Clase | null; inscripciones: InscripcionClase[] }>({ clase: null, inscripciones: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaseDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const [claseData, inscripcionesData] = await Promise.all([
        clasesService.getClase(id),
        clasesService.getInscripciones(id),
      ]);
      setData({ clase: claseData, inscripciones: inscripcionesData });
    } catch (err) {
      setError(handleClaseDetailError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (claseId) {
      fetchClaseDetail(claseId);
    }
  }, [claseId, fetchClaseDetail]);

  return { data, loading, error, fetchClaseDetail };
};

export const useCrearClase = (): UseCrearClaseReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearClase = useCallback(async (claseData: CreateClaseRequest): Promise<Clase> => {
    setLoading(true);
    setError(null);

    try {
      const nuevaClase = await clasesService.createClase(claseData);
      return nuevaClase;
    } catch (err) {
      setError(handleCrearClaseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, crearClase };
};