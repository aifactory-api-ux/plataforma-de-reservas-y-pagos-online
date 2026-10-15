import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Sede, Cancha } from '../../../types/models';

export interface TarjetaSedeProps {
  sede: Sede;
  canchas?: Cancha[];
  selected?: boolean;
  onClick?: () => void;
}

const getContainerStyles = (selected: boolean): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  border: selected
    ? `2px solid ${tokens.colors.brand.green_500}`
    : `1px solid ${tokens.colors.neutral.border}`,
  padding: tokens.spacing.space_4,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  boxShadow: selected ? tokens.shadows.card_hover : tokens.shadows.card,
});

const getHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: tokens.spacing.space_3,
});

const getSedeIconStyles = (): React.CSSProperties => ({
  width: '48px',
  height: '48px',
  borderRadius: tokens.radii.md,
  backgroundColor: tokens.colors.brand.green_100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: tokens.colors.brand.green_700,
  marginRight: tokens.spacing.space_3,
});

const getInfoStyles = (): React.CSSProperties => ({
  flex: 1,
});

const getNombreStyles = (): React.CSSProperties => ({
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  margin: 0,
  marginBottom: tokens.spacing.space_1,
});

const getDireccionStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
  marginBottom: tokens.spacing.space_2,
});

const getTelefonoStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
});

const getCanchasContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_2,
  flexWrap: 'wrap' as const,
  paddingTop: tokens.spacing.space_3,
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
});

const getCanchaBadgeStyles = (_deporte: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
  borderRadius: tokens.radii.pill,
  backgroundColor: tokens.colors.brand.green_50,
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.brand.green_700,
  fontWeight: 500,
});

const getStatsStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_4,
  marginTop: tokens.spacing.space_3,
});

const getStatItemStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
});

const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, selected: boolean) => {
  if (selected) {
    e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
  } else {
    e.currentTarget.style.borderColor = tokens.colors.brand.green_300;
    e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
  }
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, selected: boolean) => {
  if (selected) {
    e.currentTarget.style.borderColor = tokens.colors.brand.green_500;
  } else {
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
    e.currentTarget.style.boxShadow = tokens.shadows.card;
  }
};

const getDeporteEmoji = (deporte: string): string => {
  return deporte === 'padel' ? '🎾' : '⚽';
};

const countCanchasByDeporte = (canchas: Cancha[], deporte: string): number => {
  return canchas.filter((c) => c.deporte === deporte).length;
};

const TarjetaSede: React.FC<TarjetaSedeProps> = ({
  sede,
  canchas = [],
  selected = false,
  onClick,
}) => {
  const padelCount = countCanchasByDeporte(canchas, 'padel');
  const futbol7Count = countCanchasByDeporte(canchas, 'futbol7');
  const totalCanchas = canchas.length;

  return (
    <div
      style={getContainerStyles(selected)}
      onClick={onClick}
      onMouseEnter={(e) => handleMouseEnter(e, selected)}
      onMouseLeave={(e) => handleMouseLeave(e, selected)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div style={getHeaderStyles()}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={getSedeIconStyles()}>
            <MapPin size={24} strokeWidth={1.75} />
          </div>
          <div style={getInfoStyles()}>
            <h3 style={getNombreStyles()}>{sede.nombre}</h3>
            <div style={getDireccionStyles()}>
              <MapPin size={14} strokeWidth={1.75} />
              <span>{sede.direccion}</span>
            </div>
            <div style={getTelefonoStyles()}>
              <Phone size={14} strokeWidth={1.75} />
              <span>{sede.telefono}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={getStatsStyles()}>
        <div style={getStatItemStyles()}>
          <Clock size={14} strokeWidth={1.75} />
          <span>Abierto ahora</span>
        </div>
      </div>

      {canchas.length > 0 && (
        <div style={getCanchasContainerStyles()}>
          {padelCount > 0 && (
            <span style={getCanchaBadgeStyles('padel')}>
              {getDeporteEmoji('padel')} {padelCount} Pádel
            </span>
          )}
          {futbol7Count > 0 && (
            <span style={getCanchaBadgeStyles('futbol7')}>
              {getDeporteEmoji('futbol7')} {futbol7Count} Fútbol 7
            </span>
          )}
          <span
            style={{
              ...getCanchaBadgeStyles('total'),
              backgroundColor: tokens.colors.neutral.surface_subtle,
              color: tokens.colors.neutral.text_secondary,
            }}
          >
            {totalCanchas} canchas
          </span>
        </div>
      )}
    </div>
  );
};

export default TarjetaSede;
