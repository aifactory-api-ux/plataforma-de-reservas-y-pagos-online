import React from 'react';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { UsuarioPersonal, Sede, RolUsuario } from '../../../types/models';

interface TablaUsuariosProps {
  usuarios: UsuarioPersonal[];
  sedes: Sede[];
  isLoading: boolean;
  editingId: number | null;
  formData: {
    nombre: string;
    email: string;
    password: string;
    rol: RolUsuario;
    sedeId: number;
  };
  onStartEdit: (usuario: UsuarioPersonal) => void;
  onEditNombreChange: (value: string) => void;
  onEditEmailChange: (value: string) => void;
  onEditRolChange: (value: RolUsuario) => void;
  onUpdate: () => void;
  onDelete: (usuarioId: number) => void;
  onCancelEdit: () => void;
}

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: 'encargado', label: 'Encargado de Sede' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'administrador', label: 'Administrador' },
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
});

const getSelectStyles = (): React.CSSProperties => ({
  ...getInputStyles(),
  width: '150px',
});

const getButtonGroupStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_2,
});

const getIconButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
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

const getSedeNombre = (sedes: Sede[], sedeId: number): string => {
  return sedes.find((s) => s.id === sedeId)?.nombre || 'Sede desconocida';
};

const getRolLabel = (rol: RolUsuario): string => {
  return ROLES.find((r) => r.value === rol)?.label || '';
};

interface UserRowProps {
  usuario: UsuarioPersonal;
  sedes: Sede[];
  isEditing: boolean;
  formData: {
    nombre: string;
    email: string;
    password: string;
    rol: RolUsuario;
    sedeId: number;
  };
  onStartEdit: () => void;
  onEditNombreChange: (value: string) => void;
  onEditEmailChange: (value: string) => void;
  onEditRolChange: (value: RolUsuario) => void;
  onUpdate: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

const UserRow: React.FC<UserRowProps> = ({
  usuario,
  sedes,
  isEditing,
  formData,
  onStartEdit,
  onEditNombreChange,
  onEditEmailChange,
  onEditRolChange,
  onUpdate,
  onDelete,
  onCancelEdit,
}) => {
  return (
    <tr>
      <td style={getTdStyles()}>
        {isEditing ? (
          <input
            type="text"
            style={{ ...getInputStyles(), width: '150px' }}
            value={formData.nombre}
            onChange={(e) => onEditNombreChange(e.target.value)}
          />
        ) : (
          usuario.nombre
        )}
      </td>
      <td style={getTdStyles()}>
        {isEditing ? (
          <input
            type="email"
            style={{ ...getInputStyles(), width: '180px' }}
            value={formData.email}
            onChange={(e) => onEditEmailChange(e.target.value)}
          />
        ) : (
          usuario.email
        )}
      </td>
      <td style={getTdStyles()}>
        {isEditing ? (
          <select
            style={getSelectStyles()}
            value={formData.rol}
            onChange={(e) => onEditRolChange(e.target.value as RolUsuario)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        ) : (
          getRolLabel(usuario.rol)
        )}
      </td>
      <td style={getTdStyles()}>{getSedeNombre(sedes, usuario.sedeId)}</td>
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
                style={getDangerButtonStyles()}
                onClick={onCancelEdit}
              >
                <Shield size={16} strokeWidth={1.75} />
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
                style={getDangerButtonStyles()}
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

export const TablaUsuarios: React.FC<TablaUsuariosProps> = ({
  usuarios,
  sedes,
  isLoading,
  editingId,
  formData,
  onStartEdit,
  onEditNombreChange,
  onEditEmailChange,
  onEditRolChange,
  onUpdate,
  onDelete,
  onCancelEdit,
}) => {
  if (!isLoading && usuarios.length === 0) {
    return (
      <p
        style={{
          textAlign: 'center',
          padding: tokens.spacing.space_8,
          color: tokens.colors.neutral.text_muted,
        }}
      >
        No hay usuarios registrados
      </p>
    );
  }

  return (
    <table style={getTableStyles()}>
      <thead>
        <tr>
          <th style={getThStyles()}>Nombre</th>
          <th style={getThStyles()}>Email</th>
          <th style={getThStyles()}>Rol</th>
          <th style={getThStyles()}>Sede</th>
          <th style={getThStyles()}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <UserRow
            key={usuario.id}
            usuario={usuario}
            sedes={sedes}
            isEditing={editingId === usuario.id}
            formData={editingId === usuario.id ? formData : {
              nombre: usuario.nombre,
              email: usuario.email,
              password: '',
              rol: usuario.rol,
              sedeId: usuario.sedeId,
            }}
            onStartEdit={() => onStartEdit(usuario)}
            onEditNombreChange={onEditNombreChange}
            onEditEmailChange={onEditEmailChange}
            onEditRolChange={onEditRolChange}
            onUpdate={onUpdate}
            onDelete={() => onDelete(usuario.id)}
            onCancelEdit={onCancelEdit}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TablaUsuarios;