import React from 'react';
import { tokens } from '../../../styles/tokens';
import type { Cancha } from '../../../types/models';
import type { AgendaRow } from '../../../services/sedes.service';
import CeldaReserva from '../CeldaReserva/CeldaReserva';

export interface AgendaGridProps {
  courts: Cancha[];
  reservations: AgendaRow[];
  onSelectReservation: (id: string) => void;
  isLoading?: boolean;
}

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

const getGridContainerStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.card,
  overflow: 'hidden',
  flex: 1,
});

const getGridHeaderStyles = (courtCount: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `80px repeat(${courtCount}, minmax(120px, 1fr))`,
  backgroundColor: tokens.colors.brand.green_900,
  color: tokens.colors.neutral.white,
  borderBottom: `2px solid ${tokens.colors.brand.green_700}`,
});

const getHeaderCellStyles = (): React.CSSProperties => ({
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_2}`,
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  textAlign: 'center',
  letterSpacing: '0.01em',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const getGridBodyStyles = (courtCount: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `80px repeat(${courtCount}, minmax(120px, 1fr))`,
  maxHeight: 'calc(100vh - 300px)',
  overflowY: 'auto',
});

const getHourCellStyles = (): React.CSSProperties => ({
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
  minHeight: '64px',
  position: 'sticky' as const,
  left: 0,
  zIndex: 1,
});

const getCourtNameDisplay = (court: Cancha): string => {
  const deporte = court.deporte === 'padel' ? 'Pádel' : 'F7';
  const techada = court.techada ? ' Tech.' : '';
  return `${deporte}${techada}`;
};

const AgendaGrid: React.FC<AgendaGridProps> = ({
  courts,
  reservations,
  onSelectReservation,
  isLoading = false,
}) => {
  const getReservationMap = (): Map<string, AgendaRow['reservas'][0]> => {
    const map = new Map<string, AgendaRow['reservas'][0]>();
    reservations.forEach((row) => {
      row.reservas.forEach((res) => {
        map.set(`${row.hora}-${res.canchaId}`, res);
      });
    });
    return map;
  };

  const reservationMap = getReservationMap();

  if (isLoading) {
    return (
      <div style={getGridContainerStyles()}>
        <div style={getGridHeaderStyles(courts.length)}>
          <div style={getHeaderCellStyles()}>Hora</div>
          {courts.map((court) => (
            <div key={court.id} style={getHeaderCellStyles()}>
              {getCourtNameDisplay(court)}
            </div>
          ))}
        </div>
        <div style={getGridBodyStyles(courts.length)}>
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div style={getHourCellStyles()}>{hour}</div>
              {courts.map((court) => (
                <CeldaReserva
                  key={`${hour}-${court.id}`}
                  onClick={onSelectReservation}
                  isLoading={true}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={getGridContainerStyles()}>
      <div style={getGridHeaderStyles(courts.length)}>
        <div style={getHeaderCellStyles()}>Hora</div>
        {courts.map((court) => (
          <div key={court.id} style={getHeaderCellStyles()}>
            {getCourtNameDisplay(court)}
          </div>
        ))}
      </div>

      <div style={getGridBodyStyles(courts.length)}>
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div style={getHourCellStyles()}>{hour}</div>
            {courts.map((court) => {
              const reservation = reservationMap.get(`${hour}-${court.id}`);
              return (
                <CeldaReserva
                  key={`${hour}-${court.id}`}
                  reserva={reservation}
                  onClick={onSelectReservation}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AgendaGrid;