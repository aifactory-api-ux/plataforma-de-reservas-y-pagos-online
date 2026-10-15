import React, { useState, useEffect, useCallback } from 'react';
import { Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { adminService, EstadisticasResumen } from '../../services/admin.service';
import type { Sede } from '../../types/models';

interface ReportExporterProps {
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

export const ReportExporter: React.FC<ReportExporterProps> = ({ onError, onSuccess }) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<number | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<ReportType>('reservas');
  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      let filename: string;

      switch (selectedReport) {
        case 'reservas':
          blob = await adminService.getReporteReservasExcel({
            sedeId: selectedSedeId,
            fechaInicio,
            fechaFin,
          });
          filename = `reporte_reservas_${fechaInicio}_${fechaFin}.xlsx`;
          break;
        case 'pagos':
          blob = await adminService.getReportePagosExcel({
            sedeId: selectedSedeId,
            fechaInicio,
            fechaFin,
          });
          filename = `reporte_pagos_${fechaInicio}_${fechaFin}.xlsx`;
          break;
        case 'no-shows':
          blob = await adminService.getReporteNoShowsExcel({
            sedeId: selectedSedeId,
            fechaInicio,
            fechaFin,
          });
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const containerStyles: React.CSSProperties = {
    padding: tokens.spacing.page_gutter_desktop,
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_6,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    margin: 0,
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
    marginBottom: tokens.spacing.space_6,
  };

  const formGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing.space_6,
    marginBottom: tokens.spacing.space_6,
  };

  const formGroupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
  };

  const inputStyles: React.CSSProperties = {
    padding: `${tokens.spacing.space_3}`,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    cursor: 'pointer',
  };

  const reportOptionsStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacing.space_4,
  };

  const reportOptionStyles = (isSelected: boolean): React.CSSProperties => ({
    padding: tokens.spacing.space_4,
    border: `2px solid ${isSelected ? tokens.colors.brand.green_500 : tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    backgroundColor: isSelected ? tokens.colors.brand.green_50 : tokens.colors.neutral.surface,
    transition: 'all 150ms ease-out',
  });

  const reportTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_1,
  };

  const reportDescStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    margin: 0,
  };

  const statsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: tokens.spacing.space_4,
  };

  const statCardStyles: React.CSSProperties = {
    padding: tokens.spacing.space_4,
    backgroundColor: tokens.colors.neutral.surface_subtle,
    borderRadius: tokens.radii.md,
    textAlign: 'center' as const,
  };

  const statValueStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
    marginBottom: tokens.spacing.space_1,
  };

  const statLabelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Reportes y Estadísticas</h2>
      </div>

      <div style={cardStyles}>
        <div style={formGridStyles}>
          <div style={formGroupStyles}>
            <label style={labelStyles}>
              <FileSpreadsheet size={14} strokeWidth={1.75} />
              Tipo de Reporte
            </label>
            <div style={reportOptionsStyles}>
              {REPORT_TYPES.map((report) => (
                <div
                  key={report.value}
                  style={reportOptionStyles(selectedReport === report.value)}
                  onClick={() => setSelectedReport(report.value)}
                >
                  <div style={reportTitleStyles}>{report.label}</div>
                  <p style={reportDescStyles}>{report.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={formGridStyles}>
          <div style={formGroupStyles}>
            <label style={labelStyles}>
              <Calendar size={14} strokeWidth={1.75} />
              Fecha Inicio
            </label>
            <input
              type="date"
              style={inputStyles}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>
              <Calendar size={14} strokeWidth={1.75} />
              Fecha Fin
            </label>
            <input
              type="date"
              style={inputStyles}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>
              <Filter size={14} strokeWidth={1.75} />
              Sede (Opcional)
            </label>
            <select
              style={selectStyles}
              value={selectedSedeId || ''}
              onChange={(e) =>
                setSelectedSedeId(e.target.value ? parseInt(e.target.value, 10) : undefined)
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
        </div>

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
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.7 : 1,
            width: '100%',
            maxWidth: '300px',
          }}
          onClick={handleExport}
          disabled={isExporting || selectedReport === 'estadisticas'}
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
      </div>

      {selectedReport === 'estadisticas' && (
        <div style={cardStyles}>
          <h3
            style={{
              ...titleStyles,
              marginBottom: tokens.spacing.space_6,
            }}
          >
            Resumen de Estadísticas
          </h3>

          {isLoadingStats ? (
            <p style={{ color: tokens.colors.neutral.text_muted }}>Cargando estadísticas...</p>
          ) : estadisticas ? (
            <div style={statsGridStyles}>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{estadisticas.totalReservas}</div>
                <div style={statLabelStyles}>Total Reservas</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{estadisticas.reservasPagadas}</div>
                <div style={statLabelStyles}>Reservas Pagadas</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{estadisticas.reservasCanceladas}</div>
                <div style={statLabelStyles}>Canceladas</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>
                  {formatCurrency(estadisticas.totalIngresos)}
                </div>
                <div style={statLabelStyles}>Ingresos Totales</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>
                  {estadisticas.porcentajeOcupacion.toFixed(1)}%
                </div>
                <div style={statLabelStyles}>Ocupación</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{estadisticas.noShows}</div>
                <div style={statLabelStyles}>No-Shows</div>
              </div>
            </div>
          ) : null}
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

export default ReportExporter;