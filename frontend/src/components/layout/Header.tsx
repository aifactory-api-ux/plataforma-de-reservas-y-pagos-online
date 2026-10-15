import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import type { UsuarioPersonal } from '../../types/models';

export interface HeaderProps {
  user?: UsuarioPersonal | null;
  sedeNombre?: string;
  onLogout: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  sedeNombre,
  onLogout,
  onProfileClick,
}) => {
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_desktop}`,
    backgroundColor: tokens.colors.neutral.surface,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    boxShadow: tokens.shadows.sticky_header,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    minHeight: '64px',
  };

  const leftSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_4,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
    letterSpacing: '0.01em',
    margin: 0,
  };

  const sedeStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    backgroundColor: tokens.colors.brand.green_50,
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    fontWeight: 600,
    color: tokens.colors.brand.green_800,
  };

  const rightSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const iconButtonStyles: React.CSSProperties = {
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
    position: 'relative',
  };

  const userButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: onProfileClick ? 'pointer' : 'default',
    transition: 'all 150ms ease-out',
  };

  const userAvatarStyles: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: tokens.colors.brand.green_100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colors.brand.green_700,
  };

  const userNameStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    textAlign: 'left' as const,
  };

  const userRoleStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    textTransform: 'capitalize' as const,
  };

  const notificationBadgeStyles: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    backgroundColor: tokens.colors.semantic.danger,
    borderRadius: '50%',
    border: '2px solid white',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
    e.currentTarget.style.borderColor = tokens.colors.neutral.border_strong;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      encargado: 'Encargado',
      profesor: 'Profesor',
      administrador: 'Administrador',
    };
    return roleNames[role] || role;
  };

  return (
    <header style={headerStyles}>
      <div style={leftSectionStyles}>
        <h1 style={logoStyles}>Sporty</h1>
        {sedeNombre && (
          <div style={sedeStyles}>
            <span>{sedeNombre}</span>
          </div>
        )}
      </div>

      <div style={rightSectionStyles}>
        <button
          type="button"
          style={iconButtonStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Notificaciones"
        >
          <Bell size={20} strokeWidth={1.75} />
          <span style={notificationBadgeStyles} aria-hidden="true" />
        </button>

        {user && (
          <button
            type="button"
            style={userButtonStyles}
            onClick={onProfileClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Perfil de usuario"
          >
            <div style={userAvatarStyles}>
              <User size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div style={userNameStyles}>{user.nombre}</div>
              <div style={userRoleStyles}>{getRoleDisplayName(user.rol)}</div>
            </div>
          </button>
        )}

        <button
          type="button"
          style={iconButtonStyles}
          onClick={onLogout}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Cerrar sesión"
        >
          <LogOut size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
};

export default Header;