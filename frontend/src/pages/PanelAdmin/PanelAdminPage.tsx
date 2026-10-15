import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokens } from '../../styles/tokens';
import { SidebarAdmin } from '../../components/admin/SidebarAdmin/SidebarAdmin';
import { TablaUsuarios } from '../../components/admin/TablaUsuarios/TablaUsuarios';
import { TablaTarifas } from '../../components/admin/TablaTarifas/TablaTarifas';
import { GeneradorReportes } from '../../components/admin/GeneradorReportes/GeneradorReportes';
import { FormularioUsuario } from '../../components/admin/FormularioUsuario/FormularioUsuario';
import { adminService, CreateUsuarioRequest, CreateTarifaRequest } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import type { UsuarioPersonal, RolUsuario, Sede, Tarifa } from '../../types/models';

type TabId = 'usuarios' | 'tarifas' | 'bloqueos' | 'reportes';

const getContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: tokens.colors.neutral.background,
});

const getContentStyles = (): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: tokens.colors.neutral.background,
  overflow: 'auto',
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

const getIconButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'auto',
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
  borderRadius: tokens.radii.sm,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  gap: tokens.spacing.space_2,
});

const getEditButtonStyles = (): React.CSSProperties => ({
  ...getIconButtonStyles(),
  backgroundColor: tokens.colors.brand.green_50,
  color: tokens.colors.brand.green_700,
});

const getInitialUsuarioFormData = (): CreateUsuarioRequest => ({
  nombre: '',
  email: '',
  password: '',
  rol: 'encargado',
  sedeId: 0,
});

const getInitialTarifaFormData = (): CreateTarifaRequest => ({
  deporte: 'padel',
  duracionMinutos: 60,
  franja: 'tarde',
  monto: 0,
});

interface JugadoresBloqueadosTableProps {
  jugadores: Array<{
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    inasistencias60Dias: number;
  }>;
  onDesbloquear: (jugadorId: number) => void;
}

