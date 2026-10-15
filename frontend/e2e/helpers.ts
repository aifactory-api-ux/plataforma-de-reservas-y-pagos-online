import { Page, APIRequestContext } from '@playwright/test';

export async function createReserva(
  request: APIRequestContext,
  token: string,
  data: {
    canchaId: number;
    tarifaId: number;
    inicio: string;
    fin: string;
    contacto: {
      nombre: string;
      telefono: string;
      email: string;
    };
  }
): Promise<{ reserva: any; retencionMinutos: number }> {
  const response = await request.post('/api/reservas', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create reserva: ${await response.text()}`);
  }
  return response.json();
}

export async function getReservasDisponibilidad(
  request: APIRequestContext,
  token: string,
  params: {
    sedeId: number;
    deporte: string;
    fecha: string;
    rangoHorario?: string;
  }
): Promise<Array<{ canchaId: number; hora: string; disponible: boolean }>> {
  const searchParams = new URLSearchParams({
    sedeId: params.sedeId.toString(),
    deporte: params.deporte,
    fecha: params.fecha,
  });
  if (params.rangoHorario) {
    searchParams.set('rangoHorario', params.rangoHorario);
  }
  const response = await request.get(`/api/reservas/disponibilidad?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get disponibilidad: ${await response.text()}`);
  }
  return response.json();
}

export async function getSedes(
  request: APIRequestContext,
  token: string
): Promise<Array<{ id: number; nombre: string; direccion: string; telefono: string }>> {
  const response = await request.get('/api/sedes', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get sedes: ${await response.text()}`);
  }
  return response.json();
}

export async function getTarifas(
  request: APIRequestContext,
  token: string
): Promise<Array<any>> {
  const response = await request.get('/api/admin/tarifas', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get tarifas: ${await response.text()}`);
  }
  return response.json();
}

export async function createTarifa(
  request: APIRequestContext,
  token: string,
  data: {
    deporte: string;
    duracionMinutos: number;
    franja: string;
    monto: number;
  }
): Promise<any> {
  const response = await request.post('/api/admin/tarifas', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create tarifa: ${await response.text()}`);
  }
  return response.json();
}

export async function initiatePago(
  request: APIRequestContext,
  token: string,
  reservaId: number
): Promise<{ tokenTransbank: string; urlWebpay: string; reservaId: number }> {
  const response = await request.post(
    '/api/pagos/initiate',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { reservaId },
    }
  );
  if (!response.ok()) {
    throw new Error(`Failed to initiate pago: ${await response.text()}`);
  }
  return response.json();
}

export async function getReservaById(
  request: APIRequestContext,
  token: string,
  reservaId: number
): Promise<any> {
  const response = await request.get(`/api/reservas/${reservaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get reserva: ${await response.text()}`);
  }
  return response.json();
}

export async function getMisReservas(
  request: APIRequestContext,
  token: string,
  params?: { estado?: string }
): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.estado) {
    searchParams.set('estado', params.estado);
  }
  const url = searchParams.toString()
    ? `/api/reservas?${searchParams}`
    : '/api/reservas';
  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get mis reservas: ${await response.text()}`);
  }
  return response.json();
}

export async function getSedeAgenda(
  request: APIRequestContext,
  token: string,
  sedeId: number,
  fecha: string
): Promise<any[]> {
  const response = await request.get(
    `/api/sedes/${sedeId}/agenda?fecha=${fecha}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok()) {
    throw new Error(`Failed to get agenda: ${await response.text()}`);
  }
  return response.json();
}

export async function createBloqueoJugador(
  request: APIRequestContext,
  token: string,
  data: {
    jugadorId: number;
    motivo: string;
    inicio: string;
    fin: string;
  }
): Promise<any> {
  const response = await request.post('/api/admin/bloqueo-jugador', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create bloqueo: ${await response.text()}`);
  }
  return response.json();
}

export async function markReservaAsistio(
  request: APIRequestContext,
  token: string,
  reservaId: number
): Promise<any> {
  const response = await request.post(`/api/reservas/${reservaId}/asistio`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to mark asistencia: ${await response.text()}`);
  }
  return response.json();
}

