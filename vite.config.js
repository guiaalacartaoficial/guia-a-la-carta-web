import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// Forzando el reinicio del servidor de Vite para que reconozca los nuevos assets
