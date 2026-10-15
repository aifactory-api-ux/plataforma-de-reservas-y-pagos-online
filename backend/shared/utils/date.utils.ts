export function toISO8601(date: Date): string {
  return date.toISOString();
}

export function fromISO8601(isoString: string): Date {
  return new Date(isoString);
}

export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (60 * 1000));
}

export function diffDays(start: Date, end: Date): number {
  const startDay = getStartOfDay(start);
  const endDay = getStartOfDay(end);
  return Math.floor((endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000));
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isTimeOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

export function formatDateForDisplay(date: Date, locale: string = 'es-CL'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeForDisplay(date: Date, locale: string = 'es-CL'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTimeForDisplay(date: Date, locale: string = 'es-CL'): string {
  return `${formatDateForDisplay(date, locale)} ${formatTimeForDisplay(date, locale)}`;
}

export function getTimeSlots(
  date: Date,
  startHour: number,
  endHour: number,
  durationMinutes: number
): Array<{ inicio: Date; fin: Date }> {
  const slots: Array<{ inicio: Date; fin: Date }> = [];
  const current = new Date(date);
  current.setHours(startHour, 0, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const slotEnd = addMinutes(current, durationMinutes);
    if (slotEnd <= end) {
      slots.push({
        inicio: new Date(current),
        fin: slotEnd,
      });
    }
    current.setMinutes(current.getMinutes() + durationMinutes);
  }

  return slots;
}

export function getFranjaHoraria(hora: number): 'manana' | 'tarde' | 'noche' {
  if (hora >= 6 && hora < 12) {
    return 'manana';
  }
  if (hora >= 12 && hora < 20) {
    return 'tarde';
  }
  return 'noche';
}

export function isWithin60Days(date: Date, referenceDate: Date = new Date()): boolean {
  const daysDiff = diffDays(date, referenceDate);
  return daysDiff >= 0 && daysDiff <= 60;
}

export function parseChileanDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function toChileanDateFormat(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
