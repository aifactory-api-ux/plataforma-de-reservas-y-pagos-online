import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import type { Jugador, UsuarioPersonal, UserRole } from '../types/models';

interface AuthState {
  user: Jugador | UsuarioPersonal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole['type'] | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (user: Jugador | UsuarioPersonal) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getRoleFromUser = (user: Jugador | UsuarioPersonal): UserRole['type'] => {
  if ('rol' in user) {
    return user.rol;
  }
  return 'jugador';
};

interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Jugador | UsuarioPersonal;
}

interface Consentimiento {
  id: number;
  jugadorId: number;
  version: string;
  fechaConsentimiento: string;
  aceptado: boolean;
}

interface LoginResponse {
  requiresConsent: boolean;
  user?: Jugador;
  consentimiento?: Consentimiento;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
    accessToken: null,
  });

  const loadUserFromStorage = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as Jugador | UsuarioPersonal;
        return { token, user };
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = loadUserFromStorage();
    if (!stored) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await apiFetch.get<{ user: Jugador | UsuarioPersonal }>('/api/auth/me');
      const role = getRoleFromUser(response.user);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        role,
        accessToken: stored.token,
      });
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
        accessToken: null,
      });
    }
  }, [loadUserFromStorage]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const loginResponse = await apiFetch.post<LoginResponse>('/api/auth/google', { idToken });

      if (loginResponse.requiresConsent && loginResponse.user) {
        setState({
          user: loginResponse.user,
          isAuthenticated: false,
          isLoading: false,
          role: 'jugador',
          accessToken: null,
        });
        throw new Error('CONSENT_REQUIRED');
      }

      const googleResponse = await apiFetch.post<GoogleLoginResponse>('/api/auth/google', { idToken });

      localStorage.setItem('accessToken', googleResponse.accessToken);
      localStorage.setItem('refreshToken', googleResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(googleResponse.user));

      const role = getRoleFromUser(googleResponse.user);
      setState({
        user: googleResponse.user,
        isAuthenticated: true,
        isLoading: false,
        role,
        accessToken: googleResponse.accessToken,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch.post('/api/auth/logout', {});
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
        accessToken: null,
      });
    }
  }, []);

  const updateUser = useCallback((user: Jugador | UsuarioPersonal) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState(prev => ({
      ...prev,
      user,
      role: getRoleFromUser(user),
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginWithGoogle,
        logout,
        refreshSession,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