const JugadoresBloqueadosTable: React.FC<JugadoresBloqueadosTableProps> = ({
  jugadores,
  onDesbloquear,
}) => {
  const getBadgeStyles = (): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.space_1,
    padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
    borderRadius: tokens.radii.pill,
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#FDE7E7',
    color: tokens.colors.semantic.danger,
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

  if (jugadores.length === 0) {
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
          <tr key={jugador.id}>
            <td style={getTdStyles()}>{jugador.nombre}</td>
            <td style={getTdStyles()}>{jugador.email}</td>
            <td style={getTdStyles()}>{jugador.telefono}</td>
            <td style={getTdStyles()}>{jugador.inasistencias60Dias}</td>
            <td style={getTdStyles()}>
              <span style={getBadgeStyles()}>Bloqueado</span>
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
                onClick={() => onDesbloquear(jugador.id)}
              >
                Desbloquear
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const PanelAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get('tab') as TabId) || 'usuarios'
  );
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioPersonal[]>([]);
  const [jugadoresBloqueados, setJugadoresBloqueados] = useState<Array<{
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    inasistencias60Dias: number;
  }>>([]);
  const [bloqueos, setBloqueos] = useState<Array<{ id: number; jugadorId: number }>>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tariffEditingId, setTariffEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingTarifa, setIsCreatingTarifa] = useState(false);
  const [formData, setFormData] = useState<CreateUsuarioRequest>(getInitialUsuarioFormData());
  const [tarifaFormData, setTarifaFormData] = useState<CreateTarifaRequest>(getInitialTarifaFormData());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabId;
    if (tab && ['usuarios', 'tarifas', 'bloqueos', 'reportes'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabId);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleError = useCallback((error: string) => {
    setNotification({ type: 'error', message: error });
  }, []);

  const handleSuccess = useCallback((message: string) => {
    setNotification({ type: 'success', message });
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usuariosData, jugadoresData, bloqueosData, sedesData, tarifasData] = await Promise.all([
        adminService.getUsuarios(),
        adminService.getJugadoresBloqueados(),
        adminService.getBloqueosJugadores(),
        adminService.getSedes(),
        adminService.getTarifas(),
      ]);
      setUsuarios(usuariosData);
      setJugadoresBloqueados(jugadoresData);
      setBloqueos(bloqueosData);
      setSedes(sedesData);
      setTarifas(tarifasData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleCreateUsuario = async () => {
    if (!formData.nombre || !formData.email || !formData.password || formData.sedeId === 0) {
      handleError('Todos los campos son requeridos');
      return;
    }

    try {
      await adminService.createUsuario(formData);
      setIsCreating(false);
      setFormData(getInitialUsuarioFormData());
      fetchData();
      handleSuccess('Usuario creado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      handleError(errorMessage);
    }
  };

  const handleUpdateUsuario = async (usuarioId: number) => {
    try {
      await adminService.updateUsuario(usuarioId, {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
      });
      setEditingId(null);
      setFormData(getInitialUsuarioFormData());
      fetchData();
      handleSuccess('Usuario actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      handleError(errorMessage);
    }
  };

  const handleDeactivateUsuario = async (usuarioId: number) => {
    try {
      await adminService.deactivateUsuario(usuarioId);
      fetchData();
      handleSuccess('Usuario desactivado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desactivar usuario';
      handleError(errorMessage);
    }
  };

  const handleDesbloquearJugador = async (jugadorId: number) => {
    const bloqueo = bloqueos.find((b) => b.jugadorId === jugadorId);
    if (bloqueo) {
      try {
        await adminService.releaseBloqueoJugador(bloqueo.id);
        fetchData();
        handleSuccess('Jugador desbloqueado exitosamente');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al desbloquear jugador';
        handleError(errorMessage);
      }
    }
  };

  const handleCreateTarifa = async () => {
    if (tarifaFormData.monto <= 0) {
      handleError('El monto debe ser mayor a 0');
      return;
    }

    try {
      await adminService.createTarifa(tarifaFormData);
      setIsCreatingTarifa(false);
      setTarifaFormData(getInitialTarifaFormData());
      fetchData();
      handleSuccess('Tarifa creada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tarifa';
      handleError(errorMessage);
    }
  };

  const handleUpdateTarifa = async (tarifaId: number) => {
    try {
      await adminService.updateTarifa(tarifaId, { monto: tarifaFormData.monto });
      setTariffEditingId(null);
      setTarifaFormData(getInitialTarifaFormData());
      fetchData();
      handleSuccess('Tarifa actualizada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarifa';
      handleError(errorMessage);
    }
  };

  const handleDeleteTarifa = async (tarifaId: number) => {
    try {
      await adminService.deleteTarifa(tarifaId);
      fetchData();
      handleSuccess('Tarifa eliminada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarifa';
      handleError(errorMessage);
    }
  };

  const startEditingUsuario = (usuario: UsuarioPersonal) => {
    setEditingId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      sedeId: usuario.sedeId,
    });
  };

  const startEditingTarifa = (tarifa: Tarifa) => {
    setTariffEditingId(tarifa.id);
    setTarifaFormData({
      deporte: tarifa.deporte,
      duracionMinutos: tarifa.duracionMinutos,
      franja: tarifa.franja,
      monto: tarifa.monto,
    });
  };

  const cancelEditingUsuario = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(getInitialUsuarioFormData());
  };

  const cancelEditingTarifa = () => {
    setTariffEditingId(null);
    setIsCreatingTarifa(false);
    setTarifaFormData(getInitialTarifaFormData());
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const typedUser = user as UsuarioPersonal;
  const isAdmin = typedUser?.rol === 'administrador';

  if (!isAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: tokens.colors.neutral.background,
          padding: tokens.spacing.page_gutter_desktop,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: tokens.spacing.space_8,
            backgroundColor: tokens.colors.neutral.surface,
            borderRadius: tokens.radii.lg,
            boxShadow: tokens.shadows.card,
            maxWidth: '400px',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: tokens.typography.families.display,
              color: tokens.colors.semantic.danger,
              marginBottom: tokens.spacing.space_4,
            }}
          >
            Acceso Denegado
          </h2>
          <p
            style={{
              fontSize: '14px',
              fontFamily: tokens.typography.families.body,
              color: tokens.colors.neutral.text_secondary,
              marginBottom: tokens.spacing.space_6,
            }}
          >
            Solo los administradores pueden acceder a este panel.
          </p>
          <button
            type="button"
            style={{
              padding: `${tokens.spacing.space_3} ${tokens.spacing.space_6}`,
              backgroundColor: tokens.colors.brand.green_700,
              color: tokens.colors.neutral.white,
              border: 'none',
              borderRadius: tokens.radii.md,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'usuarios':
        return (
          <div style={getContentStyles()}>
            <div style={{ padding: tokens.spacing.page_gutter_desktop }}>
              <div style={getHeaderStyles()}>
                <h2 style={getTitleStyles()}>Gestión de Usuarios</h2>
                {!isCreating && (
                  <button
                    type="button"
                    style={getEditButtonStyles()}
                    onClick={() => setIsCreating(true)}
                  >
                    + Nuevo Usuario
                  </button>
                )}
              </div>

              {isCreating && (
                <FormularioUsuario
                  formData={formData}
                  sedes={sedes}
                  isEditing={false}
                  onChange={setFormData}
                  onSubmit={handleCreateUsuario}
                  onCancel={cancelEditingUsuario}
                />
              )}

              <section style={getSectionStyles()}>
                <h3 style={getSectionTitleStyles()}>Personal</h3>
                <TablaUsuarios
                  usuarios={usuarios}
                  sedes={sedes}
                  isLoading={isLoading}
                  editingId={editingId}
                  formData={formData as CreateUsuarioRequest}
                  onStartEdit={startEditingUsuario}
                  onEditNombreChange={(value) => setFormData({ ...formData, nombre: value })}
                  onEditEmailChange={(value) => setFormData({ ...formData, email: value })}
                  onEditRolChange={(value) => setFormData({ ...formData, rol: value as RolUsuario })}
                  onUpdate={() => editingId && handleUpdateUsuario(editingId)}
                  onDelete={handleDeactivateUsuario}
                  onCancelEdit={cancelEditingUsuario}
                />
              </section>
            </div>
          </div>
        );

      case 'tarifas':
        return (
          <div style={getContentStyles()}>
            <div style={{ padding: tokens.spacing.page_gutter_desktop }}>
              <div style={getHeaderStyles()}>
                <h2 style={getTitleStyles()}>Gestión de Tarifas</h2>
                {!isCreatingTarifa && (
                  <button
                    type="button"
                    style={getEditButtonStyles()}
                    onClick={() => setIsCreatingTarifa(true)}
                  >
                    + Nueva Tarifa
                  </button>
                )}
              </div>

              {isCreatingTarifa && (
                <FormularioUsuario
                  formData={formData}
                  sedes={sedes}
                  isEditing={false}
                  onChange={setFormData}
                  onSubmit={handleCreateTarifa}
                  onCancel={cancelEditingTarifa}
                />
              )}

              <TablaTarifas
                tarifas={tarifas}
                isLoading={isLoading}
                editingId={tariffEditingId}
                formData={tarifaFormData}
                onStartEdit={startEditingTarifa}
                onEditMontoChange={(value) => setTarifaFormData({ ...tarifaFormData, monto: parseInt(value, 10) || 0 })}
                onUpdate={handleUpdateTarifa}
                onDelete={handleDeleteTarifa}
                onCancelEdit={cancelEditingTarifa}
              />
            </div>
          </div>
        );

      case 'bloqueos':
        return (
          <div style={getContentStyles()}>
            <div style={{ padding: tokens.spacing.page_gutter_desktop }}>
              <div style={getHeaderStyles()}>
                <h2 style={getTitleStyles()}>Jugadores Bloqueados</h2>
              </div>

              <JugadoresBloqueadosTable
                jugadores={jugadoresBloqueados}
                onDesbloquear={handleDesbloquearJugador}
              />
            </div>
          </div>
        );

      case 'reportes':
        return (
          <div style={getContentStyles()}>
            <GeneradorReportes
              onError={handleError}
              onSuccess={handleSuccess}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={getContainerStyles()}>
      <SidebarAdmin
        user={typedUser}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />
      <div style={{ position: 'relative', flex: 1 }}>
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: tokens.spacing.space_4,
              right: tokens.spacing.space_4,
              padding: `${tokens.spacing.space_4} ${tokens.spacing.space_6}`,
              borderRadius: tokens.radii.md,
              backgroundColor:
                notification.type === 'success'
                  ? tokens.colors.brand.green_100
                  : '#FDE7E7',
              border: `1px solid ${
                notification.type === 'success'
                  ? tokens.colors.brand.green_500
                  : tokens.colors.semantic.danger
              }`,
              color:
                notification.type === 'success'
                  ? tokens.colors.brand.green_800
                  : tokens.colors.semantic.danger,
              fontSize: '14px',
              fontFamily: tokens.typography.families.body,
              fontWeight: 500,
              boxShadow: tokens.shadows.modal,
              zIndex: 1000,
              animation: 'slideIn 300ms ease-out',
            }}
            role="alert"
          >
            {notification.message}
          </div>
        )}

        {renderTabContent()}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PanelAdminPage;