export async function markReservaNoAsistio(
  request: APIRequestContext,
  token: string,
  reservaId: number
): Promise<any> {
  const response = await request.put(`/api/reservas/${reservaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { estado: 'no_asistio' },
  });
  if (!response.ok()) {
    throw new Error(`Failed to mark no asistencia: ${await response.text()}`);
  }
  return response.json();
}

export async function createUsuario(
  request: APIRequestContext,
  token: string,
  data: {
    sedeId: number;
    nombre: string;
    email: string;
    password: string;
    rol: string;
  }
): Promise<any> {
  const response = await request.post('/api/admin/usuarios', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create usuario: ${await response.text()}`);
  }
  return response.json();
}

export async function getUsuarios(
  request: APIRequestContext,
  token: string,
  rol?: string
): Promise<any[]> {
  const url = rol ? `/api/admin/usuarios?rol=${rol}` : '/api/admin/usuarios';
  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get usuarios: ${await response.text()}`);
  }
  return response.json();
}

export async function deleteUsuario(
  request: APIRequestContext,
  token: string,
  usuarioId: number
): Promise<{ success: boolean }> {
  const response = await request.delete(`/api/admin/usuarios/${usuarioId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to delete usuario: ${await response.text()}`);
  }
  return response.json();
}

export async function getClases(
  request: APIRequestContext,
  token: string,
  params?: { sedeId?: number; profesorId?: number }
): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.sedeId) {
    searchParams.set('sedeId', params.sedeId.toString());
  }
  if (params?.profesorId) {
    searchParams.set('profesorId', params.profesorId.toString());
  }
  const url = searchParams.toString()
    ? `/api/clases?${searchParams}`
    : '/api/clases';
  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get clases: ${await response.text()}`);
  }
  return response.json();
}

export async function createClase(
  request: APIRequestContext,
  token: string,
  data: {
    canchaId: number;
    profesorId: number;
    inicio: string;
    fin: string;
    nombre: string;
    cupos: number;
    precio: number;
  }
): Promise<any> {
  const response = await request.post('/api/clases', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create clase: ${await response.text()}`);
  }
  return response.json();
}

export async function inscribirEnClase(
  request: APIRequestContext,
  token: string,
  claseId: number,
  jugadorId: number
): Promise<any> {
  const response = await request.post(`/api/clases/${claseId}/inscribir`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { jugadorId },
  });
  if (!response.ok()) {
    throw new Error(`Failed to inscribir: ${await response.text()}`);
  }
  return response.json();
}

export async function getReportesReservas(
  request: APIRequestContext,
  token: string,
  params: { sedeId: number; desde: string; hasta: string }
): Promise<any> {
  const searchParams = new URLSearchParams({
    sedeId: params.sedeId.toString(),
    desde: params.desde,
    hasta: params.hasta,
  });
  const response = await request.get(`/api/admin/reportes/reservas?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get reportes reservas: ${await response.text()}`);
  }
  return response.json();
}

export async function getReportesPagos(
  request: APIRequestContext,
  token: string,
  params: { sedeId: number; desde: string; hasta: string }
): Promise<any> {
  const searchParams = new URLSearchParams({
    sedeId: params.sedeId.toString(),
    desde: params.desde,
    hasta: params.hasta,
  });
  const response = await request.get(`/api/admin/reportes/pagos?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get reportes pagos: ${await response.text()}`);
  }
  return response.json();
}

export async function cancelarReserva(
  request: APIRequestContext,
  token: string,
  reservaId: number
): Promise<any> {
  const response = await request.delete(`/api/reservas/${reservaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to cancel reserva: ${await response.text()}`);
  }
  return response.json();
}

export async function devolverPago(
  request: APIRequestContext,
  token: string,
  pagoId: number,
  data: { monto: number; motivo: string }
): Promise<any> {
  const response = await request.post(`/api/pagos/${pagoId}/devolver`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to devolver pago: ${await response.text()}`);
  }
  return response.json();
}

export async function updateUsuario(
  request: APIRequestContext,
  token: string,
  usuarioId: number,
  data: { nombre?: string; email?: string; rol?: string }
): Promise<any> {
  const response = await request.put(`/api/admin/usuarios/${usuarioId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  if (!response.ok()) {
    throw new Error(`Failed to update usuario: ${await response.text()}`);
  }
  return response.json();
}