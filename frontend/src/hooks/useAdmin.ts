import { useState, useEffect, useCallback } from 'react';
import { adminService, CreateUsuarioRequest, UpdateUsuarioRequest, CreateTarifaRequest, UpdateTarifaRequest, ReporteReservasParams, ReportePagosParams, ReporteNoShowsParams, EstadisticasResumen, CreateBloqueoJugadorRequest } from '../services/admin.service';
import type { UsuarioPersonal, Tarifa, BloqueoJugador, Jugador } from '../types/models';

interface UseUsuariosReturn {
  data: UsuarioPersonal[];
  loading: boolean;
  error: string | null;
  fetchUsuarios: () => Promise<void>;
  getUsuario: (usuarioId: number) => Promise<UsuarioPersonal>;
  createUsuario: (data: CreateUsuarioRequest) => Promise<UsuarioPersonal>;
  updateUsuario: (usuarioId: number, data: UpdateUsuarioRequest) => Promise<UsuarioPersonal>;
  deactivateUsuario: (usuarioId: number) => Promise<void>;
}

interface UseTarifasReturn {
  data: Tarifa[];
  loading: boolean;
  error: string | null;
  fetchTarifas: (deporte?: 'padel' | 'futbol7') => Promise<void>;
  getTarifa: (tarifaId: number) => Promise<Tarifa>;
  createTarifa: (data: CreateTarifaRequest) => Promise<Tarifa>;
  updateTarifa: (tarifaId: number, data: UpdateTarifaRequest) => Promise<Tarifa>;
  deleteTarifa: (tarifaId: number) => Promise<void>;
}

interface UseBloqueosJugadoresReturn {
  data: { bloqueos: BloqueoJugador[]; jugadoresBloqueados: Jugador[] };
  loading: boolean;
  error: string | null;
  fetchBloqueos: () => Promise<void>;
  createBloqueo: (data: CreateBloqueoJugadorRequest) => Promise<BloqueoJugador>;
  releaseBloqueo: (bloqueoId: number) => Promise<void>;
}

interface UseReportesReturn {
  loading: boolean;
  error: string | null;
  downloadReporteReservas: (params: ReporteReservasParams) => Promise<void>;
  downloadReportePagos: (params: ReportePagosParams) => Promise<void>;
  downloadReporteNoShows: (params: ReporteNoShowsParams) => Promise<void>;
}

interface UseEstadisticasReturn {
  data: EstadisticasResumen | null;
  loading: boolean;
  error: string | null;
  fetchEstadisticas: (sedeId?: number) => Promise<void>;
}

const handleError = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error en operación';
};

export const useUsuarios = (): UseUsuariosReturn => {
  const [data, setData] = useState<UsuarioPersonal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getUsuarios();
      setData(result);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsuario = useCallback(async (usuarioId: number): Promise<UsuarioPersonal> => {
    return adminService.getUsuario(usuarioId);
  }, []);

  const createUsuario = useCallback(async (usuarioData: CreateUsuarioRequest): Promise<UsuarioPersonal> => {
    const newUsuario = await adminService.createUsuario(usuarioData);
    setData(prev => [...prev, newUsuario]);
    return newUsuario;
  }, []);

  const updateUsuario = useCallback(async (usuarioId: number, usuarioData: UpdateUsuarioRequest): Promise<UsuarioPersonal> => {
    const updated = await adminService.updateUsuario(usuarioId, usuarioData);
    setData(prev => prev.map(u => u.id === usuarioId ? updated : u));
    return updated;
  }, []);

  const deactivateUsuario = useCallback(async (usuarioId: number): Promise<void> => {
    await adminService.deactivateUsuario(usuarioId);
    setData(prev => prev.filter(u => u.id !== usuarioId));
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { data, loading, error, fetchUsuarios, getUsuario, createUsuario, updateUsuario, deactivateUsuario };
};

export const useTarifas = (deporte?: 'padel' | 'futbol7'): UseTarifasReturn => {
  const [data, setData] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTarifas = useCallback(async (dep?: 'padel' | 'futbol7') => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getTarifas(dep);
      setData(result);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getTarifa = useCallback(async (tarifaId: number): Promise<Tarifa> => {
    return adminService.getTarifa(tarifaId);
  }, []);

  const createTarifa = useCallback(async (tarifaData: CreateTarifaRequest): Promise<Tarifa> => {
    const newTarifa = await adminService.createTarifa(tarifaData);
    setData(prev => [...prev, newTarifa]);
    return newTarifa;
  }, []);

  const updateTarifa = useCallback(async (tarifaId: number, tarifaData: UpdateTarifaRequest): Promise<Tarifa> => {
    const updated = await adminService.updateTarifa(tarifaId, tarifaData);
    setData(prev => prev.map(t => t.id === tarifaId ? updated : t));
    return updated;
  }, []);

  const deleteTarifa = useCallback(async (tarifaId: number): Promise<void> => {
    await adminService.deleteTarifa(tarifaId);
    setData(prev => prev.filter(t => t.id !== tarifaId));
  }, []);

  useEffect(() => {
    fetchTarifas(deporte);
  }, [fetchTarifas, deporte]);

  return { data, loading, error, fetchTarifas, getTarifa, createTarifa, updateTarifa, deleteTarifa };
};

export const useBloqueosJugadores = (): UseBloqueosJugadoresReturn => {
  const [data, setData] = useState<{ bloqueos: BloqueoJugador[]; jugadoresBloqueados: Jugador[] }>({ bloqueos: [], jugadoresBloqueados: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBloqueos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bloqueosData, jugadoresData] = await Promise.all([
        adminService.getBloqueosJugadores(),
        adminService.getJugadoresBloqueados()
      ]);
      setData({ bloqueos: bloqueosData, jugadoresBloqueados: jugadoresData });
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createBloqueo = useCallback(async (bloqueoData: CreateBloqueoJugadorRequest): Promise<BloqueoJugador> => {
    const newBloqueo = await adminService.createBloqueoJugador(bloqueoData);
    setData(prev => ({ ...prev, bloqueos: [...prev.bloqueos, newBloqueo] }));
    return newBloqueo;
  }, []);

  const releaseBloqueo = useCallback(async (bloqueoId: number): Promise<void> => {
    await adminService.releaseBloqueoJugador(bloqueoId);
    setData(prev => ({ ...prev, bloqueos: prev.bloqueos.filter(b => b.id !== bloqueoId) }));
  }, []);

  useEffect(() => {
    fetchBloqueos();
  }, [fetchBloqueos]);

  return { data, loading, error, fetchBloqueos, createBloqueo, releaseBloqueo };
};

export const useReportes = (): UseReportesReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReporteReservas = useCallback(async (params: ReporteReservasParams): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const blob = await adminService.getReporteReservasExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_reservas_${params.fechaInicio}_${params.fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(handleError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportePagos = useCallback(async (params: ReportePagosParams): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const blob = await adminService.getReportePagosExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_pagos_${params.fechaInicio}_${params.fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(handleError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReporteNoShows = useCallback(async (params: ReporteNoShowsParams): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const blob = await adminService.getReporteNoShowsExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_noshows_${params.fechaInicio}_${params.fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(handleError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, downloadReporteReservas, downloadReportePagos, downloadReporteNoShows };
};

export const useEstadisticas = (sedeId?: number): UseEstadisticasReturn => {
  const [data, setData] = useState<EstadisticasResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async (id?: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getEstadisticas(id);
      setData(result);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstadisticas(sedeId);
  }, [fetchEstadisticas, sedeId]);

  return { data, loading, error, fetchEstadisticas };
};