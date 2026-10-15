import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  Users,
  DollarSign,
  Shield,
  BarChart3,
  LayoutDashboard,
  LogOut,
  User,
  Settings,
  BookOpen,
} from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { useAuth } from '../../../context/AuthContext';
import type { RolUsuario } from '../../../types/models';

interface StaffLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
}

const getNavItemsForRole = (role: RolUsuario): NavItem[] => {
  switch (role) {
    case 'encargado':
      return [
        { id: 'agenda', label: 'Agenda', icon: <Calendar size={20} strokeWidth={1.75} />, route: '/agenda' },
        { id: 'reserva-presencial', label: 'Reserva Presencial', icon: <ClipboardList size={20} strokeWidth={1.75} />, route: '/reserva-presencial' },
        { id: 'jugadores', label: 'Jugadores', icon: <Users size={20} strokeWidth={1.75} />, route: '/jugadores' },
      ];
    case 'profesor':
      return [
        { id: 'mis-clases', label: 'Mis Clases', icon: <BookOpen size={20} strokeWidth={1.75} />, route: '/mis-clases' },
        { id: 'agenda', label: 'Agenda', icon: <Calendar size={20} strokeWidth={1.75} />, route: '/agenda' },
      ];
    case 'administrador':
      return [
        { id: 'panel', label: 'Panel', icon: <LayoutDashboard size={20} strokeWidth={1.75} />, route: '/admin' },
        { id: 'agenda', label: 'Agenda', icon: <Calendar size={20} strokeWidth={1.75} />, route: '/agenda' },
        { id: 'usuarios', label: 'Usuarios', icon: <Users size={20} strokeWidth={1.75} />, route: '/admin?tab=usuarios' },
        { id: 'tarifas', label: 'Tarifas', icon: <DollarSign size={20} strokeWidth={1.75} />, route: '/admin?tab=tarifas' },
        { id: 'bloqueos', label: 'Bloqueos', icon: <Shield size={20} strokeWidth={1.75} />, route: '/admin?tab=bloqueos' },
        { id: 'reportes', label: 'Reportes', icon: <BarChart3 size={20} strokeWidth={1.75} />, route: '/admin?tab=reportes' },
      ];
    default:
      return [];
  }
};

const getContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: tokens.colors.neutral.background,
});

const getSidebarStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  width: '260px',
  minHeight: '100vh',
  backgroundColor: tokens.colors.neutral.surface,
  borderRight: `1px solid ${tokens.colors.neutral.border}`,
});

const getHeaderStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_6,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getLogoStyles = (): React.CSSProperties => ({
  fontSize: '24px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.brand.green_700,
  letterSpacing: '0.01em',
  margin: 0,
});

const getUserSectionStyles = (): React.CSSProperties => ({
  marginTop: tokens.spacing.space_4,
  padding: tokens.spacing.space_3,
  backgroundColor: tokens.colors.brand.green_50,
  borderRadius: tokens.radii.md,
});

const getUserNameStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
});

const getUserRoleStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  textTransform: 'capitalize' as const,
});

const getNavStyles = (): React.CSSProperties => ({
  flex: 1,
  padding: tokens.spacing.space_4,
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_2,
});

const getNavItemBaseStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_3,
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  fontSize: '14px',
  fontWeight: 500,
  fontFamily: tokens.typography.families.body,
  textDecoration: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left' as const,
});

const getFooterStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_2,
});

const getLogoutButtonStyles = (): React.CSSProperties => ({
  ...getNavItemBaseStyles(),
  color: tokens.colors.semantic.danger,
});

const getContentStyles = (): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: tokens.colors.neutral.background,
  overflow: 'auto',
});

const getContentHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_desktop}`,
  backgroundColor: tokens.colors.neutral.surface,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  position: 'sticky' as const,
  top: 0,
  zIndex: 40,
  minHeight: '64px',
});

const getContentTitleStyles = (): React.CSSProperties => ({
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  margin: 0,
});

const getHeaderActionsStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_2,
});

const getIconButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  backgroundColor: 'transparent',
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  color: tokens.colors.neutral.text_secondary,
  transition: 'all 150ms ease-out',
});

const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    encargado: 'Encargado',
    profesor: 'Profesor',
    administrador: 'Administrador',
  };
  return roleNames[role] || role;
};

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = user && 'rol' in user ? user.rol : null;
  const navItems = role ? getNavItemsForRole(role) : [];

  const handleNavigate = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
    e.currentTarget.style.borderColor = tokens.colors.neutral.border_strong;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  };

  const getNavItemStyles = (isActive: boolean): React.CSSProperties => ({
    ...getNavItemBaseStyles(),
    backgroundColor: isActive ? tokens.colors.brand.green_100 : 'transparent',
    color: isActive ? tokens.colors.brand.green_800 : tokens.colors.neutral.text_secondary,
  });

  const getCurrentPageTitle = (): string => {
    const currentNav = navItems.find(item =>
      location.pathname === item.route ||
      (item.route.startsWith('/admin') && location.pathname.startsWith('/admin'))
    );
    return currentNav?.label || 'Panel';
  };

  if (!user || !role) {
    return null;
  }

  return (
    <div style={getContainerStyles()}>
      <aside style={getSidebarStyles()}>
        <div style={getHeaderStyles()}>
          <h1 style={getLogoStyles()}>Sporty</h1>
          <div style={getUserSectionStyles()}>
            <div style={getUserNameStyles()}>{user.nombre}</div>
            <div style={getUserRoleStyles()}>{getRoleDisplayName(role)}</div>
          </div>
        </div>

        <nav style={getNavStyles()}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.route ||
              (item.route.startsWith('/admin') && location.pathname.startsWith('/admin'));

            return (
              <button
                key={item.id}
                type="button"
                style={getNavItemStyles(isActive)}
                onClick={() => handleNavigate(item.route)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={getFooterStyles()}>
          <button
            type="button"
            style={getIconButtonStyles()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Configuración"
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            style={getLogoutButtonStyles()}
            onClick={handleLogout}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <LogOut size={20} strokeWidth={1.75} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main style={getContentStyles()}>
        <header style={getContentHeaderStyles()}>
          <h2 style={getContentTitleStyles()}>{getCurrentPageTitle()}</h2>
          <div style={getHeaderActionsStyles()}>
            <button
              type="button"
              style={getIconButtonStyles()}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Notificaciones"
            >
              <User size={20} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: tokens.spacing.page_gutter_desktop }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;