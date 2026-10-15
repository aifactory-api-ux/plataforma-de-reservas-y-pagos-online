import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Tarifa, Deporte, FranjaHoraria } from '../../../types/models';
import type { CreateTarifaRequest } from '../../../services/admin.service';

interface TablaTarifasProps {
  tarifas: Tarifa[];
  isLoading: boolean;
  editingId: number | null;
  formData: CreateTarifaRequest;
  onStartEdit: (tarifa: Tarifa) => void;
  onEditMontoChange: (value: string) => void;
  onUpdate: (tarifaId: number) => void;
  onDelete: (tarifaId: number) => void;
  onCancelEdit: () => void;
}

const FRANJAS: { value: FranjaHoraria; label: string }[] = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];

const getTableStyles = (): React.CSSProperties => ({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  overflow: 'hidden',
  boxShadow: tokens.shadows.card,
});

const getThStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  backgroundColor: tokens.colors.neutral.surface_subtle,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getTdStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getInputStyles = (): React.CSSProperties => ({
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.sm,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  width: '100px',
});

const getButtonGroupStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_2,
});

const getIconButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: tokens.radii.sm,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
});

const getEditButtonStyles = (): React.CSSProperties => ({
  ...getIconButtonStyles(),
  backgroundColor: tokens.colors.brand.green_50,
  color: tokens.colors.brand.green_700,
});

const getDeleteButtonStyles = (): React.CSSProperties => ({
  ...getIconButtonStyles(),
  backgroundColor: '#FDE7E7',
  color: tokens.colors.semantic.danger,
});

const formatDuracion = (minutos: number): string => {
  if (minutos >= 60) {
    const horas = minutos / 60;
    return `${horas} hr${horas > 1 ? 's' : ''}`;
  }
  return `${minutos} min`;
};

const formatMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(monto);
};

const getDeporteLabel = (deporte: Deporte): string => {
  return deporte === 'padel' ? 'Pádel' : 'Fútbol 7';
};

const getFranjaLabel = (franja: FranjaHoraria): string => {
  return FRANJAS.find((f) => f.value === franja)?.label || '';
};

interface TariffRowProps {
  tarifa: Tarifa;
  isEditing: boolean;
  formData: CreateTarifaRequest;
  onStartEdit: () => void;
  onEditMontoChange: (value: string) => void;
  onUpdate: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

const TariffRow: React.FC<TariffRowProps> = ({
  tarifa,
  isEditing,
  formData,
  onStartEdit,
  onEditMontoChange,
  onUpdate,
  onDelete,
  onCancelEdit,
}) => {
  return (
    <tr>
      <td style={getTdStyles()}>{getDeporteLabel(tarifa.deporte)}</td>
      <td style={getTdStyles()}>{formatDuracion(tarifa.duracionMinutos)}</td>
      <td style={getTdStyles()}>{getFranjaLabel(tarifa.franja)}</td>
      <td style={getTdStyles()}>
        {isEditing ? (
          <input
            type="number"
            style={getInputStyles()}
            value={formData.monto || ''}
            onChange={(e) => onEditMontoChange(e.target.value)}
          />
        ) : (
          formatMonto(tarifa.monto)
        )}
      </td>
      <td style={getTdStyles()}>
        <div style={getButtonGroupStyles()}>
          {isEditing ? (
            <>
              <button
                type="button"
                style={getEditButtonStyles()}
                onClick={onUpdate}
              >
                <Pencil size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                style={getDeleteButtonStyles()}
                onClick={onCancelEdit}
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                style={getEditButtonStyles()}
                onClick={onStartEdit}
              >
                <Pencil size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                style={getDeleteButtonStyles()}
                onClick={onDelete}
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export const TablaTarifas: React.FC<TablaTarifasProps> = ({
  tarifas,
  isLoading,
  editingId,
  formData,
  onStartEdit,
  onEditMontoChange,
  onUpdate,
  onDelete,
  onCancelEdit,
}) => {
  if (!isLoading && tarifas.length === 0) {
    return (
      <p
        style={{
          textAlign: 'center',
          padding: tokens.spacing.space_8,
          color: tokens.colors.neutral.text_muted,
        }}
      >
        No hay tarifas configuradas
      </p>
    );
  }

  return (
    <table style={getTableStyles()}>
      <thead>
        <tr>
          <th style={getThStyles()}>Deporte</th>
          <th style={getThStyles()}>Duración</th>
          <th style={getThStyles()}>Franja</th>
          <th style={getThStyles()}>Monto</th>
          <th style={getThStyles()}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tarifas.map((tarifa) => (
          <TariffRow
            key={tarifa.id}
            tarifa={tarifa}
            isEditing={editingId === tarifa.id}
            formData={editingId === tarifa.id ? formData : {
              deporte: tarifa.deporte,
              duracionMinutos: tarifa.duracionMinutos,
              franja: tarifa.franja,
              monto: tarifa.monto,
            }}
            onStartEdit={() => onStartEdit(tarifa)}
            onEditMontoChange={onEditMontoChange}
            onUpdate={() => onUpdate(tarifa.id)}
            onDelete={() => onDelete(tarifa.id)}
            onCancelEdit={onCancelEdit}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TablaTarifas;