import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Calendar, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Clase } from '../../../types/models';

export interface TarjetaClaseProps {
  clase: Clase;
  isPast?: boolean;
  onCancel?: (clase: Clase) => void;
  onEdit?: (clase: Clase) => void;
  onSelect?: (clase: Clase) => void;
}

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayName = dias[date.getDay()];
  const dayNum = date.getDate();
  const month = meses[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dayName} ${dayNum} ${month}, ${hours}:${minutes}`;
};

const getDuracionHoras = (inicio: string, fin: string): string => {
  const horas = new Date(fin).getHours() - new Date(inicio).getHours();
  return `${horas}h`;
};

export const TarjetaClase: React.FC<TarjetaClaseProps> = ({
  clase,
  isPast = false,
  onCancel,
  onEdit,
  onSelect,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(clase);
    } else {
      navigate(`/clases/${clase.id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(clase);
    } else {
      navigate(`/clases/${clase.id}/editar`);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancel) {
      onCancel(clase);
    }
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_4,
    marginBottom: tokens.spacing.space_3,
    boxShadow: tokens.shadows.card,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeft: isPast ? 'none' : `4px solid ${tokens.colors.brand.green_500}`,
    opacity: isPast ? 0.7 : 1,
  };

  const claseInfoStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
    flex: 1,
  };

  const claseTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    margin: 0,
  };

  const claseMetaStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_4,
    flexWrap: 'wrap' as const,
  };

  const metaItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_1,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const actionButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.sm,
    cursor: 'pointer',
    color: tokens.colors.neutral.text_muted,
    transition: 'all 150ms ease-out',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPast) {
      e.currentTarget.style.boxShadow = tokens.shadows.card_hover;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = tokens.shadows.card;
    e.currentTarget.style.transform = 'translateY(0)';
  };

  const handleEditMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
  };

  const handleEditMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleCancelMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = tokens.colors.semantic.danger;
    e.currentTarget.style.borderColor = tokens.colors.semantic.danger;
  };

  const handleCancelMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = tokens.colors.neutral.text_muted;
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  };

  return (
    <div
      style={cardStyles}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      <div style={claseInfoStyles}>
        <h3 style={claseTitleStyles}>{clase.nombre}</h3>
        <div style={claseMetaStyles}>
          <span style={metaItemStyles}>
            <Calendar size={14} strokeWidth={1.75} />
            {formatDateTime(clase.inicio)}
          </span>
          <span style={metaItemStyles}>
            <Clock size={14} strokeWidth={1.75} />
            {getDuracionHoras(clase.inicio, clase.fin)}
          </span>
          <span style={metaItemStyles}>
            <Users size={14} strokeWidth={1.75} />
            {clase.cupos} cupos
          </span>
        </div>
      </div>

      <div style={actionsStyles}>
        <button
          type="button"
          style={actionButtonStyles}
          onClick={handleEditClick}
          onMouseEnter={handleEditMouseEnter}
          onMouseLeave={handleEditMouseLeave}
          aria-label="Editar clase"
        >
          <Edit2 size={16} strokeWidth={1.75} />
        </button>
        {!isPast && (
          <button
            type="button"
            style={actionButtonStyles}
            onClick={handleCancelClick}
            onMouseEnter={handleCancelMouseEnter}
            onMouseLeave={handleCancelMouseLeave}
            aria-label="Cancelar clase"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        )}
        <ChevronRight size={20} strokeWidth={1.75} color={tokens.colors.neutral.text_muted} />
      </div>
    </div>
  );
};
