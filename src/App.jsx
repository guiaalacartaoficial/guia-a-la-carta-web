import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages — lazy loaded for code splitting
const Home = lazy(() => import('./pages/Home'));
const Guias = lazy(() => import('./pages/Guias'));
const Servicios = lazy(() => import('./pages/Servicios'));
const PostulacionGuias = lazy(() => import('./pages/PostulacionGuias'));
const PostulacionEstudiantes = lazy(() => import('./pages/PostulacionEstudiantes'));
const QuienesSomos = lazy(() => import('./pages/QuienesSomos'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Relatos = lazy(() => import('./pages/Relatos'));
const RelatoDetalle = lazy(() => import('./pages/RelatoDetalle'));
const AdminDashboard = lazy(() => import('./pages/Admin'));
const Reserva = lazy(() => import('./pages/Reserva'));
const Manuales = lazy(() => import('./pages/Manuales'));
const Disponibilidad = lazy(() => import('./pages/Disponibilidad'));
const ClientesPortal = lazy(() => import('./pages/ClientesPortal'));

// Fallback de carga minimalista
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div style={{ width: 40, height: 40, border: '4px solid rgba(14,91,76,0.2)', borderTopColor: '#0E5B4C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guias" element={<Guias />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/postular-guia" element={<PostulacionGuias />} />
            <Route path="/postular-estudiante" element={<PostulacionEstudiantes />} />
            <Route path="/manuales" element={<Manuales />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/relatos" element={<Relatos />} />
            <Route path="/relatos/:id" element={<RelatoDetalle />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/reservar" element={<Reserva />} />
            <Route path="/disponibilidad" element={<Disponibilidad />} />
            <Route path="/portal-b2b" element={<ClientesPortal />} />
          </Routes>
          <Footer />
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;

