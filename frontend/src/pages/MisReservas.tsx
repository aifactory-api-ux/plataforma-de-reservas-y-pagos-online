import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { BadgeEstado } from '../components/ui/BadgeEstado';
import { BotonAccionPrincipal } from '../components/ui/BotonAccionPrincipal';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Reserva, Jugador } from '../types/models';

type FilterTab = 'proximas' | 'pasadas' | 'canceladas';

const MisReservas: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('proximas');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const jugadorId = 'id' in user ? user.id : 0;
        const data = await apiFetch.get<Reserva[]>(`/api/reservas/jugador/${jugadorId}`);
        setReservas(data);
      } catch (err) {
        setError('Error al cargar tus reservas. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservas();
  }, [user]);

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

  const handleCancelReserva = async () => {
    if (!selectedReserva) return;

    setIsCancelling(true);
    try {
      await apiFetch.delete(`/api/reservas/${selectedReserva.id}`);
      setReservas((prev) =>
        prev.map((r) =>
          r.id === selectedReserva.id ? { ...r, estado: 'cancelada' as const } : r
        )
      );
      setShowCancelModal(false);
      setSelectedReserva(null);
    } catch (err) {
      setError('Error al cancelar la reserva. Por favor intenta de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    marginBottom: tokens.spacing.space_4,
  };

  const tabsStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isActive ? tokens.colors.brand.green_700 : tokens.colors.neutral.text_secondary,
    backgroundColor: isActive ? tokens.colors.brand.green_50 : 'transparent',
    border: 'none',
    borderRadius: tokens.radii.pill,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  });

  const contentStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
  };

  const reservaCardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    marginBottom: tokens.spacing.space_4,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  };

  const cardHeaderStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_5}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const cardBodyStyles: React.CSSProperties = {
    padding: tokens.spacing.space_4,
  };

  const cardRowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    marginBottom: tokens.spacing.space_2,
    color: tokens.colors.neutral.text_secondary,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const cardPriceStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_2,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  };

  const priceStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  const emptyStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_12} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const emptyIconStyles: React.CSSProperties = {
    color: tokens.colors.neutral.text_muted,
    marginBottom: tokens.spacing.space_4,
  };

  const emptyTitleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const emptySubtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_4,
    padding: tokens.spacing.page_gutter_mobile,
  };

  const skeletonStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_5,
    boxShadow: tokens.shadows.card,
  };

  const skeletonLineStyles = (width: string): React.CSSProperties => ({
    height: '16px',
    width,
    backgroundColor: tokens.colors.neutral.border,
    borderRadius: tokens.radii.sm,
    animation: 'pulse 1.5s ease-in-out infinite',
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Mis Reservas</h1>
        <div style={tabsStyles}>
          <button
            style={tabStyles(activeTab === 'proximas')}
            onClick={() => setActiveTab('proximas')}
          >
            Próximas
          </button>
          <button
            style={tabStyles(activeTab === 'pasadas')}
            onClick={() => setActiveTab('pasadas')}
          >
            Pasadas
          </button>
          <button
            style={tabStyles(activeTab === 'canceladas')}
            onClick={() => setActiveTab('canceladas')}
          >
            Canceladas
          </button>
        </div>
      </div>

      <div style={contentStyles}>
        {isLoading && (
          <div style={loadingStyles}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={skeletonStyles}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.space_3 }}>
                  <div style={skeletonLineStyles('60%')} />
                  <div style={skeletonLineStyles('25%')} />
                </div>
                <div style={skeletonLineStyles('80%')} />
              </div>
            ))}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        )}

        {!isLoading && error && (
          <div style={{ padding: tokens.spacing.space_4, textAlign: 'center' as const }}>
            <p style={{ color: tokens.colors.semantic.danger, marginBottom: tokens.spacing.space_4 }}>{error}</p>
            <BotonAccionPrincipal
              label="Reintentar"
              variant="secondary"
              size="md"
              onClick={() => window.location.reload()}
            />
          </div>
        )}

        {!isLoading && !error && filteredReservas.length === 0 && (
          <div style={emptyStyles}>
            <div style={emptyIconStyles}>
              <Calendar size={48} strokeWidth={1.75} />
            </div>
            <p style={emptyTitleStyles}>No hay reservas</p>
            <p style={emptySubtitleStyles}>
              {activeTab === 'proximas'
                ? 'Cuando reserves una cancha, aparecerá aquí'
                : activeTab === 'pasadas'
                ? 'Las reservas pasadas aparecerán aquí'
                : 'Las reservas canceladas aparecerán aquí'}
            </p>
            {activeTab === 'proximas' && (
              <div style={{ marginTop: tokens.spacing.space_6 }}>
                <BotonAccionPrincipal
                  label="Buscar cancha"
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/buscar-cancha')}
                />
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && filteredReservas.map((reserva) => (
          <div
            key={reserva.id}
            style={reservaCardStyles}
            onClick={() => navigate(`/mis-reservas/${reserva.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = tokens.shadows.card_hover}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = tokens.shadows.card}
          >
            <div style={cardHeaderStyles}>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: tokens.typography.families.body,
                  color: tokens.colors.neutral.text_primary,
                  marginBottom: tokens.spacing.space_1,
                }}>
                  {reserva.cancha?.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'}
                </p>
                <p style={{
                  fontSize: '12px',
                  fontFamily: tokens.typography.families.body,
                  color: tokens.colors.neutral.text_muted,
                }}>
                  {reserva.cancha?.id ? `Cancha ${reserva.cancha.id}` : '-'}
                </p>
              </div>
              <BadgeEstado status={reserva.estado} size="sm" />
            </div>
            <div style={cardBodyStyles}>
              <div style={cardRowStyles}>
                <Calendar size={16} strokeWidth={1.75} />
                <span>{formatDate(reserva.inicio)}</span>
              </div>
              <div style={cardRowStyles}>
                <Clock size={16} strokeWidth={1.75} />
                <span>{formatTime(reserva.inicio)} - {formatTime(reserva.fin)}</span>
              </div>
              <div style={cardPriceStyles}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: tokens.typography.families.body,
                  color: tokens.colors.neutral.text_primary,
                }}>
                  {reserva.estado === 'cancelada' ? 'Monto reembolsado' : 'Total pagado'}
                </span>
                <span style={priceStyles}>
                  ${reserva.tarifa?.monto?.toLocaleString('es-CL') || '0'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav
        activeRoute="/mis-reservas"
        onNavigate={(route) => navigate(route)}
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
      `}</style>
    </div>
  );
};

export default MisReservas;
