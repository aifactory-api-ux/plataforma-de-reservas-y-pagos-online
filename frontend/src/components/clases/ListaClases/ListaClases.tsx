import React from 'react';
import { tokens } from '../../../styles/tokens';
import type { Clase } from '../../../types/models';
import { TarjetaClase } from '../TarjetaClase/TarjetaClase';
import EmptyState from '../../ui/EmptyState';

export interface ListaClasesProps {
  clases: Clase[];
  isLoading?: boolean;
  error?: string | null;
  isPast?: boolean;
  onCancel?: (clase: Clase) => void;
  onEdit?: (clase: Clase) => void;
  onSelect?: (clase: Clase) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

const ListaClases: React.FC<ListaClasesProps> = ({
  clases,
  isLoading = false,
  error = null,
  isPast = false,
  onCancel,
  onEdit,
  onSelect,
  emptyTitle = 'No hay clases',
  emptyDescription = 'No hay clases para mostrar',
}) => {
  if (isLoading) {
    return (
      <div style={loadingContainerStyles}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={skeletonCardStyles}>
            <div style={skeletonTitleStyles} />
            <div style={skeletonMetaStyles} />
          </div>
        ))}
        <style>
          {`
            @keyframes skeleton-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.55; }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error"
        description={error}
      />
    );
  }

  if (clases.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div style={listContainerStyles}>
      {clases.map((clase) => (
        <TarjetaClase
          key={clase.id}
          clase={clase}
          isPast={isPast}
          onCancel={onCancel}
          onEdit={onEdit}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

const listContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const loadingContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const skeletonCardStyles: React.CSSProperties = {
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing.space_4,
  marginBottom: tokens.spacing.space_3,
  height: '80px',
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
};

const skeletonTitleStyles: React.CSSProperties = {
  height: '18px',
  width: '60%',
  backgroundColor: tokens.colors.neutral.border,
  borderRadius: tokens.radii.sm,
  marginBottom: tokens.spacing.space_2,
};

const skeletonMetaStyles: React.CSSProperties = {
  height: '14px',
  width: '40%',
  backgroundColor: tokens.colors.neutral.border,
  borderRadius: tokens.radii.sm,
};

export { ListaClases };
