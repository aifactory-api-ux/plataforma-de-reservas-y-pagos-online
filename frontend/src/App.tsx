import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { tokens } from './styles/tokens';
import AppRoutes from './routes/Routes';

const App: React.FC = () => {
  const appStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral.background,
    color: tokens.colors.neutral.text_primary,
    fontFamily: tokens.typography.families.body,
  };

  return (
    <div style={appStyles}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
};

export default App;