import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1',
    port: 55556,
    open: true, // Abre automaticamente no navegador
  },
  preview: {
    port: 4173,
    open: true,
  },
});
