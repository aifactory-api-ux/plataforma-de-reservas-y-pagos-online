import { apiFetch } from './api';
import type { AuthResponse, LoginRequest, GoogleLoginRequest, RefreshTokenRequest, PasswordResetRequest, ConsentimientoRequest } from '../types/api';
import type { Jugador, UsuarioPersonal } from '../types/models';

export interface LoginResponse {
  requiresConsent: boolean;
  user?: Jugador;
  consentimiento?: {
    id: number;
    jugadorId: number;
    version: string;
    fechaConsentimiento: string;
    aceptado: boolean;
  };
}

class AuthService {
  async loginWithEmail(credentials: LoginRequest): Promise<AuthResponse> {
    return apiFetch.post<AuthResponse>('/auth/login', credentials);
  }

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const request: GoogleLoginRequest = { idToken };
    const response = await apiFetch.post<LoginResponse>('/auth/google', request);

    if (response.requiresConsent && response.user) {
      throw new Error('CONSENT_REQUIRED');
    }

    return response as unknown as AuthResponse;
  }

  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    return apiFetch.post<AuthResponse>('/auth/refresh', request);
  }

  async logout(refreshToken: string): Promise<void> {
    await apiFetch.post('/auth/logout', { refreshToken });
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    await apiFetch.post('/auth/password-reset', request);
  }

  async getCurrentUser(): Promise<{ user: Jugador | UsuarioPersonal }> {
    return apiFetch.get<{ user: Jugador | UsuarioPersonal }>('/auth/me');
  }

  async acceptConsent(request: ConsentimientoRequest): Promise<void> {
    await apiFetch.post('/auth/consent', request);
  }

  async getConsentimiento(): Promise<{ consentimiento: { id: number; version: string; aceptado: boolean } }> {
    return apiFetch.get<{ consentimiento: { id: number; version: string; aceptado: boolean } }>('/auth/consent');
  }
}

export const authService = new AuthService();
