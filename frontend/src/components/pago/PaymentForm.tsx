import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { BotonAccionPrincipal } from '../ui/BotonAccionPrincipal';
import { apiFetch } from '../../lib/api';

interface PaymentFormProps {
  montoTotal: number;
  onPaymentSuccess: (token: string) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
  splitCount?: number;
}

const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ').substring(0, 19);
};

const formatExpiryDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 2) {
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
  }
  return digits;
};

const formatCvv = (value: string): string => {
  return value.replace(/\D/g, '').substring(0, 4);
};

const getCardDigits = (cardNumber: string): string => {
  return cardNumber.replace(/\D/g, '');
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  montoTotal,
  onPaymentSuccess,
  onPaymentError,
  isLoading = false,
  splitCount = 1,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  const validateCard = (): boolean => {
    const digits = getCardDigits(cardNumber);
    if (digits.length < 16) {
      setCardError('El número de tarjeta debe tener 16 dígitos');
      return false;
    }
    if (expiryDate.length < 5) {
      setCardError('La fecha de expiración no es válida');
      return false;
    }
    if (cvv.length < 3) {
      setCardError('El CVV no es válido');
      return false;
    }
    setCardError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;

    try {
      const response = await apiFetch.post<{ token: string }>('/api/pagos/webpay/init', {
        monto: montoTotal,
        splitCount,
        cardNumber: getCardDigits(cardNumber),
      });
      onPaymentSuccess(response.token);
    } catch {
      onPaymentError('Error al procesar el pago');
    }
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
    paddingBottom: tokens.spacing.space_4,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
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
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_1,
  };

  const headerSubtitleStyles: React.CSSProperties = {
    fontSize: '13px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_muted,
  };

  const formStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_4,
  };

  const fieldStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    fontSize: '16px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    outline: 'none',
    transition: 'border-color 150ms ease-out',
  };

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_4,
  };

  const halfFieldStyles: React.CSSProperties = {
    flex: 1,
  };

  const errorStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    backgroundColor: tokens.colors.reservation_status.cancelada.fill,
    border: `1px solid ${tokens.colors.reservation_status.cancelada.border}`,
    borderRadius: tokens.radii.md,
    color: tokens.colors.reservation_status.cancelada.text,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const securityStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
    marginTop: tokens.spacing.space_4,
    paddingTop: tokens.spacing.space_4,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
    color: tokens.colors.neutral.text_muted,
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
  };

  const montoStyles: React.CSSProperties = {
    textAlign: 'center' as const,
    marginBottom: tokens.spacing.space_6,
  };

  const montoLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    marginBottom: tokens.spacing.space_1,
  };

  const montoValueStyles: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={headerIconStyles}>
          <CreditCard size={24} strokeWidth={1.75} />
        </div>
        <div style={headerTextStyles}>
          <div style={headerTitleStyles}>Pago con tarjeta</div>
          <div style={headerSubtitleStyles}>Transacción segura con Webpay Plus</div>
        </div>
      </div>

      <div style={montoStyles}>
        <div style={montoLabelStyles}>Monto a pagar</div>
        <div style={montoValueStyles}>
          ${(montoTotal / splitCount).toLocaleString('es-CL')}
          {splitCount > 1 && (
            <span style={{ fontSize: '16px', color: tokens.colors.neutral.text_muted }}>
              {' '}x{splitCount}
            </span>
          )}
        </div>
      </div>

      <form style={formStyles} onSubmit={handleSubmit}>
        <div style={fieldStyles}>
          <label style={labelStyles}>Número de tarjeta</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = tokens.colors.brand.green_500}
            onBlur={(e) => e.target.style.borderColor = tokens.colors.neutral.border}
          />
        </div>

        <div style={rowStyles}>
          <div style={halfFieldStyles}>
            <div style={fieldStyles}>
              <label style={labelStyles}>Fecha de expiración</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                style={inputStyles}
                onFocus={(e) => e.target.style.borderColor = tokens.colors.brand.green_500}
                onBlur={(e) => e.target.style.borderColor = tokens.colors.neutral.border}
              />
            </div>
          </div>
          <div style={halfFieldStyles}>
            <div style={fieldStyles}>
              <label style={labelStyles}>CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(formatCvv(e.target.value))}
                placeholder="123"
                maxLength={4}
                style={inputStyles}
                onFocus={(e) => e.target.style.borderColor = tokens.colors.brand.green_500}
                onBlur={(e) => e.target.style.borderColor = tokens.colors.neutral.border}
              />
            </div>
          </div>
        </div>

        {cardError && (
          <div style={errorStyles}>
            <AlertCircle size={16} strokeWidth={1.75} />
            {cardError}
          </div>
        )}

        <BotonAccionPrincipal
          type="submit"
          label={isLoading ? 'Procesando...' : 'Pagar ahora'}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        />
      </form>

      <div style={securityStyles}>
        <Lock size={14} strokeWidth={1.75} />
        Pago 100% seguro con encriptación SSL
      </div>
    </div>
  );
};

export default PaymentForm;
