import React from 'react';
import { tokens } from '../../styles/tokens';
import type { Cancha, Reserva } from '../../types/models';
import BadgeEstado from './BadgeEstado';

export interface AgendaRow {
  id: string;
  hora: string;
  reservas: Array<{
    id: string;
    jugadorNombre: string;
    estado: Reserva['estado'];
    canchaId: number;
  }>;
}

export interface AgendaGrillaProps {
  date: Date;
  sede: { id: number; nombre: string; direccion: string; telefono: string };
  courts: Cancha[];
  reservations: AgendaRow[];
  onSelectReservation: (id: string) => void;
}

const formatDateDisplay = (date: Date): string => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
};

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

export const AgendaGrilla: React.FC<AgendaGrillaProps> = ({
  date,
  sede,
  courts,
  reservations,
  onSelectReservation,
}) => {
  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.background,
    minHeight: '100vh',
    padding: tokens.spacing.page_gutter_desktop,
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    marginBottom: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
  };

  const sedeTitleStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    margin: 0,
    lineHeight: '32px',
  };

  const dateStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    marginTop: tokens.spacing.space_2,
  };

  const gridContainerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    overflow: 'hidden',
  };

  const gridHeaderStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `80px repeat(${courts.length}, 1fr)`,
    backgroundColor: tokens.colors.brand.green_900,
    color: tokens.colors.neutral.white,
    borderBottom: `2px solid ${tokens.colors.brand.green_700}`,
  };

  const headerCellStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_2}`,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    textAlign: 'center',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const gridBodyStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `80px repeat(${courts.length}, 1fr)`,
  };

  const hourCellStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_2}`,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.numeric,
    color: tokens.colors.neutral.text_muted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.neutral.surface_subtle,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    borderRight: `1px solid ${tokens.colors.neutral.border}`,
    minHeight: '56px',
  };

  const getCourtCellStyles = (hasReservation: boolean): React.CSSProperties => ({
    padding: tokens.spacing.space_2,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    borderRight: `1px solid ${tokens.colors.neutral.border}`,
    backgroundColor: hasReservation
      ? 'transparent'
      : tokens.colors.neutral.surface_subtle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '56px',
    position: 'relative' as const,
  });

  const getReservationCardStyles = (): React.CSSProperties => ({
    width: '100%',
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.sm,
    border: `1px solid ${tokens.colors.neutral.border}`,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_1,
  });

  const reservationTextStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const getReservationMap = (): Map<string, AgendaRow['reservas'][0]> => {
    const map = new Map();
    reservations.forEach((row) => {
      row.reservas.forEach((res) => {
        map.set(`${row.hora}-${res.canchaId}`, res);
      });
    });
    return map;
  };

  const reservationMap = getReservationMap();

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = tokens.shadows.focus_ring;
    e.currentTarget.style.transform = 'scale(1.02)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={sedeTitleStyles}>{sede.nombre}</h1>
        <p style={dateStyles}>{formatDateDisplay(date)}</p>
      </div>

      <div style={gridContainerStyles}>
        <div style={gridHeaderStyles}>
          <div style={headerCellStyles}>Hora</div>
          {courts.map((court) => (
            <div key={court.id} style={headerCellStyles}>
              {court.deporte === 'padel' ? 'Pádel' : 'F7'} {court.techada ? 'Techada' : ''}
            </div>
          ))}
        </div>

        <div style={gridBodyStyles}>
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div style={hourCellStyles}>{hour}</div>
              {courts.map((court) => {
                const reservation = reservationMap.get(`${hour}-${court.id}`);
                const hasReservation = !!reservation;

                return (
                  <div key={`${hour}-${court.id}`} style={getCourtCellStyles(hasReservation)}>
                    {reservation && (
                      <div
                        style={getReservationCardStyles()}
                        onClick={() => onSelectReservation(reservation.id)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onSelectReservation(reservation.id);
                          }
                        }}
                      >
                        <span style={reservationTextStyles}>{reservation.jugadorNombre}</span>
                        <BadgeEstado
                          status={reservation.estado}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgendaGrilla;