import React from 'react';
import { tokens } from '../../../styles/tokens';

type FilterTab = 'proximas' | 'pasadas' | 'canceladas';

interface FiltroReservasProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

const FiltroReservas: React.FC<FiltroReservasProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.space_2,
  };

  const getTabStyles = (isActive: boolean): React.CSSProperties => ({
    padding: `${tokens.spacing.space_2} ${tokens.spacing.space_4}`,
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: tokens.typography.families.body,
    color: isActive ? tokens.colors.brand.green_700 : tokens.colors.neutral.text_secondary,
    backgroundColor: isActive ? tokens.colors.brand.green_50 : 'transparent',
    border: 'none',
    borderRadius: tokens.radii.pill,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  });

  const handleTabClick = (tab: FilterTab) => {
    onTabChange(tab);
  };

  return (
    <div style={tabsContainerStyles} role="tablist" aria-label="Filtro de reservas">
      <button
        style={getTabStyles(activeTab === 'proximas')}
        onClick={() => handleTabClick('proximas')}
        role="tab"
        aria-selected={activeTab === 'proximas'}
      >
        Próximas
      </button>
      <button
        style={getTabStyles(activeTab === 'pasadas')}
        onClick={() => handleTabClick('pasadas')}
        role="tab"
        aria-selected={activeTab === 'pasadas'}
      >
        Pasadas
      </button>
      <button
        style={getTabStyles(activeTab === 'canceladas')}
        onClick={() => handleTabClick('canceladas')}
        role="tab"
        aria-selected={activeTab === 'canceladas'}
      >
        Canceladas
      </button>
    </div>
  );
};

export default FiltroReservas;
