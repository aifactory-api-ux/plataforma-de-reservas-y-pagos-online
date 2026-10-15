import React, { useEffect, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

interface CountdownTimerProps {
  expiryTime: Date;
  onExpire?: () => void;
}

interface TimeRemaining {
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

const CRITICAL_THRESHOLD_SECONDS = 120;
const WARNING_THRESHOLD_SECONDS = 300;

const formatTime = (value: number): string => {
  return String(value).padStart(2, '0');
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryTime,
  onExpire,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return { minutes: mins, seconds: secs, totalSeconds };
  }, [expiryTime]);

  useEffect(() => {
    const updateTimer = (): void => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining.totalSeconds === 0) {
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, onExpire]);

  const isCritical = timeRemaining.totalSeconds <= CRITICAL_THRESHOLD_SECONDS && timeRemaining.totalSeconds > 0;
  const isWarning = timeRemaining.totalSeconds <= WARNING_THRESHOLD_SECONDS && timeRemaining.totalSeconds > CRITICAL_THRESHOLD_SECONDS;

  const containerStyles: React.CSSProperties = {
    position: 'absolute',
    top: tokens.spacing.space_3,
    right: tokens.spacing.space_4,
    zIndex: 10,
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    backgroundColor: isCritical
      ? tokens.colors.semantic.danger
      : isWarning
        ? tokens.colors.semantic.warning
        : tokens.colors.neutral.surface,
    border: `1px solid ${
      isCritical
        ? tokens.colors.semantic.danger
        : isWarning
          ? tokens.colors.semantic.warning
          : tokens.colors.neutral.border
    }`,
    borderRadius: tokens.radii.md,
    boxShadow: tokens.shadows.card,
    animation: isCritical ? 'pulse 1s ease-in-out infinite' : 'none',
  };

  const iconStyles: React.CSSProperties = {
    color: isCritical || isWarning
      ? tokens.colors.neutral.white
      : tokens.colors.neutral.text_muted,
    flexShrink: 0,
  };

  const timeTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.numeric,
    color: isCritical || isWarning
      ? tokens.colors.neutral.white
      : tokens.colors.neutral.text_primary,
    lineHeight: 1,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isCritical || isWarning
      ? tokens.colors.neutral.white
      : tokens.colors.neutral.text_muted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    opacity: isCritical || isWarning ? 0.9 : 1,
  };

  return (
    <div style={containerStyles}>
      <div style={badgeStyles}>
        <Clock size={16} strokeWidth={1.75} style={iconStyles} />
        <span style={timeTextStyles}>
          {formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
        </span>
        <span style={labelStyles}>min</span>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.02); }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.9; }
            }
          }
        `}
      </style>
    </div>
  );
};

export default CountdownTimer;
