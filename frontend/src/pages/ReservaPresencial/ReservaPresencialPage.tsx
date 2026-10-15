import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { Header } from '../../components/layout/Header';
import { ModalConfirmacion } from '../../components/ui/ModalConfirmacion';
import { useAuth } from '../../hooks/useAuth';
import { useSedeDetail } from '../../hooks/useSedes';
import { sedesService } from '../../services/sedes.service';
import { reservasService } from '../../services/reservas.service';
import { BuscadorJugador } from '../../components/presencial/BuscadorJugador/BuscadorJugador';
import { FormularioReserva } from '../../components/presencial/FormularioReserva/FormularioReserva';
import { ResumenTemporal } from '../../components/presencial/ResumenTemporal/ResumenTemporal';
import type { UsuarioPersonal, Jugador, Cancha, Tarifa } from '../../types/models';

interface FormData {
  canchaId: number;
  tarifaId: number;
  fecha: string;
  horaInicio: string;
  esPagoManual: boolean;
}

const ReservaPresencialPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const personalUser = user as UsuarioPersonal;
  const { data: sedeData, loading: sedeLoading } = useSedeDetail(personalUser?.sedeId);

  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [formData, setFormData] = useState<FormData>({
    canchaId: 0,
    tarifaId: 0,
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '10:00',
    esPagoManual: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canchas: Cancha[] = sedeData?.canchas || [];
  const tarifas: Tarifa[] = sedeData?.tarifas || [];
  const sede = sedeData?.sede;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (canchas.length > 0 && formData.canchaId === 0) {
      setFormData((prev) => ({ ...prev, canchaId: canchas[0].id }));
    }
  }, [canchas, formData.canchaId]);

  useEffect(() => {
    if (formData.canchaId && tarifas.length > 0) {
      const selectedCancha = canchas.find((c) => c.id === formData.canchaId);
      if (selectedCancha) {
        const compatibleTarifas = tarifas.filter((t) => t.deporte === selectedCancha.deporte);
        if (compatibleTarifas.length > 0 && formData.tarifaId === 0) {
          setFormData((prev) => ({ ...prev, tarifaId: compatibleTarifas[0].id }));
        }
      }
    }
  }, [formData.canchaId, tarifas, canchas]);

  useEffect(() => {
    if (!formData.fecha || !formData.horaInicio || !formData.canchaId || !formData.tarifaId) {
      return;
    }

    const selectedTarifa = tarifas.find((t) => t.id === formData.tarifaId);
    if (!selectedTarifa) {
      return;
    }

    const debounceTimer = setTimeout(async () => {
      const inicioDate = new Date(`${formData.fecha}T${formData.horaInicio}:00`);
      const finDate = new Date(
        inicioDate.getTime() + selectedTarifa.duracionMinutos * 60000
      );

      try {
        const result = await reservasService.checkSlotDisponibilidad(
          formData.canchaId,
          inicioDate.toISOString(),
          finDate.toISOString()
        );

        if (!result.disponible) {
          setErrors((prev) => ({
            ...prev,
            canchaNoDisponible: 'La cancha no está disponible para el horario seleccionado',
          }));
        } else {
          setErrors((prev) => {
            const { canchaNoDisponible, ...rest } = prev;
            return rest;
          });
        }
      } catch {
        // Silently handle error - the actual reservation will catch any real conflicts
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData.fecha, formData.horaInicio, formData.canchaId, formData.tarifaId, tarifas]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!jugador) {
      newErrors.jugador = 'Debe buscar y seleccionar un jugador';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }

    if (!formData.canchaId) {
      newErrors.canchaId = 'Debe seleccionar una cancha';
    }

    if (errors.canchaNoDisponible) {
      newErrors.canchaNoDisponible = errors.canchaNoDisponible;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [jugador, formData, errors.canchaNoDisponible]);

  const handleCanchaChange = useCallback((canchaId: number) => {
    setFormData((prev) => ({ ...prev, canchaId, tarifaId: 0 }));
  }, []);

  const handleTarifaChange = useCallback((tarifaId: number) => {
    setFormData((prev) => ({ ...prev, tarifaId }));
  }, []);

  const handleFechaChange = useCallback((fecha: string) => {
    setFormData((prev) => ({ ...prev, fecha }));
    setErrors((prev) => ({ ...prev, fecha: '' }));
  }, []);

  const handleHoraChange = useCallback((horaInicio: string) => {
    setFormData((prev) => ({ ...prev, horaInicio }));
  }, []);

  const handlePagoManualChange = useCallback((esPagoManual: boolean) => {
    setFormData((prev) => ({ ...prev, esPagoManual }));
  }, []);

  const getSelectedCancha = (): Cancha | null => {
    return canchas.find((c) => c.id === formData.canchaId) || null;
  };

  const getSelectedTarifa = (): Tarifa | null => {
    return tarifas.find((t) => t.id === formData.tarifaId) || null;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const selectedTarifa = getSelectedTarifa();
        const inicioDate = new Date(`${formData.fecha}T${formData.horaInicio}:00`);
        const finDate = new Date(
          inicioDate.getTime() + (selectedTarifa?.duracionMinutos ?? 60) * 60000
        );

        await sedesService.createReservaPresencial({
          jugadorNombre: jugador!.nombre,
          jugadorTelefono: jugador!.telefono,
          jugadorEmail: jugador!.email || undefined,
          canchaId: formData.canchaId,
          tarifaId: formData.tarifaId,
          inicio: inicioDate.toISOString(),
          fin: finDate.toISOString(),
          esPagoManual: formData.esPagoManual,
        });

        setShowSuccessModal(true);
        setJugador(null);
        setFormData({
          canchaId: canchas[0]?.id ?? 0,
          tarifaId: 0,
          fecha: new Date().toISOString().split('T')[0],
          horaInicio: '10:00',
          esPagoManual: false,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear la reserva';
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, jugador, validateForm, canchas]
  );

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '960px',
    margin: '0 auto',
    padding: tokens.spacing.space_6,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_4,
    marginBottom: tokens.spacing.space_6,
  };

  const backButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    color: tokens.colors.neutral.text_secondary,
    transition: 'all 150ms ease-out',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    margin: 0,
  };

  const stepIndicatorStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    marginBottom: tokens.spacing.space_6,
  };

  const stepStyles = (isActive: boolean, isComplete: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
    backgroundColor: isActive
      ? tokens.colors.brand.green_100
      : isComplete
      ? tokens.colors.brand.green_50
      : 'transparent',
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    fontFamily: tokens.typography.families.body,
    color: isActive
      ? tokens.colors.brand.green_800
      : isComplete
      ? tokens.colors.brand.green_600
      : tokens.colors.neutral.text_muted,
  });

  const stepNumberStyles = (isActive: boolean, isComplete: boolean): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: isComplete
      ? tokens.colors.brand.green_600
      : isActive
      ? tokens.colors.brand.green_700
      : tokens.colors.neutral.border,
    color: tokens.colors.neutral.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
  });

  const contentStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: tokens.spacing.space_6,
  };

  const desktopContentStyles: React.CSSProperties = {
    ...contentStyles,
    gridTemplateColumns: '1fr 320px',
  };

  const formCardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_6,
    boxShadow: tokens.shadows.card,
  };

  const sectionStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_6,
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.space_4,
  };

  const inputGroupStyles: React.CSSProperties = {
    marginBottom: tokens.spacing.space_4,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    marginBottom: tokens.spacing.space_2,
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.radii.md,
    fontSize: '16px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    outline: 'none',
    transition: 'border-color 150ms ease-out',
    boxSizing: 'border-box' as const,
  };

  const errorStyles: React.CSSProperties = {
    padding: tokens.spacing.space_3,
    backgroundColor: '#FDE7E7',
    border: `1px solid ${tokens.colors.semantic.danger}`,
    borderRadius: tokens.radii.md,
    color: tokens.colors.semantic.danger,
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    marginBottom: tokens.spacing.space_4,
  };

  const submitButtonStyles: React.CSSProperties = {
    width: '100%',
    padding: tokens.spacing.space_4,
    backgroundColor: tokens.colors.brand.green_700,
    color: tokens.colors.neutral.white,
    border: 'none',
    borderRadius: tokens.radii.md,
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.body,
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    opacity: isSubmitting ? 0.7 : 1,
    transition: 'all 150ms ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.space_2,
  };

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div style={pageStyles}>
      <Header user={personalUser} sedeNombre={sede?.nombre} onLogout={logout} />

      <div style={containerStyles}>
        <div style={headerStyles}>
          <button
            type="button"
            style={backButtonStyles}
            onClick={() => navigate('/agenda')}
            aria-label="Volver a la agenda"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <h1 style={titleStyles}>Reserva Presencial</h1>
        </div>

        <div style={stepIndicatorStyles}>
          <div style={stepStyles(true, false)}>
            <span style={stepNumberStyles(true, false)}>1</span>
            <span>Buscar Jugador</span>
          </div>
          <span style={{ color: tokens.colors.neutral.border }}>→</span>
          <div style={stepStyles(!jugador, !!jugador)}>
            <span style={stepNumberStyles(!jugador, !!jugador)}>2</span>
            <span>Reserva</span>
          </div>
        </div>

        <form style={isDesktop ? desktopContentStyles : contentStyles} onSubmit={handleSubmit}>
          <div style={formCardStyles}>
            {error && <div style={errorStyles}>{error}</div>}

            <div style={sectionStyles}>
              <h2 style={sectionTitleStyles}>Datos del Jugador</h2>

              <BuscadorJugador
                onJugadorFound={setJugador}
                error={errors.jugador}
              />

              {jugador && (
                <>
                  <div style={inputGroupStyles}>
                    <label style={labelStyles} htmlFor="jugadorNombre">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="jugadorNombre"
                      style={inputStyles}
                      value={jugador.nombre}
                      disabled
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.space_4 }}>
                    <div style={inputGroupStyles}>
                      <label style={labelStyles} htmlFor="jugadorTelefono">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="jugadorTelefono"
                        style={inputStyles}
                        value={jugador.telefono}
                        disabled
                      />
                    </div>

                    <div style={inputGroupStyles}>
                      <label style={labelStyles} htmlFor="jugadorEmail">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="jugadorEmail"
                        style={inputStyles}
                        value={jugador.email}
                        disabled
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <FormularioReserva
              canchas={canchas}
              tarifas={tarifas}
              canchaId={formData.canchaId}
              tarifaId={formData.tarifaId}
              fecha={formData.fecha}
              horaInicio={formData.horaInicio}
              esPagoManual={formData.esPagoManual}
              onCanchaChange={handleCanchaChange}
              onTarifaChange={handleTarifaChange}
              onFechaChange={handleFechaChange}
              onHoraChange={handleHoraChange}
              onPagoManualChange={handlePagoManualChange}
              errors={errors}
            />

            <button
              type="submit"
              style={submitButtonStyles}
              disabled={isSubmitting || sedeLoading}
            >
              {isSubmitting ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>

          <div>
            <ResumenTemporal
              jugador={jugador}
              cancha={getSelectedCancha()}
              tarifa={getSelectedTarifa()}
              fecha={formData.fecha}
              horaInicio={formData.horaInicio}
              esPagoManual={formData.esPagoManual}
            />
          </div>
        </form>
      </div>

      <ModalConfirmacion
        open={showSuccessModal}
        title="Reserva Creada"
        description="La reserva presencial se ha creado exitosamente."
        confirmLabel="Ir a Agenda"
        onConfirm={() => {
          setShowSuccessModal(false);
          navigate('/agenda');
        }}
        onCancel={() => setShowSuccessModal(false)}
        variant="primary"
      />
    </div>
  );
};

export default ReservaPresencialPage;
