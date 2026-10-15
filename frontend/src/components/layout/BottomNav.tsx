import React from 'react';
import {
  Calendar,
  Search,
  CreditCard,
} from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface BottomNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const navItems = [
  { label: 'Buscar', icon: 'search', route: '/buscar' },
  { label: 'Mis Reservas', icon: 'calendar', route: '/mis-reservas' },
  { label: 'Pagar', icon: 'creditcard', route: '/pago' },
];

const iconMap: Record<string, React.ReactNode> = {
  search: <Search size={24} strokeWidth={1.75} />,
  calendar: <Calendar size={24} strokeWidth={1.75} />,
  creditcard: <CreditCard size={24} strokeWidth={1.75} />,
};

export const BottomNav: React.FC<BottomNavProps> = ({
  activeRoute,
  onNavigate,
}) => {
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
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
  };

  const getNavItemStyles = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_1,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
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
    minWidth: '64px',
    minHeight: '48px',
    border: 'none',
    outline: 'none',
  });

  const activeIndicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '32px',
    height: '3px',
    backgroundColor: tokens.colors.brand.green_700,
    borderRadius: `0 0 ${tokens.radii.sm} ${tokens.radii.sm}`,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <nav style={containerStyles} aria-label="Navegación inferior para jugadores">
      {navItems.map((item) => {
        const isActive = activeRoute === item.route;
        const icon = iconMap[item.icon] || <Calendar size={24} strokeWidth={1.75} />;

        return (
          <div key={item.route} style={{ position: 'relative' }}>
            <button
              type="button"
              style={getNavItemStyles(isActive)}
              onClick={() => onNavigate(item.route)}
              onMouseEnter={(e) => handleMouseEnter(e, isActive)}
              onMouseLeave={(e) => handleMouseLeave(e, isActive)}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && <div style={activeIndicatorStyles} />}
              <span style={{ flexShrink: 0 }}>{icon}</span>
              <span style={labelStyles}>{item.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
};

export default BottomNav;