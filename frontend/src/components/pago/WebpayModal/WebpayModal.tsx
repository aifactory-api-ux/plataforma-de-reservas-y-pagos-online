import React, { useEffect, useCallback, useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

export interface WebpayRedirectResult {
  token: string;
  reservaId: number;
  status: 'success' | 'error' | 'cancelled';
  error?: string;
}

interface WebpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  webpayUrl: string;
  token: string;
  reservaId: number;
  returnPath?: string;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  onRedirect?: () => void;
}

type ProcessingState = 'loading' | 'ready' | 'redirecting' | 'waiting_return' | 'completed' | 'error';

const WebpayModal: React.FC<WebpayModalProps> = ({
  isOpen,
  onClose,
  webpayUrl,
  token,
  reservaId,
  returnPath = '/pago/webpay-return',
  onSuccess,
  onError,
  onRedirect,
}) => {
  const [processingState, setProcessingState] = useState<ProcessingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buildWebpayUrl = useCallback(() => {
    const baseUrl = webpayUrl.endsWith('/') ? webpayUrl.slice(0, -1) : webpayUrl;
    return `${baseUrl}?token_ws=${token}`;
  }, [webpayUrl, token]);

  const buildReturnUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${returnPath}?reservaId=${reservaId}&token=${token}`;
  }, [returnPath, reservaId, token]);

  useEffect(() => {
    if (!isOpen || !webpayUrl || !token) return;

    setProcessingState('loading');
    setErrorMessage(null);

    const returnUrlBuilt = buildReturnUrl();

    sessionStorage.setItem('webpay_pending', JSON.stringify({
      token,
      reservaId,
      returnUrl: returnUrlBuilt,
      timestamp: Date.now(),
    }));

    const timer = setTimeout(() => {
      setProcessingState('ready');
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, webpayUrl, token, reservaId, buildReturnUrl]);

  const handleRedirectToWebpay = useCallback(() => {
    const webpayUrlBuilt = buildWebpayUrl();
    const returnUrlBuilt = buildReturnUrl();

    setProcessingState('redirecting');
    onRedirect?.();

    sessionStorage.setItem('webpay_redirect_started', JSON.stringify({
      timestamp: Date.now(),
    }));

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = webpayUrlBuilt;
    form.target = '_blank';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'token_ws';
    tokenInput.value = token;
    form.appendChild(tokenInput);

    const returnUrlInput = document.createElement('input');
    returnUrlInput.type = 'hidden';
    returnUrlInput.name = 'return_url';
    returnUrlInput.value = returnUrlBuilt;
    form.appendChild(returnUrlInput);

    document.body.appendChild(form);

    const fallbackTimer = setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
      window.location.href = webpayUrlBuilt;
    }, 500);

    form.submit();

    return () => {
      clearTimeout(fallbackTimer);
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    };
  }, [buildWebpayUrl, buildReturnUrl, onRedirect, token]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (processingState === 'redirecting' || processingState === 'waiting_return') {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tu pago aún está procesándose.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [processingState]);

  useEffect(() => {
    if (processingState === 'waiting_return') {
      const checkReturn = () => {
        const redirectComplete = sessionStorage.getItem('webpay_return_completed');

        if (redirectComplete) {
          sessionStorage.removeItem('webpay_pending');
          sessionStorage.removeItem('webpay_redirect_started');
          sessionStorage.removeItem('webpay_return_completed');

          try {
            const result = JSON.parse(redirectComplete);
            if (result.status === 'success') {
              setProcessingState('completed');
              onSuccess(result.token);
            } else {
              setProcessingState('error');
              setErrorMessage(result.error || 'El pago fue rechazado');
              onError(result.error || 'El pago fue rechazado');
            }
          } catch {
            setProcessingState('error');
            setErrorMessage('Error al procesar la respuesta del pago');
            onError('Error al procesar la respuesta del pago');
          }
        }
      };

      const interval = setInterval(checkReturn, 1000);
      return () => clearInterval(interval);
    }
  }, [processingState, onSuccess, onError]);

  const handleClose = useCallback(() => {
    if (processingState === 'redirecting' || processingState === 'waiting_return') {
      return;
    }
    sessionStorage.removeItem('webpay_pending');
    onClose();
  }, [processingState, onClose]);

  const handleCancel = useCallback(() => {
    sessionStorage.removeItem('webpay_pending');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.neutral.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: tokens.spacing.space_4,
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.modal,
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.space_4,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: tokens.spacing.space_2,
    cursor: processingState === 'redirecting' || processingState === 'waiting_return' ? 'not-allowed' : 'pointer',
    color: tokens.colors.neutral.text_muted,
    borderRadius: tokens.radii.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: processingState === 'redirecting' || processingState === 'waiting_return' ? 0.5 : 1,
  };

  const contentStyles: React.CSSProperties = {
    padding: tokens.spacing.space_8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: tokens.colors.brand.green_50,
    borderRadius: '50%',
    marginBottom: tokens.spacing.space_6,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
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

  const loaderContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const loaderTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const errorTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.semantic.danger,
    marginTop: tokens.spacing.space_4,
    padding: tokens.spacing.space_3,
    backgroundColor: tokens.colors.reservation_status.cancelada.fill,
    borderRadius: tokens.radii.sm,
    width: '100%',
    textAlign: 'center',
  };

  const spinnerStyles: React.CSSProperties = {
    animation: 'spin 1s linear infinite',
  };

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_3,
    width: '100%',
    marginTop: tokens.spacing.space_4,
  };

  const primaryButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
    width: '100%',
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_6}`,
    backgroundColor: tokens.colors.brand.green_600,
    color: tokens.colors.neutral.white,
    border: 'none',
    borderRadius: tokens.radii.md,
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    cursor: 'pointer',
    transition: 'background-color 150ms ease-out',
  };

  const secondaryButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
    width: '100%',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_6}`,
    backgroundColor: 'transparent',
    color: tokens.colors.neutral.text_secondary,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  };

  return (
    <div style={overlayStyles} onClick={handleClose}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <div style={headerTitleStyles}>
            <CreditCard size={24} strokeWidth={1.75} color={tokens.colors.brand.green_600} />
            Pago seguro
          </div>
          <button
            style={closeButtonStyles}
            onClick={handleClose}
            disabled={processingState === 'redirecting' || processingState === 'waiting_return'}
            aria-label="Cerrar"
          >
            <X size={24} strokeWidth={1.75} />
          </button>
        </div>

        <div style={contentStyles}>
          {processingState === 'loading' && (
            <>
              <div style={iconContainerStyles}>
                <CreditCard size={40} strokeWidth={1.75} color={tokens.colors.brand.green_600} />
              </div>
              <h2 style={titleStyles}>Preparando pago</h2>
              <p style={subtitleStyles}>
                Estamos conectando con Transbank Webpay...
              </p>
              <div style={loaderContainerStyles}>
                <Loader2 size={32} strokeWidth={1.75} style={spinnerStyles} color={tokens.colors.brand.green_500} />
                <span style={loaderTextStyles}>Cargando...</span>
              </div>
            </>
          )}

          {processingState === 'ready' && (
            <>
              <div style={iconContainerStyles}>
                <CreditCard size={40} strokeWidth={1.75} color={tokens.colors.brand.green_600} />
              </div>
              <h2 style={titleStyles}>Redirigiendo a Webpay</h2>
              <p style={subtitleStyles}>
                Serás redirigido al formulario de pago seguro de Transbank. Después de pagar, serás redirigido automáticamente de vuelta.
              </p>
              <div style={buttonContainerStyles}>
                <button
                  style={primaryButtonStyles}
                  onClick={handleRedirectToWebpay}
                >
                  <CreditCard size={20} strokeWidth={1.75} />
                  Ir a Webpay
                </button>
                <button
                  style={secondaryButtonStyles}
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}

          {processingState === 'redirecting' && (
            <>
              <div style={iconContainerStyles}>
                <CreditCard size={40} strokeWidth={1.75} color={tokens.colors.brand.green_600} />
              </div>
              <h2 style={titleStyles}>Abriendo Webpay</h2>
              <p style={subtitleStyles}>
                Si no se abrió automáticamente, haz clic en el botón de abajo.
              </p>
              <div style={loaderContainerStyles}>
                <Loader2 size={32} strokeWidth={1.75} style={spinnerStyles} color={tokens.colors.brand.green_500} />
                <span style={loaderTextStyles}>Abriendo...</span>
              </div>
              <div style={buttonContainerStyles}>
                <button
                  style={primaryButtonStyles}
                  onClick={() => {
                    const url = buildWebpayUrl();
                    window.open(url, '_blank');
                  }}
                >
                  <CreditCard size={20} strokeWidth={1.75} />
                  Abrir Webpay
                </button>
              </div>
            </>
          )}

          {processingState === 'waiting_return' && (
            <>
              <div style={iconContainerStyles}>
                <Loader2 size={40} strokeWidth={1.75} style={spinnerStyles} color={tokens.colors.brand.green_600} />
              </div>
              <h2 style={titleStyles}>Procesando pago</h2>
              <p style={subtitleStyles}>
                Esperando confirmación de Webpay. Este proceso puede tardar unos segundos...
              </p>
              <div style={loaderContainerStyles}>
                <span style={loaderTextStyles}>No cierres esta ventana</span>
              </div>
            </>
          )}

          {processingState === 'error' && (
            <>
              <div style={{ ...iconContainerStyles, backgroundColor: tokens.colors.reservation_status.cancelada.fill }}>
                <X size={40} strokeWidth={1.75} color={tokens.colors.semantic.danger} />
              </div>
              <h2 style={titleStyles}>Error en el pago</h2>
              <p style={subtitleStyles}>
                Hubo un problema al procesar tu pago con Webpay.
              </p>
              {errorMessage && (
                <div style={errorTextStyles}>
                  {errorMessage}
                </div>
              )}
              <div style={buttonContainerStyles}>
                <button
                  style={secondaryButtonStyles}
                  onClick={handleCancel}
                >
                  Volver
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebpayModal;
