import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import type { EstadoPago } from '../../types/models';

interface PaymentStatusProps {
  status: EstadoPago;
  monto?: number;
  referencia?: string;
  fechaPago?: string;
  isLoading?: boolean;
}

const getStatusConfig = (status: EstadoPago) => {
  switch (status) {
    case 'completado':
      return {
        icon: CheckCircle,
        label: 'Pago confirmado',
        color: tokens.colors.semantic.success,
        bgColor: tokens.colors.reservation_status.pagada.fill,
        borderColor: tokens.colors.reservation_status.pagada.border,
        textColor: tokens.colors.reservation_status.pagada.text,
      };
    case 'pendiente':
      return {
        icon: Clock,
        label: 'Pago pendiente',
        color: tokens.colors.semantic.warning,
        bgColor: tokens.colors.reservation_status.retenida.fill,
        borderColor: tokens.colors.reservation_status.retenida.border,
        textColor: tokens.colors.reservation_status.retenida.text,
      };
    case 'fallido':
      return {
        icon: XCircle,
        label: 'Pago rechazado',
        color: tokens.colors.semantic.danger,
        bgColor: tokens.colors.reservation_status.cancelada.fill,
        borderColor: tokens.colors.reservation_status.cancelada.border,
        textColor: tokens.colors.reservation_status.cancelada.text,
      };
    case 'reembolsado':
      return {
        icon: AlertCircle,
        label: 'Pago reembolsado',
        color: tokens.colors.neutral.text_muted,
        bgColor: tokens.colors.reservation_status.no_asistio.fill,
        borderColor: tokens.colors.reservation_status.no_asistio.border,
        textColor: tokens.colors.reservation_status.no_asistio.text,
      };
    default:
      return {
        icon: AlertCircle,
        label: 'Estado desconocido',
        color: tokens.colors.neutral.text_muted,
        bgColor: tokens.colors.neutral.surface_subtle,
        borderColor: tokens.colors.neutral.border,
        textColor: tokens.colors.neutral.text_secondary,
      };
  }
};

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  monto,
  referencia,
  fechaPago,
  isLoading = false,
}) => {
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
    border: `2px solid ${config.borderColor}`,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.space_4,
    textAlign: 'center' as const,
    marginBottom: tokens.spacing.space_6,
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    backgroundColor: config.bgColor,
    borderRadius: '50%',
    color: config.color,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: config.textColor,
  };

  const detailsStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_3,
    paddingTop: tokens.spacing.space_4,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  };

  const detailRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const detailLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const detailValueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    fontWeight: 600,
    color: tokens.colors.neutral.text_primary,
  };

  const montoStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  const loadingContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.space_4,
    padding: tokens.spacing.space_8,
  };

  const loadingTextStyles: React.CSSProperties = {
    fontSize: '16px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={loadingContainerStyles}>
          <Loader2
            size={48}
            strokeWidth={1.75}
            style={{
              color: tokens.colors.brand.green_500,
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={loadingTextStyles}>Procesando tu pago...</span>
        </div>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={iconContainerStyles}>
          <StatusIcon size={36} strokeWidth={1.75} />
        </div>
        <span style={labelStyles}>{config.label}</span>
        {monto !== undefined && (
          <span style={montoStyles}>${monto.toLocaleString('es-CL')}</span>
        )}
      </div>

      {(referencia || fechaPago) && (
        <div style={detailsStyles}>
          {referencia && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>Referencia</span>
              <span style={detailValueStyles}>{referencia}</span>
            </div>
          )}
          {fechaPago && (
            <div style={detailRowStyles}>
              <span style={detailLabelStyles}>Fecha</span>
              <span style={detailValueStyles}>
                {new Date(fechaPago).toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
