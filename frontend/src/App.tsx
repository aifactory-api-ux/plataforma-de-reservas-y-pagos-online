import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { tokens } from './styles/tokens';

import Login from './pages/Login';
import BuscarCancha from './pages/BuscarCancha';
import Pago from './pages/Pago';
import MisReservas from './pages/MisReservas';
import AgendaSede from './pages/AgendaSede';
import ReservaPresencial from './pages/ReservaPresencial';
import MisClases from './pages/MisClases';
import PanelAdmin from './pages/PanelAdmin';

const App: React.FC = () => {
  const appStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    color: tokens.colors.neutral.text_primary,
    fontFamily: tokens.typography.families.body,
  };

  return (
    <div style={appStyles}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buscar-cancha" element={<BuscarCancha />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/agenda" element={<AgendaSede />} />
        <Route path="/reserva-presencial" element={<ReservaPresencial />} />
        <Route path="/mis-clases" element={<MisClases />} />
        <Route path="/admin" element={<PanelAdmin />} />
      </Routes>
    </div>
  );
};

export default App;
