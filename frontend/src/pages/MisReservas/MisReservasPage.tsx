import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../styles/tokens';
import BotonAccionPrincipal from '../../components/ui/BotonAccionPrincipal';
import ModalConfirmacion from '../../components/shared/ModalConfirmacion/ModalConfirmacion';
import BottomNav from '../../components/layout/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import type { Reserva, ReservationStatus } from '../../types/models';
import FiltroReservas from '../../components/reservas/FiltroReservas/FiltroReservas';
import EmptyState from '../../components/reservas/EmptyState/EmptyState';
import TarjetaReserva from '../../components/reservas/TarjetaReserva/TarjetaReserva';

type FilterTab = 'proximas' | 'pasadas' | 'canceladas';

const MisReservasPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('proximas');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservas = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const jugadorId = 'id' in user ? user.id : 0;
      const data = await apiFetch.get<Reserva[]>(`/api/reservas?jugadorId=${jugadorId}`);
      setReservas(data);
    } catch {
      setError('Error al cargar tus reservas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const filteredReservas = reservas.filter((reserva) => {
    const now = new Date();
    const inicio = new Date(reserva.inicio);

    switch (activeTab) {
      case 'proximas':
        return (reserva.estado === 'pagada' || reserva.estado === 'retenida') && inicio >= now;
      case 'pasadas':
        return reserva.estado === 'asistio' || reserva.estado === 'no_asistio' || (inicio < now && reserva.estado === 'pagada');
      case 'canceladas':
        return reserva.estado === 'cancelada';
      default:
        return true;
    }
  });

  const handleCancelClick = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowCancelModal(true);
  };

  const handleCancelReserva = async () => {
    if (!selectedReserva) return;

    setIsCancelling(true);
    try {
      await apiFetch.delete(`/api/reservas/${selectedReserva.id}`);
      setReservas((prev) =>
        prev.map((r) =>
          r.id === selectedReserva.id ? { ...r, estado: 'cancelada' as ReservationStatus } : r
        )
      );
      setShowCancelModal(false);
      setSelectedReserva(null);
    } catch {
      setError('Error al cancelar la reserva. Por favor intenta de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  };

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '100px',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 20,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    marginBottom: tokens.spacing.space_4,
  };

  const contentStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-1, minmax(300px, 1fr))',
    gap: '12px',
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'proximas':
        return 'Cuando reserves una cancha, aparecerá aquí';
      case 'pasadas':
        return 'Las reservas pasadas aparecerán aquí';
      case 'canceladas':
        return 'Las reservas canceladas aparecerán aquí';
      default:
        return 'No hay reservas';
    }
  };

  const renderLoadingState = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.space_4 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            backgroundColor: tokens.colors.neutral.surface,
            borderRadius: tokens.radii.lg,
            padding: tokens.spacing.space_5,
            boxShadow: tokens.shadows.card,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.space_3 }}>
            <div
              style={{
                height: '16px',
                width: '60%',
                backgroundColor: tokens.colors.neutral.border,
                borderRadius: tokens.radii.sm,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                height: '16px',
                width: '25%',
                backgroundColor: tokens.colors.neutral.border,
                borderRadius: tokens.radii.sm,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <div
            style={{
              height: '16px',
              width: '80%',
              backgroundColor: tokens.colors.neutral.border,
              borderRadius: tokens.radii.sm,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div style={{ padding: tokens.spacing.space_4, textAlign: 'center' as const }}>
      <p style={{ color: tokens.colors.semantic.danger, marginBottom: tokens.spacing.space_4 }}>{error}</p>
      <BotonAccionPrincipal
        label="Reintentar"
        variant="secondary"
        size="md"
        onClick={() => window.location.reload()}
      />
    </div>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Mis Reservas</h1>
        <FiltroReservas activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div style={contentStyles}>
        {isLoading && renderLoadingState()}

        {!isLoading && error && renderErrorState()}

        {!isLoading && !error && filteredReservas.length === 0 && (
          <EmptyState
            title="No hay reservas"
            subtitle={getEmptyMessage()}
            showActionButton={activeTab === 'proximas'}
            actionLabel="Buscar cancha"
            onAction={() => navigate('/buscar-cancha')}
          />
        )}

        {!isLoading && !error && filteredReservas.length > 0 && (
          <div style={gridStyles}>
            {filteredReservas.map((reserva) => (
              <TarjetaReserva
                key={reserva.id}
                reserva={reserva}
                onCancel={() => handleCancelClick(reserva)}
                onClick={() => navigate(`/mis-reservas/${reserva.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav
        activeRoute="/mis-reservas"
        onNavigate={(route: string) => navigate(route)}
      />

      <ModalConfirmacion
        open={showCancelModal}
        title="Cancelar reserva"
        description="¿Estás seguro de que deseas cancelar esta reserva? Según la política de cancelación, es posible que no tengas derecho a devolución."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        variant="danger"
        onConfirm={handleCancelReserva}
        onCancel={() => {
          setShowCancelModal(false);
          setSelectedReserva(null);
        }}
        loading={isCancelling}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (min-width: 768px) {
          .reservas-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MisReservasPage;
