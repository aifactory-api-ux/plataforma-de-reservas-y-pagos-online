import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, MapPin } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import SelectorFecha from '../../components/cancha/SelectorFecha/SelectorFecha';
import TarjetaSede from '../../components/cancha/TarjetaSede/TarjetaSede';
import GridHorarios from '../../components/cancha/GridHorarios/GridHorarios';
import { BottomNav } from '../../components/layout/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useReservas } from '../../context/ReservationContext';
import { sedesService } from '../../services/sedes.service';
import type { Sede, Cancha, Filters, AvailabilitySlot, FranjaHoraria } from '../../types/models';

export interface SlotByCancha {
  canchaId: number;
  canchaNombre: string;
  slots: AvailabilitySlot[];
}

const getPageStyles = (): React.CSSProperties => ({
  minHeight: '100vh',
  backgroundColor: tokens.colors.neutral.background,
  paddingBottom: '80px',
});

const getMainStyles = (): React.CSSProperties => ({
  maxWidth: '600px',
  margin: '0 auto',
});

const getHeaderStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.neutral.surface,
  padding: `${tokens.spacing.space_4} ${tokens.spacing.page_gutter_mobile}`,
  borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  position: 'sticky' as const,
  top: 0,
  zIndex: 20,
});

const getHeaderTopStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: tokens.spacing.space_3,
});

const getTitleStyles = (): React.CSSProperties => ({
  fontSize: '22px',
  fontWeight: 700,
  fontFamily: tokens.typography.families.display,
  color: tokens.colors.neutral.text_primary,
  letterSpacing: '0.01em',
  margin: 0,
});

const getFilterButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_1,
  padding: `${tokens.spacing.space_2} ${tokens.spacing.space_3}`,
  borderRadius: tokens.radii.md,
  border: `1px solid ${tokens.colors.neutral.border}`,
  backgroundColor: tokens.colors.neutral.surface,
  fontSize: '13px',
  fontFamily: tokens.typography.families.body,
  fontWeight: 500,
  color: tokens.colors.neutral.text_secondary,
  cursor: 'pointer',
});

const getContentStyles = (): React.CSSProperties => ({
  padding: tokens.spacing.space_4,
});

const getSedesSectionStyles = (): React.CSSProperties => ({
  marginBottom: tokens.spacing.space_6,
});

const getSectionTitleStyles = (): React.CSSProperties => ({
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  marginBottom: tokens.spacing.space_3,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.space_2,
});

const getSedesGridStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: tokens.spacing.space_3,
});

const getDeporteFilterStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: tokens.spacing.space_2,
  marginBottom: tokens.spacing.space_4,
});

