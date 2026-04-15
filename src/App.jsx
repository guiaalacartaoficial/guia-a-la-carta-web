import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Guias from './pages/Guias';
import Servicios from './pages/Servicios';
import PostulacionGuias from './pages/PostulacionGuias';
import PostulacionEstudiantes from './pages/PostulacionEstudiantes';
import QuienesSomos from './pages/QuienesSomos';
import Contacto from './pages/Contacto';
import Relatos from './pages/Relatos';
import RelatoDetalle from './pages/RelatoDetalle';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guias" element={<Guias />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/postular-guia" element={<PostulacionGuias />} />
            <Route path="/postular-estudiante" element={<PostulacionEstudiantes />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/relatos" element={<Relatos />} />
            <Route path="/relatos/:id" element={<RelatoDetalle />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
