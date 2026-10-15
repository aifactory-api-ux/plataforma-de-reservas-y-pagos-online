import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { UserRole } from '../../../types/models';

type RoleType = UserRole['type'];

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: RoleType[];
  fallbackRoute?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackRoute = '/login',
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F8F5',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #1C9A58',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
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
  }

  if (!user || !role) {
    return (
      <Navigate
        to={fallbackRoute}
        state={{ from: location }}
        replace
      />
    );
  }

  if (!allowedRoles.includes(role as RoleType)) {
    const defaultRoutes: Record<RoleType, string> = {
      jugador: '/buscar-cancha',
      encargado: '/agenda',
      profesor: '/mis-clases',
      administrador: '/admin',
    };

    const redirectTo = defaultRoutes[role as RoleType] || '/login';

    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;