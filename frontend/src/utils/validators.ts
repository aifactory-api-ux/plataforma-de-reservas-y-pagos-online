import type { AvailabilityRequest } from '../types/api';
import type { Reserva, BloqueoCancha, Clase } from '../types/models';
import { isTimeOverlapping, getMinutesDiff } from './date.utils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ReservaFormData {
  canchaId: number;
  jugadorId: number;
  tarifaId: number;
  inicio: string;
  fin: string;
}

export function validateReservaForm(data: ReservaFormData): ValidationResult {
  const errors: string[] = [];

  if (!data.canchaId || data.canchaId <= 0) {
    errors.push('Debe seleccionar una cancha');
  }

  if (!data.jugadorId || data.jugadorId <= 0) {
    errors.push('Debe seleccionar un jugador');
  }

  if (!data.tarifaId || data.tarifaId <= 0) {
    errors.push('Debe seleccionar una tarifa');
  }

  if (!data.inicio) {
    errors.push('Debe especificar la fecha y hora de inicio');
  }

  if (!data.fin) {
    errors.push('Debe especificar la fecha y hora de fin');
  }

  if (data.inicio && data.fin) {
    const inicioDate = new Date(data.inicio);
    const finDate = new Date(data.fin);

    if (inicioDate >= finDate) {
      errors.push('La hora de fin debe ser posterior a la hora de inicio');
    }

    if (inicioDate < new Date()) {
      errors.push('No se pueden crear reservas en fechas pasadas');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAvailabilityRequest(request: AvailabilityRequest): ValidationResult {
  const errors: string[] = [];

  if (!request.sedeId || request.sedeId <= 0) {
    errors.push('Debe seleccionar una sede');
  }

  if (!request.deporte) {
    errors.push('Debe seleccionar un deporte');
  }

  if (!request.fecha) {
    errors.push('Debe seleccionar una fecha');
  } else {
    const fechaDate = new Date(request.fecha);
    if (isNaN(fechaDate.getTime())) {
      errors.push('La fecha no es válida');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function canReserveSlot(
  newReserva: { inicio: string; fin: string; canchaId: number },
  existingReservas: Reserva[],
  bloqueos: BloqueoCancha[]
): { canReserve: boolean; reason?: string } {
  const newInicio = new Date(newReserva.inicio);
  const newFin = new Date(newReserva.fin);

  for (const reserva of existingReservas) {
    if (reserva.canchaId !== newReserva.canchaId) continue;
    if (reserva.estado === 'cancelada') continue;

    const resInicio = new Date(reserva.inicio);
    const resFin = new Date(reserva.fin);

    if (isTimeOverlapping(newInicio, newFin, resInicio, resFin)) {
      return {
        canReserve: false,
        reason: 'La cancha ya está reservada en este horario',
      };
    }
  }

  for (const bloqueo of bloqueos) {
    if (bloqueo.canchaId !== newReserva.canchaId) continue;
    if (bloqueo.estado === 'liberado') continue;

    const bloqInicio = new Date(bloqueo.inicio);
    const bloqFin = new Date(bloqueo.fin);

    if (isTimeOverlapping(newInicio, newFin, bloqInicio, bloqFin)) {
      return {
        canReserve: false,
        reason: 'La cancha está bloqueada en este horario',
      };
    }
  }

  return { canReserve: true };
}

export function validateClaseForm(data: {
  canchaId: number;
  profesorId: number;
  nombre: string;
  inicio: string;
  fin: string;
  cupos: number;
  precio: number;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.canchaId || data.canchaId <= 0) {
    errors.push('Debe seleccionar una cancha');
  }

  if (!data.profesorId || data.profesorId <= 0) {
    errors.push('Debe seleccionar un profesor');
  }

  if (!data.nombre || data.nombre.trim().length < 3) {
    errors.push('El nombre de la clase debe tener al menos 3 caracteres');
  }

  if (!data.inicio) {
    errors.push('Debe especificar la fecha y hora de inicio');
  }

  if (!data.fin) {
    errors.push('Debe especificar la fecha y hora de fin');
  }

  if (data.inicio && data.fin) {
    const inicioDate = new Date(data.inicio);
    const finDate = new Date(data.fin);

    if (inicioDate >= finDate) {
      errors.push('La hora de fin debe ser posterior a la hora de inicio');
    }

    if (inicioDate < new Date()) {
      errors.push('No se pueden crear clases en fechas pasadas');
    }

    const duracionMinutos = getMinutesDiff(inicioDate, finDate);
    if (duracionMinutos < 30) {
      errors.push('La clase debe durar al menos 30 minutos');
    }
  }

  if (!data.cupos || data.cupos < 1) {
    errors.push('Debe haber al menos 1 cupo');
  }

  if (data.cupos > 20) {
    errors.push('El máximo de cupos es 20');
  }

  if (data.precio < 0) {
    errors.push('El precio no puede ser negativo');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function canCreateClase(
  newClase: { inicio: string; fin: string; canchaId: number },
  existingClases: Clase[]
): { canCreate: boolean; reason?: string } {
  const newInicio = new Date(newClase.inicio);
  const newFin = new Date(newClase.fin);

  for (const clase of existingClases) {
    if (clase.canchaId !== newClase.canchaId) continue;

    const claseInicio = new Date(clase.inicio);
    const claseFin = new Date(clase.fin);

    if (isTimeOverlapping(newInicio, newFin, claseInicio, claseFin)) {
      return {
        canCreate: false,
        reason: 'Ya existe una clase en esta cancha en el horario seleccionado',
      };
    }
  }

  return { canCreate: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined) {
    return `${fieldName} es requerido`;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return `${fieldName} es requerido`;
  }
  return null;
}

export function validateJugadorBloqueado(jugador: { bloqueado: boolean; inasistencias60Dias: number }): ValidationResult {
  const errors: string[] = [];

  if (jugador.bloqueado) {
    errors.push('El jugador está bloqueado y no puede realizar reservas');
  }

  if (jugador.inasistencias60Dias >= 3) {
    errors.push('El jugador ha alcanzado el límite de inasistencias');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMaxReservasFuturas(
  existingReservas: Reserva[],
  maxReservas: number = 3
): { canCreate: boolean; reason?: string } {
  const futureReservas = existingReservas.filter(
    (r) => r.estado !== 'cancelada' && new Date(r.inicio) > new Date()
  );

  if (futureReservas.length >= maxReservas) {
    return {
      canCreate: false,
      reason: `El jugador tiene el máximo de ${maxReservas} reservas futuras`,
    };
  }

  return { canCreate: true };
}

export function validateCheckInTime(reserva: Reserva): { canCheckIn: boolean; reason?: string } {
  const now = new Date();
  const inicio = new Date(reserva.inicio);
  const diffMinutes = getMinutesDiff(inicio, now);

  if (diffMinutes < -15) {
    return {
      canCheckIn: false,
      reason: 'Aún no es momento de hacer check-in para esta reserva',
    };
  }

  if (diffMinutes > 60) {
    return {
      canCheckIn: false,
      reason: 'El check-in solo está disponible 15 minutos antes y hasta 60 minutos después de la hora',
    };
  }

  if (reserva.estado !== 'pagada') {
    return {
      canCheckIn: false,
      reason: 'Solo se puede hacer check-in a reservas pagadas',
    };
  }

  return { canCheckIn: true };
}
