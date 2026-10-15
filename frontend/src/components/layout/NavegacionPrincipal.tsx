import React from 'react';
import {
  Calendar,
  Search,
  CreditCard,
  ClipboardList,
  Users,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavegacionPrincipalProps {
  items: NavItem[];
  activeRoute: string;
  role: 'jugador' | 'encargado' | 'profesor' | 'administrador';
  onSelect: (route: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  calendar: <Calendar size={24} strokeWidth={1.75} />,
  search: <Search size={24} strokeWidth={1.75} />,
  creditcard: <CreditCard size={24} strokeWidth={1.75} />,
  clipboard: <ClipboardList size={24} strokeWidth={1.75} />,
  users: <Users size={24} strokeWidth={1.75} />,
  settings: <Settings size={24} strokeWidth={1.75} />,
  dashboard: <LayoutDashboard size={24} strokeWidth={1.75} />,
};

const getNavItemsForRole = (role: NavegacionPrincipalProps['role']): NavItem[] => {
  const commonItems: NavItem[] = [];

  switch (role) {
    case 'jugador':
      return [
        { label: 'Buscar', icon: 'search', route: '/buscar' },
        { label: 'Mis Reservas', icon: 'calendar', route: '/mis-reservas' },
        { label: 'Mis Clases', icon: 'users', route: '/mis-clases' },
      ];
    case 'encargado':
      return [
        { label: 'Agenda', icon: 'calendar', route: '/agenda' },
        { label: 'Reserva Presencial', icon: 'clipboard', route: '/reserva-presencial' },
        { label: 'Jugadores', icon: 'users', route: '/jugadores' },
      ];
    case 'profesor':
      return [
        { label: 'Mis Clases', icon: 'calendar', route: '/mis-clases' },
        { label: 'Agenda', icon: 'clipboard', route: '/agenda' },
      ];
    case 'administrador':
      return [
        { label: 'Panel', icon: 'dashboard', route: '/panel' },
        { label: 'Agenda', icon: 'calendar', route: '/agenda' },
        { label: 'Usuarios', icon: 'users', route: '/usuarios' },
        { label: 'Configuración', icon: 'settings', route: '/configuracion' },
      ];
    default:
      return commonItems;
  }
};

export const NavegacionPrincipal: React.FC<NavegacionPrincipalProps> = ({
  items,
  activeRoute,
  role,
  onSelect,
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    ...(isMobile
      ? {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderTop: `1px solid ${tokens.colors.neutral.border}`,
          paddingTop: tokens.spacing.space_2,
          paddingBottom: tokens.spacing.space_2,
          paddingLeft: tokens.spacing.space_2,
          paddingRight: tokens.spacing.space_2,
        }
      : {
          width: '240px',
          minHeight: '100vh',
          borderRight: `1px solid ${tokens.colors.neutral.border}`,
          padding: tokens.spacing.space_4,
          display: 'flex',
          flexDirection: 'column',
        }),
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
    letterSpacing: '0.01em',
    marginBottom: tokens.spacing.space_6,
    padding: isMobile ? `0 ${tokens.spacing.space_2}` : 0,
  };

  const navListStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: isMobile ? 0 : tokens.spacing.space_1,
    flex: 1,
    justifyContent: isMobile ? 'space-around' : 'flex-start',
  };

  const getNavItemStyles = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_1,
    padding: isMobile
      ? `${tokens.spacing.space_2} ${tokens.spacing.space_3}`
      : `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    borderRadius: tokens.radii.md,
    backgroundColor: isActive
      ? tokens.colors.brand.green_50
      : 'transparent',
    color: isActive
      ? tokens.colors.brand.green_700
      : tokens.colors.neutral.text_secondary,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    textDecoration: 'none',
    minWidth: isMobile ? '64px' : 'auto',
    minHeight: '48px',
  });

  const activeIndicatorStyles: React.CSSProperties = {
    position: 'absolute',
    ...(isMobile
      ? {
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '32px',
          height: '3px',
          backgroundColor: tokens.colors.brand.green_700,
          borderRadius: `0 0 ${tokens.radii.sm} ${tokens.radii.sm}`,
        }
      : {
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '24px',
          backgroundColor: tokens.colors.brand.green_700,
          borderRadius: `0 ${tokens.radii.sm} ${tokens.radii.sm} 0`,
        }),
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  const navItems = items.length > 0 ? items : getNavItemsForRole(role);

  return (
    <nav style={containerStyles} aria-label={`Navegación principal para ${role}`}>
      <div style={logoStyles}>Sporty</div>

      <ul style={navListStyles} role="list">
        {navItems.map((item) => {
          const isActive = activeRoute === item.route;
          const icon = iconMap[item.icon] || <Calendar size={24} strokeWidth={1.75} />;

          return (
            <li key={item.route} style={{ position: 'relative' }}>
              <div
                style={getNavItemStyles(isActive)}
                onClick={() => onSelect(item.route)}
                onMouseEnter={(e) => handleMouseEnter(e, isActive)}
                onMouseLeave={(e) => handleMouseLeave(e, isActive)}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(item.route);
                  }
                }}
              >
                {isActive && <div style={activeIndicatorStyles} />}
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <span style={labelStyles}>{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavegacionPrincipal;