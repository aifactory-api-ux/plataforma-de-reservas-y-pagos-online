import { useState, useEffect, useCallback } from 'react';
import { clasesService, MisClasesProfesorResponse } from '../services/clases.service';
import type { Clase, InscripcionClase } from '../types/models';
import type { CreateClaseRequest } from '../types/api';

interface UseMisClasesReturn {
  clases: Clase[];
  clasesCompletas: Clase[];
  clasesDisponibles: Clase[];
  isLoading: boolean;
  error: string | null;
  fetchClases: () => Promise<void>;
}

interface UseClaseDetailReturn {
  clase: Clase | null;
  inscripciones: InscripcionClase[];
  isLoading: boolean;
  error: string | null;
  fetchClaseDetail: (claseId: number) => Promise<void>;
}

interface UseCrearClaseReturn {
  isLoading: boolean;
  error: string | null;
  crearClase: (data: CreateClaseRequest) => Promise<Clase>;
}

export const useMisClases = (profesorId?: number): UseMisClasesReturn => {
  const [clases, setClases] = useState<Clase[]>([]);
  const [clasesCompletas, setClasesCompletas] = useState<Clase[]>([]);
  const [clasesDisponibles, setClasesDisponibles] = useState<Clase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfesorId, setCurrentProfesorId] = useState<number | undefined>(profesorId);

  const fetchClases = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clasesService.getMisClases(id);
      setClases(data.clases);
      setClasesCompletas(data.clasesCompletas);
      setClasesDisponibles(data.clasesDisponibles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener clases';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profesorId) {
      setCurrentProfesorId(profesorId);
      fetchClases(profesorId);
    }
  }, [profesorId, fetchClases]);

  return {
    clases,
    clasesCompletas,
    clasesDisponibles,
    isLoading,
    error,
    fetchClases: () => currentProfesorId ? fetchClases(currentProfesorId) : Promise.resolve(),
  };
};

export const useClaseDetail = (claseId?: number): UseClaseDetailReturn => {
  const [clase, setClase] = useState<Clase | null>(null);
  const [inscripciones, setInscripciones] = useState<InscripcionClase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaseDetail = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const [claseData, inscripcionesData] = await Promise.all([
        clasesService.getClase(id),
        clasesService.getInscripciones(id),
      ]);
      setClase(claseData);
      setInscripciones(inscripcionesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalle de clase';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (claseId) {
      fetchClaseDetail(claseId);
    }
  }, [claseId, fetchClaseDetail]);

  return { clase, inscripciones, isLoading, error, fetchClaseDetail };
};

export const useCrearClase = (): UseCrearClaseReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearClase = useCallback(async (data: CreateClaseRequest): Promise<Clase> => {
    setIsLoading(true);
    setError(null);

    try {
      const nuevaClase = await clasesService.createClase(data);
      return nuevaClase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear clase';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, crearClase };
};