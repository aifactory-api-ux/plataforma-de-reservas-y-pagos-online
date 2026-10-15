import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { BadgeEstado } from '../components/ui/BadgeEstado';
import { BotonAccionPrincipal } from '../components/ui/BotonAccionPrincipal';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Reserva } from '../types/models';

type FilterTab = 'proximas' | 'pasadas' | 'canceladas';

const PULL_THRESHOLD = 80;
const ROTATE_ANGLE = 360;

const MisReservas: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('proximas');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [isPullingRefresh, setIsPullingRefresh] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchReservas = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const jugadorId = 'id' in user ? user.id : 0;
      const data = await apiFetch.get<Reserva[]>(`/api/reservas?jugadorId=${jugadorId}`);
      setReservas(data);
    } catch (err) {
      setError('Error al cargar tus reservas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsPullingRefresh(false);
      setPullProgress(0);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [user]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLoading || isRefreshing) return;
    pullStartY.current = e.touches[0].clientY;
    isPulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isLoading || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - pullStartY.current);
    pullDistance.current = distance;
    const progress = Math.min(distance / PULL_THRESHOLD, 1);
    setPullProgress(progress);
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${distance * 0.5}px)`;
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance.current >= PULL_THRESHOLD && !isLoading && !isRefreshing) {
      setIsPullingRefresh(true);
      fetchReservas(true);
    }

    if (contentRef.current) {
      contentRef.current.style.transform = 'translateY(0px)';
      contentRef.current.style.transition = 'transform 300ms ease-out';
    }
    pullDistance.current = 0;
    setPullProgress(0);
  };

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

  const renderTabButtons = () => (
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
  );

  const renderLoadingState = () => (
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

  const renderEmptyState = () => (
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
  );

  const getReservaCardStyles = (): React.CSSProperties => ({
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    marginBottom: tokens.spacing.space_4,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  });

  const getCardHeaderStyles = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_5}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  });

  const getCardBodyStyles = (): React.CSSProperties => ({
    padding: tokens.spacing.space_4,
  });

  const getCardRowStyles = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    marginBottom: tokens.spacing.space_2,
    color: tokens.colors.neutral.text_secondary,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  });

  const getCardPriceStyles = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_2,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  });

  const getPriceStyles = (): React.CSSProperties => ({
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  });

  const renderReservaCard = (reserva: Reserva) => {
    const cardStyles = getReservaCardStyles();
    const headerStyles = getCardHeaderStyles();
    const bodyStyles = getCardBodyStyles();
    const rowStyles = getCardRowStyles();
    const priceStyles = getCardPriceStyles();
    const priceTextStyles = getPriceStyles();

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.boxShadow = tokens.shadows.card;
    };

    const deporteLabel = reserva.cancha?.deporte === 'padel' ? 'Pádel' : 'Fútbol 7';
    const canchaNumero = reserva.cancha?.id ? `Cancha ${reserva.cancha.id}` : '-';
    const precioLabel = reserva.estado === 'cancelada' ? 'Monto reembolsado' : 'Total pagado';
    const precio = `$${reserva.tarifa?.monto?.toLocaleString('es-CL') || '0'}`;

    return (
      <div
        key={reserva.id}
        style={cardStyles}
        onClick={() => navigate(`/mis-reservas/${reserva.id}`)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={headerStyles}>
          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: tokens.typography.families.body,
              color: tokens.colors.neutral.text_primary,
              marginBottom: tokens.spacing.space_1,
            }}>
              {deporteLabel}
            </p>
            <p style={{
              fontSize: '12px',
              fontFamily: tokens.typography.families.body,
              color: tokens.colors.neutral.text_muted,
            }}>
              {canchaNumero}
            </p>
          </div>
          <BadgeEstado status={reserva.estado} size="sm" />
        </div>
        <div style={bodyStyles}>
          <div style={rowStyles}>
            <Calendar size={16} strokeWidth={1.75} />
            <span>{formatDate(reserva.inicio)}</span>
          </div>
          <div style={rowStyles}>
            <Clock size={16} strokeWidth={1.75} />
            <span>{formatTime(reserva.inicio)} - {formatTime(reserva.fin)}</span>
          </div>
          <div style={priceStyles}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: tokens.typography.families.body,
              color: tokens.colors.neutral.text_primary,
            }}>
              {precioLabel}
            </span>
            <span style={priceTextStyles}>
              {precio}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  const pullRefreshIndicatorStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_4} 0`,
    marginBottom: tokens.spacing.space_2,
    opacity: pullProgress,
    transform: `rotate(${pullProgress * ROTATE_ANGLE}deg)`,
    transition: isPullingRefresh ? 'transform 400ms ease-out' : 'opacity 150ms ease-out',
  };

  const pullRefreshTextStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    marginTop: tokens.spacing.space_2,
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={headerTitleStyles}>Mis Reservas</h1>
        {renderTabButtons()}
      </div>

      <div
        ref={contentRef}
        style={contentStyles}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {(isRefreshing || pullProgress > 0) && (
          <div style={pullRefreshIndicatorStyles}>
            <Loader2
              size={24}
              strokeWidth={1.75}
              style={{ color: tokens.colors.brand.green_600 }}
            />
            {pullProgress > 0 && !isPullingRefresh && (
              <span style={pullRefreshTextStyles}>Desliza para actualizar</span>
            )}
            {isPullingRefresh && (
              <span style={pullRefreshTextStyles}>Actualizando...</span>
            )}
          </div>
        )}

        {isLoading && renderLoadingState()}

        {!isLoading && error && renderErrorState()}

        {!isLoading && !error && filteredReservas.length === 0 && renderEmptyState()}

        {!isLoading && !error && filteredReservas.map(renderReservaCard)}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MisReservas;
