import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface FilaDisponibilidadProps {
  courtName: string;
  time: string;
  price: number;
  available: boolean;
  onSelect: () => void;
}

export const FilaDisponibilidad: React.FC<FilaDisponibilidadProps> = ({
  courtName,
  time,
  price,
  available,
  onSelect,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    backgroundColor: available
      ? tokens.colors.neutral.surface
      : tokens.colors.neutral.surface_subtle,
    borderRadius: tokens.radii.md,
    border: `1px solid ${available
      ? tokens.colors.neutral.border
      : tokens.colors.neutral.border_strong}`,
    cursor: available ? 'pointer' : 'not-allowed',
    opacity: available ? 1 : 0.6,
    transition: 'all 150ms ease-out',
    minHeight: '64px',
  };

  const leftSectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_1,
  };

  const courtNameStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    lineHeight: '20px',
  };

  const timeStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_1,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  const rightSectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: tokens.spacing.space_1,
  };

  const priceStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: available
      ? tokens.colors.brand.green_700
      : tokens.colors.neutral.text_muted,
  };

  const statusStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_1,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: available
      ? tokens.colors.semantic.success
      : tokens.colors.neutral.text_muted,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (available) {
      e.currentTarget.style.borderColor = tokens.colors.brand.green_500;
      e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (available) {
      e.currentTarget.style.borderColor = tokens.colors.neutral.border;
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <div
      style={containerStyles}
      onClick={available ? onSelect : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
      aria-label={`${courtName} a las ${time}, ${available ? `disponible por $${price.toLocaleString('es-CL')}` : 'no disponible'}`}
      onKeyDown={(e) => {
        if (available && (e.key === 'Enter' || e.key === ' ')) {
          onSelect();
        }
      }}
    >
      <div style={leftSectionStyles}>
        <span style={courtNameStyles}>{courtName}</span>
        <span style={timeStyles}>
          <Clock size={14} strokeWidth={1.75} />
          {time}
        </span>
      </div>
      <div style={rightSectionStyles}>
        <span style={priceStyles}>${price.toLocaleString('es-CL')}</span>
        <span style={statusStyles}>
          {available ? (
            <>
              <CheckCircle size={12} strokeWidth={1.75} />
              Disponible
            </>
          ) : (
            'Ocupada'
          )}
        </span>
      </div>
    </div>
  );
};

export default FilaDisponibilidad;