import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Cancha } from '../../../types/models';

export interface FiltrosAgendaProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedCourtId?: number;
  onCourtChange?: (courtId: number | undefined) => void;
  courts: Cancha[];
  selectedStatus?: string;
  onStatusChange?: (status: string | undefined) => void;
}

const formatDateShort = (date: Date): string => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
};

const formatDateLong = (date: Date): string => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
};

const getContainerStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.card,
  padding: tokens.spacing.space_4,
  width: '240px',
  flexShrink: 0,
});

const getSectionStyles = (): React.CSSProperties => ({
  marginBottom: tokens.spacing.space_5,
});

const getSectionTitleStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  marginBottom: tokens.spacing.space_3,
});

const getDateNavStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_2,
  marginBottom: tokens.spacing.space_3,
});

const getNavButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  backgroundColor: 'transparent',
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  color: tokens.colors.neutral.text_secondary,
  transition: 'all 150ms ease-out',
});

const getDateDisplayStyles = (): React.CSSProperties => ({
  flex: 1,
  textAlign: 'center' as const,
});

const getDateTextStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  lineHeight: '20px',
});

const getDateSubtextStyles = (): React.CSSProperties => ({
  fontSize: '11px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
});

const getTodayButtonStyles = (): React.CSSProperties => ({
  width: '100%',
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  backgroundColor: tokens.colors.brand.green_50,
  border: `1px solid ${tokens.colors.brand.green_300}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.brand.green_700,
  transition: 'all 150ms ease-out',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing.space_2,
});

const getDatePickerStyles = (): React.CSSProperties => ({
  width: '100%',
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  backgroundColor: tokens.colors.neutral.surface,
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  cursor: 'pointer',
  marginTop: tokens.spacing.space_2,
});

const getCourtListStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: tokens.spacing.space_2,
});

const getCourtItemStyles = (isSelected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_2,
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  backgroundColor: isSelected
    ? tokens.colors.brand.green_50
    : 'transparent',
  border: `1px solid ${isSelected
    ? tokens.colors.brand.green_300
    : tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
});

const getCourtTextStyles = (isSelected: boolean): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: isSelected ? 600 : 400,
  fontFamily: tokens.typography.families.body,
  color: isSelected
    ? tokens.colors.brand.green_700
    : tokens.colors.neutral.text_primary,
});

const getStatusSelectStyles = (): React.CSSProperties => ({
  width: '100%',
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  backgroundColor: tokens.colors.neutral.surface,
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  cursor: 'pointer',
});

const getAllOptionStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_2,
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  backgroundColor: 'transparent',
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  width: '100%',
});

const getAllOptionTextStyles = (): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: 400,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
});

const getCourtChipStyles = (deporte: string): React.CSSProperties => ({
  padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
  backgroundColor: deporte === 'padel'
    ? tokens.colors.brand.green_100
    : tokens.colors.brand.green_50,
  borderRadius: tokens.radii.sm,
  fontSize: '10px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.brand.green_700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
});

const FiltrosAgenda: React.FC<FiltrosAgendaProps> = ({
  selectedDate,
  onDateChange,
  selectedCourtId,
  onCourtChange,
  courts,
  selectedStatus,
  onStatusChange,
}) => {
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const handleCourtSelect = (courtId: number | undefined) => {
    if (onCourtChange) {
      onCourtChange(courtId === selectedCourtId ? undefined : courtId);
    }
  };

  const handleAllCourts = () => {
    if (onCourtChange) {
      onCourtChange(undefined);
    }
  };

  const isToday = (): boolean => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const getInputDateValue = (): string => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div style={getContainerStyles()}>
      <div style={getSectionStyles()}>
        <div style={getSectionTitleStyles()}>Fecha</div>
        <div style={getDateNavStyles()}>
          <button
            type="button"
            style={getNavButtonStyles()}
            onClick={handlePreviousDay}
            aria-label="Día anterior"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>
          <div style={getDateDisplayStyles()}>
            <div style={getDateTextStyles()}>{formatDateShort(selectedDate)}</div>
            <div style={getDateSubtextStyles()}>{formatDateLong(selectedDate).split(',')[0]}</div>
          </div>
          <button
            type="button"
            style={getNavButtonStyles()}
            onClick={handleNextDay}
            aria-label="Día siguiente"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        </div>
        {!isToday() && (
          <button
            type="button"
            style={getTodayButtonStyles()}
            onClick={handleToday}
          >
            <Calendar size={14} strokeWidth={1.75} />
            Hoy
          </button>
        )}
        <input
          type="date"
          style={getDatePickerStyles()}
          value={getInputDateValue()}
          onChange={handleDateInputChange}
          aria-label="Seleccionar fecha"
        />
      </div>

      {courts.length > 0 && onCourtChange && (
        <div style={getSectionStyles()}>
          <div style={getSectionTitleStyles()}>Canchas</div>
          <div style={getCourtListStyles()}>
            <button
              type="button"
              style={getAllOptionStyles()}
              onClick={handleAllCourts}
            >
              <span style={getAllOptionTextStyles()}>Todas las canchas</span>
            </button>
            {courts.map((court) => (
              <button
                type="button"
                key={court.id}
                style={getCourtItemStyles(selectedCourtId === court.id)}
                onClick={() => handleCourtSelect(court.id)}
              >
                <span style={getCourtChipStyles(court.deporte)}>
                  {court.deporte === 'padel' ? 'P' : 'F7'}
                </span>
                <span style={getCourtTextStyles(selectedCourtId === court.id)}>
                  {court.techada ? 'Techada' : 'Desc.'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {onStatusChange && (
        <div style={getSectionStyles()}>
          <div style={getSectionTitleStyles()}>Estado</div>
          <select
            style={getStatusSelectStyles()}
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange(e.target.value || undefined)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="retenida">Retenida</option>
            <option value="pagada">Pagada</option>
            <option value="cancelada">Cancelada</option>
            <option value="asistio">Asistió</option>
            <option value="no_asistio">No asistió</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default FiltrosAgenda;