import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, Calendar, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { Header } from '../components/layout/Header';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { BadgeEstado } from '../components/ui/BadgeEstado';
import { useAuth } from '../hooks/useAuth';
import { useMisClases } from '../hooks/useClases';
import type { UsuarioPersonal, Clase } from '../types/models';

const MisClases: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const personalUser = user as UsuarioPersonal;
  const {
    clases,
    clasesCompletas,
    clasesDisponibles,
    isLoading,
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

  const handleCancelClase = useCallback((clase: Clase) => {
    setSelectedClase(clase);
    setShowCancelModal(true);
  }, []);

  const confirmCancelClase = useCallback(async () => {
    if (!selectedClase) return;

    setCancelLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/clases/${selectedClase.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
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
    fontSize: '22px',
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

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
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

  const claseCardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_4,
    marginBottom: tokens.spacing.space_3,
    boxShadow: tokens.shadows.card,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const claseInfoStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
    flex: 1,
  };

  const claseTitleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    margin: 0,
  };

  const claseMetaStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_4,
    flexWrap: 'wrap' as const,
  };

  const metaItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_1,
    fontSize: '13px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: tokens.spacing.space_12,
    color: tokens.colors.neutral.text_muted,
  };

  const emptyTitleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    marginBottom: tokens.spacing.space_2,
    color: tokens.colors.neutral.text_secondary,
  };

  const emptyTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const actionButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.sm,
    cursor: 'pointer',
    color: tokens.colors.neutral.text_muted,
    transition: 'all 150ms ease-out',
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dayName = dias[date.getDay()];
    const dayNum = date.getDate();
    const month = meses[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dayName} ${dayNum} ${month}, ${hours}:${minutes}`;
  };

  const getCuposInfo = (clase: Clase): string => {
    return `${clase.cupos} cupos`;
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const displayClases = activeTab === 'disponibles' ? clasesDisponibles : clasesCompletas;

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
            style={tabStyles(activeTab === 'disponibles')}
            onClick={() => setActiveTab('disponibles')}
          >
            Próximas ({clasesDisponibles.length})
          </button>
          <button
            type="button"
            style={tabStyles(activeTab === 'completas')}
            onClick={() => setActiveTab('completas')}
          >
            Pasadas ({clasesCompletas.length})
          </button>
        </div>

        {isLoading ? (
          <div style={emptyStateStyles}>
            <p>Cargando clases...</p>
          </div>
        ) : error ? (
          <div style={emptyStateStyles}>
            <p style={{ color: tokens.colors.semantic.danger }}>{error}</p>
          </div>
        ) : displayClases.length === 0 ? (
          <div style={emptyStateStyles}>
            <p style={emptyTitleStyles}>
              {activeTab === 'disponibles'
                ? 'No tienes clases programadas'
                : 'No hay clases pasadas'}
            </p>
            <p style={emptyTextStyles}>
              {activeTab === 'disponibles'
                ? 'Las clases que crees aparecerán aquí'
                : 'Las clases completadas aparecerán aquí'}
            </p>
          </div>
        ) : (
          displayClases.map((clase) => (
            <div
              key={clase.id}
              style={claseCardStyles}
              onClick={() => navigate(`/clases/${clase.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = tokens.shadows.card;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/clases/${clase.id}`);
                }
              }}
            >
              <div style={claseInfoStyles}>
                <h3 style={claseTitleStyles}>{clase.nombre}</h3>
                <div style={claseMetaStyles}>
                  <span style={metaItemStyles}>
                    <Calendar size={14} strokeWidth={1.75} />
                    {formatDateTime(clase.inicio)}
                  </span>
                  <span style={metaItemStyles}>
                    <Clock size={14} strokeWidth={1.75} />
                    {new Date(clase.fin).getHours() - new Date(clase.inicio).getHours()}h
                  </span>
                  <span style={metaItemStyles}>
                    <Users size={14} strokeWidth={1.75} />
                    {getCuposInfo(clase)}
                  </span>
                </div>
              </div>

              <div style={actionsStyles}>
                <button
                  type="button"
                  style={actionButtonStyles}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/clases/${clase.id}/editar`);
                  }}
                  aria-label="Editar clase"
                >
                  <Edit2 size={16} strokeWidth={1.75} />
                </button>
                {activeTab === 'disponibles' && (
                  <button
                    type="button"
                    style={{
                      ...actionButtonStyles,
                      color: tokens.colors.semantic.danger,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelClase(clase);
                    }}
                    aria-label="Cancelar clase"
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                )}
                <ChevronRight size={20} strokeWidth={1.75} color={tokens.colors.neutral.text_muted} />
              </div>
            </div>
          ))
        )}
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