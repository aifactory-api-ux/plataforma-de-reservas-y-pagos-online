import React from 'react';
import { FilaDisponibilidad } from '../ui/FilaDisponibilidad';
import { tokens } from '../../styles/tokens';
import type { AvailabilitySlot } from '../../types/models';

interface DisponibilidadListProps {
  slots: AvailabilitySlot[];
  onSelectSlot: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
}

const DisponibilidadList: React.FC<DisponibilidadListProps> = ({
  slots,
  onSelectSlot,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div style={containerStyles}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={skeletonStyles}>
            <div style={skeletonContentStyles}>
              <div style={skeletonLineStyles('60%')} />
              <div style={skeletonLineStyles('40%')} />
            </div>
            <div style={skeletonPriceStyles}>
              <div style={skeletonLineStyles('50px')} />
            </div>
          </div>
        ))}
        <style>{skeletonAnimation}</style>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={emptyContainerStyles}>
        <div style={emptyIconStyles}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke={tokens.colors.neutral.text_muted}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p style={emptyTextStyles}>No hay horarios disponibles para esta fecha</p>
        <p style={emptySubtextStyles}>Intenta con otra fecha o cambia la franja horaria</p>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {slots.map((slot, index) => (
        <FilaDisponibilidad
          key={`${slot.canchaId}-${slot.hora}-${index}`}
          courtName={slot.canchaNombre}
          time={slot.hora}
          price={slot.precio}
          available={slot.disponible}
          onSelect={() => onSelectSlot(slot)}
        />
      ))}
    </div>
  );
};

const containerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_3,
  padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
  paddingBottom: '100px',
};

const skeletonStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.md,
  border: `1px solid ${tokens.colors.neutral.border}`,
  minHeight: '64px',
};

const skeletonContentStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_2,
};

const skeletonLineStyles = (widthValue: string): React.CSSProperties => ({
  height: '16px',
  width: widthValue,
  backgroundColor: tokens.colors.neutral.border,
  borderRadius: tokens.radii.sm,
  animation: 'pulse 1.5s ease-in-out infinite',
});

const skeletonPriceStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: tokens.spacing.space_2,
};

const skeletonAnimation = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const emptyContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${tokens.spacing.space_12} ${tokens.spacing.page_gutter_mobile}`,
  textAlign: 'center' as const,
};

const emptyIconStyles: React.CSSProperties = {
  marginBottom: tokens.spacing.space_4,
  color: tokens.colors.neutral.text_muted,
};

const emptyTextStyles: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  marginBottom: tokens.spacing.space_2,
};

const emptySubtextStyles: React.CSSProperties = {
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
};

export default DisponibilidadList;
