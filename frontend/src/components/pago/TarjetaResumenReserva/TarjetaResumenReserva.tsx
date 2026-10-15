import React from 'react';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Reserva } from '../../../types/models';

interface TarjetaResumenReservaProps {
  reserva: Reserva;
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

const formatDeporte = (deporte: string): string => {
  return deporte === 'padel' ? 'Pádel' : 'Fútbol 7';
};

const getCanchaNombre = (cancha?: { id?: number; deporte?: string; sedeId?: number }): string => {
  if (!cancha) return 'Cancha';
  return `Cancha ${cancha.id || ''}`;
};

const getSedeNombre = (reserva: Reserva): string => {
  if (reserva.cancha?.sedeId === 1) return 'Ñuñoa';
  if (reserva.cancha?.sedeId === 2) return 'La Florida';
  return 'Sede';
};

export const TarjetaResumenReserva: React.FC<TarjetaResumenReservaProps> = ({ reserva }) => {
  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_4,
    paddingBottom: tokens.spacing.space_4,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    marginBottom: tokens.spacing.space_2,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
  };

  const detailRowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    padding: `${tokens.spacing.space_3} 0`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const detailIconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: tokens.colors.brand.green_50,
    borderRadius: tokens.radii.md,
    color: tokens.colors.brand.green_700,
    flexShrink: 0,
  };

  const detailContentStyles: React.CSSProperties = {
    flex: 1,
  };

  const detailLabelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    marginBottom: tokens.spacing.space_1,
  };

  const detailValueStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Confirmar reserva</h2>
        <div style={subtitleStyles}>
          <MapPin size={16} strokeWidth={1.75} />
          <span>{getSedeNombre(reserva)} - {getCanchaNombre(reserva.cancha)}</span>
        </div>
      </div>

      <div style={detailRowStyles}>
        <div style={detailIconStyles}>
          <Calendar size={18} strokeWidth={1.75} />
        </div>
        <div style={detailContentStyles}>
          <div style={detailLabelStyles}>Fecha</div>
          <div style={detailValueStyles}>{formatDate(reserva.inicio)}</div>
        </div>
      </div>

      <div style={detailRowStyles}>
        <div style={detailIconStyles}>
          <Clock size={18} strokeWidth={1.75} />
        </div>
        <div style={detailContentStyles}>
          <div style={detailLabelStyles}>Hora</div>
          <div style={detailValueStyles}>
            {formatTime(reserva.inicio)} - {formatTime(reserva.fin)}
          </div>
        </div>
      </div>

      <div style={{ ...detailRowStyles, borderBottom: 'none' }}>
        <div style={detailIconStyles}>
          <Users size={18} strokeWidth={1.75} />
        </div>
        <div style={detailContentStyles}>
          <div style={detailLabelStyles}>Deporte</div>
          <div style={detailValueStyles}>{formatDeporte(reserva.cancha?.deporte || '')}</div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaResumenReserva;
