import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  // Detectar scroll para transición transparente → sólido
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const closeMenu = () => {
    setIsOpen(false);
    setDropdownOpen(false);
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
          
          <div className="nav-dropdown" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <button className="nav-link nav-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              Únete a la Red <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`nav-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              <NavLink to="/postular-guia" onClick={closeMenu} className="dropdown-item">Postulación Guías</NavLink>
              <NavLink to="/postular-estudiante" onClick={closeMenu} className="dropdown-item">Postulación Estudiantes</NavLink>
            </div>
          </div>
          
          <NavLink to="/quienes-somos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Nosotros</NavLink>
          <NavLink to="/contacto" className={({ isActive }) => `nav-link nav-cta ${isActive ? 'active' : ''}`} onClick={closeMenu}>Contacto</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
