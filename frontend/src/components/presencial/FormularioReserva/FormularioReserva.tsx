import React, { useEffect, useCallback } from 'react';
import { tokens } from '../../../styles/tokens';
import type { Cancha, Tarifa } from '../../../types/models';

interface FormularioReservaProps {
  canchas: Cancha[];
  tarifas: Tarifa[];
  canchaId: number;
  tarifaId: number;
  fecha: string;
  horaInicio: string;
  esPagoManual: boolean;
  onCanchaChange: (canchaId: number) => void;
  onTarifaChange: (tarifaId: number) => void;
  onFechaChange: (fecha: string) => void;
  onHoraChange: (hora: string) => void;
  onPagoManualChange: (esPagoManual: boolean) => void;
  errors: Record<string, string>;
}

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

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

const formatDeporte = (deporte: string): string => {
  return deporte === 'padel' ? 'Pádel' : 'Fútbol 7';
};

export const FormularioReserva: React.FC<FormularioReservaProps> = ({
  canchas,
  tarifas,
  canchaId,
  tarifaId,
  fecha,
  horaInicio,
  esPagoManual,
  onCanchaChange,
  onTarifaChange,
  onFechaChange,
  onHoraChange,
  onPagoManualChange,
  errors,
}) => {
  const filteredTarifas = canchas.length > 0 && canchaId
    ? tarifas.filter((t) => t.deporte === canchas.find((c) => c.id === canchaId)?.deporte)
    : tarifas;

  useEffect(() => {
    if (canchas.length > 0 && !canchaId) {
      onCanchaChange(canchas[0].id);
    }
  }, [canchas, canchaId, onCanchaChange]);

  useEffect(() => {
    if (filteredTarifas.length > 0 && !tarifaId) {
      onTarifaChange(filteredTarifas[0].id);
    }
  }, [filteredTarifas, tarifaId, onTarifaChange]);

  const handleCanchaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCanchaId = parseInt(e.target.value, 10);
      onCanchaChange(newCanchaId);
      const newTarifa = filteredTarifas.find(
        (t) => t.deporte === canchas.find((c) => c.id === newCanchaId)?.deporte
      );
      if (newTarifa) {
        onTarifaChange(newTarifa.id);
      }
    },
    [filteredTarifas, canchas, onCanchaChange, onTarifaChange]
  );

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_6,
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.space_4,
  };

  const fieldGroupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_4,
  };

  const rowStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing.space_4,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${errors.fecha ? tokens.colors.semantic.danger : tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    fontSize: '16px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    outline: 'none',
    transition: 'border-color 150ms ease-out',
    boxSizing: 'border-box' as const,
  };

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23647A6F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${tokens.spacing.space_4} center`,
    paddingRight: tokens.spacing.space_10,
  };

  const checkboxContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_2,
  };

  const checkboxStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: tokens.colors.brand.green_700,
  };

  const errorStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.semantic.danger,
    marginTop: tokens.spacing.space_1,
  };

  return (
    <div style={containerStyles}>
      <div>
        <h3 style={sectionTitleStyles}>Detalles de la Reserva</h3>
        <div style={fieldGroupStyles}>
          <div style={rowStyles}>
            <div>
              <label style={labelStyles} htmlFor="fecha">
                Fecha
              </label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => onFechaChange(e.target.value)}
                style={{
                  ...inputStyles,
                  border: errors.fecha
                    ? `1px solid ${tokens.colors.semantic.danger}`
                    : inputStyles.border,
                }}
                required
              />
              {errors.fecha && <div style={errorStyles}>{errors.fecha}</div>}
            </div>

            <div>
              <label style={labelStyles} htmlFor="horaInicio">
                Hora de inicio
              </label>
              <select
                id="horaInicio"
                value={horaInicio}
                onChange={(e) => onHoraChange(e.target.value)}
                style={selectStyles}
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyles} htmlFor="canchaId">
              Cancha
            </label>
            <select
              id="canchaId"
              value={canchaId}
              onChange={handleCanchaChange}
              style={{
                ...selectStyles,
                border: errors.canchaId
                  ? `1px solid ${tokens.colors.semantic.danger}`
                  : selectStyles.border,
              }}
            >
              {canchas.map((cancha) => (
                <option key={cancha.id} value={cancha.id}>
                  {formatDeporte(cancha.deporte)} - {cancha.techada ? 'Techada' : 'Descubierta'}
                </option>
              ))}
            </select>
            {errors.canchaId && <div style={errorStyles}>{errors.canchaId}</div>}
            {errors.canchaNoDisponible && (
              <div style={{ ...errorStyles, marginTop: tokens.spacing.space_2 }}>
                {errors.canchaNoDisponible}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyles} htmlFor="tarifaId">
              Tarifa
            </label>
            <select
              id="tarifaId"
              value={tarifaId}
              onChange={(e) => onTarifaChange(parseInt(e.target.value, 10))}
              style={selectStyles}
            >
              {filteredTarifas.map((tarifa) => (
                <option key={tarifa.id} value={tarifa.id}>
                  {getFranjaLabel(tarifa.franja)} - ${tarifa.monto.toLocaleString('es-CL')} (
                  {tarifa.duracionMinutos} min)
                </option>
              ))}
            </select>
          </div>

          <div style={checkboxContainerStyles}>
            <input
              type="checkbox"
              id="esPagoManual"
              checked={esPagoManual}
              onChange={(e) => onPagoManualChange(e.target.checked)}
              style={checkboxStyles}
            />
            <label style={{ ...labelStyles, marginBottom: 0 }} htmlFor="esPagoManual">
              Pago en efectivo/transferencia (no online)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioReserva;
