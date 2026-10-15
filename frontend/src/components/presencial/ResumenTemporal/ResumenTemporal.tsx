import React from 'react';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Cancha, Tarifa, Jugador } from '../../../types/models';

interface ResumenTemporalProps {
  jugador: Jugador | null;
  cancha: Cancha | null;
  tarifa: Tarifa | null;
  fecha: string;
  horaInicio: string;
  esPagoManual: boolean;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const formatDeporte = (deporte: string): string => {
  return deporte === 'padel' ? 'Pádel' : 'Fútbol 7';
};

const getFranjaLabel = (franja: string): string => {
  switch (franja) {
    case 'manana':
      return 'Mañana';
    case 'tarde':
      return 'Tarde';
    case 'noche':
      return 'Noche';
    default:
      return franja;
  }
};

export const ResumenTemporal: React.FC<ResumenTemporalProps> = ({
  jugador,
  cancha,
  tarifa,
  fecha,
  horaInicio,
  esPagoManual,
}) => {
  const calcularHoraFin = (): string => {
    if (!tarifa) return horaInicio;

    const [hours, minutes] = horaInicio.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + tarifa.duracionMinutos);

    return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.brand.green_50,
    border: `1px solid ${tokens.colors.brand.green_100}`,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_4,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    margin: 0,
  };

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const iconStyles: React.CSSProperties = {
    color: tokens.colors.brand.green_600,
    flexShrink: 0,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    display: 'block',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    display: 'block',
  };

  const dividerStyles: React.CSSProperties = {
    height: '1px',
    backgroundColor: tokens.colors.brand.green_100,
    margin: `${tokens.spacing.space_2} 0`,
  };

  const priceStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacing.space_2,
  };

  const priceLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const priceValueStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
    letterSpacing: '0.01em',
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center' as const,
    padding: tokens.spacing.space_4,
    color: tokens.colors.neutral.text_muted,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const isComplete = jugador && cancha && tarifa && fecha && horaInicio;

  return (
    <div style={containerStyles}>
      <h3 style={titleStyles}>Resumen de la Reserva</h3>

      {!isComplete ? (
        <div style={emptyStateStyles}>
          Complete los datos del jugador y la reserva para ver el resumen
        </div>
      ) : (
        <>
          <div>
            <div style={rowStyles}>
              <Calendar size={18} strokeWidth={1.75} style={iconStyles} />
              <div>
                <span style={labelStyles}>Fecha</span>
                <span style={valueStyles}>{formatDate(fecha)}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={rowStyles}>
              <Clock size={18} strokeWidth={1.75} style={iconStyles} />
              <div>
                <span style={labelStyles}>Horario</span>
                <span style={valueStyles}>
                  {horaInicio} - {calcularHoraFin()} ({tarifa.duracionMinutos} min)
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={rowStyles}>
              <MapPin size={18} strokeWidth={1.75} style={iconStyles} />
              <div>
                <span style={labelStyles}>Cancha</span>
                <span style={valueStyles}>
                  {formatDeporte(cancha.deporte)} - {cancha.techada ? 'Techada' : 'Descubierta'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={rowStyles}>
              <CreditCard size={18} strokeWidth={1.75} style={iconStyles} />
              <div>
                <span style={labelStyles}>Pago</span>
                <span style={valueStyles}>
                  {esPagoManual ? 'Efectivo/Transferencia' : 'Online'}
                </span>
              </div>
            </div>
          </div>

          <div style={dividerStyles} />

          <div style={priceStyles}>
            <span style={priceLabelStyles}>
              {getFranjaLabel(tarifa.franja)} - {tarifa.duracionMinutos} min
            </span>
            <span style={priceValueStyles}>${tarifa.monto.toLocaleString('es-CL')}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumenTemporal;
