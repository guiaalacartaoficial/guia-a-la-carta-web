import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/leaflet') || id.includes('components/ChileMap')) {
            return 'vendor-maps';
          }
        }
      }
    },
    sourcemap: false,
    cssCodeSplit: true,
  }
})

// Forzando el reinicio del servidor de Vite para que reconozca los nuevos assets
