import React, { useEffect, useState, useCallback } from 'react';
import { tokens } from '../../styles/tokens';

interface RetentionTimerProps {
  expiryTime: Date;
  onExpire?: () => void;
  variant?: 'compact' | 'full';
  onTick?: (remainingSeconds: number) => void;
}

interface TimeDisplay {
  minutes: number;
  seconds: number;
}

const calculateTimeRemaining = (expiryTime: Date): TimeDisplay => {
  const now = new Date();
  const diff = Math.max(0, expiryTime.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
};

const RetentionTimer: React.FC<RetentionTimerProps> = ({
  expiryTime,
  onExpire,
  variant = 'full',
  onTick,
}) => {
  const [time, setTime] = useState<TimeDisplay>(() => calculateTimeRemaining(expiryTime));
  const [isLowTime, setIsLowTime] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining(expiryTime);
      setTime(newTime);

      const totalSeconds = newTime.minutes * 60 + newTime.seconds;
      setIsLowTime(totalSeconds <= 120);

      if (onTick) {
        onTick(totalSeconds);
      }

      if (totalSeconds <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, onExpire, onTick]);

  const formatTime = (value: number): string => String(value).padStart(2, '0');

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
    textAlign: 'center' as const,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isLowTime
      ? tokens.colors.reservation_status.retenida.text
      : tokens.colors.neutral.text_muted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  };

  const ClockIcon = () => (
    <svg
      width={variant === 'compact' ? 14 : 18}
      height={variant === 'compact' ? 14 : 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return (
    <div
      style={containerStyles}
      role="timer"
      aria-label={`Tiempo restante: ${time.minutes} minutos y ${time.seconds} segundos`}
    >
      <span style={iconStyles}>
        <ClockIcon />
      </span>
      <span style={timeStyles}>
        {formatTime(time.minutes)}:{formatTime(time.seconds)}
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

export default RetentionTimer;
