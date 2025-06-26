import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.151:9191',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost" // ✅ indispensable pour que le cookie soit stocké
      },
      '/professionnel': {
        target: 'http://192.168.1.151:9191',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost" // ✅ aussi ici
      },
    },
  },
});
