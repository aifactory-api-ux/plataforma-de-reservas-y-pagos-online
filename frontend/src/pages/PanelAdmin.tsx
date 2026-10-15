import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { AdminLayout } from '../components/layout/AdminLayout';
import { TariffEditor } from '../components/admin/TariffEditor';
import { UserManager } from '../components/admin/UserManager';
import { ReportExporter } from '../components/admin/ReportExporter';
import { useAuth } from '../hooks/useAuth';
import type { UsuarioPersonal } from '../types/models';

const AdminTabs: React.FC = {
  usuarios: UserManager,
  tarifas: TariffEditor,
  bloqueos: UserManager,
  reportes: ReportExporter,
} as const;

type TabId = keyof typeof AdminTabs;

export const BloqueosManager: React.FC<{ onError?: (e: string) => void; onSuccess?: (m: string) => void }> = () => {
  return <UserManager />;
};

const PanelAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get('tab') as TabId) || 'usuarios'
  );
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabId;
    if (tab && ['usuarios', 'tarifas', 'bloqueos', 'reportes'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleError = useCallback((error: string) => {
    setNotification({ type: 'error', message: error });
  }, []);

  const handleSuccess = useCallback((message: string) => {
    setNotification({ type: 'success', message });
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const isAdmin = (user as UsuarioPersonal)?.rol === 'administrador';
  if (!isAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: tokens.colors.neutral.background,
          padding: tokens.spacing.page_gutter_desktop,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: tokens.spacing.space_8,
            backgroundColor: tokens.colors.neutral.surface,
            borderRadius: tokens.radii.lg,
            boxShadow: tokens.shadows.card,
            maxWidth: '400px',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: tokens.typography.families.display,
              color: tokens.colors.semantic.danger,
              marginBottom: tokens.spacing.space_4,
            }}
          >
            Acceso Denegado
          </h2>
          <p
            style={{
              fontSize: '14px',
              fontFamily: tokens.typography.families.body,
              color: tokens.colors.neutral.text_secondary,
              marginBottom: tokens.spacing.space_6,
            }}
          >
            Solo los administradores pueden acceder a este panel.
          </p>
          <button
            type="button"
            style={{
              padding: `${tokens.spacing.space_3} ${tokens.spacing.space_6}`,
              backgroundColor: tokens.colors.brand.green_700,
              color: tokens.colors.neutral.white,
              border: 'none',
              borderRadius: tokens.radii.md,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const tabComponents: Record<TabId, React.ReactNode> = {
      usuarios: <UserManager onError={handleError} onSuccess={handleSuccess} />,
      tarifas: <TariffEditor onError={handleError} onSuccess={handleSuccess} />,
      bloqueos: <UserManager onError={handleError} onSuccess={handleSuccess} />,
      reportes: <ReportExporter onError={handleError} onSuccess={handleSuccess} />,
    };

    return tabComponents[activeTab];
  };

  return (
    <AdminLayout user={user as UsuarioPersonal} onLogout={handleLogout}>
      <div style={{ position: 'relative' }}>
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: tokens.spacing.space_4,
              right: tokens.spacing.space_4,
              padding: `${tokens.spacing.space_4} ${tokens.spacing.space_6}`,
              borderRadius: tokens.radii.md,
              backgroundColor:
                notification.type === 'success'
                  ? tokens.colors.brand.green_100
                  : '#FDE7E7',
              border: `1px solid ${
                notification.type === 'success'
                  ? tokens.colors.brand.green_500
                  : tokens.colors.semantic.danger
              }`,
              color:
                notification.type === 'success'
                  ? tokens.colors.brand.green_800
                  : tokens.colors.semantic.danger,
              fontSize: '14px',
              fontFamily: tokens.typography.families.body,
              fontWeight: 500,
              boxShadow: tokens.shadows.modal,
              zIndex: 1000,
              animation: 'slideIn 300ms ease-out',
            }}
            role="alert"
          >
            {notification.message}
          </div>
        )}

        {renderTabContent()}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </AdminLayout>
  );
};

export default PanelAdmin;