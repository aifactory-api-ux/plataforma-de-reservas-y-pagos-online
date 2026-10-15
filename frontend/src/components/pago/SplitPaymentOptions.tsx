import React, { useState } from 'react';
import { Users, CreditCard, SplitSquareVertical } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { BotonAccionPrincipal } from '../ui/BotonAccionPrincipal';

interface SplitPaymentOptionsProps {
  montoTotal: number;
  onSplitSelect: (cantidadJugadores: number) => void;
  onContinueFullPayment: () => void;
  isLoading?: boolean;
}

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 4;

const getNextJugadoresCount = (current: number, delta: number): number => {
  const next = current + delta;
  if (next < MIN_JUGADORES || next > MAX_JUGADORES) return current;
  return next;
};

const canIncrement = (count: number): boolean => count < MAX_JUGADORES;
const canDecrement = (count: number): boolean => count > MIN_JUGADORES;

const SplitPaymentOptions: React.FC<SplitPaymentOptionsProps> = ({
  montoTotal,
  onSplitSelect,
  onContinueFullPayment,
  isLoading = false,
}) => {
  const [jugadoresCount, setJugadoresCount] = useState<number>(MIN_JUGADORES);
  const [showSplitOptions, setShowSplitOptions] = useState(false);

  const handleIncrement = () => {
    if (canIncrement(jugadoresCount)) {
      setJugadoresCount(prev => getNextJugadoresCount(prev, 1));
    }
  };

  const handleDecrement = () => {
    if (canDecrement(jugadoresCount)) {
      setJugadoresCount(prev => getNextJugadoresCount(prev, -1));
    }
  };

  const handleSplitConfirm = () => {
    onSplitSelect(jugadoresCount);
  };

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    marginBottom: tokens.spacing.space_6,
  };

  const headerIconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: tokens.colors.brand.green_50,
    borderRadius: tokens.radii.md,
    color: tokens.colors.brand.green_700,
  };

  const headerTextStyles: React.CSSProperties = {
    flex: 1,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_1,
  };

  const headerSubtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const optionCardStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_4,
  };

  const fullPaymentCard: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_4,
    padding: tokens.spacing.space_4,
    border: `2px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    transition: 'border-color 150ms ease-out',
  };

  const splitPaymentCard: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_4,
    padding: tokens.spacing.space_4,
    border: `2px solid ${tokens.colors.brand.green_500}`,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.brand.green_50,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  };

  const cardIconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: tokens.colors.brand.green_100,
    borderRadius: tokens.radii.sm,
    color: tokens.colors.brand.green_700,
  };

  const cardContentStyles: React.CSSProperties = {
    flex: 1,
  };

  const cardTitleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_1,
  };

  const cardDescriptionStyles: React.CSSProperties = {
    fontSize: '13px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const cardPriceStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  const splitConfigStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_4,
    padding: tokens.spacing.space_4,
    backgroundColor: tokens.colors.neutral.surface_subtle,
    borderRadius: tokens.radii.md,
    marginTop: tokens.spacing.space_4,
  };

  const counterStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.space_4,
  };

  const counterLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  const counterControlsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const counterButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.radii.sm,
    border: `1px solid ${tokens.colors.neutral.border}`,
    backgroundColor: tokens.colors.neutral.surface,
    color: tokens.colors.neutral.text_primary,
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  };

  const counterValueStyles: React.CSSProperties = {
    minWidth: '32px',
    textAlign: 'center' as const,
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const splitSummaryStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacing.space_4,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
  };

  const splitTotalStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  const splitAmountStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={headerIconStyles}>
          <SplitSquareVertical size={24} strokeWidth={1.75} />
        </div>
        <div style={headerTextStyles}>
          <div style={headerTitleStyles}>Opciones de pago</div>
          <div style={headerSubtitleStyles}>Paga solo o divide el monto con compañeros</div>
        </div>
      </div>

      <div style={optionCardStyles}>
        <div
          style={fullPaymentCard}
          onClick={() => !isLoading && onContinueFullPayment()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && onContinueFullPayment()}
        >
          <div style={cardIconStyles}>
            <CreditCard size={20} strokeWidth={1.75} />
          </div>
          <div style={cardContentStyles}>
            <div style={cardTitleStyles}>Pago completo</div>
            <div style={cardDescriptionStyles}>Paga el total ahora</div>
          </div>
          <div style={cardPriceStyles}>
            ${montoTotal.toLocaleString('es-CL')}
          </div>
        </div>

        <div
          style={splitPaymentCard}
          onClick={() => !isLoading && setShowSplitOptions(!showSplitOptions)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && setShowSplitOptions(!showSplitOptions)}
        >
          <div style={cardIconStyles}>
            <Users size={20} strokeWidth={1.75} />
          </div>
          <div style={cardContentStyles}>
            <div style={cardTitleStyles}>Dividir pago</div>
            <div style={cardDescriptionStyles}>Comparte el costo con 2-4 jugadores</div>
          </div>
          <div style={cardPriceStyles}>
            ${Math.round(montoTotal / 2).toLocaleString('es-CL')}+
          </div>
        </div>

        {showSplitOptions && (
          <div style={splitConfigStyles}>
            <div style={counterStyles}>
              <span style={counterLabelStyles}>Número de jugadores</span>
              <div style={counterControlsStyles}>
                <button
                  type="button"
                  style={counterButtonStyles}
                  onClick={handleDecrement}
                  disabled={jugadoresCount <= MIN_JUGADORES || isLoading}
                >
                  -
                </button>
                <span style={counterValueStyles}>{jugadoresCount}</span>
                <button
                  type="button"
                  style={counterButtonStyles}
                  onClick={handleIncrement}
                  disabled={jugadoresCount >= MAX_JUGADORES || isLoading}
                >
                  +
                </button>
              </div>
            </div>

            <div style={splitSummaryStyles}>
              <span style={splitTotalStyles}>
                Cada jugador paga
              </span>
              <span style={splitAmountStyles}>
                ${Math.round(montoTotal / jugadoresCount).toLocaleString('es-CL')}
              </span>
            </div>

            <BotonAccionPrincipal
              label="Confirmar división de pago"
              variant="primary"
              size="md"
              fullWidth
              loading={isLoading}
              onClick={handleSplitConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPaymentOptions;
