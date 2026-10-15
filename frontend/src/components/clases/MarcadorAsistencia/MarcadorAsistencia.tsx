import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, UserCheck, UserX } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import type { InscripcionClase, Clase } from '../../../types/models';
import { clasesService } from '../../../services/clases.service';

export interface MarcadorAsistenciaProps {
  clase: Clase;
  inscripciones: InscripcionClase[];
  onUpdate?: () => void;
}

type AttendanceStatus = 'presente' | 'ausente' | 'pendiente';

const getAttendanceIcon = (status: AttendanceStatus) => {
  switch (status) {
    case 'presente':
      return <UserCheck size={16} strokeWidth={1.75} color={tokens.colors.semantic.success} />;
    case 'ausente':
      return <UserX size={16} strokeWidth={1.75} color={tokens.colors.semantic.danger} />;
    case 'pendiente':
      return <Clock size={16} strokeWidth={1.75} color={tokens.colors.neutral.text_muted} />;
  }
};

const getStatusLabel = (status: AttendanceStatus): string => {
  switch (status) {
    case 'presente':
      return 'Presente';
    case 'ausente':
      return 'Ausente';
    case 'pendiente':
      return 'Pendiente';
  }
};

const MarcadorAsistencia: React.FC<MarcadorAsistenciaProps> = ({
  clase: _clase,
  inscripciones,
  onUpdate,
}) => {
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>(() => {
    const initial: Record<number, AttendanceStatus> = {};
    inscripciones.forEach((insc) => {
      initial[insc.id] = insc.estado === 'activa' ? 'pendiente' : insc.estado === 'cancelada' ? 'ausente' : 'pendiente';
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAttendance = async (inscripcionId: number, _jugadorId: number, status: AttendanceStatus) => {
    setLoading(true);
    setError(null);

    try {
      setAttendanceMap((prev) => ({
        ...prev,
        [inscripcionId]: status,
      }));

      if (status === 'ausente') {
        await clasesService.desinscribirJugador(inscripcionId);
      }

      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar asistencia');
      setAttendanceMap((prev) => ({
        ...prev,
        [inscripcionId]: 'pendiente',
      }));
    } finally {
      setLoading(false);
    }
  };

  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.neutral.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.space_4,
    marginTop: tokens.spacing.space_4,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_2,
    marginBottom: tokens.spacing.space_4,
  };

  const headerTitleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    margin: 0,
  };

  const listStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_2,
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.space_3,
    backgroundColor: tokens.colors.neutral.surface_subtle,
    borderRadius: tokens.radii.md,
    minHeight: '48px',
  };

  const itemInfoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const nombreStyles: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const statusBadgeStyles = (status: AttendanceStatus): React.CSSProperties => {
    let backgroundColor = tokens.colors.neutral.surface_subtle;
    let color = tokens.colors.neutral.text_muted;

    if (status === 'presente') {
      backgroundColor = tokens.colors.semantic.success + '20';
      color = tokens.colors.semantic.success;
    } else if (status === 'ausente') {
      backgroundColor = tokens.colors.semantic.danger + '20';
      color = tokens.colors.semantic.danger;
    }

    return {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing.space_1,
      padding: `${tokens.spacing.space_1} ${tokens.spacing.space_2}`,
      borderRadius: tokens.radii.sm,
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: tokens.typography.families.body,
      backgroundColor,
      color,
    };
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const actionButtonStyles = (_variant: 'success' | 'danger'): React.CSSProperties => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      backgroundColor: 'transparent',
      border: `1px solid ${tokens.colors.neutral.border}`,
      borderRadius: tokens.radii.sm,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.5 : 1,
      transition: 'all 150ms ease-out',
    };
  };

  const handlePresentHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.backgroundColor = tokens.colors.semantic.success + '20';
      e.currentTarget.style.borderColor = tokens.colors.semantic.success;
    }
  };

  const handlePresentLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  };

  const handleAbsentHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.backgroundColor = tokens.colors.semantic.danger + '20';
      e.currentTarget.style.borderColor = tokens.colors.semantic.danger;
    }
  };

  const handleAbsentLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.borderColor = tokens.colors.neutral.border;
  };

  if (inscripciones.length === 0) {
    return (
      <div style={containerStyles}>
        <p style={{ ...headerTitleStyles, color: tokens.colors.neutral.text_muted }}>
          No hay jugadores inscritos en esta clase
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <CheckCircle size={20} strokeWidth={1.75} color={tokens.colors.brand.green_500} />
        <h3 style={headerTitleStyles}>Asistencia</h3>
      </div>

      {error && (
        <div style={{
          padding: tokens.spacing.space_3,
          marginBottom: tokens.spacing.space_3,
          backgroundColor: tokens.colors.semantic.danger + '15',
          borderRadius: tokens.radii.sm,
          color: tokens.colors.semantic.danger,
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <div style={listStyles}>
        {inscripciones.map((inscripcion) => {
          const status = attendanceMap[inscripcion.id] || 'pendiente';
          return (
            <div key={inscripcion.id} style={itemStyles}>
              <div style={itemInfoStyles}>
                {getAttendanceIcon(status)}
                <span style={nombreStyles}>
                  Jugador #{inscripcion.jugadorId}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.space_3 }}>
                <span style={statusBadgeStyles(status)}>
                  {getStatusLabel(status)}
                </span>

                <div style={actionsStyles}>
                  <button
                    type="button"
                    style={actionButtonStyles('success')}
                    onClick={() => markAttendance(inscripcion.id, inscripcion.jugadorId, 'presente')}
                    onMouseEnter={handlePresentHover}
                    onMouseLeave={handlePresentLeave}
                    disabled={loading}
                    aria-label="Marcar presente"
                  >
                    <CheckCircle size={16} strokeWidth={1.75} color={tokens.colors.semantic.success} />
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyles('danger')}
                    onClick={() => markAttendance(inscripcion.id, inscripcion.jugadorId, 'ausente')}
                    onMouseEnter={handleAbsentHover}
                    onMouseLeave={handleAbsentLeave}
                    disabled={loading}
                    aria-label="Marcar ausente"
                  >
                    <XCircle size={16} strokeWidth={1.75} color={tokens.colors.semantic.danger} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarcadorAsistencia;
