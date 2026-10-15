import React from 'react';
import { tokens } from '../../../styles/tokens';
import type { Tarifa } from '../../../types/models';

interface DesglosePrecioProps {
  tarifa: Tarifa;
  esParcial?: boolean;
  cantidadDividida?: number;
}

const formatMonto = (monto: number): string => {
  return monto.toLocaleString('es-CL');
};

const formatDuracion = (minutos: number): string => {
  if (minutos >= 60) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas} hora${horas > 1 ? 's' : ''}`;
  }
  return `${minutos} minutos`;
};

const getFranjaLabel = (franja: string): string => {
  const labels: Record<string, string> = {
    manana: 'Mañana',
    tarde: 'Tarde',
    noche: 'Noche',
  };
  return labels[franja] || franja;
};

export const DesglosePrecio: React.FC<DesglosePrecioProps> = ({
  tarifa,
  esParcial = false,
  cantidadDividida = 1,
}) => {
  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_4,
    paddingBottom: tokens.spacing.space_4,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_1,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const lineItemStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.space_3} 0`,
  };

  const lineLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const lineValueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const subtotalRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.space_3} 0`,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
    marginTop: tokens.spacing.space_2,
  };

  const subtotalLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const subtotalValueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const totalRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.space_4} 0 0 0`,
    marginTop: tokens.spacing.space_2,
    borderTop: `2px solid ${tokens.colors.neutral.border_strong}`,
  };

  const totalLabelStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const totalValueStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_600,
    letterSpacing: '0.01em',
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
    backgroundColor: tokens.colors.brand.green_100,
    borderRadius: tokens.radii.sm,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.brand.green_700,
    marginTop: tokens.spacing.space_2,
  };

  const precioPorPersonaStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
    marginTop: tokens.spacing.space_1,
    textAlign: 'right' as const,
  };

  const montoBase = tarifa.monto;
  const montoTotal = esParcial ? montoBase / cantidadDividida : montoBase;

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={titleStyles}>Desglose del precio</div>
        <div style={subtitleStyles}>
          {formatDuracion(tarifa.duracionMinutos)} · {getFranjaLabel(tarifa.franja)}
        </div>
        {esParcial && (
          <div style={badgeStyles}>
            Pago dividido entre {cantidadDividida} jugadores
          </div>
        )}
      </div>

      <div style={lineItemStyles}>
        <span style={lineLabelStyles}>Precio por hora</span>
        <span style={lineValueStyles}>${formatMonto(montoBase)}</span>
      </div>

      <div style={lineItemStyles}>
        <span style={lineLabelStyles}>Duración</span>
        <span style={lineValueStyles}>{formatDuracion(tarifa.duracionMinutos)}</span>
      </div>

      {esParcial && cantidadDividida > 1 && (
        <div style={lineItemStyles}>
          <span style={lineLabelStyles}>Dividido entre</span>
          <span style={lineValueStyles}>{cantidadDividida} jugadores</span>
        </div>
      )}

      <div style={subtotalRowStyles}>
        <span style={subtotalLabelStyles}>Subtotal</span>
        <span style={subtotalValueStyles}>${formatMonto(montoBase)}</span>
      </div>

      <div style={totalRowStyles}>
        <span style={totalLabelStyles}>Total a pagar</span>
        <div>
          <span style={totalValueStyles}>${formatMonto(montoTotal)}</span>
          {esParcial && cantidadDividida > 1 && (
            <div style={precioPorPersonaStyles}>
              ${formatMonto(montoBase / cantidadDividida)} por persona
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesglosePrecio;
