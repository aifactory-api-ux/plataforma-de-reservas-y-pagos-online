import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../styles/tokens';
import { BotonAccionPrincipal } from '../ui/BotonAccionPrincipal';
import { ModalConfirmacion } from '../ui/ModalConfirmacion';
import { useReservas } from '../../context/ReservationContext';
import type { AvailabilitySlot, CreateReservationInput } from '../../types/models';

interface ReservaFormProps {
  slot: AvailabilitySlot;
  onSuccess?: (reservaId: number) => void;
  onCancel?: () => void;
}

const ReservaForm: React.FC<ReservaFormProps> = ({
  slot,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { createReservation, isLoading, error } = useReservas();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleConfirmReservation = async () => {
    setLocalError(null);

    const fecha = new Date().toISOString().split('T')[0];
    const [hours, minutes] = slot.hora.split(':').map(Number);
    const inicio = new Date(`${fecha}T${slot.hora}:00`);
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000);

    const reservaData: CreateReservationInput = {
      canchaId: slot.canchaId,
      tarifaId: 0,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
    };

    try {
      const reserva = await createReservation(reservaData);
      setShowConfirmModal(false);
      if (onSuccess) {
        onSuccess(reserva.id);
      } else {
        navigate('/pago', { state: { reservaId: reserva.id } });
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error al crear la reserva');
    }
  };

  const containerStyles: React.CSSProperties = {
    padding: tokens.spacing.page_gutter_mobile,
    paddingBottom: tokens.spacing.space_8,
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.brand.green_50,
    padding: `${tokens.spacing.space_4} ${tokens.spacing.space_5}`,
    borderBottom: `1px solid ${tokens.colors.brand.green_100}`,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_900,
    marginBottom: tokens.spacing.space_1,
  };

  const headerSubtitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.brand.green_700,
  };

  const bodyStyles: React.CSSProperties = {
    padding: tokens.spacing.space_5,
  };

  const detailRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.space_3} 0`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const detailLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  const detailValueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const totalRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.space_4} 0`,
  };

  const totalLabelStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
  };

  const totalValueStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.brand.green_700,
  };

  const warningStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacing.space_3,
    backgroundColor: tokens.colors.reservation_status.retenida.fill,
    border: `1px solid ${tokens.colors.reservation_status.retenida.border}`,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_4,
  };

  const warningIconStyles: React.CSSProperties = {
    color: tokens.colors.reservation_status.retenida.text,
    flexShrink: 0,
    marginTop: '2px',
  };

  const warningTextStyles: React.CSSProperties = {
    fontSize: '13px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.reservation_status.retenida.text,
    lineHeight: '18px',
  };

  const errorStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.reservation_status.cancelada.fill,
    border: `1px solid ${tokens.colors.reservation_status.cancelada.border}`,
    borderRadius: tokens.radii.md,
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    marginTop: tokens.spacing.space_4,
    color: tokens.colors.reservation_status.cancelada.text,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_6,
  };

  const today = formatDate(new Date().toISOString());

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={headerStyles}>
          <div style={headerTitleStyles}>Confirmar Reserva</div>
          <div style={headerSubtitleStyles}>{slot.canchaNombre}</div>
        </div>

        <div style={bodyStyles}>
          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>Fecha</span>
            <span style={detailValueStyles}>{today}</span>
          </div>

          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>Hora</span>
            <span style={detailValueStyles}>{slot.hora}</span>
          </div>

          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>Duración</span>
            <span style={detailValueStyles}>60 minutos</span>
          </div>

          <div style={detailRowStyles}>
            <span style={detailLabelStyles}>Precio por hora</span>
            <span style={detailValueStyles}>${slot.precio.toLocaleString('es-CL')}</span>
          </div>

          <div style={totalRowStyles}>
            <span style={totalLabelStyles}>Total a pagar</span>
            <span style={totalValueStyles}>${slot.precio.toLocaleString('es-CL')}</span>
          </div>

          <div style={warningStyles}>
            <span style={warningIconStyles}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span style={warningTextStyles}>
              La cancha quedará retenida por 10 minutos mientras completas el pago. Si no pagas a tiempo, la reserva se cancelará automáticamente.
            </span>
          </div>

          {(error || localError) && (
            <div style={errorStyles}>{error || localError}</div>
          )}

          <div style={actionsStyles}>
            <BotonAccionPrincipal
              label="Confirmar y pagar"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={() => setShowConfirmModal(true)}
            />
            <BotonAccionPrincipal
              label="Cancelar"
              variant="ghost"
              size="md"
              fullWidth
              onClick={onCancel || (() => navigate('/buscar-cancha'))}
            />
          </div>
        </div>
      </div>

      <ModalConfirmacion
        open={showConfirmModal}
        title="¿Confirmar reserva?"
        description={`Vas a reservar ${slot.canchaNombre} el ${today} a las ${slot.hora}. Podrás proceder al pago inmediatamente.`}
        confirmLabel="Sí, confirmar"
        cancelLabel="Volver"
        onConfirm={handleConfirmReservation}
        onCancel={() => setShowConfirmModal(false)}
        loading={isLoading}
      />
    </div>
  );
};

export default ReservaForm;
