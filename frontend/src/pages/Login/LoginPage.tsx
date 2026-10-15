import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokens } from '../../styles/tokens';
import { BotonAccionPrincipal } from '../../components/ui/BotonAccionPrincipal';
import { ModalConfirmacion } from '../../components/ui/ModalConfirmacion';
import { GoogleButton } from '../../components/auth/GoogleButton/GoogleButton';
import type { Jugador } from '../../types/models';

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

const getContainerStyles = (): React.CSSProperties => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing.page_gutter_mobile,
  backgroundColor: tokens.colors.neutral.background,
});

const getCardStyles = (): React.CSSProperties => ({
  width: '100%',
  maxWidth: '360px',
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.xl,
  boxShadow: tokens.shadows.card,
  padding: `${tokens.spacing.space_6} ${tokens.spacing.space_4}`,
  textAlign: 'center' as const,
});

const getLogoStyles = (): React.CSSProperties => ({
  fontSize: '40px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.brand.green_500,
  letterSpacing: '0.01em',
  marginTop: '80px',
  marginBottom: tokens.spacing.space_4,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '32px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  lineHeight: '36px',
  marginBottom: tokens.spacing.space_2,
});

const getSubtitleStyles = (): React.CSSProperties => ({
  fontSize: '16px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
  lineHeight: '24px',
  marginBottom: tokens.spacing.space_8,
});

const getErrorStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.reservation_status.cancelada.fill,
  border: `1px solid ${tokens.colors.reservation_status.cancelada.border}`,
  borderRadius: tokens.radii.md,
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  marginBottom: tokens.spacing.space_4,
  color: tokens.colors.reservation_status.cancelada.text,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
});

const getDividerStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_3,
  marginBottom: tokens.spacing.space_6,
});

const getDividerLineStyles = (): React.CSSProperties => ({
  flex: 1,
  height: '1px',
  backgroundColor: tokens.colors.neutral.border,
});

const getDividerTextStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
});

const getFooterStyles = (): React.CSSProperties => ({
  marginTop: tokens.spacing.space_8,
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  lineHeight: '16px',
});

const getFooterLinkStyles = (): React.CSSProperties => ({
  color: tokens.colors.brand.green_700,
  textDecoration: 'none',
  fontWeight: 600,
});

const getLoadingSpinnerStyles = (): React.CSSProperties => ({
  display: 'inline-block',
  width: '32px',
  height: '32px',
  border: '3px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  color: tokens.colors.brand.green_700,
});

const getLoadingContainerStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_8,
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<Jugador | null>(null);

  const navigateToSearch = useCallback(() => {
    navigate('/buscar-cancha');
  }, [navigate]);

  const handleNavigationOnAuth = useCallback(() => {
    if (isAuthenticated && user && 'bloqueado' in user) {
      navigateToSearch();
    }
  }, [isAuthenticated, user, navigateToSearch]);

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
      navigateToSearch();
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

  useEffect(() => {
    handleNavigationOnAuth();
  }, [handleNavigationOnAuth]);

  if (authLoading) {
    return (
      <div style={getContainerStyles()}>
        <div style={getCardStyles()}>
          <div style={getLoadingContainerStyles()}>
            <span style={getLoadingSpinnerStyles()} />
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
    <div style={getContainerStyles()}>
      <div style={getCardStyles()}>
        <div style={getLogoStyles()}>Sporty</div>
        <h1 style={getTitleStyles()}>Reserva tu cancha</h1>
        <p style={getSubtitleStyles()}>
          Accede con tu cuenta de Google para buscar y reservar canchas de pádel y fútbol 7
        </p>

        {error && <div style={getErrorStyles()}>{error}</div>}

        <div style={getDividerStyles()}>
          <div style={getDividerLineStyles()} />
          <span style={getDividerTextStyles()}>Continuar con</span>
          <div style={getDividerLineStyles()} />
        </div>

        <GoogleButton
          onGoogleCredential={handleCredentialResponse}
          isLoading={isLoading}
        />

        <BotonAccionPrincipal
          label={isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
          variant="outline"
          fullWidth
          loading={isLoading}
          disabled={false}
          onClick={() => {}}
        />
      </div>

      <p style={getFooterStyles()}>
        Al continuar, aceptas nuestros{' '}
        <a href="/terminos" style={getFooterLinkStyles()}>
          Términos de Servicio
        </a>{' '}
        y{' '}
        <a href="/privacidad" style={getFooterLinkStyles()}>
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

export default LoginPage;
