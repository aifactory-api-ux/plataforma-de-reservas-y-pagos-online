import React from 'react';
import { tokens } from '../../../styles/tokens';
import type { ReservationStatus } from '../../../types/models';

export interface TarjetaResumenProps {
  title: string;
  subtitle?: string;
  status?: ReservationStatus;
  image?: string;
  price?: number;
  meta?: string[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

const getStatusColors = (status?: ReservationStatus) => {
  if (!status) return null;
  const statusConfig = tokens.colors.reservation_status[status];
  return {
    fill: statusConfig.fill,
    border: statusConfig.border,
    text: statusConfig.text,
  };
};

const getContainerStyles = (
  statusColors: { fill: string; border: string; text: string } | null,
  onClick?: () => void
): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.card,
  border: statusColors
    ? `2px solid ${statusColors.border}`
    : `1px solid ${tokens.colors.neutral.border}`,
  overflow: 'hidden',
  cursor: onClick ? 'pointer' : 'default',
  transition: 'all 150ms ease-out',
  opacity: onClick ? 1 : 0.9,
});

const getHeaderStyles = (
  statusColors: { fill: string; border: string; text: string } | null
): React.CSSProperties => ({
  ...(statusColors && {
    backgroundColor: statusColors.fill,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
    borderBottom: `1px solid ${statusColors.border}`,
  }),
});

const getStatusLabelStyles = (
  statusColors: { fill: string; border: string; text: string } | null
): React.CSSProperties => ({
  ...(statusColors && {
    color: statusColors.text,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  }),
});

const getBodyStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  lineHeight: '24px',
  margin: 0,
});

const getSubtitleStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  color: tokens.colors.neutral.text_secondary,
  marginTop: tokens.spacing.space_1,
  lineHeight: '20px',
});

const getPriceStyles = (): React.CSSProperties => ({
  fontSize: '22px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.brand.green_700,
  marginTop: tokens.spacing.space_2,
});

const getMetaStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  color: tokens.colors.neutral.text_muted,
  marginTop: tokens.spacing.space_2,
  fontFamily: tokens.typography.families.body,
});

const getActionsStyles = (): React.CSSProperties => ({
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
  display: 'flex',
  gap: tokens.spacing.space_2,
  justifyContent: 'flex-end',
});

const getImageStyles = (): React.CSSProperties => ({
  width: '100%',
  height: '160px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: tokens.radii.md,
  marginBottom: tokens.spacing.space_3,
});

const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, onClick?: () => void) => {
  if (onClick) {
    e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
  }
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = tokens.shadows.card;
};

const formatPrice = (price: number): string => {
  return `$${price.toLocaleString('es-CL')}`;
};

const renderMetaItems = (meta: string[]): React.ReactNode => {
  return meta.map((item, index) => (
    <span key={index}>
      {item}
      {index < meta.length - 1 && ' • '}
    </span>
  ));
};

const TarjetaResumen: React.FC<TarjetaResumenProps> = ({
  title,
  subtitle,
  status,
  image,
  price,
  meta,
  actions,
  onClick,
}) => {
  const statusColors = getStatusColors(status);
  const containerStyles = getContainerStyles(statusColors, onClick);

  return (
    <div
      style={containerStyles}
      onClick={onClick}
      onMouseEnter={(e) => handleMouseEnter(e, onClick)}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {status && (
        <div style={getHeaderStyles(statusColors)}>
          <span style={getStatusLabelStyles(statusColors)}>
            {tokens.colors.reservation_status[status].label}
          </span>
        </div>
      )}
      <div style={getBodyStyles()}>
        {image && (
          <div
            style={{
              ...getImageStyles(),
              backgroundImage: `url(${image})`,
            }}
          />
        )}
        <h3 style={getTitleStyles()}>{title}</h3>
        {subtitle && <p style={getSubtitleStyles()}>{subtitle}</p>}
        {price !== undefined && (
          <div style={getPriceStyles()}>
            {formatPrice(price)}
          </div>
        )}
        {meta && meta.length > 0 && (
          <div style={getMetaStyles()}>
            {renderMetaItems(meta)}
          </div>
        )}
      </div>
      {actions && <div style={getActionsStyles()}>{actions}</div>}
    </div>
  );
};

export default TarjetaResumen;