import React from 'react';
import { Check } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  error,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacing.space_3,
    padding: tokens.spacing.space_4,
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    border: error
      ? `1px solid ${tokens.colors.semantic.danger}`
      : `1px solid ${tokens.colors.neutral.border}`,
    transition: 'border-color 150ms ease-out',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };

  const checkboxWrapperStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    minWidth: '24px',
    backgroundColor: checked
      ? tokens.colors.brand.green_700
      : tokens.colors.neutral.surface,
    border: `2px solid ${
      checked
        ? tokens.colors.brand.green_700
        : tokens.colors.neutral.border_strong
    }`,
    borderRadius: tokens.radii.sm,
    transition: 'all 150ms ease-out',
    flexShrink: 0,
  };

  const checkIconStyles: React.CSSProperties = {
    color: tokens.colors.neutral.white,
    opacity: checked ? 1 : 0,
    transform: checked ? 'scale(1)' : 'scale(0.5)',
    transition: 'all 150ms ease-out',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    lineHeight: 1.4,
    userSelect: 'none' as const,
  };

  const linkStyles: React.CSSProperties = {
    color: tokens.colors.brand.green_700,
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const errorTextStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.semantic.danger,
    marginTop: tokens.spacing.space_2,
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
      style={containerStyles}
    >
      <div style={checkboxWrapperStyles}>
        <Check
          size={16}
          strokeWidth={2.5}
          style={checkIconStyles}
        />
      </div>
      <div style={contentStyles}>
        <label style={labelStyles}>
          Acepto los{' '}
          <span
            style={linkStyles}
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            términos y condiciones
          </span>
          {' '}y la{' '}
          <span
            style={linkStyles}
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            política de cancelación
          </span>
          . Entiendo que mi reserva estará vigente durante 10 minutos hasta completar el pago.
        </label>
        {error && <div style={errorTextStyles}>{error}</div>}
      </div>
    </div>
  );
};

export default TermsCheckbox;
