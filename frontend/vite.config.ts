import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:23001',
        changeOrigin: true,
        rewrite: (apiPath) => apiPath,
      },
      '/auth': {
        target: 'http://localhost:23001',
        changeOrigin: true,
        rewrite: (authPath) => authPath,
      },
      '/reservas': {
        target: 'http://localhost:23002',
        changeOrigin: true,
        rewrite: (reservasPath) => reservasPath,
      },
      '/pagos': {
        target: 'http://localhost:23003',
        changeOrigin: true,
        rewrite: (pagosPath) => pagosPath,
      },
      '/sedes': {
        target: 'http://localhost:23004',
        changeOrigin: true,
        rewrite: (sedesPath) => sedesPath,
      },
      '/clases': {
        target: 'http://localhost:23005',
        changeOrigin: true,
        rewrite: (clasesPath) => clasesPath,
      },
      '/admin': {
        target: 'http://localhost:23006',
        changeOrigin: true,
        rewrite: (adminPath) => adminPath,
      },
    },
  },
});