import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthGuard } from '../components/auth/AuthGuard/AuthGuard';
import { RoleGuard } from '../components/auth/RoleGuard/RoleGuard';
import { PlayerLayout } from './PlayerLayout';
import { StaffLayout } from './StaffLayout';

import LoginPage from '../pages/Login/LoginPage';
import BuscarCanchaPage from '../pages/BuscarCancha/BuscarCanchaPage';
import PagoPage from '../pages/Pago/PagoPage';
import WebpayReturnPage from '../pages/Pago/WebpayReturnPage';
import MisReservasPage from '../pages/MisReservas/MisReservasPage';
import AgendaSedePage from '../pages/AgendaSede/AgendaSedePage';
import ReservaPresencialPage from '../pages/ReservaPresencial/ReservaPresencialPage';
import MisClasesPage from '../pages/MisClases/MisClasesPage';
import PanelAdminPage from '../pages/PanelAdmin/PanelAdminPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/buscar-cancha"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['jugador']}>
              <PlayerLayout>
                <BuscarCanchaPage />
              </PlayerLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/pago"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['jugador']}>
              <PlayerLayout>
                <PagoPage />
              </PlayerLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/pago/webpay-return"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['jugador']}>
              <PlayerLayout>
                <WebpayReturnPage />
              </PlayerLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/mis-reservas"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['jugador']}>
              <PlayerLayout>
                <MisReservasPage />
              </PlayerLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/mis-clases"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['jugador', 'profesor']}>
              <PlayerLayout>
                <MisClasesPage />
              </PlayerLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/agenda"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['encargado', 'profesor', 'administrador']}>
              <StaffLayout>
                <AgendaSedePage />
              </StaffLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/reserva-presencial"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['encargado']}>
              <StaffLayout>
                <ReservaPresencialPage />
              </StaffLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/admin"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['administrador']}>
              <StaffLayout>
                <PanelAdminPage />
              </StaffLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
