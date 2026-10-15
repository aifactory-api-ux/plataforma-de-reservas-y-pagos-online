import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { BotonAccionPrincipal } from '../../components/ui/BotonAccionPrincipal';
import { BottomNav } from '../../components/layout/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useReservas } from '../../context/ReservationContext';
import { apiFetch } from '../../lib/api';
import type { Reserva } from '../../types/models';
import { TarjetaResumenReserva } from '../../components/pago/TarjetaResumenReserva/TarjetaResumenReserva';
import { DesglosePrecio } from '../../components/pago/DesglosePrecio/DesglosePrecio';
import { CountdownTimer } from '../../components/pago/CountdownTimer/CountdownTimer';
import { TermsCheckbox } from '../../components/pago/TermsCheckbox/TermsCheckbox';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'expired';

interface WebpayInitResponse {
  token: string;
  url: string;
}

interface PagoPageProps {
  onPaymentSuccess?: (token: string) => void;
  onPaymentError?: (error: string) => void;
}

const PagoPage: React.FC<PagoPageProps> = ({
  onPaymentError,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { retencionExpiry, releaseRetention, setCurrentReservation } = useReservas();

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | undefined>();
  const [splitCount] = useState(1);

  const reservaId = location.state?.reservaId as number | undefined;

  const fetchReserva = useCallback(async (id: number): Promise<Reserva> => {
    const data = await apiFetch.get<Reserva>(`/api/reservas/${id}`);
    setReserva(data);
    setCurrentReservation(data);
    return data;
  }, [setCurrentReservation]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reservaId) {
      navigate('/buscar-cancha');
      return;
    }

    fetchReserva(reservaId)
      .then((data) => {
        if (data.estado === 'pagada') {
          setPaymentStatus('success');
        } else if (data.estado === 'cancelada' || data.estado === 'no_asistio') {
          setPaymentStatus('expired');
        }
      })
      .catch(() => {
        navigate('/buscar-cancha');
      });
  }, [isAuthenticated, navigate, reservaId, fetchReserva]);

  const handleTermsChange = useCallback((checked: boolean) => {
    setTermsAccepted(checked);
    if (checked) {
      setTermsError(undefined);
    }
  }, []);

  const redirectToWebpay = useCallback((webpayUrl: string, token: string, reservaId: number) => {
    sessionStorage.setItem('webpay_pending', JSON.stringify({
      reservaId,
      token,
      timestamp: Date.now(),
    }));

    const fullUrl = webpayUrl.includes('?')
      ? `${webpayUrl}&token_ws=${token}`
      : `${webpayUrl}?token_ws=${token}`;

    window.location.href = fullUrl;
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!termsAccepted) {
      setTermsError('Debes aceptar los términos para continuar');
      return;
    }

    if (!reserva) return;

    setPaymentStatus('processing');

    try {
      const response = await apiFetch.post<WebpayInitResponse>('/api/pagos/webpay/init', {
        reservaId: reserva.id,
        monto: reserva.tarifa?.monto || 0,
        splitCount,
      });

      redirectToWebpay(response.url, response.token, reserva.id);
    } catch {
      setPaymentStatus('error');
      const msg = 'Error al iniciar el pago. Por favor intenta de nuevo.';
      setErrorMessage(msg);
      onPaymentError?.(msg);
    }
  }, [termsAccepted, reserva, splitCount, redirectToWebpay, onPaymentError]);

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

  if (!isAuthenticated || !reserva) {
    return null;
  }

  if (paymentStatus === 'success') {
    return (
      <SuccessView
        reserva={reserva}
        onGoToReservations={handleGoToReservations}
      />
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <ExpiredView onGoToSearch={() => navigate('/buscar-cancha')} />
    );
  }

  if (paymentStatus === 'error') {
    return (
      <ErrorView
        errorMessage={errorMessage}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <PageLayout
      reserva={reserva}
      retencionExpiry={retencionExpiry}
      termsAccepted={termsAccepted}
      termsError={termsError}
      isLoading={paymentStatus === 'processing'}
      splitCount={splitCount}
      onTermsChange={handleTermsChange}
      onSubmit={handleSubmit}
    />
  );
};

