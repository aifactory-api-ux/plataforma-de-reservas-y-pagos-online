import { apiFetch } from './api';
import type { Clase, InscripcionClase } from '../types/models';
import type { CreateClaseRequest, InscripcionClaseRequest } from '../types/api';

export interface MisClasesProfesorResponse {
  clases: Clase[];
  clasesCompletas: Clase[];
  clasesDisponibles: Clase[];
}

class ClasesService {
  async getMisClases(profesorId: number): Promise<MisClasesProfesorResponse> {
    return apiFetch.get<MisClasesProfesorResponse>(`/clases/profesor/${profesorId}`);
  }

  async getClase(claseId: number): Promise<Clase> {
    return apiFetch.get<Clase>(`/clases/${claseId}`);
  }

  async getInscripciones(claseId: number): Promise<InscripcionClase[]> {
    return apiFetch.get<InscripcionClase[]>(`/clases/${claseId}/inscripciones`);
  }

  async createClase(data: CreateClaseRequest): Promise<Clase> {
    return apiFetch.post<Clase>('/clases', data);
  }

  async updateClase(claseId: number, data: Partial<CreateClaseRequest>): Promise<Clase> {
    return apiFetch.put<Clase>(`/clases/${claseId}`, data);
  }

  async cancelClase(claseId: number): Promise<void> {
    await apiFetch.delete(`/clases/${claseId}`);
  }

  async inscribirJugador(data: InscripcionClaseRequest): Promise<InscripcionClase> {
    return apiFetch.post<InscripcionClase>('/clases/inscripcion', data);
  }

  async desinscribirJugador(inscripcionId: number): Promise<void> {
    await apiFetch.delete(`/clases/inscripcion/${inscripcionId}`);
  }
}

export const clasesService = new ClasesService();