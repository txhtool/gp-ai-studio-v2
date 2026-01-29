import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to the backend server (usually localhost:3000 when running 'vercel dev')
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});