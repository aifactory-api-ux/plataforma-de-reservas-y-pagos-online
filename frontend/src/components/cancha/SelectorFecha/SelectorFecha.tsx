import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { FranjaHoraria } from '../../../types/models';

export interface SelectorFechaProps {
  fecha: Date;
  rangoHorario?: FranjaHoraria;
  onFechaChange: (fecha: Date) => void;
  onRangoChange?: (rango: FranjaHoraria | undefined) => void;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getContainerStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  padding: tokens.spacing.space_4,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getDateNavStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_3,
});

const getNavButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: tokens.radii.md,
  border: `1px solid ${tokens.colors.neutral.border}`,
  backgroundColor: tokens.colors.neutral.surface,
  cursor: 'pointer',
  color: tokens.colors.neutral.text_primary,
  transition: 'all 150ms ease-out',
});

const getDateDisplayStyles = (): React.CSSProperties => ({
  flex: 1,
  textAlign: 'center' as const,
});

const getDateLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: tokens.spacing.space_1,
});

const getDateValueStyles = (): React.CSSProperties => ({
  fontSize: '16px',
  fontFamily: tokens.typography.families.body,
  fontWeight: 600,
  color: tokens.colors.neutral.text_primary,
});

const getFranjaContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_2,
  marginTop: tokens.spacing.space_3,
  paddingTop: tokens.spacing.space_3,
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
});

const getFranjaButtonStyles = (isActive: boolean): React.CSSProperties => ({
  flex: 1,
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  borderRadius: tokens.radii.md,
  border: isActive
    ? `2px solid ${tokens.colors.brand.green_700}`
    : `1px solid ${tokens.colors.neutral.border}`,
  backgroundColor: isActive
    ? tokens.colors.brand.green_50
    : tokens.colors.neutral.surface,
  color: isActive
    ? tokens.colors.brand.green_700
    : tokens.colors.neutral.text_secondary,
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  fontWeight: isActive ? 600 : 400,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  textTransform: 'capitalize' as const,
});

const getCalendarIconStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing.space_2,
  color: tokens.colors.brand.green_700,
});

const handleNavButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
  if (isHover) {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
    e.currentTarget.style.borderColor = tokens.colors.brand.green_500;
  } else {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface;
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  }
};

const handleFranjaButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
  if (!isHover) return;
  const target = e.currentTarget;
  if (target.style.borderColor !== tokens.colors.brand.green_700) {
    target.style.borderColor = tokens.colors.brand.green_300;
    target.style.backgroundColor = tokens.colors.neutral.surface_subtle;
  }
};

const SelectorFecha: React.FC<SelectorFechaProps> = ({
  fecha,
  rangoHorario,
  onFechaChange,
  onRangoChange,
}) => {
  const goToPreviousDay = useCallback(() => {
    const newDate = new Date(fecha);
    newDate.setDate(newDate.getDate() - 1);
    onFechaChange(newDate);
  }, [fecha, onFechaChange]);

  const goToNextDay = useCallback(() => {
    const newDate = new Date(fecha);
    newDate.setDate(newDate.getDate() + 1);
    onFechaChange(newDate);
  }, [fecha, onFechaChange]);

  const goToToday = useCallback(() => {
    onFechaChange(new Date());
  }, [onFechaChange]);

  const handleFranjaClick = useCallback(
    (franja: FranjaHoraria) => {
      if (!onRangoChange) return;
      if (rangoHorario === franja) {
        onRangoChange(undefined);
      } else {
        onRangoChange(franja);
      }
    },
    [rangoHorario, onRangoChange]
  );

  const franjas: FranjaHoraria[] = ['manana', 'tarde', 'noche'];

  const getFranjaLabel = (franja: FranjaHoraria): string => {
    const labels: Record<FranjaHoraria, string> = {
      manana: 'Mañana',
      tarde: 'Tarde',
      noche: 'Noche',
    };
    return labels[franja];
  };

  return (
    <div style={getContainerStyles()}>
      <div style={getDateNavStyles()}>
        <button
          style={getNavButtonStyles()}
          onClick={goToPreviousDay}
          onMouseEnter={(e) => handleNavButtonHover(e, true)}
          onMouseLeave={(e) => handleNavButtonHover(e, false)}
          aria-label="Día anterior"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>

        <div style={getDateDisplayStyles()}>
          <div style={getDateLabelStyles()}>{formatDate(fecha)}</div>
          <div style={getDateValueStyles()}>{formatFullDate(fecha)}</div>
        </div>

        <button
          style={{
            ...getNavButtonStyles(),
            ...getCalendarIconStyles(),
          }}
          onClick={goToToday}
          aria-label="Ir a hoy"
        >
          <Calendar size={20} strokeWidth={1.75} />
        </button>

        <button
          style={getNavButtonStyles()}
          onClick={goToNextDay}
          onMouseEnter={(e) => handleNavButtonHover(e, true)}
          onMouseLeave={(e) => handleNavButtonHover(e, false)}
          aria-label="Día siguiente"
        >
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
      </div>

      {onRangoChange && (
        <div style={getFranjaContainerStyles()}>
          {franjas.map((franja) => (
            <button
              key={franja}
              style={getFranjaButtonStyles(rangoHorario === franja)}
              onClick={() => handleFranjaClick(franja)}
              onMouseEnter={(e) => handleFranjaButtonHover(e, true)}
              onMouseLeave={(e) => handleFranjaButtonHover(e, false)}
            >
              {getFranjaLabel(franja)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectorFecha;
