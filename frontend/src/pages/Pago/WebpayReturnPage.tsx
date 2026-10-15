import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { apiFetch } from '../../lib/api';
import type { Reserva } from '../../types/models';

const WebpayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = searchParams.get('token_ws') || searchParams.get('token');

  const processReturn = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No se recibió el token de Webpay');
      return;
    }

    try {
      const response = await apiFetch.post<Reserva>('/api/pagos/confirmar', { token });

      sessionStorage.setItem('webpay_payment_result', JSON.stringify({
        status: 'success',
        reserva: response,
        timestamp: Date.now(),
      }));

      setStatus('success');

      setTimeout(() => {
        navigate('/pago', {
          state: { reservaId: response.id, paymentSuccess: true },
          replace: true,
        });
      }, 2000);
    } catch (err) {
      const error = err as Error;
      let message = 'El pago fue rechazado. Por favor intenta de nuevo.';

      try {
        const errorData = JSON.parse(error.message);
        if (errorData.message) {
          message = errorData.message;
        }
      } catch {}

      sessionStorage.setItem('webpay_payment_result', JSON.stringify({
        status: 'error',
        error: message,
        timestamp: Date.now(),
      }));

      setStatus('error');
      setErrorMessage(message);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      processReturn();
    } else {
      setStatus('error');
      setErrorMessage('Token no encontrado en la URL');
    }
  }, [token, processReturn]);

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.space_4,
  };

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '400px',
  };

  const iconContainerSuccessStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100px',
    height: '100px',
    backgroundColor: tokens.colors.reservation_status.pagada.fill,
    borderRadius: '50%',
    marginBottom: tokens.spacing.space_6,
  };

  const iconContainerErrorStyles: React.CSSProperties = {
    ...iconContainerSuccessStyles,
    backgroundColor: tokens.colors.reservation_status.cancelada.fill,
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
    lineHeight: '20px',
  };

  const spinnerStyles: React.CSSProperties = {
    animation: 'spin 1s linear infinite',
    color: tokens.colors.brand.green_500,
  };

  if (status === 'processing') {
    return (
      <div style={pageStyles}>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={contentStyles}>
          <div style={iconContainerSuccessStyles}>
            <Loader2 size={48} strokeWidth={1.75} style={spinnerStyles} />
          </div>
          <h1 style={titleStyles}>Procesando pago</h1>
          <p style={subtitleStyles}>
            Estamos confirmando tu pago con Transbank Webpay. Por favor espera...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={pageStyles}>
        <div style={contentStyles}>
          <div style={iconContainerSuccessStyles}>
            <CheckCircle size={48} strokeWidth={1.75} color={tokens.colors.semantic.success} />
          </div>
          <h1 style={{ ...titleStyles, color: tokens.colors.semantic.success }}>¡Pago exitoso!</h1>
          <p style={subtitleStyles}>
            Tu reserva ha sido confirmada. Serás redirigido a tus reservas en un momento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      <div style={contentStyles}>
        <div style={iconContainerErrorStyles}>
          <XCircle size={48} strokeWidth={1.75} color={tokens.colors.semantic.danger} />
        </div>
        <h1 style={{ ...titleStyles, color: tokens.colors.semantic.danger }}>Error en el pago</h1>
        <p style={subtitleStyles}>
          {errorMessage || 'Hubo un problema al procesar tu pago. Por favor intenta de nuevo.'}
        </p>
        <button
          onClick={() => navigate('/buscar-cancha')}
          style={{
            padding: `${tokens.spacing.space_3} ${tokens.spacing.space_6}`,
            backgroundColor: tokens.colors.brand.green_600,
            color: tokens.colors.neutral.white,
            border: 'none',
            borderRadius: tokens.radii.md,
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Volver a buscar
        </button>
      </div>
    </div>
  );
};

export default WebpayReturnPage;
