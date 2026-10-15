import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { Header } from '../components/layout/Header';
import { AgendaGrilla } from '../components/ui/AgendaGrilla';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';

import { useAuth } from '../hooks/useAuth';
import { useAgendaSede, useSedes } from '../hooks/useSedes';
import { sedesService } from '../services/sedes.service';
import type { UsuarioPersonal, Reserva } from '../types/models';

const AgendaSede: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { sedes, isLoading: sedesLoading } = useSedes();
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { agenda, isLoading, error, fetchAgenda, refetch } = useAgendaSede(
    selectedSedeId ?? undefined,
    selectedDate
  );

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reserva | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

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

  const handlePreviousDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    if (selectedSedeId) {
      fetchAgenda(selectedSedeId, newDate);
    }
  }, [selectedDate, selectedSedeId, fetchAgenda]);

  const handleNextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    if (selectedSedeId) {
      fetchAgenda(selectedSedeId, newDate);
    }
  }, [selectedDate, selectedSedeId, fetchAgenda]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    if (selectedSedeId) {
      fetchAgenda(selectedSedeId, today);
    }
  }, [selectedSedeId, fetchAgenda]);

  const handleSedeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSedeId = parseInt(e.target.value, 10);
    setSelectedSedeId(newSedeId);
    fetchAgenda(newSedeId, selectedDate);
  }, [selectedDate, fetchAgenda]);

  const handleSelectReservation = useCallback((reservaId: string) => {
    const reserva = agenda?.reservas
      .flatMap((r) => r.reservas)
      .find((r) => r.id === reservaId);
    if (reserva) {
      setSelectedReservation(reserva as unknown as Reserva);
      setShowAttendanceModal(true);
    }
  }, [agenda]);

  const handleMarkAsistencia = useCallback(async (estado: 'asistio' | 'no_asistio') => {
    if (!selectedReservation) return;

    setAttendanceLoading(true);
    try {
      await sedesService.updateReservaEstado(selectedReservation.id, estado);
      setShowAttendanceModal(false);
      setSelectedReservation(null);
      refetch();
    } catch (err) {
      console.error('Error al actualizar asistencia:', err);
    } finally {
      setAttendanceLoading(false);
    }
  }, [selectedReservation, refetch]);

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
  };

  const dateNavStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.page_gutter_desktop}`,
    backgroundColor: tokens.colors.neutral.surface,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const dateDisplayStyles: React.CSSProperties = {
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

  const navButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    color: tokens.colors.neutral.text_secondary,
    transition: 'all 150ms ease-out',
  };

  const todayButtonStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
    backgroundColor: tokens.colors.brand.green_50,
    border: `1px solid ${tokens.colors.brand.green_300}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.brand.green_700,
    transition: 'all 150ms ease-out',
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

  const actionsBarStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacing.space_3,
    padding: `${tokens.spacing.space_3} ${tokens.spacing.page_gutter_desktop}`,
    backgroundColor: tokens.colors.neutral.surface,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
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

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const formatDateShort = (date: Date): string => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
  };

  return (
    <div style={pageStyles}>
      <Header
        user={user as UsuarioPersonal}
        sedeNombre={agenda?.sede.nombre}
        onLogout={logout}
      />

      <div style={dateNavStyles}>
        <div style={dateDisplayStyles}>
          <button
            type="button"
            style={navButtonStyles}
            onClick={handlePreviousDay}
            aria-label="Día anterior"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <span style={dateTextStyles}>{formatDateShort(selectedDate)}</span>
          <button
            type="button"
            style={navButtonStyles}
            onClick={handleNextDay}
            aria-label="Día siguiente"
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            style={todayButtonStyles}
            onClick={handleToday}
          >
            Hoy
          </button>
        </div>

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
      </div>

      <div style={actionsBarStyles}>
        <button
          type="button"
          style={refreshButtonStyles}
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw size={16} strokeWidth={1.75} />
          Actualizar
        </button>
      </div>

      {isLoading && sedesLoading ? (
        <div style={{ padding: tokens.spacing.page_gutter_desktop, textAlign: 'center' }}>
          <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando agenda...</p>
        </div>
      ) : error ? (
        <div style={{ padding: tokens.spacing.page_gutter_desktop, textAlign: 'center' }}>
          <p style={{ color: tokens.colors.semantic.danger }}>{error}</p>
        </div>
      ) : agenda ? (
        <AgendaGrilla
          date={selectedDate}
          sede={agenda.sede}
          courts={agenda.canchas}
          reservations={agenda.reservas}
          onSelectReservation={handleSelectReservation}
        />
      ) : null}

      {showAttendanceModal && selectedReservation && (
        <ModalConfirmacion
          open={showAttendanceModal}
          title="Reserva"
          description={`${selectedReservation.jugador?.nombre ?? 'Cliente'}`}
          confirmLabel="Marcar asistencia"
          cancelLabel="Cerrar"
          onConfirm={() => handleMarkAsistencia('asistio')}
          onCancel={() => setShowAttendanceModal(false)}
          variant="primary"
          loading={attendanceLoading}
        />
      )}
    </div>
  );
};

export default AgendaSede;