import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { Header } from '../../components/layout/Header';
import AgendaGrid from '../../components/agenda/AgendaGrid/AgendaGrid';
import FiltrosAgenda from '../../components/agenda/FiltrosAgenda/FiltrosAgenda';
import EstadisticasPanel from '../../components/agenda/EstadisticasPanel/EstadisticasPanel';
import SidebarDetalle from '../../components/agenda/SidebarDetalle/SidebarDetalle';
import { useAuth } from '../../hooks/useAuth';
import { useAgendaSede, useSedes } from '../../hooks/useSedes';
import { useNotifications } from '../../context/NotificationContext';
import { sedesService } from '../../services/sedes.service';
import type { UsuarioPersonal, Reserva } from '../../types/models';
import type { AgendaRow } from '../../services/sedes.service';

const AgendaSedePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { sendReminder } = useNotifications();
  const { data: sedes, loading: sedesLoading } = useSedes();
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const { data: agenda, loading: isLoading, error, fetchAgenda, refetch } = useAgendaSede(
    selectedSedeId ?? undefined,
    selectedDate
  );

  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reserva | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (sedes.length > 0 && !selectedSedeId) {
      const personalUser = user as UsuarioPersonal;
      if (personalUser?.sedeId) {
        const hasAccess = sedes.some((s) => s.id === personalUser.sedeId);
        setSelectedSedeId(hasAccess ? personalUser.sedeId : sedes[0].id);
      } else {
        setSelectedSedeId(sedes[0].id);
      }
    }
  }, [sedes, selectedSedeId, user]);

  useEffect(() => {
    if (selectedSedeId) {
      fetchAgenda(selectedSedeId, selectedDate);
    }
  }, [selectedSedeId, selectedDate, fetchAgenda]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    if (selectedSedeId) {
      fetchAgenda(selectedSedeId, date);
    }
  }, [selectedSedeId, fetchAgenda]);

  const handleSedeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSedeId = parseInt(e.target.value, 10);
    setSelectedSedeId(newSedeId);
    fetchAgenda(newSedeId, selectedDate);
  }, [selectedDate, fetchAgenda]);

  const handleCourtChange = useCallback((courtId: number | undefined) => {
    setSelectedCourtId(courtId);
  }, []);

  const handleStatusFilterChange = useCallback((status: string | undefined) => {
    setSelectedStatus(status);
  }, []);

  const handleSelectReservation = useCallback((reservaId: string) => {
    const reserva = agenda?.reservas
      .flatMap((r) => r.reservas)
      .find((r) => r.id === reservaId);

    if (reserva) {
      setSelectedReservation(reserva as unknown as Reserva);
      setShowSidebar(true);
    }
  }, [agenda]);

  const handleCloseSidebar = useCallback(() => {
    setShowSidebar(false);
    setSelectedReservation(null);
  }, []);

  const handleMarkAsistencia = useCallback(async (estado: 'asistio' | 'no_asistio') => {
    if (!selectedReservation) return;

    setSidebarLoading(true);
    try {
      await sedesService.updateReservaEstado(selectedReservation.id, estado);
      handleCloseSidebar();
      if (selectedSedeId) {
        fetchAgenda(selectedSedeId, selectedDate);
      }
    } catch (err) {
      console.error('Error al actualizar asistencia:', err);
    } finally {
      setSidebarLoading(false);
    }
  }, [selectedReservation, selectedSedeId, selectedDate, fetchAgenda, handleCloseSidebar]);

  const handleSendReminder = useCallback(async () => {
    if (!selectedReservation) return;

    setSidebarLoading(true);
    try {
      await sendReminder(selectedReservation.id);
    } catch (err) {
      console.error('Error al enviar recordatorio:', err);
    } finally {
      setSidebarLoading(false);
    }
  }, [selectedReservation, sendReminder]);

  const getFilteredReservations = (): AgendaRow[] => {
    if (!agenda?.reservas) return [];

    let filtered = agenda.reservas;

    if (selectedCourtId) {
      filtered = filtered.map(row => ({
        ...row,
        reservas: row.reservas.filter(r => r.canchaId === selectedCourtId),
      }));
    }

    if (selectedStatus) {
      filtered = filtered.map(row => ({
        ...row,
        reservas: row.reservas.filter(r => r.estado === selectedStatus),
      }));
    }

    return filtered;
  };

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
  };

  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_desktop}`,
    backgroundColor: tokens.colors.neutral.surface,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    gap: tokens.spacing.space_4,
    flexWrap: 'wrap' as const,
  };

  const dateNavStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const dateTextStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const sedeSelectStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    cursor: 'pointer',
  };

  const refreshButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    transition: 'all 150ms ease-out',
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    padding: tokens.spacing.space_6,
    gap: tokens.spacing.space_6,
    minHeight: 'calc(100vh - 140px)',
  };

  const sidebarColumnStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing.space_4,
    width: '240px',
    flexShrink: 0,
  };

  const gridColumnStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  };

  const pageTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    margin: 0,
    lineHeight: 1.2,
  };

  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: tokens.spacing.space_16,
  };

  const errorStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: tokens.spacing.space_16,
    color: tokens.colors.semantic.danger,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const formatDateShort = (date: Date): string => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const filteredReservations = getFilteredReservations();

  return (
    <div style={pageStyles}>
      <Header
        user={user as UsuarioPersonal}
        sedeNombre={agenda?.sede.nombre}
        onLogout={logout}
      />

      <div style={toolbarStyles}>
        <div style={dateNavStyles}>
          <h1 style={pageTitleStyles}>
            Agenda {agenda?.sede.nombre || 'Sede'}
          </h1>
          <span style={dateTextStyles}>{formatDateShort(selectedDate)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.space_3 }}>
          <select
            style={sedeSelectStyles}
            value={selectedSedeId ?? ''}
            onChange={handleSedeChange}
            aria-label="Seleccionar sede"
          >
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            style={refreshButtonStyles}
            onClick={refetch}
            disabled={isLoading}
            aria-label="Actualizar agenda"
          >
            <RefreshCw
              size={16}
              strokeWidth={1.75}
              style={{
                animation: isLoading ? 'spin 1s linear infinite' : 'none',
              }}
            />
            Actualizar
          </button>
        </div>
      </div>

      <div style={mainContentStyles}>
        <div style={sidebarColumnStyles}>
          <FiltrosAgenda
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            selectedCourtId={selectedCourtId}
            onCourtChange={handleCourtChange}
            courts={agenda?.canchas || []}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusFilterChange}
          />

          <EstadisticasPanel
            reservations={agenda?.reservas || []}
            date={selectedDate}
            onFilterByStatus={handleStatusFilterChange}
          />
        </div>

        <div style={gridColumnStyles}>
          {isLoading || sedesLoading ? (
            <div style={loadingStyles}>
              <p style={{ color: tokens.colors.neutral.text_muted, fontSize: '14px' }}>
                Cargando agenda...
              </p>
            </div>
          ) : error ? (
            <div style={errorStyles}>{error}</div>
          ) : agenda ? (
            <AgendaGrid
              courts={selectedCourtId
                ? agenda.canchas.filter(c => c.id === selectedCourtId)
                : agenda.canchas}
              reservations={filteredReservations}
              onSelectReservation={handleSelectReservation}
            />
          ) : null}
        </div>
      </div>

      {showSidebar && (
        <SidebarDetalle
          reserva={selectedReservation}
          onClose={handleCloseSidebar}
          onMarkAsistencia={handleMarkAsistencia}
          onSendReminder={handleSendReminder}
          isLoading={sidebarLoading}
        />
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AgendaSedePage;