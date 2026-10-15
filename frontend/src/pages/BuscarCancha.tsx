import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { SelectorDeporteFecha } from '../components/ui/SelectorDeporteFecha';
import { DisponibilidadList } from '../components/reserva/DisponibilidadList';
import { RetentionTimer } from '../components/reserva/RetentionTimer';
import { ReservaForm } from '../components/reserva/ReservaForm';
import { BottomNav } from '../components/layout/BottomNav';
import { useReservas } from '../context/ReservationContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Sede, Filters, AvailabilitySlot } from '../types/models';

const BuscarCancha: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    retencionExpiry,
    releaseRetention,
    availableSlots,
    isLoading,
    fetchAvailability,
  } = useReservas();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [showReservaForm, setShowReservaForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const data = await apiFetch.get<Sede[]>('/api/sedes');
        setSedes(data);
        if (data.length > 0) {
          const initialFilters: Filters = {
            sedeId: data[0].id,
            deporte: 'padel',
            fecha: new Date(),
          };
          setFilters(initialFilters);
          fetchAvailability(initialFilters);
        }
      } catch (error) {
        console.error('Error fetching sedes:', error);
      }
    };
    fetchSedes();
  }, [fetchAvailability]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    fetchAvailability(newFilters);
  }, [fetchAvailability]);

  const handleSelectSlot = useCallback((slot: AvailabilitySlot) => {
    if (!slot.disponible) return;
    setSelectedSlot(slot);
    setShowReservaForm(true);
  }, []);

  const handleReservaSuccess = useCallback((reservaId: number) => {
    navigate('/pago', { state: { reservaId } });
  }, [navigate]);

  const handleCancelReserva = useCallback(() => {
    releaseRetention();
    setSelectedSlot(null);
    setShowReservaForm(false);
  }, [releaseRetention]);

  const handleExpireRetention = useCallback(() => {
    releaseRetention();
    setSelectedSlot(null);
    setShowReservaForm(false);
  }, [releaseRetention]);

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    paddingBottom: '80px',
  };

  const mainStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
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
  };

  const retentionBarStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.page_gutter_mobile}`,
    backgroundColor: tokens.colors.reservation_status.retenida.fill,
    borderBottom: `1px solid ${tokens.colors.reservation_status.retenida.border}`,
  };

  const retentionTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.reservation_status.retenida.text,
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={pageStyles}>
      <div style={mainStyles}>
        <div style={headerStyles}>
          <h1 style={headerTitleStyles}>Buscar Cancha</h1>
        </div>

        {retencionExpiry && (
          <div style={retentionBarStyles}>
            <span style={retentionTextStyles}>
              Tu reserva está retenida. Completa el pago antes de:
            </span>
            <RetentionTimer
              expiryTime={retencionExpiry}
              variant="compact"
              onExpire={handleExpireRetention}
            />
          </div>
        )}

        {filters && (
          <SelectorDeporteFecha
            sedes={sedes}
            deportes={['padel', 'futbol7']}
            fecha={filters.fecha}
            rangoHorario={filters.rangoHorario}
            onChange={handleFiltersChange}
          />
        )}

        {showReservaForm && selectedSlot ? (
          <ReservaForm
            slot={selectedSlot}
            onSuccess={handleReservaSuccess}
            onCancel={handleCancelReserva}
          />
        ) : (
          <DisponibilidadList
            slots={availableSlots}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoading}
          />
        )}
      </div>

      <BottomNav
        activeRoute="/buscar-cancha"
        onNavigate={(route) => navigate(route)}
      />
    </div>
  );
};

export default BuscarCancha;
