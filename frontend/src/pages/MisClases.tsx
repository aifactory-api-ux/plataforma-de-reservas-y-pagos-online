import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { Header } from '../components/layout/Header';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { ListaClases } from '../components/clases/ListaClases/ListaClases';
import { useAuth } from '../hooks/useAuth';
import { useMisClases } from '../hooks/useClases';
import { clasesService } from '../services/clases.service';
import type { UsuarioPersonal, Clase } from '../types/models';

const getTabTitle = (tab: 'disponibles' | 'completas'): string => {
  return tab === 'disponibles' ? 'Próximas' : 'Pasadas';
};

const getEmptyTitle = (tab: 'disponibles' | 'completas'): string => {
  return tab === 'disponibles'
    ? 'No tienes clases programadas'
    : 'No hay clases pasadas';
};

const getEmptyDescription = (tab: 'disponibles' | 'completas'): string => {
  return tab === 'disponibles'
    ? 'Las clases que crees aparecerán aquí'
    : 'Las clases completadas aparecerán aquí';
};

const MisClases: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const personalUser = user as UsuarioPersonal;
  const {
    data: clasesData,
    loading: isLoading,
    error,
    fetchClases,
  } = useMisClases(personalUser?.id);

  const [activeTab, setActiveTab] = useState<'disponibles' | 'completas'>('disponibles');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSelectClase = useCallback((clase: Clase) => {
    navigate(`/clases/${clase.id}`);
  }, [navigate]);

  const handleEditClase = useCallback((clase: Clase) => {
    navigate(`/clases/${clase.id}/editar`);
  }, [navigate]);

  const handleCancelClase = useCallback((clase: Clase) => {
    setSelectedClase(clase);
    setShowCancelModal(true);
  }, []);

  const confirmCancelClase = useCallback(async () => {
    if (!selectedClase) return;

    setCancelLoading(true);
    try {
      await clasesService.cancelClase(selectedClase.id);
      setShowCancelModal(false);
      setSelectedClase(null);
      fetchClases();
    } catch (err) {
      console.error('Error al cancelar clase:', err);
    } finally {
      setCancelLoading(false);
    }
  }, [selectedClase, fetchClases]);

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: tokens.spacing.page_gutter_desktop,
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_6,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    margin: 0,
    marginBottom: tokens.spacing.space_2,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const tabsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
    marginBottom: tokens.spacing.space_6,
    backgroundColor: tokens.colors.neutral.surface_subtle,
    padding: tokens.spacing.space_1,
    borderRadius: tokens.radii.md,
  };

  const getTabButtonStyles = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    backgroundColor: isActive ? tokens.colors.neutral.surface : 'transparent',
    border: 'none',
    borderRadius: tokens.radii.sm,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isActive
      ? tokens.colors.neutral.text_primary
      : tokens.colors.neutral.text_muted,
    transition: 'all 150ms ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
  });

  const getTabCount = (tab: 'disponibles' | 'completas'): number => {
    return tab === 'disponibles'
      ? clasesData.clasesDisponibles.length
      : clasesData.clasesCompletas.length;
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const displayClases = activeTab === 'disponibles'
    ? clasesData.clasesDisponibles
    : clasesData.clasesCompletas;

  return (
    <div style={pageStyles}>
      <Header
        user={personalUser}
        onLogout={logout}
      />

      <div style={containerStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Mis Clases</h1>
          <p style={subtitleStyles}>
            Gestiona las clases que impartes
          </p>
        </div>

        <div style={tabsContainerStyles}>
          <button
            type="button"
            style={getTabButtonStyles(activeTab === 'disponibles')}
            onClick={() => setActiveTab('disponibles')}
          >
            {getTabTitle('disponibles')} ({getTabCount('disponibles')})
          </button>
          <button
            type="button"
            style={getTabButtonStyles(activeTab === 'completas')}
            onClick={() => setActiveTab('completas')}
          >
            {getTabTitle('completas')} ({getTabCount('completas')})
          </button>
        </div>

        <ListaClases
          clases={displayClases}
          isLoading={isLoading}
          error={error}
          isPast={activeTab === 'completas'}
          onCancel={handleCancelClase}
          onEdit={handleEditClase}
          onSelect={handleSelectClase}
          emptyTitle={getEmptyTitle(activeTab)}
          emptyDescription={getEmptyDescription(activeTab)}
        />
      </div>

      <ModalConfirmacion
        open={showCancelModal}
        title="Cancelar Clase"
        description={`¿Estás seguro de que deseas cancelar la clase "${selectedClase?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        onConfirm={confirmCancelClase}
        onCancel={() => {
          setShowCancelModal(false);
          setSelectedClase(null);
        }}
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
};

export default MisClases;