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

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  const config = tokens.colors.reservation_status[status];
  const icon = iconMap[config.icon] || <Clock size={14} strokeWidth={1.75} />;

  const containerStyles: React.CSSProperties = {
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

  const iconStyles: React.CSSProperties = {
    color: config.text,
    flexShrink: 0,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: size === 'sm' ? '11px' : '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: config.text,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1,
  };

  return (
    <span style={containerStyles} role="status" aria-label={config.label}>
      <span style={iconStyles}>{icon}</span>
      {showLabel && <span style={labelStyles}>{config.label}</span>}
    </span>
  );
};

export default BadgeEstado;