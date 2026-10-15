import React from 'react';
import { tokens } from '../../styles/tokens';
import type { ReservationStatus } from '../../types/models';

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

export const TarjetaResumen: React.FC<TarjetaResumenProps> = ({
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

  const containerStyles: React.CSSProperties = {
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
  };

  const headerStyles: React.CSSProperties = {
    ...(statusColors && {
      backgroundColor: statusColors.fill,
      padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
      borderBottom: `1px solid ${statusColors.border}`,
    }),
  };

  const statusLabelStyles: React.CSSProperties = {
    ...(statusColors && {
      color: statusColors.text,
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: tokens.typography.families.body,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }),
  };

  const bodyStyles: React.CSSProperties = {
    padding: tokens.spacing.space_4,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    lineHeight: '24px',
    margin: 0,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    color: tokens.colors.neutral.text_secondary,
    marginTop: tokens.spacing.space_1,
    lineHeight: '20px',
  };

  const priceStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
    marginTop: tokens.spacing.space_2,
  };

  const metaStyles: React.CSSProperties = {
    fontSize: '12px',
    color: tokens.colors.neutral.text_muted,
    marginTop: tokens.spacing.space_2,
    fontFamily: tokens.typography.families.body,
  };

  const actionsStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
    display: 'flex',
    gap: tokens.spacing.space_2,
    justifyContent: 'flex-end',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.boxShadow = tokens.shadows.card;
    }
  };

  return (
    <div
      style={containerStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {status && (
        <div style={headerStyles}>
          <span style={statusLabelStyles}>
            {tokens.colors.reservation_status[status].label}
          </span>
        </div>
      )}
      <div style={bodyStyles}>
        {image && (
          <div
            style={{
              width: '100%',
              height: '160px',
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: tokens.radii.md,
              marginBottom: tokens.spacing.space_3,
            }}
          />
        )}
        <h3 style={titleStyles}>{title}</h3>
        {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        {price !== undefined && (
          <div style={priceStyles}>
            ${price.toLocaleString('es-CL')}
          </div>
        )}
        {meta && meta.length > 0 && (
          <div style={metaStyles}>
            {meta.map((item, index) => (
              <span key={index}>
                {item}
                {index < meta.length - 1 && ' • '}
              </span>
            ))}
          </div>
        )}
      </div>
      {actions && <div style={actionsStyles}>{actions}</div>}
    </div>
  );
};

export default TarjetaResumen;
