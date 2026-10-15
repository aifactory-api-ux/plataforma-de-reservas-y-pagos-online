export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+56)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function isValidChileanPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '').replace(/^\+56/, '');
  if (cleanPhone.length !== 9) {
    return false;
  }
  const validPrefixes = ['9'];
  return validPrefixes.some(prefix => cleanPhone.startsWith(prefix));
}

export function isValidRUT(rut: string): boolean {
  const cleanRut = rut.replace(/\s/g, '').replace(/[^0-9kK]/g, '');
  if (cleanRut.length < 8) {
    return false;
  }
  return true;
}

export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isValidNombre(nombre: string): boolean {
  return nombre.trim().length >= 2 && nombre.trim().length <= 100;
}

export function isValidDireccion(direccion: string): boolean {
  return direccion.trim().length >= 5 && direccion.trim().length <= 255;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function isValidDateRange(inicio: Date, fin: Date): boolean {
  return fin > inicio;
}

export function isValidReservaHorario(inicio: Date, fin: Date): boolean {
  const inicioTime = inicio.getHours();
  const finTime = fin.getHours();
  const duracionMinutos = (fin.getTime() - inicio.getTime()) / (60 * 1000);

  if (duracionMinutos < 30 || duracionMinutos > 240) {
    return false;
  }

  if (inicioTime < 6 || finTime > 23) {
    return false;
  }

  return true;
}

export function isValidMonto(monto: number): boolean {
  return monto > 0 && monto <= 1000000;
}

export function isValidCupos(cupos: number): boolean {
  return Number.isInteger(cupos) && cupos >= 1 && cupos <= 50;
}

export function isValidDuracionMinutos(duracion: number): boolean {
  return [30, 60, 90, 120, 180].includes(duracion);
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateReservaInput(data: {
  canchaId?: number;
  tarifaId?: number;
  inicio?: Date;
  fin?: Date;
  jugadorId?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.canchaId || data.canchaId <= 0) {
    errors.canchaId = 'Cancha inválida';
  }

  if (!data.tarifaId || data.tarifaId <= 0) {
    errors.tarifaId = 'Tarifa inválida';
  }

  if (!data.jugadorId || data.jugadorId <= 0) {
    errors.jugadorId = 'Jugador inválido';
  }

  if (!data.inicio) {
    errors.inicio = 'Fecha de inicio es requerida';
  }

  if (!data.fin) {
    errors.fin = 'Fecha de fin es requerida';
  }

  if (data.inicio && data.fin && !isValidDateRange(data.inicio, data.fin)) {
    errors.fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
  }

  if (data.inicio && data.fin && !isValidReservaHorario(data.inicio, data.fin)) {
    errors.horario = 'El horario de reserva no es válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePagoInput(data: {
  reservaId?: number;
  montoTotal?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.reservaId || data.reservaId <= 0) {
    errors.reservaId = 'Reserva inválida';
  }

  if (data.montoTotal === undefined || !isValidMonto(data.montoTotal)) {
    errors.montoTotal = 'Monto inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUsuarioPersonalInput(data: {
  nombre?: string;
  email?: string;
  passwordHash?: string;
  rol?: string;
  sedeId?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.nombre || !isValidNombre(data.nombre)) {
    errors.nombre = 'Nombre inválido';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  if (!data.sedeId || data.sedeId <= 0) {
    errors.sedeId = 'Sede inválida';
  }

  const validRoles = ['encargado', 'profesor', 'administrador'];
  if (!data.rol || !validRoles.includes(data.rol)) {
    errors.rol = 'Rol inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
