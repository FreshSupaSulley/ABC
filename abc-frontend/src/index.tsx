import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { LoadingProvider } from './components/LoadingContext';
import { APIProvider } from './components/APIProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Create a custom theme
export const theme = createTheme({
  typography: {
    fontFamily: 'system-ui'
  },
  palette: {
    // I'll just force dark theme ig
    mode: 'dark',
    primary: {
      main: '#FF6600',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
    },
    warning: {
      main: '#ff9800',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      contrastText: '#ffffff',
    },
  },
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <LoadingProvider>
        <CssBaseline />
        <App />
      </LoadingProvider>
    </ThemeProvider>
  </React.StrictMode>
);
