import React from 'react';
import { tokens } from '../../styles/tokens';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
}) => {
  const containerStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: tokens.spacing.space_12,
    color: tokens.colors.neutral.text_muted,
  };

  const iconStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_4,
    color: tokens.colors.neutral.text_muted,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    marginBottom: tokens.spacing.space_2,
    color: tokens.colors.neutral.text_secondary,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  return (
    <div style={containerStyles}>
      {icon && <div style={iconStyles}>{icon}</div>}
      <p style={titleStyles}>{title}</p>
      <p style={descriptionStyles}>{description}</p>
    </div>
  );
};

export default EmptyState;