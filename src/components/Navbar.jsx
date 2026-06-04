import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [sociosOpen, setSociosOpen] = useState(false);
  const location = useLocation();

  // Detectar scroll para transición transparente → sólido
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setPostOpen(false);
    setSociosOpen(false);
  };

  // Solo transparente en la Home
  const isHome = location.pathname === '/';

  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'transparent' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Guía a la Carta" />
          <span>Guía a la Carta</span>
        </Link>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Menú">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav className={`navbar-nav ${isOpen ? 'active' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Inicio</NavLink>
          <NavLink to="/servicios" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Servicios</NavLink>
          <NavLink to="/guias" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Nuestros Guías</NavLink>
          <NavLink to="/relatos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Relatos</NavLink>
          
          {/* Dropdown Postulaciones */}
          <div className="nav-dropdown">
            <button className="nav-link nav-dropdown-toggle" onClick={() => { setPostOpen(!postOpen); setSociosOpen(false); }}>
              Postulaciones <ChevronDown size={16} className={`chevron ${postOpen ? 'open' : ''}`} />
            </button>
            <div className={`nav-dropdown-menu ${postOpen ? 'show' : ''}`}>
              <NavLink to="/postular-guia" onClick={closeMenu} className="dropdown-item">Postular como Guía</NavLink>
              <NavLink to="/postular-estudiante" onClick={closeMenu} className="dropdown-item">Postular como Estudiante</NavLink>
            </div>
          </div>

          {/* Dropdown Gestión de Servicios */}
          <div className="nav-dropdown">
            <button className="nav-link nav-dropdown-toggle" onClick={() => { setSociosOpen(!sociosOpen); setPostOpen(false); }}>
              Gestión de Servicios <ChevronDown size={16} className={`chevron ${sociosOpen ? 'open' : ''}`} />
            </button>
            <div className={`nav-dropdown-menu ${sociosOpen ? 'show' : ''}`}>
              <NavLink to="/disponibilidad" onClick={closeMenu} className="dropdown-item">Mi Disponibilidad (Guía)</NavLink>
            </div>
          </div>
          
          <NavLink to="/manuales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Manuales</NavLink>
          <NavLink to="/quienes-somos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Nosotros</NavLink>
          <NavLink to="/reservar" className={({ isActive }) => `nav-link nav-highlight ${isActive ? 'active' : ''}`} onClick={closeMenu}>Reservar Guía</NavLink>
          <NavLink to="/contacto" className={({ isActive }) => `nav-link nav-cta ${isActive ? 'active' : ''}`} onClick={closeMenu}>Contacto</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
