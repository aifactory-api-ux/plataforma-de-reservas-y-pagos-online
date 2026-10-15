import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Search, CreditCard, LogOut, User } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { useAuth } from '../../../context/AuthContext';

interface PlayerLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  route: string;
}

const navItems: NavItem[] = [
  { label: 'Buscar', icon: <Search size={24} strokeWidth={1.75} />, route: '/buscar-cancha' },
  { label: 'Mis Reservas', icon: <Calendar size={24} strokeWidth={1.75} />, route: '/mis-reservas' },
  { label: 'Pagar', icon: <CreditCard size={24} strokeWidth={1.75} />, route: '/pago' },
];

const getContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: tokens.colors.neutral.background,
});

const getHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
  backgroundColor: tokens.colors.neutral.surface,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  position: 'sticky',
  top: 0,
  zIndex: 50,
  minHeight: '56px',
});

const getLogoStyles = (): React.CSSProperties => ({
  fontSize: '20px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.brand.green_700,
  letterSpacing: '0.01em',
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

const getMainStyles = (): React.CSSProperties => ({
  flex: 1,
  paddingBottom: '80px',
  overflowY: 'auto' as const,
});

const getBottomNavStyles = (): React.CSSProperties => ({
  position: 'fixed' as const,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  backgroundColor: tokens.colors.neutral.surface,
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
  paddingTop: tokens.spacing.space_2,
  paddingBottom: `calc(${tokens.spacing.space_2} + env(safe-area-inset-bottom, 0px))`,
  paddingLeft: tokens.spacing.space_2,
  paddingRight: tokens.spacing.space_2,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const getNavItemStyles = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing.space_1,
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  borderRadius: tokens.radii.md,
  backgroundColor: isActive ? tokens.colors.brand.green_50 : 'transparent',
  color: isActive ? tokens.colors.brand.green_700 : tokens.colors.neutral.text_secondary,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  textDecoration: 'none',
  minWidth: '64px',
  minHeight: '48px',
  border: 'none',
  outline: 'none',
});

const getActiveIndicatorStyles = (): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '32px',
  height: '3px',
  backgroundColor: tokens.colors.brand.green_700,
  borderRadius: `0 0 ${tokens.radii.sm} ${tokens.radii.sm}`,
});

const getLabelStyles = (): React.CSSProperties => ({
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
});

const getUserAvatarStyles = (): React.CSSProperties => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: tokens.colors.brand.green_100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: tokens.colors.brand.green_700,
});

export const PlayerLayout: React.FC<PlayerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

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

  return (
    <div style={getContainerStyles()}>
      <header style={getHeaderStyles()}>
        <h1 style={getLogoStyles()}>Sporty</h1>
        <div style={getHeaderActionsStyles()}>
          <button
            type="button"
            style={getIconButtonStyles()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Perfil"
          >
            <div style={getUserAvatarStyles()}>
              <User size={16} strokeWidth={1.75} />
            </div>
          </button>
          <button
            type="button"
            style={getIconButtonStyles()}
            onClick={handleLogout}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main style={getMainStyles()}>
        {children}
      </main>

      <nav style={getBottomNavStyles()} aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive = location.pathname === item.route ||
            (item.route === '/buscar-cancha' && location.pathname.startsWith('/buscar'));

          return (
            <div key={item.route} style={{ position: 'relative' }}>
              <button
                type="button"
                style={getNavItemStyles(isActive)}
                onClick={() => handleNavigate(item.route)}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && <div style={getActiveIndicatorStyles()} />}
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                <span style={getLabelStyles()}>{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default PlayerLayout;