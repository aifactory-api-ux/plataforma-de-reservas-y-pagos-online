import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import type { Sede, Filters, FranjaHoraria } from '../../types/models';

export interface SelectorDeporteFechaProps {
  sedes: Sede[];
  deportes: Array<'padel' | 'futbol7'>;
  fecha: Date;
  rangoHorario?: FranjaHoraria;
  onChange: (filters: Filters) => void;
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const FRANJA_LABELS: Record<FranjaHoraria, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
};

export const SelectorDeporteFecha: React.FC<SelectorDeporteFechaProps> = ({
  sedes,
  deportes,
  fecha,
  rangoHorario,
  onChange,
}) => {
  const [localFecha, setLocalFecha] = useState<string>(formatDate(fecha));
  const [sedeId, setSedeId] = useState<number>(sedes.length > 0 ? sedes[0].id : 0);
  const [deporte, setDeporte] = useState<'padel' | 'futbol7'>(
    deportes.includes('padel') ? 'padel' : deportes[0]
  );
  const [franja, setFranja] = useState<FranjaHoraria | undefined>(rangoHorario);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFecha(value);
    const [day, month, year] = value.split('/').map(Number);
    const newDate = new Date(year, month - 1, day);
    onChange({ sedeId, deporte, fecha: newDate, rangoHorario: franja });
  };

  const handleSedeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSedeId = Number(e.target.value);
    setSedeId(newSedeId);
    onChange({ sedeId: newSedeId, deporte, fecha, rangoHorario: franja });
  };

  const handleDeporteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeporte = e.target.value as 'padel' | 'futbol7';
    setDeporte(newDeporte);
    onChange({ sedeId, deporte: newDeporte, fecha, rangoHorario: franja });
  };

  const handleFranjaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newFranja = value === '' ? undefined : (value as FranjaHoraria);
    setFranja(newFranja);
    onChange({ sedeId, deporte, fecha, rangoHorario: newFranja });
  };

  const containerStyles: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: tokens.colors.neutral.surface,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_3,
  };

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_3,
    flexWrap: 'wrap',
  };

  const selectWrapperStyles: React.CSSProperties = {
    flex: '1 1 auto',
    minWidth: '140px',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.space_1,
  };

  const getSelectStyles = (): React.CSSProperties => ({
    width: '100%',
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    paddingRight: tokens.spacing.space_8,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23647A6F' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${tokens.spacing.space_2} center`,
    minHeight: '44px',
  });

  const dateInputStyles: React.CSSProperties = {
    ...getSelectStyles(),
    display: 'flex',
    alignItems: 'center',
  };

  const fechaContainerStyles: React.CSSProperties = {
    position: 'relative',
    flex: '1 1 auto',
    minWidth: '140px',
  };

  return (
    <div style={containerStyles}>
      <div style={rowStyles}>
        <div style={selectWrapperStyles}>
          <label style={labelStyles}>Sede</label>
          <select
            value={sedeId}
            onChange={handleSedeChange}
            style={getSelectStyles()}
            aria-label="Seleccionar sede"
          >
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={selectWrapperStyles}>
          <label style={labelStyles}>Deporte</label>
          <select
            value={deporte}
            onChange={handleDeporteChange}
            style={getSelectStyles()}
            aria-label="Seleccionar deporte"
          >
            {deportes.map((d) => (
              <option key={d} value={d}>
                {d === 'padel' ? 'Pádel' : 'Fútbol 7'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={rowStyles}>
        <div style={fechaContainerStyles}>
          <label style={labelStyles}>Fecha</label>
          <div style={dateInputStyles}>
            <Calendar
              size={16}
              strokeWidth={1.75}
              style={{
                marginRight: tokens.spacing.space_2,
                color: tokens.colors.neutral.text_muted,
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              value={localFecha}
              onChange={handleFechaChange}
              placeholder="DD/MM/AAAA"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                fontFamily: tokens.typography.families.body,
                color: tokens.colors.neutral.text_primary,
                width: '100%',
                minHeight: '44px',
              }}
              aria-label="Fecha de reserva"
            />
          </div>
        </div>

        <div style={selectWrapperStyles}>
          <label style={labelStyles}>Horario</label>
          <select
            value={franja || ''}
            onChange={handleFranjaChange}
            style={getSelectStyles()}
            aria-label="Seleccionar franja horaria"
          >
            <option value="">Todos</option>
            <option value="manana">{FRANJA_LABELS.manana}</option>
            <option value="tarde">{FRANJA_LABELS.tarde}</option>
            <option value="noche">{FRANJA_LABELS.noche}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SelectorDeporteFecha;