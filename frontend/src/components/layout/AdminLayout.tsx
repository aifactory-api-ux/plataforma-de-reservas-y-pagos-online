import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Shield,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { tokens } from '../../styles/tokens';
import type { UsuarioPersonal } from '../../types/models';

export interface AdminLayoutProps {
  children: React.ReactNode;
  user: UsuarioPersonal;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
}

const navItems: NavItem[] = [
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: <Users size={20} strokeWidth={1.75} />,
    route: '/admin?tab=usuarios',
  },
  {
    id: 'tarifas',
    label: 'Tarifas',
    icon: <DollarSign size={20} strokeWidth={1.75} />,
    route: '/admin?tab=tarifas',
  },
  {
    id: 'bloqueos',
    label: 'Bloqueos',
    icon: <Shield size={20} strokeWidth={1.75} />,
    route: '/admin?tab=bloqueos',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: <BarChart3 size={20} strokeWidth={1.75} />,
    route: '/admin?tab=reportes',
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = new URLSearchParams(location.search).get('tab') || 'usuarios';

  const handleNavClick = (route: string) => {
    navigate(route);
  };

  const sidebarStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '260px',
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.surface,
    borderRight: `1px solid ${tokens.colors.neutral.border}`,
  };

  const headerStyles: React.CSSProperties = {
    padding: tokens.spacing.space_6,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
    letterSpacing: '0.01em',
    margin: 0,
  };

  const userSectionStyles: React.CSSProperties = {
    marginTop: tokens.spacing.space_4,
    padding: `${tokens.spacing.space_3}`,
    backgroundColor: tokens.colors.brand.green_50,
    borderRadius: tokens.radii.md,
  };

  const userNameStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const userRoleStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    textTransform: 'capitalize' as const,
  };

  const navStyles: React.CSSProperties = {
    flex: 1,
    padding: tokens.spacing.space_4,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
  };

  const navItemBaseStyles: React.CSSProperties = {
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
  };

  const getNavItemStyles = (isActive: boolean): React.CSSProperties => ({
    ...navItemBaseStyles,
    backgroundColor: isActive
      ? tokens.colors.brand.green_100
      : 'transparent',
    color: isActive
      ? tokens.colors.brand.green_800
      : tokens.colors.neutral.text_secondary,
  });

  const footerStyles: React.CSSProperties = {
    padding: tokens.spacing.space_4,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  };

  const logoutButtonStyles: React.CSSProperties = {
    ...navItemBaseStyles,
    color: tokens.colors.semantic.danger,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colors.neutral.background,
    overflow: 'auto',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyles}>
        <div style={headerStyles}>
          <h1 style={logoStyles}>Sporty</h1>
          <div style={userSectionStyles}>
            <div style={userNameStyles}>{user.nombre}</div>
            <div style={userRoleStyles}>{user.rol}</div>
          </div>
        </div>

        <nav style={navStyles}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              style={getNavItemStyles(activeTab === item.id)}
              onClick={() => handleNavClick(item.route)}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={footerStyles}>
          <button
            type="button"
            style={logoutButtonStyles}
            onClick={onLogout}
          >
            <LogOut size={20} strokeWidth={1.75} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main style={contentStyles}>{children}</main>
    </div>
  );
};

export default AdminLayout;