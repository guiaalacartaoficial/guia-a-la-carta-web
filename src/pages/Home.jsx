import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarCog, DatabaseBackup, TimerReset, MapPin, CheckCircle, Clock, Briefcase, Star, Compass, Zap, Settings, Users, ShieldCheck, HeartPulse, Mountain, Languages, TrendingUp, Truck, UserStar, Van, ChevronLeft, ChevronRight } from 'lucide-react';
import GuideCarousel from '../components/GuideCarousel';
import './Home.css';
import ChileMap from '../components/ChileMap';

const Home = () => {
  const [activeService, setActiveService] = useState(null);

  const servicesData = [
    {
      id: 1,
      title: "PROVISIÓN DE GUÍAS Y COORDINADORES CERTIFICADOS",
      icon: <UserStar size={40} />,
      desc: "Asignamos guías y coordinadores validados según el tipo de servicio, perfil de pasajero e idioma requerido.",
      highlight: "Cobertura confiable con profesionales listos para operar desde el primer servicio."
    },
    {
      id: 2,
      title: "GUÍA SOS",
      icon: <Zap size={40} />,
      desc: "Servicio de respuesta inmediata para cubrir contingencias, reemplazos urgentes o refuerzos operativos.",
      highlight: "Solución rápida cuando más lo necesitas, sin comprometer la calidad del servicio."
    },
    {
      id: 3,
      title: "SOPORTE Y ASISTENCIA LOGÍSTICA",
      icon: <Settings size={40} />,
      desc: "Coordinamos la planificación y ejecución de servicios: asignación de guías, comunicación operativa y seguimiento en terreno.",
      highlight: "Menos carga para tu equipo, mayor control en cada operación."
    },
    {
      id: 4,
      title: "DRIVEPLUS+",
      icon: <Van size={40} />,
      desc: "Red de conductores profesionales y transporte turístico, conectados con tu operación. DrivePlus+ integra conductores especializados y servicios de transporte turístico, coordinados para operar junto a guías o de forma independiente según el servicio.",
      highlight: "Accedes a conductores confiables y transporte listo para operar, sin gestionar múltiples proveedores."
    },
    {
      id: 5,
      title: "LEVANTAMIENTO Y OPTIMIZACIÓN DE EXPERIENCIAS TURÍSTICAS",
      icon: <TrendingUp size={40} />,
      desc: "Analizamos, diseñamos y mejoramos tus servicios turísticos para aumentar calidad, eficiencia operativa y valor percibido.",
      highlight: "Transformas tus tours en productos más competitivos y rentables."
    }
  ];
  return (
    <div className="home-page">

      {/* SECCIÓN 1: HERO PRINCIPAL */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content text-center">
          <img src="/logo.png" alt="Guía a la Carta Logo" className="hero-center-logo mb-4" style={{ width: '200px' }} />
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
              En temporada alta o en operaciones exigentes, muchas empresas enfrentan los mismos desafíos: falta de disponibilidad, coordinación manual, reemplazos urgentes, presión operativa y dificultad para encontrar perfiles alineados al servicio.
            </p>
            <p className="bajada-resalte mt-3">
              <strong>Guía a la Carta nace para resolver ese problema con una red profesional validada y una coordinación más ordenada.</strong>
            </p>
          </div>

          <div className="problema-grid mt-5">
            <div className="problema-bloque card-cobertura">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <BadgeCheck className="icon-problema" size={32} />
                <h4>GUÍAS VERIFICADOS</h4>
                <p>Cada guía es validado en certificaciones, experiencia y habilidades en terreno, asegurando un estándar real de servicio.
                  Menos riesgo, mejor experiencia para tus pasajeros.</p>
              </div>
            </div>
            <div className="problema-bloque card-certificados">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <CalendarCog className="icon-problema" size={32} />
                <h4>FLEXIBILIDAD OPERATIVA REAL</h4>
                <p>Nos adaptamos a cada tipo de servicio.
                  Asignamos guías según idioma, perfil de pasajero, nivel de exigencia y tipo de operación.
                  Puedes cubrir desde servicios simples hasta experiencias de alto nivel sin fricción.
                </p>
              </div>
            </div>
            <div className="problema-bloque card-respaldo">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <DatabaseBackup className="icon-problema" size={32} />
                <h4>RESPALDO OPERATIVO</h4>
                <p>No estás solo durante la ejecución.
                  Acompañamos cada servicio con coordinación activa y capacidad de respuesta ante cambios o imprevistos.
                  Mayor control y continuidad en tu operación.
                </p>
              </div>
            </div>
            <div className="problema-bloque card-flexibilidad">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <TimerReset className="icon-problema" size={32} />
                <h4>REDUCCIÓN DE CARGA OPERATIVA</h4>
                <p>Deja de coordinar, enfócate en crecer.
                  Centralizamos la búsqueda, asignación y comunicación con guías para simplificar tu operación diaria.
                  Menos desgaste interno, más eficiencia.
                </p>
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
            <p className="bajada text-center mx-auto" style={{ maxWidth: '800px' }}>
              No solo conectamos empresas con guías. Organizamos, validamos, coordinamos y apoyamos la ejecución para que el servicio salga bien.
            </p>
          </div>

          <div className="solucion-content">
            <div className="solucion-pilares">
              <div className="pilar-item">
                <HeartPulse size={32} className="text-accent mb-3" />
                <h4>PRIMEROS AUXILIOS</h4>
                <p>Guías con formación en primeros auxilios, preparados para responder ante situaciones de riesgo en terreno.</p>
                <div className="pilar-highlight">Mayor seguridad para tus pasajeros</div>
              </div>
              <div className="pilar-item">
                <Mountain size={32} className="text-accent mb-3" />
                <h4>EXPERIENCIA EN TERRENO</h4>
                <p>Profesionales con experiencia real operando tours y enfrentando distintos escenarios.</p>
                <div className="pilar-highlight">Menos improvisación, mejor ejecución</div>
              </div>
              <div className="pilar-item">
                <Languages size={32} className="text-accent mb-3" />
                <h4>MANEJO DE IDIOMAS</h4>
                <p>Guías capacitados para comunicarse con pasajeros internacionales.</p>
                <div className="pilar-highlight">Mejor conexión y experiencia del cliente</div>
              </div>
              <div className="pilar-item">
                <Users size={32} className="text-accent mb-3" />
                <h4>MANEJO DE GRUPOS</h4>
                <p>Capacidad para liderar, organizar y mantener el control de grupos en todo momento.</p>
                <div className="pilar-highlight">Servicios más fluidos y ordenados</div>
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

          <div className="servicios-grid mt-5">
            {servicesData.map((service) => (
              <div 
                key={service.id} 
                className="servicio-card interactive" 
                onClick={() => setActiveService(service)}
              >
                <div className="servicio-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <span className="btn-ver-mas">Ver detalle</span>
              </div>
            ))}
          </div>

          <div className="servicios-slogan mt-5">
            <p>"Ustedes se enfocan en los pasajeros; nosotros nos encargamos de que siempre tengan al guía o coordinador correcto."</p>
          </div>

          {/* Modal Emergente de Servicio */}
          {activeService && (
            <div className="service-modal-overlay" onClick={() => setActiveService(null)}>
              <div className="service-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">{activeService.icon}</div>
                <h3>{activeService.title}</h3>
                <p className="modal-desc">{activeService.desc}</p>
                <div className="modal-highlight">{activeService.highlight}</div>
                <div className="modal-actions">
                  <Link to="/servicios" className="btn btn-primary" onClick={() => setActiveService(null)}>Saber más</Link>
                </div>
              </div>
            </div>
          )}
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
              <div className="nivel-precio" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--c-text-light)', textTransform: 'uppercase' }}>Referencial:</span>
                <strong style={{ color: 'var(--c-primary)', fontSize: '1.2rem' }}>$40.000 – $50.000</strong>
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
              <div className="nivel-precio" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--c-text-light)', textTransform: 'uppercase' }}>Referencial:</span>
                <strong style={{ color: 'var(--c-primary)', fontSize: '1.2rem' }}>Desde $60.000</strong>
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
              <div className="nivel-precio" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--c-text-light)', textTransform: 'uppercase' }}>Referencial:</span>
                <strong style={{ color: 'var(--c-primary)', fontSize: '1.2rem' }}>Desde $70.000</strong>
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
            <span className="destino-tag"><Compass size={18} /> Santiago City Tour</span>
            <span className="destino-tag"><Compass size={18} /> Farellones</span>
            <span className="destino-tag"><Compass size={18} /> Valle Nevado</span>
            <span className="destino-tag"><Compass size={18} /> El Colorado</span>
            <span className="destino-tag"><Compass size={18} /> Portillo</span>
            <span className="destino-tag"><Compass size={18} /> Andes Panorámico / Sunset</span>
            <span className="destino-tag"><Compass size={18} /> Valparaíso y Viña del Mar</span>
            <span className="destino-tag"><Compass size={18} /> Isla Negra y rutas vinícolas</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: CONFIANZA / RESPALDO */}
      <section className="section-confianza">
        <div className="container">
          <h2 className="text-center mb-5">Trabajamos con estándares claros</h2>

          <div className="estandares-grid">
            <div className="estandar-box">
              <CheckCircle className="text-accent mb-3" size={32} />
              <h5>Guías registrados en SERNATUR</h5>
            </div>
            <div className="estandar-box">
              <Star className="text-accent mb-3" size={32} />
              <h5>Perfiles evaluados</h5>
            </div>
            <div className="estandar-box">
              <Settings className="text-accent mb-3" size={32} />
              <h5>Coordinación previa al servicio</h5>
            </div>
            <div className="estandar-box">
              <Zap className="text-accent mb-3" size={32} />
              <h5>Respuesta flexible según disponibilidad</h5>
            </div>
            <div className="estandar-box">
              <Users className="text-accent mb-3" size={32} />
              <h5>Posibilidad de reemplazo operativo</h5>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN NUEVA: MAPA INTERACTIVO */}
      <ChileMap />

      {/* SECCIÓN NUEVA: GALERÍA DE EXPERIENCIAS (COLLAGE SLIDER) */}
      <section className="section-gallery bg-b2b-light">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="display-5 fw-bold text-primary-dark">Nuestra Comunidad en Acción</h2>
            <p className="lead text-muted">Resumen visual de las experiencias y el estándar operativo que entregamos en cada rincón de Chile.</p>
          </div>

          <div className="collage-slider-wrapper">
            <div className="collage-slider">
              {/* Slide 1 */}
              <div className="collage-slide active">
                <div className="custom-collage-grid">
                  <div className="collage-item item-1"><img src="/gallery/g1.png" alt="Exp 1" /></div>
                  <div className="collage-item item-2"><img src="/gallery/g2.png" alt="Exp 2" /></div>
                  <div className="collage-item item-3"><img src="/gallery/g3.png" alt="Exp 3" /></div>
                  <div className="collage-item item-4"><img src="/gallery/g4.png" alt="Exp 4" /></div>
                </div>
              </div>

              {/* Slide 2 */}
              <div className="collage-slide">
                <div className="custom-collage-grid">
                  <div className="collage-item item-1"><img src="/gallery/g5.png" alt="Exp 5" /></div>
                  <div className="collage-item item-2"><img src="/gallery/g6.png" alt="Exp 6" /></div>
                  <div className="collage-item item-3"><img src="/gallery/g7.png" alt="Exp 7" /></div>
                  <div className="collage-item item-4"><img src="/gallery/g8.png" alt="Exp 8" /></div>
                </div>
              </div>
            </div>

            <div className="slider-controls">
              <button className="slider-btn prev" onClick={() => {
                const slides = document.querySelectorAll('.collage-slide');
                const dots = document.querySelectorAll('.dot');
                let activeIdx = Array.from(slides).findIndex(s => s.classList.contains('active'));
                slides[activeIdx].classList.remove('active');
                dots[activeIdx].classList.remove('active');
                let nextIdx = (activeIdx - 1 + slides.length) % slides.length;
                slides[nextIdx].classList.add('active');
                dots[nextIdx].classList.add('active');
              }}>
                <ChevronLeft size={32} />
              </button>
              <button className="slider-btn next" onClick={() => {
                const slides = document.querySelectorAll('.collage-slide');
                const dots = document.querySelectorAll('.dot');
                let activeIdx = Array.from(slides).findIndex(s => s.classList.contains('active'));
                slides[activeIdx].classList.remove('active');
                dots[activeIdx].classList.remove('active');
                let nextIdx = (activeIdx + 1) % slides.length;
                slides[nextIdx].classList.add('active');
                dots[nextIdx].classList.add('active');
              }}>
                <ChevronRight size={32} />
              </button>
            </div>

            <div className="slider-dots">
              {[0, 1].map((i) => (
                <span key={i} className={`dot ${i === 0 ? 'active' : ''}`} onClick={() => {
                  const slides = document.querySelectorAll('.collage-slide');
                  const dots = document.querySelectorAll('.dot');
                  slides.forEach(s => s.classList.remove('active'));
                  dots.forEach(d => d.classList.remove('active'));
                  slides[i].classList.add('active');
                  dots[i].classList.add('active');
                }}></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 9: LLAMADO FINAL */}
      <section className="section-cta-final text-center">
        <div className="container">
          <div className="cta-final-box">
            <h2>¿Quieres fortalecer tu operación turística esta temporada?</h2>
            <p>Conversemos y revisemos cómo Guía a la Carta puede apoyar a tu empresa con una operación más confiable, flexible y ordenada.</p>

            <div className="hero-actions mt-4">
              <Link to="/contacto" className="btn btn-hero">Agendar reunión</Link>
              <a href="https://wa.me/56956048293?text=Hola%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n" target="_blank" rel="noreferrer" className="btn btn-whatsapp border-white">Escribir por WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
