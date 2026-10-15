import React from 'react';
import { Clock, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { ReservationStatus } from '../../../types/models';

export interface CeldaReservaProps {
  reserva?: {
    id: string;
    jugadorNombre: string;
    estado: ReservationStatus;
    canchaId: number;
  };
  onClick: (reservaId: string) => void;
  isLoading?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock size={14} strokeWidth={1.75} />,
  check_circle: <CheckCircle size={14} strokeWidth={1.75} />,
  x_circle: <XCircle size={14} strokeWidth={1.75} />,
  user_check: <UserCheck size={14} strokeWidth={1.75} />,
  user_x: <UserX size={14} strokeWidth={1.75} />,
};

const getStatusConfig = (status: ReservationStatus) => {
  return tokens.colors.reservation_status[status];
};

const CeldaReserva: React.FC<CeldaReservaProps> = ({
  reserva,
  onClick,
  isLoading = false,
}) => {
  const handleClick = () => {
    if (reserva) {
      onClick(reserva.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && reserva) {
      e.preventDefault();
      onClick(reserva.id);
    }
  };

  const getCellStyles = (): React.CSSProperties => ({
    padding: tokens.spacing.space_2,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    borderRight: `1px solid ${tokens.colors.neutral.border}`,
    backgroundColor: reserva
      ? 'transparent'
      : tokens.colors.neutral.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '64px',
    position: 'relative' as const,
    cursor: reserva ? 'pointer' : 'default',
    transition: 'background-color 150ms ease-out',
  });

  const getReservationCardStyles = (status: ReservationStatus): React.CSSProperties => {
    const config = getStatusConfig(status);
    return {
      width: '100%',
      padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
      backgroundColor: config.fill,
      borderRadius: tokens.radii.sm,
      border: `1px solid ${config.border}`,
      cursor: 'pointer',
      transition: 'all 150ms ease-out',
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing.space_1,
    };
  };

  const getReservationTextStyles = (): React.CSSProperties => ({
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  const getBadgeContainerStyles = (status: ReservationStatus): React.CSSProperties => {
    const config = getStatusConfig(status);
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing.space_1,
      padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
      borderRadius: tokens.radii.pill,
      backgroundColor: config.fill,
      border: `1px solid ${config.border}`,
    };
  };

  const getBadgeIconStyles = (status: ReservationStatus): React.CSSProperties => {
    const config = getStatusConfig(status);
    return {
      color: config.text,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    };
  };

  const getBadgeLabelStyles = (status: ReservationStatus): React.CSSProperties => {
    const config = getStatusConfig(status);
    return {
      fontSize: '10px',
      fontWeight: 600,
      fontFamily: tokens.typography.families.body,
      color: config.text,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      lineHeight: 1,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reserva) {
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.boxShadow = tokens.shadows.focus_ring;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reserva) {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  if (isLoading) {
    return (
      <div style={getCellStyles()}>
        <div
          style={{
            width: '100%',
            height: '48px',
            backgroundColor: tokens.colors.neutral.border,
            borderRadius: tokens.radii.sm,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.55; }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes pulse {
                from { opacity: 1; }
                to { opacity: 1; }
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (!reserva) {
    return <div style={getCellStyles()} />;
  }

  const config = getStatusConfig(reserva.estado);
  const iconName = config.icon;

  return (
    <div
      style={getCellStyles()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Reserva de ${reserva.jugadorNombre}, estado ${config.label}`}
    >
      <div style={getReservationCardStyles(reserva.estado)}>
        <span style={getReservationTextStyles()}>{reserva.jugadorNombre}</span>
        <div style={getBadgeContainerStyles(reserva.estado)}>
          <span style={getBadgeIconStyles(reserva.estado)}>
            {iconMap[iconName] || <Clock size={14} strokeWidth={1.75} />}
          </span>
          <span style={getBadgeLabelStyles(reserva.estado)}>{config.label}</span>
        </div>
      </div>
    </div>
  );
};

export default CeldaReserva;