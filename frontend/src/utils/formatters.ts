import type { EstadoReserva, EstadoPago, EstadoCancha, RolUsuario } from '../types/models';
import { tokens } from '../styles/tokens';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+56 9 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)}`;
  }
  if (cleaned.startsWith('56') && cleaned.length === 11) {
    return `+56 9 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  }
  return phone;
}

export function formatTime(hora: string): string {
  const [hours, minutes] = hora.split(':');
  return `${hours}:${minutes}`;
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDeporte(deporte: string): string {
  const labels: Record<string, string> = {
    padel: 'Pádel',
    futbol7: 'Fútbol 7',
  };
  return labels[deporte] || deporte;
}

export function formatEstadoReserva(estado: EstadoReserva): string {
  const labels: Record<EstadoReserva, string> = {
    retenida: 'Retenida',
    pagada: 'Pagada',
    cancelada: 'Cancelada',
    asistio: 'Asistió',
    no_asistio: 'No asistió',
  };
  return labels[estado] || estado;
}

export function formatEstadoPago(estado: EstadoPago): string {
  const labels: Record<EstadoPago, string> = {
    pendiente: 'Pendiente',
    completado: 'Completado',
    fallido: 'Fallido',
    reembolsado: 'Reembolsado',
  };
  return labels[estado] || estado;
}

export function formatEstadoCancha(estado: EstadoCancha): string {
  const labels: Record<EstadoCancha, string> = {
    disponible: 'Disponible',
    mantenimiento: 'Mantenimiento',
    bloqueada: 'Bloqueada',
  };
  return labels[estado] || estado;
}

export function formatRolUsuario(rol: RolUsuario): string {
  const labels: Record<RolUsuario, string> = {
    encargado: 'Encargado',
    profesor: 'Profesor',
    administrador: 'Administrador',
  };
  return labels[rol] || rol;
}

export function formatFranjaHoraria(franja: string): string {
  const labels: Record<string, string> = {
    manana: 'Mañana',
    tarde: 'Tarde',
    noche: 'Noche',
  };
  return labels[franja] || franja;
}

export function getStatusColor(estado: EstadoReserva): { fill: string; border: string; text: string } {
  const statusColors = tokens.colors.reservation_status;
  return {
    fill: statusColors[estado]?.fill || '#ECEFF1',
    border: statusColors[estado]?.border || '#5A6460',
    text: statusColors[estado]?.text || '#303A35',
  };
}

export function getStatusLabel(estado: EstadoReserva): string {
  return tokens.colors.reservation_status[estado]?.label || estado;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} min`;
  }
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && !digits.startsWith('56')) {
    return `+56 9 ${digits.slice(1, 4)} ${digits.slice(4)}`;
  }
  if (digits.startsWith('56')) {
    return `+56 9 ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function formatInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatOccupationRate(occupied: number, total: number): string {
  if (total === 0) return '0%';
  const rate = (occupied / total) * 100;
  return formatPercentage(rate);
}
