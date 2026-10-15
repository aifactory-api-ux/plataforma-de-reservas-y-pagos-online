import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { tokens } from '../../styles/tokens';
import type { ReservationStatus } from '../../types/models';

export interface BadgeEstadoProps {
  status: ReservationStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
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

const getIcon = (status: ReservationStatus): React.ReactNode => {
  const config = getStatusConfig(status);
  const iconName = config.icon;
  return iconMap[iconName] || <Clock size={14} strokeWidth={1.75} />;
};

const getContainerStyles = (status: ReservationStatus, size: 'sm' | 'md'): React.CSSProperties => {
  const config = getStatusConfig(status);
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size === 'sm' ? tokens.spacing.space_1 : tokens.spacing.space_2,
    padding: size === 'sm'
      ? `${tokens.spacing.space_1} ${tokens.spacing.space_2}`
      : `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    borderRadius: tokens.radii.pill,
    backgroundColor: config.fill,
    border: `1px solid ${config.border}`,
  };
};

const getIconStyles = (status: ReservationStatus): React.CSSProperties => {
  const config = getStatusConfig(status);
  return {
    color: config.text,
    flexShrink: 0,
  };
};

const getLabelStyles = (status: ReservationStatus, size: 'sm' | 'md'): React.CSSProperties => {
  const config = getStatusConfig(status);
  return {
    fontSize: size === 'sm' ? '11px' : '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: config.text,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1,
  };
};

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  const config = getStatusConfig(status);
  const icon = getIcon(status);
  const containerStyles = getContainerStyles(status, size);
  const iconStyles = getIconStyles(status);
  const labelStyles = getLabelStyles(status, size);

  return (
    <span style={containerStyles} role="status" aria-label={config.label}>
      <span style={iconStyles}>{icon}</span>
      {showLabel && <span style={labelStyles}>{config.label}</span>}
    </span>
  );
};

export default BadgeEstado;
