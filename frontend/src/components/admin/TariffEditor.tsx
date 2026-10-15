import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { adminService, CreateTarifaRequest } from '../../services/admin.service';
import type { Tarifa, Deporte, FranjaHoraria } from '../../types/models';

interface TariffEditorProps {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

const DURACIONES = [30, 60, 90, 120, 180];
const FRANJAS: { value: FranjaHoraria; label: string }[] = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];

const DEPORTES: { value: Deporte; label: string }[] = [
  { value: 'padel', label: 'Pádel' },
  { value: 'futbol7', label: 'Fútbol 7' },
];

const getContainerStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.page_gutter_desktop,
});

const getHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: tokens.spacing.space_6,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '22px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  margin: 0,
});

const getTableStyles = (): React.CSSProperties => ({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  overflow: 'hidden',
  boxShadow: tokens.shadows.card,
});

const getThStyles = (): React.CSSProperties => ({
  padding: `${tokens.spacing.space_4}`,
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
  padding: `${tokens.spacing.space_4}`,
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

const getSelectStyles = (): React.CSSProperties => ({
  ...getInputStyles(),
  width: '120px',
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

const getCreateFormStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_4,
  alignItems: 'flex-end',
  padding: tokens.spacing.space_4,
  backgroundColor: tokens.colors.neutral.surface_subtle,
  borderRadius: tokens.radii.md,
  marginBottom: tokens.spacing.space_4,
  flexWrap: 'wrap' as const,
});

const getFormGroupStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_2,
});

const getLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
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

interface TariffFormProps {
  formData: CreateTarifaRequest;
  onChange: (data: CreateTarifaRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TariffForm: React.FC<TariffFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const handleDeporteChange = (value: string) => {
    onChange({ ...formData, deporte: value as Deporte });
  };

  const handleDuracionChange = (value: string) => {
    onChange({ ...formData, duracionMinutos: parseInt(value, 10) });
  };

  const handleFranjaChange = (value: string) => {
    onChange({ ...formData, franja: value as FranjaHoraria });
  };

  const handleMontoChange = (value: string) => {
    onChange({ ...formData, monto: parseInt(value, 10) || 0 });
  };

  return (
    <div style={getCreateFormStyles()}>
      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Deporte</label>
        <select
          style={getSelectStyles()}
          value={formData.deporte}
          onChange={(e) => handleDeporteChange(e.target.value)}
        >
          {DEPORTES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Duración</label>
        <select
          style={getSelectStyles()}
          value={formData.duracionMinutos}
          onChange={(e) => handleDuracionChange(e.target.value)}
        >
          {DURACIONES.map((d) => (
            <option key={d} value={d}>
              {formatDuracion(d)}
            </option>
          ))}
        </select>
      </div>

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Franja</label>
        <select
          style={getSelectStyles()}
          value={formData.franja}
          onChange={(e) => handleFranjaChange(e.target.value)}
        >
          {FRANJAS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Monto (CLP)</label>
        <input
          type="number"
          style={getInputStyles()}
          value={formData.monto || ''}
          onChange={(e) => handleMontoChange(e.target.value)}
          placeholder="0"
        />
      </div>

      <div style={{ ...getFormGroupStyles(), marginTop: 'auto' }}>
        <button
          type="button"
          style={{
            ...getEditButtonStyles(),
            width: '36px',
            height: '36px',
          }}
          onClick={onSubmit}
        >
          <Check size={18} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          style={{
            ...getDeleteButtonStyles(),
            width: '36px',
            height: '36px',
          }}
          onClick={onCancel}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
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
    <tr key={tarifa.id}>
      <td style={getTdStyles()}>
        {getDeporteLabel(tarifa.deporte)}
      </td>
      <td style={getTdStyles()}>{formatDuracion(tarifa.duracionMinutos)}</td>
      <td style={getTdStyles()}>
        {getFranjaLabel(tarifa.franja)}
      </td>
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
                <Check size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                style={getDeleteButtonStyles()}
                onClick={onCancelEdit}
              >
                <X size={16} strokeWidth={1.75} />
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

const TariffTable: React.FC<{
  tarifas: Tarifa[];
  editingId: number | null;
  formData: CreateTarifaRequest;
  onStartEdit: (tarifa: Tarifa) => void;
  onEditMontoChange: (value: string) => void;
  onUpdate: (tarifaId: number) => void;
  onDelete: (tarifaId: number) => void;
  onCancelEdit: () => void;
}> = ({
  tarifas,
  editingId,
  formData,
  onStartEdit,
  onEditMontoChange,
  onUpdate,
  onDelete,
  onCancelEdit,
}) => {
  if (tarifas.length === 0) {
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

export const TariffEditor: React.FC<TariffEditorProps> = ({ onError, onSuccess }) => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateTarifaRequest>({
    deporte: 'padel',
    duracionMinutos: 60,
    franja: 'tarde',
    monto: 0,
  });

  const getInitialFormData = (): CreateTarifaRequest => ({
    deporte: 'padel',
    duracionMinutos: 60,
    franja: 'tarde',
    monto: 0,
  });

  const fetchTarifas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getTarifas();
      setTarifas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tarifas';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchTarifas();
  }, [fetchTarifas]);

  const handleCreate = async () => {
    if (formData.monto <= 0) {
      onError?.('El monto debe ser mayor a 0');
      return;
    }

    try {
      await adminService.createTarifa(formData);
      setIsCreating(false);
      setFormData(getInitialFormData());
      fetchTarifas();
      onSuccess?.('Tarifa creada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tarifa';
      onError?.(errorMessage);
    }
  };

  const handleUpdate = async (tarifaId: number) => {
    try {
      await adminService.updateTarifa(tarifaId, { monto: formData.monto });
      setEditingId(null);
      setFormData(getInitialFormData());
      fetchTarifas();
      onSuccess?.('Tarifa actualizada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarifa';
      onError?.(errorMessage);
    }
  };

  const handleDelete = async (tarifaId: number) => {
    try {
      await adminService.deleteTarifa(tarifaId);
      fetchTarifas();
      onSuccess?.('Tarifa eliminada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarifa';
      onError?.(errorMessage);
    }
  };

  const startEditing = (tarifa: Tarifa) => {
    setEditingId(tarifa.id);
    setFormData({
      deporte: tarifa.deporte,
      duracionMinutos: tarifa.duracionMinutos,
      franja: tarifa.franja,
      monto: tarifa.monto,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(getInitialFormData());
  };

  const handleEditMontoChange = (value: string) => {
    setFormData({ ...formData, monto: parseInt(value, 10) || 0 });
  };

  if (isLoading && tarifas.length === 0) {
    return (
      <div style={getContainerStyles()}>
        <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando tarifas...</p>
      </div>
    );
  }

  return (
    <div style={getContainerStyles()}>
      <div style={getHeaderStyles()}>
        <h2 style={getTitleStyles()}>Gestión de Tarifas</h2>
        {!isCreating && (
          <button
            type="button"
            style={{
              ...getEditButtonStyles(),
              width: 'auto',
              padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
              gap: tokens.spacing.space_2,
            }}
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} strokeWidth={1.75} />
            Nueva Tarifa
          </button>
        )}
      </div>

      {isCreating && (
        <TariffForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleCreate}
          onCancel={cancelEditing}
        />
      )}

      <TariffTable
        tarifas={tarifas}
        editingId={editingId}
        formData={formData}
        onStartEdit={startEditing}
        onEditMontoChange={handleEditMontoChange}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCancelEdit={cancelEditing}
      />
    </div>
  );
};

export default TariffEditor;