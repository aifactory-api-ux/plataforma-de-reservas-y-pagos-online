import React from 'react';
import { Check } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

export interface ConsentimientoCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const containerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing.space_3,
  padding: tokens.spacing.space_4,
  backgroundColor: tokens.colors.neutral.surface_subtle,
  borderRadius: tokens.radii.md,
  border: `1px solid ${tokens.colors.neutral.border}`,
};

const checkboxWrapperStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  flexShrink: 0,
  cursor: 'pointer',
};

const getCheckboxStyles = (checked: boolean, disabled?: boolean): React.CSSProperties => ({
  width: '20px',
  height: '20px',
  borderRadius: tokens.radii.sm,
  border: checked
    ? `2px solid ${tokens.colors.brand.green_700}`
    : `2px solid ${tokens.colors.neutral.border_strong}`,
  backgroundColor: checked ? tokens.colors.brand.green_700 : 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 150ms ease-out',
  opacity: disabled ? 0.5 : 1,
});

const getLabelStyles = (disabled?: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_1,
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const titleStyles: React.CSSProperties = {
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  fontWeight: 600,
  color: tokens.colors.neutral.text_primary,
  lineHeight: '20px',
};

const descriptionStyles: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
  lineHeight: '16px',
};

const linkStyles: React.CSSProperties = {
  color: tokens.colors.brand.green_700,
  textDecoration: 'none',
  fontWeight: 600,
};

export const ConsentimientoCheckbox: React.FC<ConsentimientoCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const handleClick = (): void => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div style={containerStyles}>
      <div
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={checkboxWrapperStyles}
      >
        <div style={getCheckboxStyles(checked, disabled)}>
          {checked && <Check size={14} color={tokens.colors.neutral.white} strokeWidth={3} />}
        </div>
      </div>
      <div style={getLabelStyles(disabled)} onClick={handleClick} onKeyDown={handleKeyDown}>
        <span style={titleStyles}>Acepto la política de datos personales</span>
        <span style={descriptionStyles}>
          He leído y acepto el tratamiento de mis datos personales según la{' '}
          <a href="/privacidad" style={linkStyles} onClick={(e) => e.stopPropagation()}>
            Ley 19.628
          </a>{' '}
          de Protección de la Vida Privada.
        </span>
      </div>
    </div>
  );
};

export default ConsentimientoCheckbox;
