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
          <h1>Tu red confiable de guías en todo Chile</h1>
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
            <div className="problema-bloque card-cobertura">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <Zap className="icon-problema" size={32}/>
                <h4>Cobertura rápida</h4>
                <p>Activamos guías en tiempo récord para cubrir tus servicios y contingencias más urgentes.</p>
              </div>
            </div>
            <div className="problema-bloque card-certificados">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <ShieldCheck className="icon-problema" size={32}/>
                <h4>Guías certificados</h4>
                <p>Red exclusiva de profesionales con registro SERNATUR y validación técnica rigurosa.</p>
              </div>
            </div>
            <div className="problema-bloque card-respaldo">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <Settings className="icon-problema" size={32}/>
                <h4>Respaldo operativo</h4>
                <p>Coordinación logística centralizada y soporte constante durante toda la ejecución del servicio.</p>
              </div>
            </div>
            <div className="problema-bloque card-flexibilidad">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <Users className="icon-problema" size={32}/>
                <h4>Flexibilidad total</h4>
                <p>Soluciones que se adaptan a cada tipo de pasajero, idioma y nivel de exigencia de tu empresa.</p>
              </div>
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
              <p className="nivel-desc">Apoyo operativo o servicios de menor complejidad.</p>
              <div className="nivel-ideal">
                <h5>Ideal para:</h5>
                <ul>
                  <li><CheckCircle size={16} /> Servicios simples</li>
                  <li><CheckCircle size={16} /> Apoyo en terreno</li>
                  <li><CheckCircle size={16} /> Operaciones menores</li>
                </ul>
              </div>
              <div className="nivel-precio" style={{borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.8rem', color: 'var(--c-text-light)', textTransform: 'uppercase'}}>Referencial:</span>
                <strong style={{color: 'var(--c-primary)', fontSize: '1.2rem'}}>$40.000 – $50.000</strong>
              </div>
            </div>
            
            <div className="nivel-mini destacado">
              <div className="nivel-ribbon">Más solicitado</div>
              <h4>Guía Full</h4>
              <p className="nivel-desc">Operativo estándar, autónomo y con experiencia comprobable.</p>
              <div className="nivel-ideal">
                <h5>Ideal para:</h5>
                <ul>
                  <li><CheckCircle size={16} /> Tours regulares</li>
                  <li><CheckCircle size={16} /> Servicios completos</li>
                  <li><CheckCircle size={16} /> Atención a pasajeros</li>
                </ul>
              </div>
              <div className="nivel-precio" style={{borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.8rem', color: 'var(--c-text-light)', textTransform: 'uppercase'}}>Referencial:</span>
                <strong style={{color: 'var(--c-primary)', fontSize: '1.2rem'}}>Desde $60.000</strong>
              </div>
            </div>
            
            <div className="nivel-mini">
              <h4>Guía Senior</h4>
              <p className="nivel-desc">Máxima resolución y capacidad de representación.</p>
              <div className="nivel-ideal">
                <h5>Ideal para:</h5>
                <ul>
                  <li><CheckCircle size={16} /> Servicios exigentes</li>
                  <li><CheckCircle size={16} /> Grupos especiales / VIP</li>
                  <li><CheckCircle size={16} /> Operaciones delicadas</li>
                </ul>
              </div>
              <div className="nivel-precio" style={{borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.8rem', color: 'var(--c-text-light)', textTransform: 'uppercase'}}>Referencial:</span>
                <strong style={{color: 'var(--c-primary)', fontSize: '1.2rem'}}>Desde $70.000</strong>
              </div>
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
