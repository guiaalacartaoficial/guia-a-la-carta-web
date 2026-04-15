import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Users, Zap, CheckCircle, Clock, Settings, Briefcase, Star, Compass } from 'lucide-react';
import GuideCarousel from '../components/GuideCarousel';
import './Home.css';
import ChileMap from '../components/ChileMap';

const Home = () => {
  return (
    <div className="home-page">
      
      {/* SECCIÓN 1: HERO PRINCIPAL */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content text-center">
          <img src="/logo.png" alt="Guía a la Carta Logo" className="hero-center-logo mb-4" style={{width: '200px'}} />
          <h1>tu red confiable de guias en todo chile</h1>
          <p className="hero-subtitle">Soluciones operativas para empresas de turismo en Chile</p>
          <p className="hero-desc">Conectamos empresas turísticas, hoteles y agencias con guías certificados, entregando una operación más confiable, flexible y profesional.</p>
          <div className="hero-actions mt-4">
            <Link to="/postular-guia" className="btn btn-hero">Regístrate</Link>
            <Link to="/contacto" className="btn btn-hero">Cotiza</Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: QUÉ PROBLEMA RESOLVEMOS */}
      <section className="section-problema">
        <div className="container">
          <div className="section-head text-center">
            <h2>Sabemos lo difícil que es encontrar al guía correcto en el momento correcto</h2>
            <p className="bajada">
              En temporada alta o en operaciones exigentes, muchas empresas enfrentan los mismos desafíos: 
              falta de disponibilidad, coordinación manual, reemplazos urgentes, presión operativa y 
              dificultad para encontrar perfiles alineados al servicio.
            </p>
            <p className="bajada-resalte mt-3">
              <strong>Guía a la Carta nace para resolver ese problema con una red profesional validada y una coordinación más ordenada.</strong>
            </p>
          </div>

          <div className="problema-grid mt-5">
            <div className="problema-bloque">
              <Zap className="icon-problema" size={36}/>
              <h4>Cobertura rápida</h4>
            </div>
            <div className="problema-bloque">
              <ShieldCheck className="icon-problema" size={36}/>
              <h4>Guías certificados</h4>
            </div>
            <div className="problema-bloque">
              <Settings className="icon-problema" size={36}/>
              <h4>Respaldo operativo</h4>
            </div>
            <div className="problema-bloque">
              <Users className="icon-problema" size={36}/>
              <h4>Flexibilidad según cada servicio</h4>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: NUESTRA SOLUCIÓN */}
      <section className="section-solucion">
        <div className="container">
          <div className="solucion-header text-center mb-5">
            <h2>Una red profesional de guías con respaldo operativo</h2>
            <p className="bajada text-center mx-auto" style={{maxWidth: '800px'}}>
              No solo conectamos empresas con guías. Organizamos, validamos, coordinamos y apoyamos la ejecución para que el servicio salga bien.
            </p>
          </div>
          
          <div className="solucion-content">
            <div className="solucion-pilares">
              <div className="pilar-item">
                <CheckCircle size={24} className="text-accent" />
                <span>Optimización operativa</span>
              </div>
              <div className="pilar-item">
                <CheckCircle size={24} className="text-accent" />
                <span>Cobertura confiable</span>
              </div>
              <div className="pilar-item">
                <CheckCircle size={24} className="text-accent" />
                <span>Perfiles alineados al servicio</span>
              </div>
              <div className="pilar-item">
                <CheckCircle size={24} className="text-accent" />
                <span>Coordinación centralizada</span>
              </div>
            </div>
            
            {/* Carrusel de Guías en Arco */}
            <GuideCarousel />
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: SERVICIOS DESTACADOS */}
      <section className="section-servicios">
        <div className="container text-center">
          <h2 className="mb-5">Servicios que ofrecemos</h2>
          
          <div className="servicios-grid">
            <div className="servicio-card">
              <Briefcase className="servicio-icon" size={40}/>
              <h3>Provisión de guías por tour</h3>
              <Link to="/servicios" className="btn btn-outline border-white">Ver más</Link>
            </div>
            
            <div className="servicio-card">
              <MapPin className="servicio-icon" size={40}/>
              <h3>Cobertura en temporada alta</h3>
              <Link to="/servicios" className="btn btn-outline border-white">Ver más</Link>
            </div>
            
            <div className="servicio-card">
              <Clock className="servicio-icon" size={40}/>
              <h3>Guías para servicios de último minuto</h3>
              <Link to="/servicios" className="btn btn-outline border-white">Ver más</Link>
            </div>
            
            <div className="servicio-card">
              <Settings className="servicio-icon" size={40}/>
              <h3>Servicio operativo completo</h3>
              <Link to="/servicios" className="btn btn-outline border-white">Ver más</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: NIVELES DE GUÍA */}
      <section className="section-niveles-home">
        <div className="container text-center">
          <h2>Perfiles de guía según el nivel de exigencia del servicio</h2>
          
          <div className="niveles-resumen mt-5 mb-5">
            <div className="nivel-mini">
              <h4>Guía Junior</h4>
              <p>Apoyo operativo y servicios simples.</p>
            </div>
            <div className="nivel-mini destacado">
              <h4>Guía Full</h4>
              <p>Tours regulares y atención general.</p>
            </div>
            <div className="nivel-mini">
              <h4>Guía Senior</h4>
              <p>Servicios exigentes y grupos VIP.</p>
            </div>
          </div>
          
          <Link to="/guias" className="btn btn-primary">Ver perfiles de guía</Link>
        </div>
      </section>

      {/* SECCIÓN 7: COBERTURA */}
      <section className="section-cobertura">
        <div className="container">
          <h2 className="text-center mb-5">Cobertura en destinos clave</h2>
          
          <div className="cobertura-lista-visual">
            <span className="destino-tag"><Compass size={18}/> Santiago City Tour</span>
            <span className="destino-tag"><Compass size={18}/> Farellones</span>
            <span className="destino-tag"><Compass size={18}/> Valle Nevado</span>
            <span className="destino-tag"><Compass size={18}/> El Colorado</span>
            <span className="destino-tag"><Compass size={18}/> Portillo</span>
            <span className="destino-tag"><Compass size={18}/> Andes Panorámico / Sunset</span>
            <span className="destino-tag"><Compass size={18}/> Valparaíso y Viña del Mar</span>
            <span className="destino-tag"><Compass size={18}/> Isla Negra y rutas vinícolas</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: CONFIANZA / RESPALDO */}
      <section className="section-confianza">
        <div className="container">
          <h2 className="text-center mb-5">Trabajamos con estándares claros</h2>
          
          <div className="estandares-grid">
            <div className="estandar-box">
              <CheckCircle className="text-accent mb-3" size={32}/>
              <h5>Guías registrados en SERNATUR</h5>
            </div>
            <div className="estandar-box">
              <Star className="text-accent mb-3" size={32}/>
              <h5>Perfiles evaluados</h5>
            </div>
            <div className="estandar-box">
              <Settings className="text-accent mb-3" size={32}/>
              <h5>Coordinación previa al servicio</h5>
            </div>
            <div className="estandar-box">
              <Zap className="text-accent mb-3" size={32}/>
              <h5>Respuesta flexible según disponibilidad</h5>
            </div>
            <div className="estandar-box">
              <Users className="text-accent mb-3" size={32}/>
              <h5>Posibilidad de reemplazo operativo</h5>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN NUEVA: MAPA INTERACTIVO */}
      <ChileMap />

      {/* SECCIÓN 9: LLAMADO FINAL */}
      <section className="section-cta-final text-center">
        <div className="container">
          <div className="cta-final-box">
            <h2>¿Quieres fortalecer tu operación turística esta temporada?</h2>
            <p>Conversemos y revisemos cómo Guía a la Carta puede apoyar a tu empresa con una operación más confiable, flexible y ordenada.</p>
            
            <div className="hero-actions mt-4">
              <Link to="/contacto" className="btn btn-hero">Agendar reunión</Link>
              <a href="https://wa.me/56900000000" target="_blank" rel="noreferrer" className="btn btn-whatsapp border-white">Escribir por WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
