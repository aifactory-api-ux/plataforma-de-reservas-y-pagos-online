import React, { useEffect, useState, useCallback } from 'react';
import { ContadorRetencion } from '../ui/ContadorRetencion';
import { useReservas } from '../../hooks/useReservas';

interface ReservationTimerProps {
  variant?: 'compact' | 'full';
  onExpire?: () => void;
}

export const ReservationTimer: React.FC<ReservationTimerProps> = ({
  variant = 'full',
  onExpire,
}) => {
  const { retencionExpiry } = useReservas();
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const calculateTimeRemaining = useCallback(() => {
    if (!retencionExpiry) {
      return { minutes: 0, seconds: 0 };
    }

    const now = new Date();
    const expiry = new Date(retencionExpiry);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return { minutes: mins, seconds: secs };
  }, [retencionExpiry]);

  useEffect(() => {
    if (!retencionExpiry) {
      return;
    }

    const updateTimer = () => {
      const { minutes: mins, seconds: secs } = calculateTimeRemaining();
      setMinutes(mins);
      setSeconds(secs);

      if (mins === 0 && secs === 0) {
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [retencionExpiry, calculateTimeRemaining, onExpire]);

  if (!retencionExpiry) {
    return null;
  }

  return <ContadorRetencion minutes={minutes} seconds={seconds} variant={variant} />;
};

export default ReservationTimer;
