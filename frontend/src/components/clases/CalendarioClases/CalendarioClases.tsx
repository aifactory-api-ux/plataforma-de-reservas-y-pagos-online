import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Clase } from '../../../types/models';

export interface CalendarioClasesProps {
  clases: Clase[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasClases: boolean;
  clasesCount: number;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const CalendarioClases: React.FC<CalendarioClasesProps> = ({
  clases,
  selectedDate,
  onDateSelect,
  onMonthChange,
  minDate,
  maxDate,
}) => {
  const [viewDate, setViewDate] = React.useState(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  const clasesByDate = useMemo(() => {
    const map: Record<string, Clase[]> = {};
    clases.forEach((clase) => {
      const date = new Date(clase.inicio);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(clase);
    });
    return map;
  }, [clases]);

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: CalendarDay[] = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
        hasClases: !!clasesByDate[dateKey],
        clasesCount: clasesByDate[dateKey]?.length || 0,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
        hasClases: !!clasesByDate[dateKey],
        clasesCount: clasesByDate[dateKey]?.length || 0,
      });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextYear, nextMonth, day);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
        hasClases: !!clasesByDate[dateKey],
        clasesCount: clasesByDate[dateKey]?.length || 0,
      });
    }

    return days;
  }, [viewDate, selectedDate, clasesByDate]);

  const handlePrevMonth = () => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    setViewDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    setViewDate(newDate);
    onMonthChange?.(newDate);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_4,
    boxShadow: tokens.shadows.card,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.space_4,
  };

  const monthTitleStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    margin: 0,
  };

  const navButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.sm,
    cursor: 'pointer',
    color: tokens.colors.neutral.text_secondary,
    transition: 'all 150ms ease-out',
  };

  const weekdaysStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: tokens.spacing.space_1,
    marginBottom: tokens.spacing.space_2,
  };

  const weekdayStyles: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    padding: tokens.spacing.space_2,
  };

  const daysStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: tokens.spacing.space_1,
  };

  const getDayStyles = (day: CalendarDay): React.CSSProperties => {
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';
    let color = tokens.colors.neutral.text_primary;

    if (day.isSelected) {
      backgroundColor = tokens.colors.brand.green_500;
      borderColor = tokens.colors.brand.green_500;
      color = tokens.colors.neutral.white;
    } else if (day.isToday) {
      backgroundColor = tokens.colors.brand.green_50;
      borderColor = tokens.colors.brand.green_300;
      color = tokens.colors.brand.green_700;
    } else if (!day.isCurrentMonth) {
      color = tokens.colors.neutral.text_muted;
    }

    if (day.hasClases && !day.isSelected) {
      backgroundColor = tokens.colors.brand.green_100;
    }

    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.spacing.space_2,
      borderRadius: tokens.radii.md,
      cursor: isDateDisabled(day.date) ? 'not-allowed' : 'pointer',
      backgroundColor,
      border: `2px solid ${borderColor}`,
      color,
      opacity: isDateDisabled(day.date) ? 0.4 : 1,
      transition: 'all 150ms ease-out',
      minHeight: '48px',
    };
  };

  const dayNumberStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    lineHeight: 1,
  };

  const claseIndicatorStyles: React.CSSProperties = {
    display: 'flex',
    gap: '2px',
    marginTop: '4px',
  };

  const claseDotStyles: React.CSSProperties = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: tokens.colors.brand.green_600,
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <button
          type="button"
          style={navButtonStyles}
          onClick={handlePrevMonth}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} strokeWidth={1.75} />
        </button>

        <h3 style={monthTitleStyles}>
          <CalendarIcon size={20} strokeWidth={1.75} />
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>

        <button
          type="button"
          style={navButtonStyles}
          onClick={handleNextMonth}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div style={weekdaysStyles}>
        {WEEKDAYS.map((day) => (
          <div key={day} style={weekdayStyles}>
            {day}
          </div>
        ))}
      </div>

      <div style={daysStyles}>
        {calendarDays.map((day, index) => (
          <div
            key={index}
            style={getDayStyles(day)}
            onClick={() => !isDateDisabled(day.date) && onDateSelect(day.date)}
            role="button"
            tabIndex={isDateDisabled(day.date) ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isDateDisabled(day.date)) {
                onDateSelect(day.date);
              }
            }}
          >
            <span style={dayNumberStyles}>{day.date.getDate()}</span>
            {day.hasClases && day.clasesCount > 0 && (
              <div style={claseIndicatorStyles}>
                {Array.from({ length: Math.min(day.clasesCount, 3) }).map((_, i) => (
                  <div key={i} style={claseDotStyles} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarioClases;
