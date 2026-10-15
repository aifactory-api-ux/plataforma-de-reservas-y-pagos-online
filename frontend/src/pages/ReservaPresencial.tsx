import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { Header } from '../components/layout/Header';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { useAuth } from '../hooks/useAuth';
import { useSedeDetail } from '../hooks/useSedes';
import { sedesService } from '../services/sedes.service';
import type { UsuarioPersonal, Cancha, Tarifa } from '../types/models';

interface FormData {
  jugadorNombre: string;
  jugadorTelefono: string;
  jugadorEmail: string;
  canchaId: number;
  tarifaId: number;
  fecha: string;
  horaInicio: string;
  esPagoManual: boolean;
}

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

const ReservaPresencial: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const personalUser = user as UsuarioPersonal;
  const { sede, canchas, tarifas, isLoading: sedeLoading, fetchSedeDetail } = useSedeDetail(
    personalUser?.sedeId
  );

  const [formData, setFormData] = useState<FormData>({
    jugadorNombre: '',
    jugadorTelefono: '',
    jugadorEmail: '',
    canchaId: 0,
    tarifaId: 0,
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '10:00',
    esPagoManual: false,
  });

  const [filteredCanchas, setFilteredCanchas] = useState<Cancha[]>([]);
  const [filteredTarifas, setFilteredTarifas] = useState<Tarifa[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (personalUser?.sedeId) {
      fetchSedeDetail(personalUser.sedeId);
    }
  }, [personalUser?.sedeId, fetchSedeDetail]);

  useEffect(() => {
    if (canchas.length > 0 && formData.canchaId === 0) {
      setFormData((prev) => ({ ...prev, canchaId: canchas[0].id }));
    }
  }, [canchas, formData.canchaId]);

  useEffect(() => {
    if (formData.canchaId && tarifas.length > 0) {
      const selectedCancha = canchas.find((c) => c.id === formData.canchaId);
      if (selectedCancha) {
        const compatibleTarifas = tarifas.filter(
          (t) => t.deporte === selectedCancha.deporte
        );
        setFilteredTarifas(compatibleTarifas);
        if (compatibleTarifas.length > 0 && formData.tarifaId === 0) {
          setFormData((prev) => ({ ...prev, tarifaId: compatibleTarifas[0].id }));
        }
      }
    }
  }, [formData.canchaId, tarifas, canchas]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
      setError(null);
    },
    []
  );

  const handleCanchaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCanchaId = parseInt(e.target.value, 10);
      setFormData((prev) => ({
        ...prev,
        canchaId: newCanchaId,
        tarifaId: 0,
      }));
    },
    []
  );

  const calculateFin = useCallback((): string => {
    const selectedTarifa = tarifas.find((t) => t.id === formData.tarifaId);
    if (!selectedTarifa) return formData.horaInicio;

    const [hours, minutes] = formData.horaInicio.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + selectedTarifa.duracionMinutos);

    return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  }, [formData.horaInicio, formData.tarifaId, tarifas]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!formData.jugadorNombre.trim()) {
        setError('El nombre del jugador es obligatorio');
        return;
      }

      if (!formData.jugadorTelefono.trim()) {
        setError('El teléfono del jugador es obligatorio');
        return;
      }

      if (!formData.canchaId || !formData.tarifaId) {
        setError('Debe seleccionar una cancha y tarifa');
        return;
      }

      setIsSubmitting(true);

      try {
        const selectedTarifa = tarifas.find((t) => t.id === formData.tarifaId);
        const inicioDate = new Date(`${formData.fecha}T${formData.horaInicio}:00`);
        const finDate = new Date(inicioDate.getTime() + (selectedTarifa?.duracionMinutos ?? 60) * 60000);

        await sedesService.createReservaPresencial({
          jugadorNombre: formData.jugadorNombre,
          jugadorTelefono: formData.jugadorTelefono,
          jugadorEmail: formData.jugadorEmail || undefined,
          canchaId: formData.canchaId,
          tarifaId: formData.tarifaId,
          inicio: inicioDate.toISOString(),
          fin: finDate.toISOString(),
          esPagoManual: formData.esPagoManual,
        });

        setShowSuccessModal(true);
        setFormData({
          jugadorNombre: '',
          jugadorTelefono: '',
          jugadorEmail: '',
          canchaId: canchas[0]?.id ?? 0,
          tarifaId: filteredTarifas[0]?.id ?? 0,
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
    [formData, tarifas, canchas, filteredTarifas]
  );

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: tokens.spacing.page_gutter_desktop,
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
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: tokens.typography.families.display,
    color: tokens.colors.neutral.text_primary,
    letterSpacing: '0.01em',
    margin: 0,
  };

  const formStyles: React.CSSProperties = {
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

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23647A6F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${tokens.spacing.space_4} center`,
    paddingRight: tokens.spacing.space_10,
  };

  const checkboxContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
    marginTop: tokens.spacing.space_4,
  };

  const checkboxStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: tokens.colors.brand.green_700,
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

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div style={pageStyles}>
      <Header
        user={personalUser}
        sedeNombre={sede?.nombre}
        onLogout={logout}
      />

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

        <form style={formStyles} onSubmit={handleSubmit}>
          {error && <div style={errorStyles}>{error}</div>}

          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Datos del Jugador</h2>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="jugadorNombre">
                Nombre completo *
              </label>
              <input
                type="text"
                id="jugadorNombre"
                name="jugadorNombre"
                style={inputStyles}
                value={formData.jugadorNombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="jugadorTelefono">
                Teléfono *
              </label>
              <input
                type="tel"
                id="jugadorTelefono"
                name="jugadorTelefono"
                style={inputStyles}
                value={formData.jugadorTelefono}
                onChange={handleInputChange}
                placeholder="Ej: +56 9 1234 5678"
                required
              />
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="jugadorEmail">
                Correo electrónico (opcional)
              </label>
              <input
                type="email"
                id="jugadorEmail"
                name="jugadorEmail"
                style={inputStyles}
                value={formData.jugadorEmail}
                onChange={handleInputChange}
                placeholder="Ej: juan@email.com"
              />
            </div>
          </div>

          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Detalles de la Reserva</h2>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="fecha">
                Fecha
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                style={inputStyles}
                value={formData.fecha}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="horaInicio">
                Hora de inicio
              </label>
              <select
                id="horaInicio"
                name="horaInicio"
                style={selectStyles}
                value={formData.horaInicio}
                onChange={handleInputChange}
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="canchaId">
                Cancha
              </label>
              <select
                id="canchaId"
                name="canchaId"
                style={selectStyles}
                value={formData.canchaId}
                onChange={handleCanchaChange}
              >
                {canchas.map((cancha) => (
                  <option key={cancha.id} value={cancha.id}>
                    {cancha.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'} -{' '}
                    {cancha.techada ? 'Techada' : 'Descubierta'}
                  </option>
                ))}
              </select>
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="tarifaId">
                Tarifa
              </label>
              <select
                id="tarifaId"
                name="tarifaId"
                style={selectStyles}
                value={formData.tarifaId}
                onChange={handleInputChange}
              >
                {filteredTarifas.map((tarifa) => (
                  <option key={tarifa.id} value={tarifa.id}>
                    {tarifa.franja === 'manana' ? 'Mañana' : tarifa.franja === 'tarde' ? 'Tarde' : 'Noche'} -{' '}
                    ${tarifa.monto.toLocaleString('es-CL')} ({tarifa.duracionMinutos} min)
                  </option>
                ))}
              </select>
            </div>

            <div style={checkboxContainerStyles}>
              <input
                type="checkbox"
                id="esPagoManual"
                name="esPagoManual"
                style={checkboxStyles}
                checked={formData.esPagoManual}
                onChange={handleInputChange}
              />
              <label style={labelStyles} htmlFor="esPagoManual">
                Pago en efectivo/transferencia (no online)
              </label>
            </div>
          </div>

          <button
            type="submit"
            style={submitButtonStyles}
            disabled={isSubmitting || sedeLoading}
          >
            {isSubmitting ? 'Creando...' : 'Crear Reserva'}
          </button>
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

export default ReservaPresencial;