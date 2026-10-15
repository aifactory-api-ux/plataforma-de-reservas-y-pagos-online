import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { BadgeEstado } from '../../ui/BadgeEstado';
import { BotonAccionPrincipal } from '../../ui/BotonAccionPrincipal';
import type { Reserva } from '../../../types/models';

interface TarjetaReservaProps {
  reserva: Reserva;
  onCancel?: () => void;
  onClick?: () => void;
}

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TarjetaReserva: React.FC<TarjetaReservaProps> = ({
  reserva,
  onCancel,
  onClick,
}) => {
  const isPast = new Date(reserva.inicio) < new Date();
  const isCancellable = reserva.estado === 'pagada' || reserva.estado === 'retenida';

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 150ms ease-out',
    opacity: isPast && (reserva.estado === 'asistio' || reserva.estado === 'no_asistio') ? 0.7 : 1,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_5}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const bodyStyles: React.CSSProperties = {
    padding: tokens.spacing.space_4,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_1,
    lineHeight: '24px',
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    marginBottom: tokens.spacing.space_2,
    color: tokens.colors.neutral.text_muted,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const priceContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_2,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  };

  const priceLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const priceStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
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
    e.currentTarget.style.boxShadow = tokens.shadows.card;
  };

  const handleCancelClick = () => {
    onCancel?.();
  };

  const handleCardClick = () => {
    onClick?.();
  };

  const deporteLabel = reserva.cancha?.deporte === 'padel' ? 'Pádel' : 'Fútbol 7';
  const canchaNombre = reserva.cancha?.id ? `Cancha ${reserva.cancha.id}` : '-';
  const precioLabel = reserva.estado === 'cancelada' ? 'Monto reembolsado' : 'Total pagado';
  const precio = `$${reserva.tarifa?.monto?.toLocaleString('es-CL') || '0'}`;

  return (
    <div
      style={containerStyles}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={headerStyles}>
        <div>
          <p style={titleStyles}>{deporteLabel}</p>
          <p style={subtitleStyles}>{canchaNombre}</p>
        </div>
        <BadgeEstado status={reserva.estado} size="sm" />
      </div>

      <div style={bodyStyles}>
        <div style={rowStyles}>
          <Calendar size={16} strokeWidth={1.75} />
          <span>{formatDate(reserva.inicio)}</span>
        </div>
        <div style={rowStyles}>
          <Clock size={16} strokeWidth={1.75} />
          <span>
            {formatTime(reserva.inicio)} - {formatTime(reserva.fin)}
          </span>
        </div>
        <div style={priceContainerStyles}>
          <span style={priceLabelStyles}>{precioLabel}</span>
          <span style={priceStyles}>{precio}</span>
        </div>
      </div>

      {isCancellable && onCancel && (
        <div style={actionsStyles}>
          <BotonAccionPrincipal
            label="Cancelar"
            variant="ghost"
            size="sm"
            onClick={handleCancelClick}
          />
        </div>
      )}
    </div>
  );
};

export default TarjetaReserva;
