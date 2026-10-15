import React from 'react';
import { Clock, CheckCircle, Lock } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { AvailabilitySlot } from '../../../types/models';

export interface GridHorariosProps {
  canchaNombre: string;
  canchaId: number;
  slots: AvailabilitySlot[];
  onSelectSlot: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
}

const formatPrice = (precio: number): string => {
  return `$${precio.toLocaleString('es-CL')}`;
};

const formatHora = (hora: string): string => {
  const [hours, minutes] = hora.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getContainerStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  border: `1px solid ${tokens.colors.neutral.border}`,
  overflow: 'hidden',
  marginBottom: tokens.spacing.space_4,
});

const getHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  backgroundColor: tokens.colors.neutral.surface_subtle,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getCanchaNombreStyles = (): React.CSSProperties => ({
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  margin: 0,
});

const getSlotsCountStyles = (): React.CSSProperties => ({
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
});

const getGridStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: tokens.spacing.space_2,
  padding: tokens.spacing.space_4,
});

const getSlotStyles = (
  disponible: boolean,
  isSelected: boolean
): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_2}`,
  borderRadius: tokens.radii.md,
  border: isSelected
    ? `2px solid ${tokens.colors.brand.green_500}`
    : disponible
    ? `1px solid ${tokens.colors.neutral.border}`
    : `1px solid ${tokens.colors.neutral.border}`,
  backgroundColor: isSelected
    ? tokens.colors.brand.green_50
    : disponible
    ? tokens.colors.neutral.surface
    : tokens.colors.neutral.surface_subtle,
  cursor: disponible ? 'pointer' : 'not-allowed',
  transition: 'all 150ms ease-out',
  minHeight: '72px',
});

const getHoraStyles = (disponible: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.numeric,
  color: disponible
    ? tokens.colors.neutral.text_primary
    : tokens.colors.neutral.text_muted,
  marginBottom: tokens.spacing.space_1,
});

const getPrecioStyles = (disponible: boolean): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: disponible
    ? tokens.colors.brand.green_700
    : tokens.colors.neutral.text_muted,
});

const getStatusIconStyles = (_disponible: boolean): React.CSSProperties => ({
  marginTop: tokens.spacing.space_1,
});

const getEmptyStateStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing.space_8,
  color: tokens.colors.neutral.text_muted,
  textAlign: 'center' as const,
});

const getEmptyStateTextStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  marginTop: tokens.spacing.space_2,
});

const getLoadingSkeletonStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: tokens.spacing.space_2,
  padding: tokens.spacing.space_4,
});

const getSkeletonSlotStyles = (): React.CSSProperties => ({
  height: '72px',
  borderRadius: tokens.radii.md,
  backgroundColor: tokens.colors.neutral.surface_subtle,
  animation: 'pulse 1.5s ease-in-out infinite',
});

const handleSlotHover = (
  e: React.MouseEvent<HTMLDivElement>,
  disponible: boolean,
  isSelected: boolean
) => {
  if (!disponible) return;
  if (isSelected) {
    e.currentTarget.style.backgroundColor = tokens.colors.brand.green_100;
    e.currentTarget.style.borderColor = tokens.colors.brand.green_500;
  } else {
    e.currentTarget.style.backgroundColor = tokens.colors.brand.green_50;
    e.currentTarget.style.borderColor = tokens.colors.brand.green_300;
  }
};

const handleSlotLeave = (
  e: React.MouseEvent<HTMLDivElement>,
  disponible: boolean,
  isSelected: boolean
) => {
  if (!disponible) return;
  if (isSelected) {
    e.currentTarget.style.backgroundColor = tokens.colors.brand.green_50;
    e.currentTarget.style.borderColor = tokens.colors.brand.green_500;
  } else {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface;
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  }
};

const GridHorarios: React.FC<GridHorariosProps> = ({
  canchaNombre,
  canchaId: _canchaId,
  slots,
  onSelectSlot,
  isLoading = false,
}) => {
  const availableCount = slots.filter((s) => s.disponible).length;

  if (isLoading) {
    return (
      <div style={getContainerStyles()}>
        <div style={getHeaderStyles()}>
          <h4 style={getCanchaNombreStyles()}>{canchaNombre}</h4>
        </div>
        <div style={getLoadingSkeletonStyles()}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={getSkeletonSlotStyles()} />
          ))}
        </div>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={getContainerStyles()}>
        <div style={getHeaderStyles()}>
          <h4 style={getCanchaNombreStyles()}>{canchaNombre}</h4>
        </div>
        <div style={getEmptyStateStyles()}>
          <Clock size={32} strokeWidth={1.5} />
          <p style={getEmptyStateTextStyles()}>
            No hay horarios disponibles para esta cancha
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={getContainerStyles()}>
      <div style={getHeaderStyles()}>
        <h4 style={getCanchaNombreStyles()}>{canchaNombre}</h4>
        <span style={getSlotsCountStyles()}>
          {availableCount} disponibles
        </span>
      </div>
      <div style={getGridStyles()}>
        {slots.map((slot) => (
          <div
            key={`${slot.canchaId}-${slot.hora}`}
            style={getSlotStyles(slot.disponible, false)}
            onClick={() => {
              if (slot.disponible) {
                onSelectSlot(slot);
              }
            }}
            onMouseEnter={(e) => handleSlotHover(e, slot.disponible, false)}
            onMouseLeave={(e) => handleSlotLeave(e, slot.disponible, false)}
            role="button"
            tabIndex={slot.disponible ? 0 : -1}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && slot.disponible) {
                onSelectSlot(slot);
              }
            }}
            aria-disabled={!slot.disponible}
          >
            <span style={getHoraStyles(slot.disponible)}>
              <Clock size={14} strokeWidth={1.75} />
              {formatHora(slot.hora)}
            </span>
            <span style={getPrecioStyles(slot.disponible)}>
              {formatPrice(slot.precio)}
            </span>
            <span style={getStatusIconStyles(slot.disponible)}>
              {slot.disponible ? (
                <CheckCircle
                  size={16}
                  strokeWidth={1.75}
                  color={tokens.colors.semantic.success}
                />
              ) : (
                <Lock
                  size={16}
                  strokeWidth={1.75}
                  color={tokens.colors.neutral.text_muted}
                />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridHorarios;
