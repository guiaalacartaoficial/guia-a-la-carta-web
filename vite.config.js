import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin de desarrollo: ejecuta las funciones serverless de /api (Vercel) dentro de `npm run dev`
const localApiPlugin = (env) => ({
  name: 'local-vercel-api',
  apply: 'serve',
  configureServer(server) {
    // Exponer variables de servidor (sin prefijo VITE_) a las funciones /api
    Object.assign(process.env, env);
    server.middlewares.use('/api/google-reviews', async (req, res) => {
      try {
        const mod = await server.ssrLoadModule('/api/google-reviews.js');
        await mod.default(req, res);
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  },
});

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
export default defineConfig(({ mode }) => ({
  plugins: [react(), asyncCssPlugin(), localApiPlugin(loadEnv(mode, process.cwd(), ''))],
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
}))

// Forzando el reinicio del servidor de Vite para que reconozca los nuevos assets
