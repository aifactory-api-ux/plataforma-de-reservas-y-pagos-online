import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, UserX, Shield, Ban } from 'lucide-react';
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

export const UserManager: React.FC<UserManagerProps> = ({ onError, onSuccess }) => {
  const [usuarios, setUsuarios] = useState<UsuarioPersonal[]>([]);
  const [jugadoresBloqueados, setJugadoresBloqueados] = useState<Jugador[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoJugador[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUsuarioRequest>({
    nombre: '',
    email: '',
    password: '',
    rol: 'encargado',
    sedeId: 0,
  });

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
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'encargado',
        sedeId: 0,
      });
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
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'encargado',
        sedeId: 0,
      });
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
    const bloqueo = bloqueos.find((b) => b.jugadorId === jugadorId && b.estado !== 'liberado');
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
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'encargado',
      sedeId: 0,
    });
  };

  const getSedeNombre = (sedeId: number): string => {
    return sedes.find((s) => s.id === sedeId)?.nombre || 'Sede desconocida';
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

  const sectionStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_8,
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_4,
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
  };

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    width: '150px',
  };

  const buttonGroupStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const iconButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
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

  const dangerButtonStyles: React.CSSProperties = {
    ...iconButtonStyles,
    backgroundColor: '#FDE7E7',
    color: tokens.colors.semantic.danger,
  };

  const createFormStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing.space_4,
    padding: tokens.spacing.space_4,
    backgroundColor: tokens.colors.neutral.surface_subtle,
    borderRadius: tokens.radii.md,
    marginBottom: tokens.spacing.space_4,
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

  const badgeStyles = (variant: 'success' | 'danger' | 'warning'): React.CSSProperties => {
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

  if (isLoading && usuarios.length === 0) {
    return (
      <div style={containerStyles}>
        <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Gestión de Usuarios</h2>
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
            Nuevo Usuario
          </button>
        )}
      </div>

      {isCreating && (
        <div style={createFormStyles}>
          <div style={formGroupStyles}>
            <label style={labelStyles}>Nombre</label>
            <input
              type="text"
              style={inputStyles}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Email</label>
            <input
              type="email"
              style={inputStyles}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Contraseña</label>
            <input
              type="password"
              style={inputStyles}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Rol</label>
            <select
              style={selectStyles}
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value as RolUsuario })
              }
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Sede</label>
            <select
              style={selectStyles}
              value={formData.sedeId || ''}
              onChange={(e) =>
                setFormData({ ...formData, sedeId: parseInt(e.target.value, 10) })
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

          <div style={{ ...formGroupStyles, justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: tokens.spacing.space_2, marginTop: 'auto' }}>
              <button
                type="button"
                style={editButtonStyles}
                onClick={handleCreate}
              >
                <Check size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                style={dangerButtonStyles}
                onClick={cancelEditing}
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}

      <section style={sectionStyles}>
        <h3 style={sectionTitleStyles}>Personal</h3>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Nombre</th>
              <th style={thStyles}>Email</th>
              <th style={thStyles}>Rol</th>
              <th style={thStyles}>Sede</th>
              <th style={thStyles}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td style={tdStyles}>
                  {editingId === usuario.id ? (
                    <input
                      type="text"
                      style={{ ...inputStyles, width: '150px' }}
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  ) : (
                    usuario.nombre
                  )}
                </td>
                <td style={tdStyles}>
                  {editingId === usuario.id ? (
                    <input
                      type="email"
                      style={{ ...inputStyles, width: '180px' }}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    usuario.email
                  )}
                </td>
                <td style={tdStyles}>
                  {editingId === usuario.id ? (
                    <select
                      style={selectStyles}
                      value={formData.rol}
                      onChange={(e) =>
                        setFormData({ ...formData, rol: e.target.value as RolUsuario })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ROLES.find((r) => r.value === usuario.rol)?.label
                  )}
                </td>
                <td style={tdStyles}>{getSedeNombre(usuario.sedeId)}</td>
                <td style={tdStyles}>
                  <div style={buttonGroupStyles}>
                    {editingId === usuario.id ? (
                      <>
                        <button
                          type="button"
                          style={editButtonStyles}
                          onClick={() => handleUpdate(usuario.id)}
                        >
                          <Check size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          style={dangerButtonStyles}
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
                          onClick={() => startEditing(usuario)}
                        >
                          <Pencil size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          style={dangerButtonStyles}
                          onClick={() => handleDeactivate(usuario.id)}
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

        {!isLoading && usuarios.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              padding: tokens.spacing.space_8,
              color: tokens.colors.neutral.text_muted,
            }}
          >
            No hay usuarios registrados
          </p>
        )}
      </section>

      <section style={sectionStyles}>
        <h3 style={sectionTitleStyles}>Jugadores Bloqueados</h3>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Nombre</th>
              <th style={thStyles}>Email</th>
              <th style={thStyles}>Teléfono</th>
              <th style={thStyles}>Inasistencias</th>
              <th style={thStyles}>Estado</th>
              <th style={thStyles}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jugadoresBloqueados.map((jugador) => (
              <tr key={jugador.id}>
                <td style={tdStyles}>{jugador.nombre}</td>
                <td style={tdStyles}>{jugador.email}</td>
                <td style={tdStyles}>{jugador.telefono}</td>
                <td style={tdStyles}>{jugador.inasistencias60Dias}</td>
                <td style={tdStyles}>
                  <span style={badgeStyles('danger')}>
                    <Ban size={12} strokeWidth={1.75} />
                    Bloqueado
                  </span>
                </td>
                <td style={tdStyles}>
                  <button
                    type="button"
                    style={{
                      ...editButtonStyles,
                      width: 'auto',
                      padding: `${tokens.spacing.space_1} ${tokens.spacing.space_3}`,
                      gap: tokens.spacing.space_1,
                    }}
                    onClick={() => handleDesbloquearJugador(jugador.id)}
                  >
                    <Shield size={14} strokeWidth={1.75} />
                    Desbloquear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && jugadoresBloqueados.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              padding: tokens.spacing.space_8,
              color: tokens.colors.neutral.text_muted,
            }}
          >
            No hay jugadores bloqueados
          </p>
        )}
      </section>
    </div>
  );
};

export default UserManager;