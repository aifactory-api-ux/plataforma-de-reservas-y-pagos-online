import type { FranjaHoraria } from '../types/models';

export interface TimeSlot {
  hora: string;
  minutos: number;
}

export interface DateRange {
  inicio: Date;
  fin: Date;
}

const HORAS_MANANA = 6;
const HORAS_TARDE = 14;
const HORAS_NOCHE = 20;
const HORA_FIN_JORNADA = 23;

export function getFranjaHoraria(hora: number): FranjaHoraria {
  if (hora >= HORAS_MANANA && hora < HORAS_TARDE) {
    return 'manana';
  }
  if (hora >= HORAS_TARDE && hora < HORAS_NOCHE) {
    return 'tarde';
  }
  return 'noche';
}

export function getFranjaLabel(franja: FranjaHoraria): string {
  const labels: Record<FranjaHoraria, string> = {
    manana: 'Mañana',
    tarde: 'Tarde',
    noche: 'Noche',
  };
  return labels[franja];
}

export function generateTimeSlots(
  fecha: Date,
  franja?: FranjaHoraria,
  duracionMinutos: number = 60
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const horaInicio = getHoraInicioFranja(franja);
  const horaFin = franja ? getHoraFinFranja(franja) : HORA_FIN_JORNADA;
  const now = new Date();
  const isToday = isSameDay(fecha, now);

  for (let hora = horaInicio; hora < horaFin; hora++) {
    for (let minutos = 0; minutos < 60; minutos += duracionMinutos) {
      if (hora === horaInicio && minutos < 0) continue;
      if (isToday) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const slotMinutes = hora * 60 + minutos;
        if (slotMinutes <= currentMinutes) continue;
      }
      slots.push({
        hora: `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
        minutos: hora * 60 + minutos,
      });
    }
  }

  return slots;
}

function getHoraInicioFranja(franja?: FranjaHoraria): number {
  if (!franja) return HORAS_MANANA;
  switch (franja) {
    case 'manana':
      return HORAS_MANANA;
    case 'tarde':
      return HORAS_TARDE;
    case 'noche':
      return HORAS_NOCHE;
  }
}

function getHoraFinFranja(franja: FranjaHoraria): number {
  switch (franja) {
    case 'manana':
      return HORAS_TARDE;
    case 'tarde':
      return HORAS_NOCHE;
    case 'noche':
      return HORA_FIN_JORNADA + 1;
  }
}

export function parseISOToDate(isoString: string): Date {
  return new Date(isoString);
}

export function formatDateToISO(date: Date): string {
  return date.toISOString();
}

export function getDateRange(fecha: Date, duracionMinutos: number, hora: string): DateRange {
  const [horas, minutos] = hora.split(':').map(Number);
  const inicio = new Date(fecha);
  inicio.setHours(horas, minutos, 0, 0);

  const fin = new Date(inicio);
  fin.setMinutes(fin.getMinutes() + duracionMinutos);

  return { inicio, fin };
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function isDateInPast(date: Date): boolean {
  return date < new Date();
}

export function isDateToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
}

export function getMonthName(date: Date, locale: string = 'es-CL'): string {
  return date.toLocaleDateString(locale, { month: 'long' });
}

export function getDayName(date: Date, locale: string = 'es-CL'): string {
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

export function formatDateDisplay(date: Date, locale: string = 'es-CL'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function getMinutesDiff(inicio: Date | string, fin: Date | string): number {
  const start = typeof inicio === 'string' ? new Date(inicio) : inicio;
  const end = typeof fin === 'string' ? new Date(fin) : fin;
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

export function isTimeOverlapping(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = typeof start1 === 'string' ? new Date(start1) : start1;
  const e1 = typeof end1 === 'string' ? new Date(end1) : end1;
  const s2 = typeof start2 === 'string' ? new Date(start2) : start2;
  const e2 = typeof end2 === 'string' ? new Date(end2) : end2;

  return s1 < e2 && s2 < e1;
}