const getDeporteButtonStyles = (isActive: boolean, _deporte: string): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing.space_2,
  padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4}`,
  borderRadius: tokens.radii.md,
  border: isActive
    ? `2px solid ${tokens.colors.brand.green_700}`
    : `1px solid ${tokens.colors.neutral.border}`,
  backgroundColor: isActive
    ? tokens.colors.brand.green_50
    : tokens.colors.neutral.surface,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  fontWeight: isActive ? 600 : 400,
  color: isActive
    ? tokens.colors.brand.green_700
    : tokens.colors.neutral.text_secondary,
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
});

const getLoadingStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing.space_12,
  color: tokens.colors.neutral.text_muted,
});

const getErrorStyles = (): React.CSSProperties => ({
  backgroundColor: tokens.colors.reservation_status.cancelada.fill,
  border: `1px solid ${tokens.colors.reservation_status.cancelada.border}`,
  borderRadius: tokens.radii.md,
  padding: tokens.spacing.space_4,
  marginBottom: tokens.spacing.space_4,
  color: tokens.colors.reservation_status.cancelada.text,
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
});

const getEmptyStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing.space_12,
  textAlign: 'center' as const,
});

const getEmptyTitleStyles = (): React.CSSProperties => ({
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_primary,
  marginBottom: tokens.spacing.space_2,
  margin: 0,
});

const getEmptyTextStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontFamily: tokens.typography.families.body,
  color: tokens.colors.neutral.text_secondary,
  margin: 0,
});

const getDeporteEmoji = (deporte: string): string => {
  return deporte === 'padel' ? '🎾' : '⚽';
};

const groupSlotsByCancha = (
  slots: AvailabilitySlot[],
  canchas: Cancha[]
): SlotByCancha[] => {
  const canchaMap = new Map<number, Cancha>();
  canchas.forEach((c) => canchaMap.set(c.id, c));

  const groups = new Map<number, SlotByCancha>();

  slots.forEach((slot) => {
    if (!groups.has(slot.canchaId)) {
      groups.set(slot.canchaId, {
        canchaId: slot.canchaId,
        canchaNombre: slot.canchaNombre || `Cancha ${slot.canchaId}`,
        slots: [],
      });
    }
    groups.get(slot.canchaId)!.slots.push(slot);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.canchaNombre.localeCompare(b.canchaNombre)
  );
};

const BuscarCanchaPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    availableSlots,
    isLoading: isLoadingSlots,
    fetchAvailability,
  } = useReservas();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [selectedDeporte, setSelectedDeporte] = useState<'padel' | 'futbol7'>('padel');
  const [selectedFecha, setSelectedFecha] = useState<Date>(new Date());
  const [selectedFranja, setSelectedFranja] = useState<FranjaHoraria | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadSedes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sedesData = await sedesService.getSedes();
        setSedes(sedesData);
        if (sedesData.length > 0) {
          setSelectedSede(sedesData[0]);
        }
      } catch (err) {
        setError('Error al cargar las sedes. Por favor intenta de nuevo.');
        console.error('Error loading sedes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSedes();
  }, []);

  useEffect(() => {
    const loadCanchas = async () => {
      if (!selectedSede) return;
      try {
        const canchasData = await sedesService.getCanchas(selectedSede.id);
        setCanchas(canchasData);
      } catch (err) {
        console.error('Error loading canchas:', err);
      }
    };
    loadCanchas();
  }, [selectedSede]);

  useEffect(() => {
    if (!selectedSede) return;

    const filters: Filters = {
      sedeId: selectedSede.id,
      deporte: selectedDeporte,
      fecha: selectedFecha,
      rangoHorario: selectedFranja,
    };
    fetchAvailability(filters);
  }, [selectedSede, selectedDeporte, selectedFecha, selectedFranja, fetchAvailability]);

  const handleSedeSelect = useCallback((sede: Sede) => {
    setSelectedSede(sede);
  }, []);

  const handleDeporteSelect = useCallback((deporte: 'padel' | 'futbol7') => {
    setSelectedDeporte(deporte);
  }, []);

  const handleFechaChange = useCallback((fecha: Date) => {
    setSelectedFecha(fecha);
  }, []);

  const handleFranjaChange = useCallback((franja: FranjaHoraria | undefined) => {
    setSelectedFranja(franja);
  }, []);

  const handleSelectSlot = useCallback(
    (slot: AvailabilitySlot) => {
      if (!slot.disponible) return;
      sessionStorage.setItem('selectedSlot', JSON.stringify(slot));
      navigate('/pago', { state: { slot } });
    },
    [navigate]
  );

  const filteredCanchas = canchas.filter(
    (c) => c.deporte === selectedDeporte && c.estado === 'disponible'
  );

  const slotsByCancha = groupSlotsByCancha(availableSlots, filteredCanchas);

  const handleMouseEnterFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = tokens.colors.brand.green_300;
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface_subtle;
  };

  const handleMouseLeaveFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface;
  };

  const handleDeporteHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    isActive: boolean
  ) => {
    if (isActive) return;
    e.currentTarget.style.borderColor = tokens.colors.brand.green_300;
    e.currentTarget.style.backgroundColor = tokens.colors.brand.green_50;
  };

  const handleDeporteLeave = (
    e: React.MouseEvent<HTMLButtonElement>,
    isActive: boolean
  ) => {
    if (isActive) return;
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
    e.currentTarget.style.backgroundColor = tokens.colors.neutral.surface;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={getPageStyles()}>
      <div style={getMainStyles()}>
        <div style={getHeaderStyles()}>
          <div style={getHeaderTopStyles()}>
            <h1 style={getTitleStyles()}>Buscar Cancha</h1>
            <button
              style={getFilterButtonStyles()}
              onClick={() => setShowFilters(!showFilters)}
              onMouseEnter={handleMouseEnterFilter}
              onMouseLeave={handleMouseLeaveFilter}
            >
              <Filter size={16} strokeWidth={1.75} />
              Filtros
            </button>
          </div>

          <SelectorFecha
            fecha={selectedFecha}
            rangoHorario={selectedFranja}
            onFechaChange={handleFechaChange}
            onRangoChange={handleFranjaChange}
          />
        </div>

        <div style={getContentStyles()}>
          {error && <div style={getErrorStyles()}>{error}</div>}

          <div style={getDeporteFilterStyles()}>
            <button
              style={getDeporteButtonStyles(
                selectedDeporte === 'padel',
                'padel'
              )}
              onClick={() => handleDeporteSelect('padel')}
              onMouseEnter={(e) => handleDeporteHover(e, selectedDeporte === 'padel')}
              onMouseLeave={(e) => handleDeporteLeave(e, selectedDeporte === 'padel')}
            >
              {getDeporteEmoji('padel')} Pádel
            </button>
            <button
              style={getDeporteButtonStyles(
                selectedDeporte === 'futbol7',
                'futbol7'
              )}
              onClick={() => handleDeporteSelect('futbol7')}
              onMouseEnter={(e) => handleDeporteHover(e, selectedDeporte === 'futbol7')}
              onMouseLeave={(e) => handleDeporteLeave(e, selectedDeporte === 'futbol7')}
            >
              {getDeporteEmoji('futbol7')} Fútbol 7
            </button>
          </div>

          {isLoading ? (
            <div style={getLoadingStyles()}>
              <span>Cargando sedes...</span>
            </div>
          ) : (
            <>
              <div style={getSedesSectionStyles()}>
                <h2 style={getSectionTitleStyles()}>
                  <MapPin size={18} strokeWidth={1.75} />
                  Sedes
                </h2>
                <div style={getSedesGridStyles()}>
                  {sedes.map((sede) => (
                    <TarjetaSede
                      key={sede.id}
                      sede={sede}
                      canchas={canchas}
                      selected={selectedSede?.id === sede.id}
                      onClick={() => handleSedeSelect(sede)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 style={getSectionTitleStyles()}>
                  Horarios disponibles
                  {selectedSede && ` - ${selectedSede.nombre}`}
                </h2>

                {isLoadingSlots ? (
                  <div style={getLoadingStyles()}>
                    <span>Cargando horarios...</span>
                  </div>
                ) : slotsByCancha.length === 0 ? (
                  <div style={getEmptyStyles()}>
                    <MapPin size={48} strokeWidth={1} color={tokens.colors.neutral.text_muted} />
                    <h3 style={getEmptyTitleStyles()}>
                      No hay horarios disponibles
                    </h3>
                    <p style={getEmptyTextStyles()}>
                      Prueba con otra fecha o selecciona otro deporte
                    </p>
                  </div>
                ) : (
                  slotsByCancha.map((canchaGroup) => (
                    <GridHorarios
                      key={canchaGroup.canchaId}
                      canchaNombre={canchaGroup.canchaNombre}
                      canchaId={canchaGroup.canchaId}
                      slots={canchaGroup.slots}
                      onSelectSlot={handleSelectSlot}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav activeRoute="/buscar-cancha" onNavigate={(route) => navigate(route)} />
    </div>
  );
};

export default BuscarCanchaPage;