interface PageLayoutProps {
  reserva: Reserva;
  retencionExpiry: Date | null;
  termsAccepted: boolean;
  termsError?: string;
  isLoading: boolean;
  splitCount: number;
  onTermsChange: (checked: boolean) => void;
  onSubmit: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  reserva,
  retencionExpiry,
  termsAccepted,
  termsError,
  isLoading,
  splitCount,
  onTermsChange,
  onSubmit,
}) => {
  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '100px',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: tokens.spacing.space_4,
    position: 'relative' as const,
  };

  const componentStackStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing.space_4,
  };

  const ctaContainerStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '80px',
    left: 0,
    right: 0,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    backgroundColor: tokens.colors.neutral.surface,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
    boxShadow: tokens.shadows.sticky_header,
    zIndex: 15,
  };

  const ctaInnerStyles: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Confirmar reserva</h1>
      </div>

      <div style={contentStyles}>
        {retencionExpiry && (
          <CountdownTimer expiryTime={retencionExpiry} />
        )}

        <div style={componentStackStyles}>
          <TarjetaResumenReserva reserva={reserva} />

          {reserva.tarifa && (
            <DesglosePrecio
              tarifa={reserva.tarifa}
              esParcial={splitCount > 1}
              cantidadDividida={splitCount}
            />
          )}

          <TermsCheckbox
            checked={termsAccepted}
            onChange={onTermsChange}
            error={termsError}
          />
        </div>
      </div>

      <div style={ctaContainerStyles}>
        <div style={ctaInnerStyles}>
          <BotonAccionPrincipal
            label={isLoading ? 'Procesando...' : 'Pagar ahora'}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading || !termsAccepted}
            onClick={onSubmit}
            leftIcon={<ShieldCheck size={20} strokeWidth={1.75} />}
          />
        </div>
      </div>

      <BottomNav activeRoute="/pago" onNavigate={() => {}} />
    </div>
  );
};

interface SuccessViewProps {
  reserva: Reserva;
  onGoToReservations: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ reserva, onGoToReservations }) => {
  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '100px',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.semantic.success,
    letterSpacing: '0.01em',
  };

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_12} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const iconContainerStyles: React.CSSProperties = {
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

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    marginBottom: tokens.spacing.space_6,
    maxWidth: '300px',
  };

  const cardContainerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    marginBottom: tokens.spacing.space_6,
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>¡Pago exitoso!</h1>
      </div>
      <div style={contentStyles}>
        <div style={iconContainerStyles}>
          <ShieldCheck size={40} strokeWidth={1.75} />
        </div>
        <h2 style={titleStyles}>Reserva confirmada</h2>
        <p style={subtitleStyles}>
          Tu pago fue procesado correctamente. Te hemos enviado un correo de confirmación.
        </p>
        <div style={cardContainerStyles}>
          <TarjetaResumenReserva reserva={reserva} />
        </div>
        <BotonAccionPrincipal
          label="Ver mis reservas"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onGoToReservations}
        />
      </div>
      <BottomNav activeRoute="/pago" onNavigate={() => {}} />
    </div>
  );
};

interface ExpiredViewProps {
  onGoToSearch: () => void;
}

const ExpiredView: React.FC<ExpiredViewProps> = ({ onGoToSearch }) => {
  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '100px',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
  };

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_12} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    marginBottom: tokens.spacing.space_6,
    maxWidth: '300px',
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Tiempo expirado</h1>
      </div>
      <div style={contentStyles}>
        <h2 style={titleStyles}>Reserva expirada</h2>
        <p style={subtitleStyles}>
          El tiempo para completar el pago ha expirado. La cancha ha sido liberada.
        </p>
        <BotonAccionPrincipal
          label="Volver a buscar"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onGoToSearch}
        />
      </div>
      <BottomNav activeRoute="/pago" onNavigate={() => {}} />
    </div>
  );
};

interface ErrorViewProps {
  errorMessage: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ errorMessage, onRetry, onCancel }) => {
  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '100px',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.semantic.danger,
    letterSpacing: '0.01em',
  };

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_8} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    marginBottom: tokens.spacing.space_6,
    maxWidth: '300px',
  };

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing.space_3,
    width: '100%',
    maxWidth: '300px',
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Error en el pago</h1>
      </div>
      <div style={contentStyles}>
        <h2 style={titleStyles}>Pago rechazado</h2>
        <p style={subtitleStyles}>
          {errorMessage || 'El pago fue rechazado. Por favor intenta de nuevo.'}
        </p>
        <div style={buttonContainerStyles}>
          <BotonAccionPrincipal
            label="Intentar de nuevo"
            variant="primary"
            size="lg"
            fullWidth
            onClick={onRetry}
          />
          <BotonAccionPrincipal
            label="Cancelar reserva"
            variant="ghost"
            size="md"
            fullWidth
            onClick={onCancel}
          />
        </div>
      </div>
      <BottomNav activeRoute="/pago" onNavigate={() => {}} />
    </div>
  );
};

export default PagoPage;
