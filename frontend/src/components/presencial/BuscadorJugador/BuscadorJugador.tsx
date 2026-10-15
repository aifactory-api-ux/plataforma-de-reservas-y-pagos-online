import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, User } from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { apiFetch } from '../../../lib/api';
import type { Jugador } from '../../../types/models';

interface BuscadorJugadorProps {
  onJugadorFound: (jugador: Jugador | null) => void;
  error?: string | null;
}

interface JugadorSearchResult {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  inasistencias60Dias: number;
}

export const BuscadorJugador: React.FC<BuscadorJugadorProps> = ({
  onJugadorFound,
  error: externalError,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundJugador, setFoundJugador] = useState<JugadorSearchResult | null>(null);

  const searchJugador = useCallback(async (term: string) => {
    if (term.length < 3) {
      setFoundJugador(null);
      onJugadorFound(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await apiFetch.get<JugadorSearchResult[]>(
        `/api/jugadores/buscar?q=${encodeURIComponent(term)}`
      );

      if (results.length > 0) {
        const jugador = results[0];
        setFoundJugador(jugador);
        onJugadorFound(jugador);

        if (jugador.bloqueado) {
          setSearchError('Este jugador se encuentra bloqueado');
        }
      } else {
        setFoundJugador(null);
        onJugadorFound(null);
      }
    } catch {
      setSearchError('Error al buscar jugador');
      setFoundJugador(null);
      onJugadorFound(null);
    } finally {
      setIsSearching(false);
    }
  }, [onJugadorFound]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchJugador(searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchJugador]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (foundJugador) {
      setFoundJugador(null);
      onJugadorFound(null);
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.space_3,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const inputWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputIconStyles: React.CSSProperties = {
    position: 'absolute',
    left: tokens.spacing.space_4,
    color: tokens.colors.neutral.text_muted,
    pointerEvents: 'none',
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${tokens.spacing.space_3} ${tokens.spacing.space_4} ${tokens.spacing.space_3} 44px`,
    backgroundColor: tokens.colors.neutral.surface,
    border: `1px solid ${
      externalError || searchError
        ? tokens.colors.semantic.danger
        : foundJugador
        ? tokens.colors.brand.green_300
        : tokens.colors.neutral.border
    }`,
    borderRadius: tokens.radii.md,
    fontSize: '16px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
    outline: 'none',
    transition: 'border-color 150ms ease-out',
    boxSizing: 'border-box' as const,
  };

  const checkIconStyles: React.CSSProperties = {
    position: 'absolute',
    right: tokens.spacing.space_4,
    color: tokens.colors.semantic.success,
  };

  const playerInfoStyles: React.CSSProperties = {
    padding: tokens.spacing.space_3,
    backgroundColor: tokens.colors.brand.green_100,
    border: `1px solid ${tokens.colors.brand.green_300}`,
    borderRadius: tokens.radii.md,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.space_3,
  };

  const playerNameStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_primary,
  };

  const playerDetailStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.neutral.text_secondary,
  };

  const errorTextStyles: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: tokens.typography.families.body,
    color: tokens.colors.semantic.danger,
    marginTop: tokens.spacing.space_1,
  };

  return (
    <div style={containerStyles}>
      <label style={labelStyles}>Buscar Jugador</label>

      <div style={inputWrapperStyles}>
        <span style={inputIconStyles}>
          <Search size={20} strokeWidth={1.75} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          style={inputStyles}
          placeholder="Nombre, email o teléfono..."
        />
        {foundJugador && !searchError && (
          <span style={checkIconStyles}>
            <CheckCircle size={20} strokeWidth={1.75} />
          </span>
        )}
      </div>

      {isSearching && (
        <span style={{ fontSize: '12px', color: tokens.colors.neutral.text_muted }}>
          Buscando...
        </span>
      )}

      {foundJugador && !searchError && (
        <div style={playerInfoStyles}>
          <User size={20} strokeWidth={1.75} color={tokens.colors.brand.green_700} />
          <div>
            <div style={playerNameStyles}>{foundJugador.nombre}</div>
            <div style={playerDetailStyles}>
              {foundJugador.email} • {foundJugador.telefono}
            </div>
          </div>
        </div>
      )}

      {(externalError || searchError) && (
        <span style={errorTextStyles}>{externalError || searchError}</span>
      )}
    </div>
  );
};

export default BuscadorJugador;
