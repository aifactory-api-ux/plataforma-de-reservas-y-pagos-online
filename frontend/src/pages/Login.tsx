import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../styles/tokens';
import { BotonAccionPrincipal } from '../components/ui/BotonAccionPrincipal';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import type { Jugador } from '../types/models';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GOOGLE_CLIENT_ID = (import.meta.env as any).VITE_GOOGLE_CLIENT_ID || '';

const containerStyles: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing.page_gutter_mobile,
  backgroundColor: tokens.colors.neutral.background,
};

const cardStyles: React.CSSProperties = {
  width: '100%',
  maxWidth: '360px',
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.xl,
  boxShadow: tokens.shadows.card,
  padding: `${tokens.spacing.space_6} ${tokens.spacing.space_4}`,
  textAlign: 'center' as const,
};

const logoStyles: React.CSSProperties = {
  fontSize: '40px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.brand.green_500,
  letterSpacing: '0.01em',
  marginTop: '80px',
  marginBottom: tokens.spacing.space_4,
};

const titleStyles: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  lineHeight: '36px',
  marginBottom: tokens.spacing.space_2,
};

const subtitleStyles: React.CSSProperties = {
  fontSize: '16px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
  lineHeight: '24px',
  marginBottom: tokens.spacing.space_8,
};

const errorStyles: React.CSSProperties = {
  backgroundColor: tokens.colors.reservation_status.cancelada.fill,
  border: `1px solid ${tokens.colors.reservation_status.cancelada.border}`,
  borderRadius: tokens.radii.md,
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  marginBottom: tokens.spacing.space_4,
  color: tokens.colors.reservation_status.cancelada.text,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
};

const dividerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_3,
  marginBottom: tokens.spacing.space_6,
};

const dividerLineStyles: React.CSSProperties = {
  flex: 1,
  height: '1px',
  backgroundColor: tokens.colors.neutral.border,
};

const dividerTextStyles: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
};

const footerStyles: React.CSSProperties = {
  marginTop: tokens.spacing.space_8,
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  lineHeight: '16px',
};

const footerLinkStyles: React.CSSProperties = {
  color: tokens.colors.brand.green_700,
  textDecoration: 'none',
  fontWeight: 600,
};

const googleButtonContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: tokens.spacing.space_6,
};

const configWarningStyles: React.CSSProperties = {
  backgroundColor: tokens.colors.reservation_status.retenida.fill,
  border: `1px solid ${tokens.colors.reservation_status.retenida.border}`,
  borderRadius: tokens.radii.md,
  padding: tokens.spacing.space_3,
  marginBottom: tokens.spacing.space_4,
  fontSize: '13px',
  color: tokens.colors.reservation_status.retenida.text,
};

const loadingSpinnerStyles: React.CSSProperties = {
  display: 'inline-block',
  width: '32px',
  height: '32px',
  border: '3px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  color: tokens.colors.brand.green_700,
};

const loadingContainerStyles: React.CSSProperties = {
  padding: tokens.spacing.space_8,
};

const initializeGoogleSignIn = (
  clientId: string,
  callback: (response: { credential: string }) => void
): void => {
  if (clientId && window.google?.accounts?.id) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      }
    );
  }
};

const triggerGooglePrompt = (): void => {
  const googleId = window.google?.accounts?.id;
  if (googleId && typeof googleId.prompt === 'function') {
    googleId.prompt();
  }
};

const submitConsent = async (jugadorId: number): Promise<void> => {
  await fetch('/api/auth/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jugadorId,
      version: '1.0',
      aceptado: true,
    }),
  });
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<Jugador | null>(null);
  const isInitialized = useRef(false);

  const handleNavigationOnAuth = useCallback(() => {
    if (isAuthenticated && user && 'bloqueado' in user) {
      navigate('/buscar-cancha');
    }
  }, [isAuthenticated, user, navigate]);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        await loginWithGoogle(response.credential);
      } catch (err) {
        if (err instanceof Error && err.message === 'CONSENT_REQUIRED') {
          setShowConsentModal(true);
        } else {
          setError('Error al iniciar sesión. Por favor intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loginWithGoogle]
  );

  const handleAcceptConsent = async () => {
    if (!pendingUser) return;

    setIsLoading(true);
    try {
      await submitConsent(pendingUser.id);
      setShowConsentModal(false);
      navigate('/buscar-cancha');
    } catch {
      setError('Error al aceptar el consentimiento. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineConsent = useCallback(() => {
    setShowConsentModal(false);
    setPendingUser(null);
  }, []);

  const handleGoogleButtonClick = useCallback(() => {
    triggerGooglePrompt();
  }, []);

  useEffect(() => {
    handleNavigationOnAuth();
  }, [handleNavigationOnAuth]);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID && !isInitialized.current) {
      initializeGoogleSignIn(GOOGLE_CLIENT_ID, handleCredentialResponse);
      isInitialized.current = true;
    }
  }, [handleCredentialResponse]);

  if (authLoading) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <div style={loadingContainerStyles}>
            <span style={loadingSpinnerStyles} />
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={logoStyles}>Sporty</div>
        <h1 style={titleStyles}>Reserva tu cancha</h1>
        <p style={subtitleStyles}>
          Accede con tu cuenta de Google para buscar y reservar canchas de pádel y fútbol 7
        </p>

        {error && <div style={errorStyles}>{error}</div>}

        <div style={dividerStyles}>
          <div style={dividerLineStyles} />
          <span style={dividerTextStyles}>Continuar con</span>
          <div style={dividerLineStyles} />
        </div>

        <div id="google-signin-button" style={googleButtonContainerStyles} />

        {!GOOGLE_CLIENT_ID && (
          <div style={configWarningStyles}>
            Google Sign-In no está configurado. Define VITE_GOOGLE_CLIENT_ID en tu archivo .env.
          </div>
        )}

        <BotonAccionPrincipal
          label={isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
          variant="outline"
          fullWidth
          loading={isLoading}
          disabled={!GOOGLE_CLIENT_ID}
          onClick={handleGoogleButtonClick}
        />
      </div>

      <p style={footerStyles}>
        Al continuar, aceptas nuestros{' '}
        <a href="/terminos" style={footerLinkStyles}>
          Términos de Servicio
        </a>{' '}
        y{' '}
        <a href="/privacidad" style={footerLinkStyles}>
          Política de Privacidad
        </a>
      </p>

      <ModalConfirmacion
        open={showConsentModal}
        title="Protección de datos personales"
        description="Para continuar, debes aceptar la política de protección de datos personales según la Ley 19.628. Tus datos serán tratados de forma segura y solo serán utilizados para la gestión de reservas."
        confirmLabel="Aceptar y continuar"
        cancelLabel="Cancelar"
        onConfirm={handleAcceptConsent}
        onCancel={handleDeclineConsent}
        loading={isLoading}
      />

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;
