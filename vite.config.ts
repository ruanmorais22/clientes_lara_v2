import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/clientes_lara_v2/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
