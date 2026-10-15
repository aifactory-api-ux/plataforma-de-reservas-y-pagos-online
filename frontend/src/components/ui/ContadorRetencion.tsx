import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface ContadorRetencionProps {
  minutes: number;
  seconds: number;
  variant?: 'compact' | 'full';
}

export const ContadorRetencion: React.FC<ContadorRetencionProps> = ({
  minutes,
  seconds,
  variant = 'full',
}) => {
  const [isLowTime, setIsLowTime] = useState(false);

  useEffect(() => {
    const totalSeconds = minutes * 60 + seconds;
    setIsLowTime(totalSeconds <= 120);
  }, [minutes, seconds]);

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: variant === 'compact'
      ? tokens.spacing.space_1
      : tokens.spacing.space_2,
    padding: variant === 'compact'
      ? `${tokens.spacing.space_1} ${tokens.spacing.space_2}`
      : `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
    backgroundColor: isLowTime
      ? tokens.colors.reservation_status.retenida.fill
      : tokens.colors.neutral.surface,
    border: `1px solid ${
      isLowTime
        ? tokens.colors.reservation_status.retenida.border
        : tokens.colors.neutral.border
    }`,
    borderRadius: tokens.radii.md,
    transition: 'all 200ms ease-out',
  };

  const iconStyles: React.CSSProperties = {
    color: isLowTime
      ? tokens.colors.reservation_status.retenida.text
      : tokens.colors.neutral.text_muted,
    animation: isLowTime ? 'pulse 1s ease-in-out infinite' : 'none',
    flexShrink: 0,
  };

  const timeStyles: React.CSSProperties = {
    fontSize: variant === 'compact' ? '14px' : '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.numeric,
    color: isLowTime
      ? tokens.colors.reservation_status.retenida.text
      : tokens.colors.neutral.text_primary,
    lineHeight: 1,
    minWidth: variant === 'compact' ? '40px' : '56px',
    textAlign: 'center',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isLowTime
      ? tokens.colors.reservation_status.retenida.text
      : tokens.colors.neutral.text_muted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const formatTime = (value: number): string => {
    return String(value).padStart(2, '0');
  };

  return (
    <div
      style={containerStyles}
      role="timer"
      aria-label={`Tiempo restante: ${minutes} minutos y ${seconds} segundos`}
    >
      <Clock size={variant === 'compact' ? 14 : 18} strokeWidth={1.75} style={iconStyles} />
      <span style={timeStyles}>
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
      {variant === 'full' && (
        <span style={labelStyles}>min</span>
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          }
        `}
      </style>
    </div>
  );
};

export default ContadorRetencion;