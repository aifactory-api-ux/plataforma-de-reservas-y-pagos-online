import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { BotonAccionPrincipal } from '../components/ui/BotonAccionPrincipal';
import { PaymentForm } from '../components/pago/PaymentForm';
import { RetentionTimer } from '../components/reserva/RetentionTimer';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useReservas } from '../context/ReservationContext';
import { apiFetch } from '../lib/api';
import type { Reserva } from '../types/models';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'expired';

const Pago: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { retencionExpiry, releaseRetention, setCurrentReservation } = useReservas();

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [splitCount, setSplitCount] = useState(1);
  const [showSplitOptions, setShowSplitOptions] = useState(false);

  const reservaId = location.state?.reservaId as number | undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reservaId) {
      navigate('/buscar-cancha');
      return;
    }

    const fetchReserva = async () => {
      try {
        const data = await apiFetch.get<Reserva>(`/api/reservas/${reservaId}`);
        setReserva(data);
        setCurrentReservation(data);

        if (data.estado === 'pagada') {
          setPaymentStatus('success');
        } else if (data.estado === 'cancelada' || data.estado === 'no_asistio') {
          setPaymentStatus('expired');
        }
      } catch (error) {
        console.error('Error fetching reserva:', error);
        navigate('/buscar-cancha');
      }
    };

    fetchReserva();
  }, [isAuthenticated, navigate, reservaId, setCurrentReservation]);

  const handlePaymentSuccess = useCallback(async (token: string) => {
    if (!reserva) return;

    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      const response = await apiFetch.post<Reserva>(`/api/pagos/webpay/confirm`, {
        reservaId: reserva.id,
        token,
      });

      setReserva(response);
      setCurrentReservation(response);
      setPaymentStatus('success');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage('El pago fue rechazado. Por favor intenta de nuevo.');
    }
  }, [reserva, setCurrentReservation]);

  const handlePaymentError = useCallback((error: string) => {
    setPaymentStatus('error');
    setErrorMessage(error);
  }, []);

  const handleExpire = useCallback(() => {
    setPaymentStatus('expired');
    setErrorMessage('El tiempo para completar el pago ha expirado.');
    releaseRetention();
  }, [releaseRetention]);

  const handleRetry = useCallback(() => {
    setPaymentStatus('idle');
    setErrorMessage(null);
  }, []);

  const handleCancel = useCallback(() => {
    releaseRetention();
    navigate('/buscar-cancha');
  }, [releaseRetention, navigate]);

  const handleGoToReservations = useCallback(() => {
    navigate('/mis-reservas');
  }, [navigate]);

  const handleSplitPayment = useCallback(async () => {
    if (!reserva || splitCount < 2) return;

    try {
      await apiFetch.post(`/api/pagos/split`, {
        reservaId: reserva.id,
        cantidad: splitCount,
      });
      setShowSplitOptions(false);
    } catch (error) {
      setErrorMessage('Error al dividir el pago. Por favor intenta de nuevo.');
    }
  }, [reserva, splitCount]);

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '100px',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: tokens.spacing.page_gutter_mobile,
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 20,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
  };

  const retentionBarStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.page_gutter_mobile}`,
    backgroundColor: tokens.colors.reservation_status.retenida.fill,
    borderBottom: `1px solid ${tokens.colors.reservation_status.retenida.border}`,
  };

  const retentionTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.reservation_status.retenida.text,
  };

  const successContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_12} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const successIconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: tokens.colors.reservation_status.pagada.fill,
    borderRadius: '50%',
    marginBottom: tokens.spacing.space_6,
    color: tokens.colors.semantic.success,
  };

  const successTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const successSubtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    marginBottom: tokens.spacing.space_6,
  };

  const errorContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_8} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const errorIconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    backgroundColor: tokens.colors.reservation_status.cancelada.fill,
    borderRadius: '50%',
    marginBottom: tokens.spacing.space_4,
    color: tokens.colors.semantic.danger,
  };

  const expiredIconStyles: React.CSSProperties = {
    ...errorIconStyles,
    backgroundColor: tokens.colors.reservation_status.retenida.fill,
    color: tokens.colors.semantic.warning,
  };

  const reservaCardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_5,
    marginBottom: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
  };

  const reservaTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_3,
  };

  const reservaDetailStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_2} 0`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const reservaLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  const reservaValueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const totalStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_2,
  };

  const totalLabelStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const totalValueStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  const splitSectionStyles: React.CSSProperties = {
    marginTop: tokens.spacing.space_4,
    paddingTop: tokens.spacing.space_4,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  };

  const splitLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_3,
  };

  const splitOptionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_3,
  };

  const splitButtonStyles = (isSelected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    backgroundColor: isSelected ? tokens.colors.brand.green_50 : tokens.colors.neutral.surface,
    border: `2px solid ${isSelected ? tokens.colors.brand.green_700 : tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isSelected ? tokens.colors.brand.green_700 : tokens.colors.neutral.text_primary,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  });

  if (!isAuthenticated || !reserva) {
    return null;
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

  if (paymentStatus === 'success') {
    return (
      <div style={pageStyles}>
        <div style={headerStyles}>
          <h1 style={headerTitleStyles}>Pago exitoso</h1>
        </div>
        <div style={successContainerStyles}>
          <div style={successIconStyles}>
            <CheckCircle size={40} strokeWidth={1.75} />
          </div>
          <h2 style={successTitleStyles}>¡Reserva confirmada!</h2>
          <p style={successSubtitleStyles}>
            Tu pago fue procesada correctamente. Te hemos enviado un correo de confirmación.
          </p>
          <div style={reservaCardStyles}>
            <div style={reservaTitleStyles}>{reserva.cancha?.id ? `Cancha ${reserva.cancha.id}` : 'Cancha'}</div>
            <div style={reservaDetailStyles}>
              <span style={reservaLabelStyles}>Fecha</span>
              <span style={reservaValueStyles}>{formatDate(reserva.inicio)}</span>
            </div>
            <div style={reservaDetailStyles}>
              <span style={reservaLabelStyles}>Hora</span>
              <span style={reservaValueStyles}>{formatTime(reserva.inicio)}</span>
            </div>
            <div style={totalStyles}>
              <span style={totalLabelStyles}>Total pagado</span>
              <span style={totalValueStyles}>${reserva.tarifa?.monto?.toLocaleString('es-CL') || '0'}</span>
            </div>
          </div>
          <BotonAccionPrincipal
            label="Ver mis reservas"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGoToReservations}
          />
        </div>
        <BottomNav
          activeRoute="/pago"
          onNavigate={(route) => navigate(route)}
        />
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div style={pageStyles}>
        <div style={headerStyles}>
          <h1 style={headerTitleStyles}>Tiempo expirado</h1>
        </div>
        <div style={errorContainerStyles}>
          <div style={expiredIconStyles}>
            <Clock size={32} strokeWidth={1.75} />
          </div>
          <h2 style={successTitleStyles}>Reserva expirada</h2>
          <p style={successSubtitleStyles}>
            El tiempo para completar el pago ha expirado. La cancha ha sido liberada.
          </p>
          <BotonAccionPrincipal
            label="Volver a buscar"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/buscar-cancha')}
          />
        </div>
        <BottomNav
          activeRoute="/pago"
          onNavigate={(route) => navigate(route)}
        />
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div style={pageStyles}>
        <div style={headerStyles}>
          <h1 style={headerTitleStyles}>Error en el pago</h1>
        </div>
        <div style={errorContainerStyles}>
          <div style={errorIconStyles}>
            <XCircle size={32} strokeWidth={1.75} />
          </div>
          <h2 style={successTitleStyles}>Pago rechazado</h2>
          <p style={successSubtitleStyles}>
            {errorMessage || 'El pago fue rechazado. Por favor intenta de nuevo.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.space_3, width: '100%' }}>
            <BotonAccionPrincipal
              label="Intentar de nuevo"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleRetry}
            />
            <BotonAccionPrincipal
              label="Cancelar reserva"
              variant="ghost"
              size="md"
              fullWidth
              onClick={handleCancel}
            />
          </div>
        </div>
        <BottomNav
          activeRoute="/pago"
          onNavigate={(route) => navigate(route)}
        />
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Pagar Reserva</h1>
      </div>

      {retencionExpiry && (
        <div style={retentionBarStyles}>
          <span style={retentionTextStyles}>
            Tiempo restante para pagar:
          </span>
          <RetentionTimer
            expiryTime={retencionExpiry}
            variant="compact"
            onExpire={handleExpire}
          />
        </div>
      )}

      <div style={containerStyles}>
        <div style={reservaCardStyles}>
          <div style={reservaTitleStyles}>Resumen de la reserva</div>
          <div style={reservaDetailStyles}>
            <span style={reservaLabelStyles}>Cancha</span>
            <span style={reservaValueStyles}>{reserva.cancha?.id ? `Cancha ${reserva.cancha.id}` : '-'}</span>
          </div>
          <div style={reservaDetailStyles}>
            <span style={reservaLabelStyles}>Fecha</span>
            <span style={reservaValueStyles}>{formatDate(reserva.inicio)}</span>
          </div>
          <div style={reservaDetailStyles}>
            <span style={reservaLabelStyles}>Hora</span>
            <span style={reservaValueStyles}>{formatTime(reserva.inicio)}</span>
          </div>
          <div style={reservaDetailStyles}>
            <span style={reservaLabelStyles}>Deporte</span>
            <span style={reservaValueStyles}>{reserva.cancha?.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'}</span>
          </div>
          <div style={totalStyles}>
            <span style={totalLabelStyles}>Total a pagar</span>
            <span style={totalValueStyles}>${reserva.tarifa?.monto?.toLocaleString('es-CL') || '0'}</span>
          </div>

          {showSplitOptions && (
            <div style={splitSectionStyles}>
              <div style={splitLabelStyles}>Dividir entre:</div>
              <div style={splitOptionsStyles}>
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    style={splitButtonStyles(splitCount === count)}
                    onClick={() => setSplitCount(count)}
                  >
                    {count} jugadores
                  </button>
                ))}
              </div>
              <BotonAccionPrincipal
                label="Confirmar división"
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleSplitPayment}
              />
            </div>
          )}
        </div>

        <PaymentForm
          montoTotal={reserva.tarifa?.monto || 0}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          isLoading={paymentStatus === 'processing'}
          splitCount={splitCount}
        />

        <div style={{ marginTop: tokens.spacing.space_4, textAlign: 'center' as const }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: tokens.colors.brand.green_700,
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: tokens.typography.families.body,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={() => setShowSplitOptions(!showSplitOptions)}
          >
            {showSplitOptions ? 'Ocultar' : 'Dividir pago con compañeros'}
          </button>
        </div>
      </div>

      <BottomNav
        activeRoute="/pago"
        onNavigate={(route) => navigate(route)}
      />
    </div>
  );
};

export default Pago;
