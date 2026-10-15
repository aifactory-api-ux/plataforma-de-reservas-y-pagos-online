import React, { useState, useEffect, useCallback } from 'react';
import { Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { adminService, EstadisticasResumen, ReporteReservasParams, ReportePagosParams, ReporteNoShowsParams } from '../../../services/admin.service';
import type { Sede } from '../../../types/models';

interface GeneradorReportesProps {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

type ReportType = 'reservas' | 'pagos' | 'no-shows' | 'estadisticas';

interface ReportConfig {
  value: ReportType;
  label: string;
  description: string;
}

const REPORT_TYPES: ReportConfig[] = [
  {
    value: 'reservas',
    label: 'Reporte de Reservas',
    description: 'Lista de reservas con estado, cancha, jugador y horario',
  },
  {
    value: 'pagos',
    label: 'Reporte de Pagos',
    description: 'Detalle de pagos realizados con montos y estados',
  },
  {
    value: 'no-shows',
    label: 'Reporte de No-Shows',
    description: 'Reservas donde los jugadores no asistieron',
  },
  {
    value: 'estadisticas',
    label: 'Estadísticas Generales',
    description: 'Resumen con totales y porcentajes de ocupación',
  },
];

const getContainerStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.page_gutter_desktop,
});

const getHeaderStyles = (): React.CSSProperties => ({
  marginBottom: tokens.spacing.space_6,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '22px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  margin: 0,
});

const getCardStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing.space_6,
  boxShadow: tokens.shadows.card,
  marginBottom: tokens.spacing.space_6,
});

const getFormGridStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: tokens.spacing.space_6,
  marginBottom: tokens.spacing.space_6,
});

const getFormGroupStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.space_2,
});

const getLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_2,
});

const getInputStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_3,
  border: `1px solid ${tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
});

const getSelectStyles = (): React.CSSProperties => ({
  ...getInputStyles(),
  cursor: 'pointer',
});

const getReportOptionsStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: tokens.spacing.space_4,
});

const getReportOptionStyles = (isSelected: boolean): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
  border: `2px solid ${isSelected ? tokens.colors.brand.green_500 : tokens.colors.neutral.border}`,
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  backgroundColor: isSelected ? tokens.colors.brand.green_50 : tokens.colors.neutral.surface,
  transition: 'all 150ms ease-out',
});

const getReportTitleStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  marginBottom: tokens.spacing.space_1,
});

const getReportDescStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  margin: 0,
});

const getStatsGridStyles = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: tokens.spacing.space_4,
});

const getStatCardStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
  backgroundColor: tokens.colors.neutral.surface_subtle,
  borderRadius: tokens.radii.md,
  textAlign: 'center' as const,
});

const getStatValueStyles = (): React.CSSProperties => ({
  fontSize: '28px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.brand.green_700,
  marginBottom: tokens.spacing.space_1,
});

const getStatLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

const getDefaultFechaInicio = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

const getDefaultFechaFin = (): string => {
  return new Date().toISOString().split('T')[0];
};

interface ReportTypeSelectorProps {
  selectedReport: ReportType;
  onSelect: (report: ReportType) => void;
}

const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
  selectedReport,
  onSelect,
}) => {
  return (
    <div style={getFormGroupStyles()}>
      <label style={getLabelStyles()}>
        <FileSpreadsheet size={14} strokeWidth={1.75} />
        Tipo de Reporte
      </label>
      <div style={getReportOptionsStyles()}>
        {REPORT_TYPES.map((report) => (
          <div
            key={report.value}
            style={getReportOptionStyles(selectedReport === report.value)}
            onClick={() => onSelect(report.value)}
          >
            <div style={getReportTitleStyles()}>{report.label}</div>
            <p style={getReportDescStyles()}>{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DateRangeFilterProps {
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (value: string) => void;
  onFechaFinChange: (value: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
}) => {
  return (
    <div style={getFormGridStyles()}>
      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>
          <Calendar size={14} strokeWidth={1.75} />
          Fecha Inicio
        </label>
        <input
          type="date"
          style={getInputStyles()}
          value={fechaInicio}
          onChange={(e) => onFechaInicioChange(e.target.value)}
        />
      </div>

      <div style={getFormGroupStyles()}>
        <label style={getLabelStyles()}>
          <Calendar size={14} strokeWidth={1.75} />
          Fecha Fin
        </label>
        <input
          type="date"
          style={getInputStyles()}
          value={fechaFin}
          onChange={(e) => onFechaFinChange(e.target.value)}
        />
      </div>
    </div>
  );
};

interface SedeFilterProps {
  sedes: Sede[];
  selectedSedeId: number | undefined;
  onSedeChange: (sedeId: number | undefined) => void;
}

const SedeFilter: React.FC<SedeFilterProps> = ({
  sedes,
  selectedSedeId,
  onSedeChange,
}) => {
  return (
    <div style={getFormGroupStyles()}>
      <label style={getLabelStyles()}>
        <Filter size={14} strokeWidth={1.75} />
        Sede (Opcional)
      </label>
      <select
        style={getSelectStyles()}
        value={selectedSedeId || ''}
        onChange={(e) =>
          onSedeChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
        }
      >
        <option value="">Todas las sedes</option>
        {sedes.map((sede) => (
          <option key={sede.id} value={sede.id}>
            {sede.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

interface EstadisticasGridProps {
  estadisticas: EstadisticasResumen;
  isLoading: boolean;
}

const EstadisticasGrid: React.FC<EstadisticasGridProps> = ({
  estadisticas,
  isLoading,
}) => {
  if (isLoading) {
    return <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando estadísticas...</p>;
  }

  return (
    <div style={getStatsGridStyles()}>
      <div style={getStatCardStyles()}>
        <div style={getStatValueStyles()}>{estadisticas.totalReservas}</div>
        <div style={getStatLabelStyles()}>Total Reservas</div>
      </div>
      <div style={getStatCardStyles()}>
        <div style={getStatValueStyles()}>{estadisticas.reservasPagadas}</div>
        <div style={getStatLabelStyles()}>Reservas Pagadas</div>
      </div>
      <div style={getStatCardStyles()}>
        <div style={getStatValueStyles()}>{estadisticas.reservasCanceladas}</div>
        <div style={getStatLabelStyles()}>Canceladas</div>
      </div>
      <div style={getStatCardStyles()}>
        <div style={getStatValueStyles()}>
          {formatCurrency(estadisticas.totalIngresos)}
        </div>
        <div style={getStatLabelStyles()}>Ingresos Totales</div>
      </div>
      <div style={getStatCardStyles()}>
        <div style={getStatValueStyles()}>
          {estadisticas.porcentajeOcupacion.toFixed(1)}%
        </div>
        <div style={getStatLabelStyles()}>Ocupación</div>
      </div>
      <div style={getStatCardStyles()}>
        <div style={getStatValueStyles()}>{estadisticas.noShows}</div>
        <div style={getStatLabelStyles()}>No-Shows</div>
      </div>
    </div>
  );
};

interface ExportButtonProps {
  isExporting: boolean;
  disabled: boolean;
  onClick: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  isExporting,
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing.space_2,
        padding: `${tokens.spacing.space_3} ${tokens.spacing.space_6}`,
        backgroundColor: tokens.colors.brand.green_700,
        color: tokens.colors.neutral.white,
        border: 'none',
        borderRadius: tokens.radii.md,
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: tokens.typography.families.body,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        width: '100%',
        maxWidth: '300px',
      }}
      onClick={onClick}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <>
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
          Exportando...
        </>
      ) : (
        <>
          <Download size={18} strokeWidth={1.75} />
          Exportar a Excel
        </>
      )}
    </button>
  );
};

export const GeneradorReportes: React.FC<GeneradorReportesProps> = ({ onError, onSuccess }) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<number | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<ReportType>('reservas');
  const [fechaInicio, setFechaInicio] = useState<string>(getDefaultFechaInicio);
  const [fechaFin, setFechaFin] = useState<string>(getDefaultFechaFin);
  const [isExporting, setIsExporting] = useState(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasResumen | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const data = await adminService.getSedes();
        setSedes(data);
      } catch (err) {
        console.error('Error al cargar sedes:', err);
      }
    };
    fetchSedes();
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await adminService.getEstadisticas(selectedSedeId);
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedSedeId]);

  useEffect(() => {
    if (selectedReport === 'estadisticas') {
      fetchEstadisticas();
    }
  }, [selectedReport, fetchEstadisticas]);

  const getReportParams = (): ReporteReservasParams | ReportePagosParams | ReporteNoShowsParams => {
    const baseParams = {
      sedeId: selectedSedeId,
      fechaInicio,
      fechaFin,
    };

    switch (selectedReport) {
      case 'reservas':
        return baseParams as ReporteReservasParams;
      case 'pagos':
        return baseParams as ReportePagosParams;
      case 'no-shows':
        return baseParams as ReporteNoShowsParams;
      default:
        return baseParams as ReporteReservasParams;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      let filename: string;

      switch (selectedReport) {
        case 'reservas':
          blob = await adminService.getReporteReservasExcel(getReportParams() as ReporteReservasParams);
          filename = `reporte_reservas_${fechaInicio}_${fechaFin}.xlsx`;
          break;
        case 'pagos':
          blob = await adminService.getReportePagosExcel(getReportParams() as ReportePagosParams);
          filename = `reporte_pagos_${fechaInicio}_${fechaFin}.xlsx`;
          break;
        case 'no-shows':
          blob = await adminService.getReporteNoShowsExcel(getReportParams() as ReporteNoShowsParams);
          filename = `reporte_no_shows_${fechaInicio}_${fechaFin}.xlsx`;
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onSuccess?.(`Reporte ${filename} descargado exitosamente`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al exportar reporte';
      onError?.(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={getContainerStyles()}>
      <div style={getHeaderStyles()}>
        <h2 style={getTitleStyles()}>Reportes y Estadísticas</h2>
      </div>

      <div style={getCardStyles()}>
        <div style={getFormGridStyles()}>
          <ReportTypeSelector
            selectedReport={selectedReport}
            onSelect={setSelectedReport}
          />
        </div>

        <DateRangeFilter
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicioChange={setFechaInicio}
          onFechaFinChange={setFechaFin}
        />

        <SedeFilter
          sedes={sedes}
          selectedSedeId={selectedSedeId}
          onSedeChange={setSelectedSedeId}
        />

        <ExportButton
          isExporting={isExporting}
          disabled={selectedReport === 'estadisticas'}
          onClick={handleExport}
        />
      </div>

      {selectedReport === 'estadisticas' && (
        <div style={getCardStyles()}>
          <h3
            style={{
              ...getTitleStyles(),
              marginBottom: tokens.spacing.space_6,
            }}
          >
            Resumen de Estadísticas
          </h3>

          {estadisticas && (
            <EstadisticasGrid
              estadisticas={estadisticas}
              isLoading={isLoadingStats}
            />
          )}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default GeneradorReportes;