import React, { useEffect, useRef } from 'react';
import { tokens } from '../../../styles/tokens';

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
const getGoogleClientId = (): string => (import.meta.env as any).VITE_GOOGLE_CLIENT_ID || '';

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
  if (googleId) {
    googleId.prompt?.();
  }
};

export interface GoogleButtonProps {
  onGoogleCredential: (credential: { credential: string }) => void;
  isLoading: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onGoogleCredential,
  isLoading,
}) => {
  const isInitialized = useRef(false);
  const clientId = getGoogleClientId();

  useEffect(() => {
    if (clientId && !isInitialized.current) {
      initializeGoogleSignIn(clientId, onGoogleCredential);
      isInitialized.current = true;
    }
  }, [clientId, onGoogleCredential]);

  const handleClick = (): void => {
    if (!isLoading) {
      triggerGooglePrompt();
    }
  };

  const containerStyles: React.CSSProperties = {
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

  if (!clientId) {
    return (
      <div style={configWarningStyles}>
        Google Sign-In no está configurado. Define VITE_GOOGLE_CLIENT_ID en tu archivo .env.
      </div>
    );
  }

  return (
    <div>
      <div id="google-signin-button" style={containerStyles} />
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || !clientId}
        style={{
          display: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default GoogleButton;
