import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowUpRight, Instagram, Linkedin, Facebook } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      {/* Franja superior decorativa */}
      <div className="footer-accent-bar"></div>

      <div className="container footer-main">
        {/* Columna 1: Marca */}
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img src="/logo.png" alt="Guía a la Carta" className="footer-logo" />
            <span className="footer-brand-name">Guía a la Carta</span>
          </div>
          <p className="footer-tagline">
            Tu red confiable de guías turísticos en Chile. Conectamos empresas con profesionales certificados para una operación más confiable y flexible.
          </p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/guiaalacartaoficial/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://www.linkedin.com/in/gu%C3%ADa-a-la-carta-7645382a8/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="https://www.facebook.com/guiaalacartaoficial/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        {/* Columna 2: Navegación */}
        <div className="footer-col">
          <h4>Navegación</h4>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/guias">Nuestros Guías</Link></li>
            <li><Link to="/quienes-somos">Quiénes Somos</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        {/* Columna 3: Únete */}
        <div className="footer-col">
          <h4>Únete a la Red</h4>
          <ul className="footer-links">
            <li><Link to="/postular-guia">Postulación Guías <ArrowUpRight size={14}/></Link></li>
            <li><Link to="/postular-estudiante">Pasantías Estudiantes <ArrowUpRight size={14}/></Link></li>
          </ul>
        </div>

        {/* Columna 4: Contacto */}
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul className="footer-contact">
            <li><MapPin size={16} /> Santiago, Chile</li>
            <li><Phone size={16} /> +56 9 5604 8293</li>
            <li><Mail size={16} /> guiaalacartaoficial@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Guía a la Carta. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
