import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Le port sur lequel votre application React tourne
    proxy: {
      // Toutes les requêtes qui commencent par '/api'
      // seront redirigées vers votre backend.
      '/api': {
        target: 'http://192.168.1.151:9191', // <--- Assurez-vous que C'EST L'ADRESSE IP DE VOTRE BACKEND
        changeOrigin: true,
        secure: false,
        // La ligne 'rewrite' doit rester COMMENTÉE ou ABSENTE. Votre backend a bien /api.
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // IMPORTANT: Ajoutez un second proxy pour les routes qui commencent par '/professionnel'
      // si vos contrôleurs Spring Boot pour les consultations/réservations/messages
      // utilisent un @RequestMapping("/professionnel/...") et NON @RequestMapping("/api/professionnel/...")
      '/professionnel': {
        target: 'http://192.168.1.151:9191', // <--- Même IP de votre backend
        changeOrigin: true,
        secure: false,
        // Comme pour '/api', si votre backend a '/professionnel' dans son mapping, cette ligne doit être COMMENTÉE.
        // rewrite: (path) => path.replace(/^\/professionnel/, ''),
      },
      // Ajoutez d'autres proxies si vous avez d'autres préfixes de routes dans votre backend (ex: /public, /auth etc. si non gérés par /api)
    },
  },
});
