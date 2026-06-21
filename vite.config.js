import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin personalizado para inyectar carga asíncrona en las hojas de estilo compiladas
const asyncCssPlugin = () => {
  return {
    name: 'async-css-plugin',
    transformIndexHtml(html) {
      // 1. Eliminar por completo el link estático del CSS de Leaflet/Mapas del HTML inicial
      let cleanHtml = html.replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href="[^"]*vendor-maps[^"]*"\s*\/?>/g, '');
      
      // 2. Hacer asíncronos el resto de estilos no críticos
      return cleanHtml.replace(
        /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)"\s*\/?>/g,
        '<link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\'">'
      );
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), asyncCssPlugin()],
  build: {
    modulePreload: {
      // Filtra de manera selectiva para que el navegador pre-cargue dependencias críticas en paralelo,
      // pero bloquee por completo la pre-carga del chunk pesado del mapa (vendor-maps).
      resolveDependencies(filename, deps) {
        return deps.filter(dep => !dep.includes('vendor-maps'));
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Agrupamos únicamente el mapa (Leaflet) por separado para cargarlo de manera diferida/lazy.
          // React, React-DOM, Router e Iconos vuelven al index principal para evitar waterfalls de red.
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
