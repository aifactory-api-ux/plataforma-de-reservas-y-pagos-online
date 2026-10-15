import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { adminService, CreateTarifaRequest, UpdateTarifaRequest } from '../../services/admin.service';
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

export const TariffEditor: React.FC<TariffEditorProps> = ({ onError, onSuccess }) => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateTarifaRequest>({
    deporte: 'padel',
    duracionMinutos: 60,
    franja: 'tarde',
    monto: 0,
  });

  const fetchTarifas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getTarifas();
      setTarifas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tarifas';
      setError(errorMessage);
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
      setFormData({
        deporte: 'padel',
        duracionMinutos: 60,
        franja: 'tarde',
        monto: 0,
      });
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
      setFormData({
        deporte: 'padel',
        duracionMinutos: 60,
        franja: 'tarde',
        monto: 0,
      });
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
    setFormData({
      deporte: 'padel',
      duracionMinutos: 60,
      franja: 'tarde',
      monto: 0,
    });
  };

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

  const containerStyles: React.CSSProperties = {
    padding: tokens.spacing.page_gutter_desktop,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.space_6,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    margin: 0,
  };

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    boxShadow: tokens.shadows.card,
  };

  const thStyles: React.CSSProperties = {
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
  };

  const tdStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_4}`,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const inputStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.sm,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    width: '100px',
  };

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    width: '120px',
  };

  const buttonGroupStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const iconButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.radii.sm,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  };

  const editButtonStyles: React.CSSProperties = {
    ...iconButtonStyles,
    backgroundColor: tokens.colors.brand.green_50,
    color: tokens.colors.brand.green_700,
  };

  const deleteButtonStyles: React.CSSProperties = {
    ...iconButtonStyles,
    backgroundColor: '#FDE7E7',
    color: tokens.colors.semantic.danger,
  };

  const createFormStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_4,
    alignItems: 'flex-end',
    padding: tokens.spacing.space_4,
    backgroundColor: tokens.colors.neutral.surface_subtle,
    borderRadius: tokens.radii.md,
    marginBottom: tokens.spacing.space_4,
    flexWrap: 'wrap' as const,
  };

  const formGroupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  if (isLoading && tarifas.length === 0) {
    return (
      <div style={containerStyles}>
        <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando tarifas...</p>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Gestión de Tarifas</h2>
        {!isCreating && (
          <button
            type="button"
            style={{
              ...editButtonStyles,
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
        <div style={createFormStyles}>
          <div style={formGroupStyles}>
            <label style={labelStyles}>Deporte</label>
            <select
              style={selectStyles}
              value={formData.deporte}
              onChange={(e) =>
                setFormData({ ...formData, deporte: e.target.value as Deporte })
              }
            >
              {DEPORTES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Duración</label>
            <select
              style={selectStyles}
              value={formData.duracionMinutos}
              onChange={(e) =>
                setFormData({ ...formData, duracionMinutos: parseInt(e.target.value, 10) })
              }
            >
              {DURACIONES.map((d) => (
                <option key={d} value={d}>
                  {formatDuracion(d)}
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Franja</label>
            <select
              style={selectStyles}
              value={formData.franja}
              onChange={(e) =>
                setFormData({ ...formData, franja: e.target.value as FranjaHoraria })
              }
            >
              {FRANJAS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Monto (CLP)</label>
            <input
              type="number"
              style={inputStyles}
              value={formData.monto || ''}
              onChange={(e) =>
                setFormData({ ...formData, monto: parseInt(e.target.value, 10) || 0 })
              }
              placeholder="0"
            />
          </div>

          <div style={{ ...formGroupStyles, marginTop: 'auto' }}>
            <button
              type="button"
              style={{
                ...editButtonStyles,
                width: '36px',
                height: '36px',
              }}
              onClick={handleCreate}
            >
              <Check size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              style={{
                ...deleteButtonStyles,
                width: '36px',
                height: '36px',
              }}
              onClick={cancelEditing}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={thStyles}>Deporte</th>
            <th style={thStyles}>Duración</th>
            <th style={thStyles}>Franja</th>
            <th style={thStyles}>Monto</th>
            <th style={thStyles}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tarifas.map((tarifa) => (
            <tr key={tarifa.id}>
              <td style={tdStyles}>
                {tarifa.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'}
              </td>
              <td style={tdStyles}>{formatDuracion(tarifa.duracionMinutos)}</td>
              <td style={tdStyles}>
                {FRANJAS.find((f) => f.value === tarifa.franja)?.label}
              </td>
              <td style={tdStyles}>
                {editingId === tarifa.id ? (
                  <input
                    type="number"
                    style={inputStyles}
                    value={formData.monto || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, monto: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                ) : (
                  formatMonto(tarifa.monto)
                )}
              </td>
              <td style={tdStyles}>
                <div style={buttonGroupStyles}>
                  {editingId === tarifa.id ? (
                    <>
                      <button
                        type="button"
                        style={editButtonStyles}
                        onClick={() => handleUpdate(tarifa.id)}
                      >
                        <Check size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        style={deleteButtonStyles}
                        onClick={cancelEditing}
                      >
                        <X size={16} strokeWidth={1.75} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={editButtonStyles}
                        onClick={() => startEditing(tarifa)}
                      >
                        <Pencil size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        style={deleteButtonStyles}
                        onClick={() => handleDelete(tarifa.id)}
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isLoading && tarifas.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            padding: tokens.spacing.space_8,
            color: tokens.colors.neutral.text_muted,
          }}
        >
          No hay tarifas configuradas
        </p>
      )}
    </div>
  );
};

export default TariffEditor;