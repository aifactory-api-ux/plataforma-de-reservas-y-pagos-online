import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

export interface ModalConfirmacionProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger';
  loading?: boolean;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'primary',
  loading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmFocused, setConfirmFocused] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        setConfirmFocused(true);
      }, 100);
    } else {
      document.body.style.overflow = '';
      setConfirmFocused(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (open && e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!open) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: tokens.colors.neutral.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: tokens.spacing.page_gutter_mobile,
    animation: 'fadeIn 150ms ease-out',
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.xl,
    boxShadow: tokens.shadows.modal,
    maxWidth: '420px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    animation: 'slideUp 200ms ease-out',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.space_6} ${tokens.spacing.space_6} ${tokens.spacing.space_4}`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    lineHeight: '28px',
    margin: 0,
    letterSpacing: '0.01em',
  };

  const closeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: tokens.radii.sm,
    cursor: 'pointer',
    color: tokens.colors.neutral.text_muted,
    transition: 'all 150ms ease-out',
    flexShrink: 0,
  };

  const bodyStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_6} ${tokens.spacing.space_6}`,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    lineHeight: '20px',
    margin: 0,
  };

  const footerStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_3,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_6} ${tokens.spacing.space_6}`,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
    justifyContent: 'flex-end',
  };

  const baseButtonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
    fontFamily: tokens.typography.families.body,
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '16px',
    letterSpacing: 0,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    minHeight: '44px',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_5}`,
    border: 'none',
    outline: 'none',
  };

  const cancelButtonStyles: React.CSSProperties = {
    ...baseButtonStyles,
    backgroundColor: tokens.colors.neutral.surface,
    color: tokens.colors.neutral.text_primary,
    border: `1px solid ${tokens.colors.neutral.border}`,
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
  };

  const confirmButtonStyles: React.CSSProperties = {
    ...baseButtonStyles,
    backgroundColor: variant === 'danger' ? tokens.colors.semantic.danger : tokens.colors.brand.green_700,
    color: tokens.colors.neutral.white,
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
  };

  const handleCloseMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
    }
  };

  const handleCloseMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface;
  };

  const handleConfirmMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.backgroundColor = variant === 'danger' ? '#A82222' : tokens.colors.brand.green_800;
    }
  };

  const handleConfirmMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = variant === 'danger' ? tokens.colors.semantic.danger : tokens.colors.brand.green_700;
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = tokens.shadows.focus_ring;
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      style={overlayStyles}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={modalStyles} ref={modalRef}>
        <div style={headerStyles}>
          <h2 id="modal-title" style={titleStyles}>{title}</h2>
          <button
            type="button"
            style={closeButtonStyles}
            onClick={onCancel}
            onMouseEnter={handleCloseMouseEnter}
            onMouseLeave={handleCloseMouseLeave}
            aria-label="Cerrar modal"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div style={bodyStyles}>
          <p style={descriptionStyles}>{description}</p>
        </div>

        <div style={footerStyles}>
          <button
            type="button"
            style={cancelButtonStyles}
            onClick={onCancel}
            onMouseEnter={handleCloseMouseEnter}
            onMouseLeave={handleCloseMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmFocused ? confirmButtonRef : undefined}
            style={confirmButtonStyles}
            onClick={onConfirm}
            onMouseEnter={handleConfirmMouseEnter}
            onMouseLeave={handleConfirmMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={loading}
            autoFocus={confirmFocused}
          >
            {loading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes fadeIn {
              from { opacity: 1; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                opacity: 1;
                transform: translateY(0);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(0deg); }
            }
          }
        `}
      </style>
    </div>
  );
};

export default ModalConfirmacion;
