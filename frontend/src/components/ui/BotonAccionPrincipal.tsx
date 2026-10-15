import React from 'react';
import { tokens } from '../../styles/tokens';

export interface BotonAccionPrincipalProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

type VariantType = BotonAccionPrincipalProps['variant'];
type SizeType = BotonAccionPrincipalProps['size'];

interface VariantStyles {
  backgroundColor: string;
  color: string;
  border: string;
  hoverBackgroundColor: string;
}

interface SizeStyles {
  padding: string;
  fontSize: string;
  minHeight: string;
}

const getVariantStyles = (variant: VariantType = 'primary'): VariantStyles => {
  const variants: Record<Exclude<VariantType, undefined>, VariantStyles> = {
    primary: {
      backgroundColor: tokens.colors.brand.green_700,
      color: tokens.colors.neutral.white,
      border: 'none',
      hoverBackgroundColor: tokens.colors.brand.green_800,
    },
    secondary: {
      backgroundColor: tokens.colors.neutral.surface,
      color: tokens.colors.neutral.text_primary,
      border: `1px solid ${tokens.colors.neutral.border}`,
      hoverBackgroundColor: tokens.colors.neutral.surface_subtle,
    },
    danger: {
      backgroundColor: tokens.colors.semantic.danger,
      color: tokens.colors.neutral.white,
      border: 'none',
      hoverBackgroundColor: '#A82222',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: tokens.colors.neutral.text_primary,
      border: 'none',
      hoverBackgroundColor: tokens.colors.neutral.surface_subtle,
    },
    outline: {
      backgroundColor: 'transparent',
      color: tokens.colors.brand.green_700,
      border: `2px solid ${tokens.colors.brand.green_700}`,
      hoverBackgroundColor: tokens.colors.brand.green_50,
    },
  };
  return variants[variant];
};

const getSizeStyles = (size: SizeType = 'md'): SizeStyles => {
  const sizes: Record<Exclude<SizeType, undefined>, SizeStyles> = {
    sm: {
      padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
      fontSize: '14px',
      minHeight: '36px',
    },
    md: {
      padding: `${tokens.spacing.space_3} ${tokens.spacing.space_5}`,
      fontSize: '16px',
      minHeight: '44px',
    },
    lg: {
      padding: `${tokens.spacing.space_4} ${tokens.spacing.space_6}`,
      fontSize: '16px',
      minHeight: '56px',
    },
  };
  return sizes[size];
};

const getButtonStyles = (
  variant: VariantType,
  size: SizeType,
  disabled: boolean,
  loading: boolean,
  fullWidth: boolean
): React.CSSProperties => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
    fontFamily: tokens.typography.families.body,
    fontWeight: 700,
    lineHeight: sizeStyles.fontSize,
    letterSpacing: '0',
    borderRadius: tokens.radii.md,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 150ms ease-out',
    width: fullWidth ? '100%' : 'auto',
    ...variantStyles,
    ...sizeStyles,
    outline: 'none',
  };
};

const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
  e.currentTarget.style.boxShadow = tokens.shadows.focus_ring;
};

const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
  e.currentTarget.style.boxShadow = 'none';
};

const getSpinnerStyles = (): React.CSSProperties => ({
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
});

export const BotonAccionPrincipal: React.FC<BotonAccionPrincipalProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
}) => {
  const buttonStyles = getButtonStyles(variant, size, disabled, loading, fullWidth);

  return (
    <button
      type={type}
      style={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-busy={loading}
    >
      {loading ? (
        <span style={getSpinnerStyles()} />
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          <span>{label}</span>
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
};

export default BotonAccionPrincipal;
