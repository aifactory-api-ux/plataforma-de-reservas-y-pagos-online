import React from 'react';
import { Check, X } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { RolUsuario, Sede } from '../../../types/models';
import type { CreateUsuarioRequest } from '../../../services/admin.service';

interface FormularioUsuarioProps {
  formData: CreateUsuarioRequest;
  sedes: Sede[];
  isEditing: boolean;
  onChange: (data: CreateUsuarioRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: 'encargado', label: 'Encargado de Sede' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'administrador', label: 'Administrador' },
];

const getFormStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: tokens.spacing.space_4,
  padding: tokens.spacing.space_4,
  backgroundColor: tokens.colors.neutral.surface_subtle,
  borderRadius: tokens.radii.md,
  marginBottom: tokens.spacing.space_4,
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

const getInputStyles = (): React.CSSProperties => ({
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.sm,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
});

const getSelectStyles = (): React.CSSProperties => ({
  ...getInputStyles(),
  width: '100%',
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

const getDangerButtonStyles = (): React.CSSProperties => ({
  ...getIconButtonStyles(),
  backgroundColor: '#FDE7E7',
  color: tokens.colors.semantic.danger,
});

export const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({
  formData,
  sedes,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div style={getFormStyles()}>
      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Nombre</label>
        <input
          type="text"
          style={getInputStyles()}
          value={formData.nombre}
          onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
          placeholder="Nombre completo"
        />
      </div>

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Email</label>
        <input
          type="email"
          style={getInputStyles()}
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          placeholder="email@ejemplo.com"
        />
      </div>

      {!isEditing && (
        <div style={getFormGroupStyles()}>
          <label style={getLabelStyles()}>Contraseña</label>
          <input
            type="password"
            style={getInputStyles()}
            value={formData.password}
            onChange={(e) => onChange({ ...formData, password: e.target.value })}
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      )}

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Rol</label>
        <select
          style={getSelectStyles()}
          value={formData.rol}
          onChange={(e) =>
            onChange({ ...formData, rol: e.target.value as RolUsuario })
          }
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>Sede</label>
        <select
          style={getSelectStyles()}
          value={formData.sedeId || ''}
          onChange={(e) =>
            onChange({ ...formData, sedeId: parseInt(e.target.value, 10) })
          }
        >
          <option value="">Seleccionar sede</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ ...getFormGroupStyles(), justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: tokens.spacing.space_2, marginTop: 'auto' }}>
          <button
            type="button"
            style={getEditButtonStyles()}
            onClick={onSubmit}
          >
            <Check size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            style={getDangerButtonStyles()}
            onClick={onCancel}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioUsuario;