import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, Shield, Ban } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { adminService, CreateUsuarioRequest, UpdateUsuarioRequest } from '../../services/admin.service';
import type { UsuarioPersonal, RolUsuario, Jugador, BloqueoJugador, Sede } from '../../types/models';

interface UserManagerProps {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: 'encargado', label: 'Encargado de Sede' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'administrador', label: 'Administrador' },
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

const getSectionStyles = (): React.CSSProperties => ({
  marginBottom: tokens.spacing.space_8,
});

const getSectionTitleStyles = (): React.CSSProperties => ({
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  marginBottom: tokens.spacing.space_4,
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

const getCreateFormStyles = (): React.CSSProperties => ({
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

type BadgeVariant = 'success' | 'danger' | 'warning';

const getBadgeStyles = (variant: BadgeVariant): React.CSSProperties => {
  const colors = {
    success: {
      bg: tokens.colors.brand.green_100,
      text: tokens.colors.brand.green_800,
    },
    danger: {
      bg: '#FDE7E7',
      text: tokens.colors.semantic.danger,
    },
    warning: {
      bg: '#FFF4D6',
      text: '#8A5A00',
    },
  };
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.space_1,
    padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
    borderRadius: tokens.radii.pill,
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: colors[variant].bg,
    color: colors[variant].text,
  };
};

const getSedeNombre = (sedes: Sede[], sedeId: number): string => {
  return sedes.find((s) => s.id === sedeId)?.nombre || 'Sede desconocida';
};

const getRolLabel = (rol: RolUsuario): string => {
  return ROLES.find((r) => r.value === rol)?.label || '';
};

const getInitialFormData = (): CreateUsuarioRequest => ({
  nombre: '',
  email: '',
  password: '',
  rol: 'encargado',
  sedeId: 0,
});

interface UserFormProps {
  formData: CreateUsuarioRequest;
  sedes: Sede[];
  isEditing: boolean;
  onChange: (data: CreateUsuarioRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  sedes,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div style={getCreateFormStyles()}>
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

interface UserRowProps {
  usuario: UsuarioPersonal;
  sedes: Sede[];
  isEditing: boolean;
  formData: CreateUsuarioRequest;
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
    <tr key={usuario.id}>
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
                <Check size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                style={getDangerButtonStyles()}
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

interface JugadorBloqueadoRowProps {
  jugador: Jugador;
  onDesbloquear: () => void;
}

const JugadorBloqueadoRow: React.FC<JugadorBloqueadoRowProps> = ({
  jugador,
  onDesbloquear,
}) => {
  return (
    <tr key={jugador.id}>
      <td style={getTdStyles()}>{jugador.nombre}</td>
      <td style={getTdStyles()}>{jugador.email}</td>
      <td style={getTdStyles()}>{jugador.telefono}</td>
      <td style={getTdStyles()}>{jugador.inasistencias60Dias}</td>
      <td style={getTdStyles()}>
        <span style={getBadgeStyles('danger')}>
          <Ban size={12} strokeWidth={1.75} />
          Bloqueado
        </span>
      </td>
      <td style={getTdStyles()}>
        <button
          type="button"
          style={{
            ...getEditButtonStyles(),
            width: 'auto',
            padding: `${tokens.spacing.space_1} ${tokens.spacing.space_3}`,
            gap: tokens.spacing.space_1,
          }}
          onClick={onDesbloquear}
        >
          <Shield size={14} strokeWidth={1.75} />
          Desbloquear
        </button>
      </td>
    </tr>
  );
};

const PersonalTable: React.FC<{
  usuarios: UsuarioPersonal[];
  sedes: Sede[];
  editingId: number | null;
  formData: CreateUsuarioRequest;
  onStartEdit: (usuario: UsuarioPersonal) => void;
  onEditNombreChange: (value: string) => void;
  onEditEmailChange: (value: string) => void;
  onEditRolChange: (value: RolUsuario) => void;
  onUpdate: () => void;
  onDelete: (usuarioId: number) => void;
  onCancelEdit: () => void;
  isLoading: boolean;
}> = ({
  usuarios,
  sedes,
  editingId,
  formData,
  onStartEdit,
  onEditNombreChange,
  onEditEmailChange,
  onEditRolChange,
  onUpdate,
  onDelete,
  onCancelEdit,
  isLoading,
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

const BloqueadosTable: React.FC<{
  jugadores: Jugador[];
  onDesbloquear: (jugadorId: number) => void;
  isLoading: boolean;
}> = ({
  jugadores,
  onDesbloquear,
  isLoading,
}) => {
  if (!isLoading && jugadores.length === 0) {
    return (
      <p
        style={{
          textAlign: 'center',
          padding: tokens.spacing.space_8,
          color: tokens.colors.neutral.text_muted,
        }}
      >
        No hay jugadores bloqueados
      </p>
    );
  }

  return (
    <table style={getTableStyles()}>
      <thead>
        <tr>
          <th style={getThStyles()}>Nombre</th>
          <th style={getThStyles()}>Email</th>
          <th style={getThStyles()}>Teléfono</th>
          <th style={getThStyles()}>Inasistencias</th>
          <th style={getThStyles()}>Estado</th>
          <th style={getThStyles()}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {jugadores.map((jugador) => (
          <JugadorBloqueadoRow
            key={jugador.id}
            jugador={jugador}
            onDesbloquear={() => onDesbloquear(jugador.id)}
          />
        ))}
      </tbody>
    </table>
  );
};

export const UserManager: React.FC<UserManagerProps> = ({ onError, onSuccess }) => {
  const [usuarios, setUsuarios] = useState<UsuarioPersonal[]>([]);
  const [jugadoresBloqueados, setJugadoresBloqueados] = useState<Jugador[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoJugador[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUsuarioRequest>(getInitialFormData());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usuariosData, jugadoresData, bloqueosData, sedesData] = await Promise.all([
        adminService.getUsuarios(),
        adminService.getJugadoresBloqueados(),
        adminService.getBloqueosJugadores(),
        adminService.getSedes(),
      ]);
      setUsuarios(usuariosData);
      setJugadoresBloqueados(jugadoresData);
      setBloqueos(bloqueosData);
      setSedes(sedesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formData.nombre || !formData.email || !formData.password || formData.sedeId === 0) {
      onError?.('Todos los campos son requeridos');
      return;
    }

    try {
      await adminService.createUsuario(formData);
      setIsCreating(false);
      setFormData(getInitialFormData());
      fetchData();
      onSuccess?.('Usuario creado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      onError?.(errorMessage);
    }
  };

  const handleUpdate = async (usuarioId: number) => {
    try {
      const updateData: UpdateUsuarioRequest = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
      };
      await adminService.updateUsuario(usuarioId, updateData);
      setEditingId(null);
      setFormData(getInitialFormData());
      fetchData();
      onSuccess?.('Usuario actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      onError?.(errorMessage);
    }
  };

  const handleDeactivate = async (usuarioId: number) => {
    try {
      await adminService.deactivateUsuario(usuarioId);
      fetchData();
      onSuccess?.('Usuario desactivado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desactivar usuario';
      onError?.(errorMessage);
    }
  };

  const handleDesbloquearJugador = async (jugadorId: number) => {
    const bloqueo = bloqueos.find((b) => b.jugadorId === jugadorId);
    if (bloqueo) {
      try {
        await adminService.releaseBloqueoJugador(bloqueo.id);
        fetchData();
        onSuccess?.('Jugador desbloqueado exitosamente');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al desbloquear jugador';
        onError?.(errorMessage);
      }
    }
  };

  const startEditing = (usuario: UsuarioPersonal) => {
    setEditingId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      sedeId: usuario.sedeId,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(getInitialFormData());
  };

  const handleEditNombreChange = (value: string) => {
    setFormData({ ...formData, nombre: value });
  };

  const handleEditEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
  };

  const handleEditRolChange = (value: RolUsuario) => {
    setFormData({ ...formData, rol: value });
  };

  if (isLoading && usuarios.length === 0) {
    return (
      <div style={getContainerStyles()}>
        <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={getContainerStyles()}>
      <div style={getHeaderStyles()}>
        <h2 style={getTitleStyles()}>Gestión de Usuarios</h2>
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
            Nuevo Usuario
          </button>
        )}
      </div>

      {isCreating && (
        <UserForm
          formData={formData}
          sedes={sedes}
          isEditing={false}
          onChange={setFormData}
          onSubmit={handleCreate}
          onCancel={cancelEditing}
        />
      )}

      <section style={getSectionStyles()}>
        <h3 style={getSectionTitleStyles()}>Personal</h3>
        <PersonalTable
          usuarios={usuarios}
          sedes={sedes}
          editingId={editingId}
          formData={formData}
          onStartEdit={startEditing}
          onEditNombreChange={handleEditNombreChange}
          onEditEmailChange={handleEditEmailChange}
          onEditRolChange={handleEditRolChange}
          onUpdate={() => editingId && handleUpdate(editingId)}
          onDelete={handleDeactivate}
          onCancelEdit={cancelEditing}
          isLoading={isLoading}
        />
      </section>

      <section style={getSectionStyles()}>
        <h3 style={getSectionTitleStyles()}>Jugadores Bloqueados</h3>
        <BloqueadosTable
          jugadores={jugadoresBloqueados}
          onDesbloquear={handleDesbloquearJugador}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default UserManager;