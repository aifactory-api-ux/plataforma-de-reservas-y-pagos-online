import React from 'react';
import { X, Clock, User, Phone, Mail, CreditCard, Bell } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { Reserva } from '../../../types/models';
import BadgeEstado from '../../ui/BadgeEstado/BadgeEstado';

export interface SidebarDetalleProps {
  reserva: Reserva | null;
  onClose: () => void;
  onMarkAsistencia: (estado: 'asistio' | 'no_asistio') => void;
  onSendReminder: () => void;
  isLoading?: boolean;
}

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayName = dias[date.getDay()];
  const day = date.getDate();
  const month = meses[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dayName} ${day} ${month}, ${hours}:${minutes}`;
};

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

const getOverlayStyles = (): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '380px',
  maxWidth: '100vw',
  backgroundColor: tokens.colors.neutral.surface,
  boxShadow: tokens.shadows.modal,
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column' as const,
  animation: 'slideInRight 200ms ease-out',
});

const getHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: tokens.spacing.space_4,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '18px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  letterSpacing: '0.01em',
  margin: 0,
});

const getCloseButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: tokens.radii.md,
  cursor: 'pointer',
  color: tokens.colors.neutral.text_muted,
  transition: 'all 150ms ease-out',
});

const getContentStyles = (): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: tokens.spacing.space_4,
});

const getSectionStyles = (): React.CSSProperties => ({
  marginBottom: tokens.spacing.space_5,
});

const getSectionTitleStyles = (): React.CSSProperties => ({
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  marginBottom: tokens.spacing.space_3,
});

const getInfoRowStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_3,
  padding: `${tokens.spacing.space_2} 0`,
});

const getInfoIconStyles = (): React.CSSProperties => ({
  color: tokens.colors.neutral.text_muted,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
});

const getInfoTextStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
});

const getInfoLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_muted,
  marginBottom: tokens.spacing.space_1,
});

const getCanchaCardStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.brand.green_50,
  borderRadius: tokens.radii.md,
  padding: tokens.spacing.space_3,
  border: `1px solid ${tokens.colors.brand.green_100}`,
});

const getCanchaTitleStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.brand.green_800,
  marginBottom: tokens.spacing.space_2,
});

const getPrecioStyles = (): React.CSSProperties => ({
  fontSize: '22px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.numeric,
  color: tokens.colors.brand.green_700,
});

const getFooterStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
  borderTop: `1px solid ${tokens.colors.neutral.border}`,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: tokens.spacing.space_3,
});

const getButtonStyles = (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
        fontFamily: tokens.typography.families.body,
        fontWeight: 700,
        fontSize: '14px',
        lineHeight: '20px',
        borderRadius: tokens.radii.md,
        cursor: 'pointer',
        transition: 'all 150ms ease-out',
        minHeight: '44px',
        padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
        border: 'none',
        outline: 'none',
      };

      if (variant === 'primary') {
        return {
          ...baseStyles,
          backgroundColor: tokens.colors.brand.green_700,
          color: tokens.colors.neutral.white,
        };
      }

      if (variant === 'danger') {
        return {
          ...baseStyles,
          backgroundColor: tokens.colors.semantic.danger,
          color: tokens.colors.neutral.white,
        };
      }

      return {
        ...baseStyles,
        backgroundColor: tokens.colors.neutral.surface,
        color: tokens.colors.neutral.text_primary,
        border: `1px solid ${tokens.colors.neutral.border}`,
      };
    };

    const SidebarDetalle: React.FC<SidebarDetalleProps> = ({
      reserva,
      onClose,
      onMarkAsistencia,
      onSendReminder,
      isLoading = false,
    }) => {
      if (!reserva) return null;

      const canMarkAttendance = reserva.estado === 'pagada';
      const canSendReminder = reserva.estado === 'pagada' || reserva.estado === 'retenida';

      const handleAsistio = () => {
        onMarkAsistencia('asistio');
      };

      const handleNoAsistio = () => {
        onMarkAsistencia('no_asistio');
      };

      const getDeporteDisplay = (): string => {
        if (reserva.cancha?.deporte === 'padel') {
          return reserva.cancha?.techada ? 'Pádel Techada' : 'Pádel';
        }
        return reserva.cancha?.techada ? 'Fútbol 7 Techada' : 'Fútbol 7';
      };

      return (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: tokens.colors.neutral.overlay,
              zIndex: 199,
            }}
            onClick={onClose}
          />
          <div style={getOverlayStyles()}>
            <div style={getHeaderStyles()}>
              <h2 style={getTitleStyles()}>Detalle de Reserva</h2>
              <button
                type="button"
                style={getCloseButtonStyles()}
                onClick={onClose}
                aria-label="Cerrar"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div style={getContentStyles()}>
              <div style={getSectionStyles()}>
                <div style={{ marginBottom: tokens.spacing.space_3 }}>
                  <BadgeEstado status={reserva.estado} size="md" showLabel={true} />
                </div>
              </div>

              <div style={getSectionStyles()}>
                <h3 style={getSectionTitleStyles()}>Horario</h3>
                <div style={getInfoRowStyles()}>
                  <Clock size={18} strokeWidth={1.75} style={getInfoIconStyles()} />
                  <div>
                    <div style={getInfoLabelStyles()}>Fecha y hora</div>
                    <div style={getInfoTextStyles()}>{formatDateTime(reserva.inicio)}</div>
                  </div>
                </div>
                <div style={getInfoRowStyles()}>
                  <span style={getInfoIconStyles()}>→</span>
                  <div style={getInfoTextStyles()}>{formatDateTime(reserva.fin)}</div>
                </div>
              </div>

              <div style={getSectionStyles()}>
                <h3 style={getSectionTitleStyles()}>Cancha</h3>
                <div style={getCanchaCardStyles()}>
                  <div style={getCanchaTitleStyles()}>{getDeporteDisplay()}</div>
                </div>
              </div>

              <div style={getSectionStyles()}>
                <h3 style={getSectionTitleStyles()}>Jugador</h3>
                <div style={getInfoRowStyles()}>
                  <User size={18} strokeWidth={1.75} style={getInfoIconStyles()} />
                  <div style={getInfoTextStyles()}>
                    {reserva.jugador?.nombre || 'Cliente'}
                  </div>
                </div>
                {reserva.jugador?.telefono && (
                  <div style={getInfoRowStyles()}>
                    <Phone size={18} strokeWidth={1.75} style={getInfoIconStyles()} />
                    <div style={getInfoTextStyles()}>{reserva.jugador.telefono}</div>
                  </div>
                )}
                {reserva.jugador?.email && (
                  <div style={getInfoRowStyles()}>
                    <Mail size={18} strokeWidth={1.75} style={getInfoIconStyles()} />
                    <div style={getInfoTextStyles()}>{reserva.jugador.email}</div>
                  </div>
                )}
              </div>

              {reserva.tarifa && (
                <div style={getSectionStyles()}>
                  <h3 style={getSectionTitleStyles()}>Pago</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.space_3 }}>
                    <CreditCard size={18} strokeWidth={1.75} style={getInfoIconStyles()} />
                    <span style={getPrecioStyles()}>
                      {formatPrice(reserva.tarifa.monto)}
                    </span>
                  </div>
                  {reserva.pago && (
                    <div style={{ marginTop: tokens.spacing.space_2, fontSize: '12px', color: tokens.colors.neutral.text_muted }}>
                      {reserva.pago.estado === 'completado' ? 'Pagado' : 'Pendiente'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={getFooterStyles()}>
              {canMarkAttendance && (
                <>
                  <button
                    type="button"
                    style={getButtonStyles('primary')}
                    onClick={handleAsistio}
                    disabled={isLoading}
                  >
                    Marcar Asistencia
                  </button>
                  <button
                    type="button"
                    style={getButtonStyles('danger')}
                    onClick={handleNoAsistio}
                    disabled={isLoading}
                  >
                    Marcar No Asistencia
                  </button>
                </>
              )}
              {canSendReminder && (
                <button
                  type="button"
                  style={getButtonStyles('secondary')}
                  onClick={onSendReminder}
                  disabled={isLoading}
                >
                  <Bell size={16} strokeWidth={1.75} />
                  Enviar Recordatorio
                </button>
              )}
            </div>
          </div>

          <style>
            {`
              @keyframes slideInRight {
                from {
                  transform: translateX(100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}
          </style>
        </>
      );
    };

export default SidebarDetalle;