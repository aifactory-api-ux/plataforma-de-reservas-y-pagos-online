import React from 'react';
import { Clock, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { AgendaRow } from '../../../services/sedes.service';

export interface EstadisticasPanelProps {
  reservations: AgendaRow[];
  date: Date;
  onFilterByStatus?: (status: string) => void;
}

interface StatusCount {
  retenida: number;
  pagada: number;
  cancelada: number;
  asistio: number;
  no_asistio: number;
}

const getContainerStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.card,
  padding: tokens.spacing.space_4,
  width: '240px',
  flexShrink: 0,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  letterSpacing: '0.01em',
  marginBottom: tokens.spacing.space_4,
});

const getStatsGridStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: tokens.spacing.space_3,
  marginBottom: tokens.spacing.space_5,
});

const getStatCardStyles = (fillColor?: string, borderColor?: string): React.CSSProperties => ({
  padding: tokens.spacing.space_3,
  backgroundColor: fillColor || tokens.colors.neutral.surface_subtle,
  borderRadius: tokens.radii.md,
  border: `1px solid ${borderColor || tokens.colors.neutral.border}`,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
});

const getStatValueStyles = (): React.CSSProperties => ({
  fontSize: '24px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.numeric,
  color: tokens.colors.neutral.text_primary,
  lineHeight: 1,
});

const getStatLabelStyles = (): React.CSSProperties => ({
  fontSize: '10px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
});

const getSummarySectionStyles = (): React.CSSProperties => ({
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
  paddingTop: tokens.spacing.space_4,
  marginTop: tokens.spacing.space_4,
});

const getSummaryTitleStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  marginBottom: tokens.spacing.space_3,
});

const getSummaryRowStyles = (): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${tokens.spacing.space_2} 0`,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getSummaryLabelStyles = (): React.CSSProperties => ({
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
});

const getSummaryValueStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.numeric,
  color: tokens.colors.neutral.text_primary,
});

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock size={16} strokeWidth={1.75} />,
  check_circle: <CheckCircle size={16} strokeWidth={1.75} />,
  x_circle: <XCircle size={16} strokeWidth={1.75} />,
  user_check: <UserCheck size={16} strokeWidth={1.75} />,
  user_x: <UserX size={16} strokeWidth={1.75} />,
};

const EstadisticasPanel: React.FC<EstadisticasPanelProps> = ({
  reservations,
  date,
  onFilterByStatus,
}) => {
  const getStatusCounts = (): StatusCount => {
    const counts: StatusCount = {
      retenida: 0,
      pagada: 0,
      cancelada: 0,
      asistio: 0,
      no_asistio: 0,
    };

    reservations.forEach((row) => {
      row.reservas.forEach((res) => {
        if (res.estado in counts) {
          counts[res.estado as keyof StatusCount]++;
        }
      });
    });

    return counts;
  };

  const counts = getStatusCounts();
  const totalReservas = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const getOccupancyRate = (): number => {
    if (totalReservas === 0) return 0;
    const completedReservas = counts.pagada + counts.asistio;
    return Math.round((completedReservas / totalReservas) * 100);
  };

  const getAttendanceRate = (): number => {
    const attendedOrNoShow = counts.asistio + counts.no_asistio;
    if (attendedOrNoShow === 0) return 0;
    return Math.round((counts.asistio / attendedOrNoShow) * 100);
  };

  const statusConfig: Array<{
    key: keyof StatusCount;
    label: string;
    fill: string;
    border: string;
    text: string;
    icon: string;
  }> = [
    {
      key: 'pagada',
      ...tokens.colors.reservation_status.pagada,
      label: 'Pagadas',
    },
    {
      key: 'retenida',
      ...tokens.colors.reservation_status.retenida,
      label: 'Retenidas',
    },
    {
      key: 'asistio',
      ...tokens.colors.reservation_status.asistio,
      label: 'Asistieron',
    },
    {
      key: 'cancelada',
      ...tokens.colors.reservation_status.cancelada,
      label: 'Canceladas',
    },
    {
      key: 'no_asistio',
      ...tokens.colors.reservation_status.no_asistio,
      label: 'No asist.',
    },
  ];

  const handleStatClick = (status: string) => {
    if (onFilterByStatus) {
      onFilterByStatus(status);
    }
  };

  const formatDate = (d: Date): string => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  return (
    <div style={getContainerStyles()}>
      <h3 style={getTitleStyles()}>Estadísticas</h3>

      <div style={getStatsGridStyles()}>
        {statusConfig.map((status) => (
          <div
            key={status.key}
            style={getStatCardStyles(status.fill, status.border)}
            onClick={() => handleStatClick(status.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStatClick(status.key);
              }
            }}
            aria-label={`${status.label}: ${counts[status.key]}`}
          >
            <span style={{ color: status.text, display: 'flex' }}>
              {iconMap[status.icon]}
            </span>
            <span style={getStatValueStyles()}>{counts[status.key]}</span>
            <span style={getStatLabelStyles()}>{status.label}</span>
          </div>
        ))}
      </div>

      <div style={getSummarySectionStyles()}>
        <h4 style={getSummaryTitleStyles()}>Resumen del día</h4>

        <div style={getSummaryRowStyles()}>
          <span style={getSummaryLabelStyles()}>Fecha</span>
          <span style={getSummaryValueStyles()}>{formatDate(date)}</span>
        </div>

        <div style={getSummaryRowStyles()}>
          <span style={getSummaryLabelStyles()}>Total reservas</span>
          <span style={getSummaryValueStyles()}>{totalReservas}</span>
        </div>

        <div style={getSummaryRowStyles()}>
          <span style={getSummaryLabelStyles()}>Ocupación</span>
          <span style={getSummaryValueStyles()}>{getOccupancyRate()}%</span>
        </div>

        <div style={{ ...getSummaryRowStyles(), borderBottom: 'none' }}>
          <span style={getSummaryLabelStyles()}>Asistencia</span>
          <span style={getSummaryValueStyles()}>{getAttendanceRate()}%</span>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPanel;