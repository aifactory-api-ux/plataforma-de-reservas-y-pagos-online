import React from 'react';
import { Calendar } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { BotonAccionPrincipal } from '../../ui/BotonAccionPrincipal';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  showActionButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  showActionButton = false,
  actionLabel = 'Acción',
  onAction,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.space_12} ${tokens.spacing.page_gutter_mobile}`,
    textAlign: 'center' as const,
  };

  const iconContainerStyles: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: tokens.colors.brand.green_50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.space_6,
  };

  const iconStyles: React.CSSProperties = {
    color: tokens.colors.brand.green_500,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    maxWidth: '280px',
    lineHeight: '20px',
  };

  const actionContainerStyles: React.CSSProperties = {
    marginTop: tokens.spacing.space_6,
  };

  return (
    <div style={containerStyles}>
      <div style={iconContainerStyles}>
        <Calendar size={40} strokeWidth={1.5} style={iconStyles} />
      </div>
      <h3 style={titleStyles}>{title}</h3>
      <p style={subtitleStyles}>{subtitle}</p>
      {showActionButton && onAction && (
        <div style={actionContainerStyles}>
          <BotonAccionPrincipal
            label={actionLabel}
            variant="primary"
            size="lg"
            onClick={onAction}
          />
        </div>
      )}
    </div>
  );
};

export default EmptyState;
