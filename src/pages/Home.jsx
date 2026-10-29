import React, { useState, lazy, Suspense, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarCog, DatabaseBackup, TimerReset, MapPin, CheckCircle, Clock, Briefcase, Star, Compass, Zap, Settings, Users, ShieldCheck, HeartPulse, Mountain, Languages, TrendingUp, Truck, UserStar, Van, ChevronLeft, ChevronRight, GraduationCap, X } from 'lucide-react';
import SeasonalMarketing from '../components/SeasonalMarketing';
import GoogleReviews from '../components/GoogleReviews';
import SeasonalGallery from '../components/SeasonalGallery';
// Lazy load de componentes pesados below-the-fold
const ChileMap = lazy(() => import('../components/ChileMap'));
const GuideCarousel = lazy(() => import('../components/GuideCarousel'));
import './Home.css';

const Home = () => {
  const [activeService, setActiveService] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const mapRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (mapRef.current) {
      observer.observe(mapRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCarouselVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }
    return () => observer.disconnect();
  }, []);

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
    },
    {
      id: 6,
      title: "COORDINACIÓN DE GIRAS DE ESTUDIO",
      icon: <GraduationCap size={40} />,
      desc: "Asignamos y preparamos coordinadores especializados para acompañar delegaciones estudiantiles en todo Chile, asegurando el orden del itinerario, la convivencia del grupo y la comunicación fluida con profesores y proveedores.",
      highlight: "Profesionales validados con WFR / Primeros Auxilios, liderazgo en terreno y respaldo activo ante contingencias."
    }
  ];
  return (
    <div className="home-page">

      {/* SECCIÓN 1: HERO PRINCIPAL */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content text-center">
          <img src="/logo.webp" alt="Guía a la Carta Logo" className="hero-center-logo mb-4" width="200" height="200" style={{ width: '200px', height: '200px' }} />
          <h1>Tu red confiable de guías en todo Chile</h1>
          <p className="hero-subtitle">Soluciones operativas para empresas de turismo en Chile</p>
          <p className="hero-desc">Conectamos empresas turísticas, hoteles y agencias con guías certificados y coordinadores de viaje en terreno, entregando una operación más confiable, flexible y profesional.</p>
          <div className="hero-actions mt-4">
            <Link to="/postular-guia" className="btn btn-hero">Únete como Guía</Link>
            <Link to="/contacto" className="btn btn-hero">Cotiza Servicios</Link>
          </div>
          <p className="mt-3" style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>
            ¿Eres estudiante de turismo? <Link to="/postular-estudiante" style={{ color: 'var(--c-accent)', fontWeight: '600', textDecoration: 'underline' }}>Postula a pasantías aquí</Link>
          </p>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN MARKETING ESTACIONAL (CAMPAÑA ACTIVA) */}
      <SeasonalMarketing />

      <div className="footer-accent-bar" />

      

      {/* SECCIÓN 2: QUÉ PROBLEMA RESOLVEMOS */}
      <section className="section-problema b2b-theme-light">
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
                <h3>GUÍAS VERIFICADOS</h3>
                <p>Cada guía es validado en certificaciones, experiencia y habilidades en terreno, asegurando un estándar real de servicio.
                  Menos riesgo, mejor experiencia para tus pasajeros.</p>
              </div>
            </div>
            <div className="problema-bloque card-certificados">
              <div className="bloque-overlay"></div>
              <div className="bloque-content">
                <CalendarCog className="icon-problema" size={32} />
                <h3>FLEXIBILIDAD OPERATIVA REAL</h3>
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
                <h3>RESPALDO OPERATIVO</h3>
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
                <h3>REDUCCIÓN DE CARGA OPERATIVA</h3>
                <p>Deja de coordinar, enfócate en crecer.
                  Centralizamos la búsqueda, asignación y comunicación con guías para simplificar tu operation diaria.
                  Menos desgaste interno, más eficiencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="footer-accent-bar" />

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
                <h3>PRIMEROS AUXILIOS</h3>
                <p>Guías con formación en primeros auxilios, preparados para responder ante situaciones de riesgo en terreno.</p>
                <div className="pilar-highlight">Mayor seguridad para tus pasajeros</div>
              </div>
              <div className="pilar-item">
                <Mountain size={32} className="text-accent mb-3" />
                <h3>EXPERIENCIA EN TERRENO</h3>
                <p>Profesionales con experiencia real operando tours y enfrentando distintos escenarios.</p>
                <div className="pilar-highlight">Menos improvisación, mejor ejecución</div>
              </div>
              <div className="pilar-item">
                <Languages size={32} className="text-accent mb-3" />
                <h3>MANEJO DE IDIOMAS</h3>
                <p>Guías capacitados para comunicarse con pasajeros internacionales.</p>
                <div className="pilar-highlight">Mejor conexión y experiencia del cliente</div>
              </div>
              <div className="pilar-item">
                <Users size={32} className="text-accent mb-3" />
                <h3>MANEJO DE GRUPOS</h3>
                <p>Capacidad para liderar, organizar y mantener el control de grupos en todo momento.</p>
                <div className="pilar-highlight">Servicios más fluidos y ordenados</div>
              </div>
            </div>

            {/* Carrusel de Guías en Arco diferido hasta entrar en el Viewport */}
            <div ref={carouselRef} style={{ minHeight: '350px', width: '100%' }}>
              {carouselVisible ? (
                <Suspense fallback={<div className="loading-carousel">Cargando visualizador de red...</div>}>
                  <GuideCarousel />
                </Suspense>
              ) : (
                <div className="loading-carousel">Cargando directorio de red...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN 4: SERVICIOS DESTACADOS */}
      <section className="section-servicios b2b-theme-dark">
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
            <p>"Ustedes se enfocan en los pasajeros; nosotros nos encargamos de que siempre tengan al guía o coordinador correcto"</p>
          </div>

          {/* Modal Emergente de Servicio */}
          {activeService && (
            <div className="service-modal-overlay" onClick={() => setActiveService(null)}>
              <div className="service-modal-content" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  className="modal-close-x"
                  onClick={() => setActiveService(null)}
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>
                <div className="modal-icon">{activeService.icon}</div>
                <h3>{activeService.title}</h3>
                <p className="modal-desc">{activeService.desc}</p>
                <div className="modal-highlight">{activeService.highlight}</div>
                <div className="modal-actions">
                  {activeService.id === 6 ? (
                    <>
                      <Link to="/contacto?servicio=giras-estudio" className="btn btn-primary" onClick={() => setActiveService(null)}>Cotizar Giras</Link>
                      <Link to="/servicios" className="btn btn-outline" onClick={() => setActiveService(null)}>Ver Servicios</Link>
                    </>
                  ) : (
                    <Link to="/servicios" className="btn btn-primary" onClick={() => setActiveService(null)}>Saber más</Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN 6: NIVELES DE GUÍA */}
      <section className="section-niveles-home b2b-theme-light">
        <div className="container text-center">
          <h2 className="section-title-large">Perfiles de guía según el nivel de exigencia del servicio</h2>

          <div className="niveles-resumen mt-5 mb-5">
            <div className="nivel-mini">
              <h3>Guía Junior</h3>
              <p className="nivel-desc">Apoyo operativo o servicios de menor complejidad.</p>
              <div className="nivel-ideal">
                <h4>Ideal para:</h4>
                <ul>
                  <li><CheckCircle size={16} /> Servicios simples</li>
                  <li><CheckCircle size={16} /> Apoyo en terreno</li>
                  <li><CheckCircle size={16} /> Operaciones menores</li>
                </ul>
              </div>
            </div>

            <div className="nivel-mini destacado">
              <div className="nivel-ribbon">Más solicitado</div>
              <h3>Guía Full</h3>
              <p className="nivel-desc">Operativo estándar, autónomo y con experiencia comprobable.</p>
              <div className="nivel-ideal">
                <h4>Ideal para:</h4>
                <ul>
                  <li><CheckCircle size={16} /> Tours regulares</li>
                  <li><CheckCircle size={16} /> Servicios completos</li>
                  <li><CheckCircle size={16} /> Atención a pasajeros</li>
                </ul>
              </div>
            </div>

            <div className="nivel-mini">
              <h3>Guía Senior</h3>
              <p className="nivel-desc">Máxima resolución y capacidad de representación.</p>
              <div className="nivel-ideal">
                <h4>Ideal para:</h4>
                <ul>
                  <li><CheckCircle size={16} /> Servicios exigentes</li>
                  <li><CheckCircle size={16} /> Grupos especiales / VIP</li>
                  <li><CheckCircle size={16} /> Operaciones delicadas</li>
                </ul>
              </div>
            </div>
          </div>

          <Link to="/guias" className="btn btn-primary">Ver perfiles de guía</Link>
        </div>
      </section>

      <div className="footer-accent-bar" />

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

      <div className="footer-accent-bar" />

      {/* SECCIÓN 8: CONFIANZA / RESPALDO */}
      <section className="section-confianza b2b-theme-dark">
        <div className="container">
          <h2 className="text-center mb-5 section-title-large">Trabajamos con estándares claros</h2>

          <div className="estandares-grid">
            <div className="estandar-box">
              <CheckCircle className="text-accent mb-3" size={32} />
              <h3>Guías registrados en SERNATUR</h3>
            </div>
            <div className="estandar-box">
              <Star className="text-accent mb-3" size={32} />
              <h3>Perfiles evaluados</h3>
            </div>
            <div className="estandar-box">
              <Settings className="text-accent mb-3" size={32} />
              <h3>Coordinación previa al servicio</h3>
            </div>
            <div className="estandar-box">
              <Zap className="text-accent mb-3" size={32} />
              <h3>Respuesta flexible según disponibilidad</h3>
            </div>
            <div className="estandar-box">
              <Users className="text-accent mb-3" size={32} />
              <h3>Posibilidad de reemplazo operativo</h3>
            </div>
          </div>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN NUEVA: MAPA INTERACTIVO */}
      <section className="chile-map-section" ref={mapRef}>
        <div className="container">
          <div className="map-header text-center mb-5">
            <h2 className="map-titleHighlight">Nuestra Red Nacional</h2>
            <p className="map-subtitle">Con presencia en todas las regiones, aseguramos cobertura donde la necesites.</p>
          </div>
          
          <div className="map-container-wrapper">
            {mapVisible ? (
              <Suspense fallback={
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020a09', color: 'white' }}>
                  <p>Cargando mapa interactivo...</p>
                </div>
              }>
                <ChileMap />
              </Suspense>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020a09', color: 'white' }}>
                <p>Desplázate para ver el mapa...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN RESEÑAS VERIFICADAS DE GOOGLE */}
      <GoogleReviews />

      <div className="footer-accent-bar" />

      {/* SECCIÓN NUEVA: GALERÍA DE EXPERIENCIAS (TEMPORADA ACTUAL) */}
      <SeasonalGallery />

      <div className="footer-accent-bar" />

      {/* SECCIÓN 9: LLAMADO FINAL */}
      <section className="section-cta-final b2b-theme-dark">
        <div className="container">
          <div className="cta-card text-center">
            <h2>¿Quieres fortalecer tu operación turística esta temporada?</h2>
            <p>Conversemos y revisemos cómo Guía a la Carta puede apoyar a tu empresa con una operación más confiable, flexible y ordenada.</p>
            <div className="hero-actions justify-content-center mt-5">
              <Link to="/contacto" className="btn btn-hero btn-cta-dark">Agendar reunión</Link>
              <a href="https://wa.me/56956048293?text=Hola%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n" target="_blank" rel="noreferrer" className="btn btn-whatsapp-cta">Escribir por WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
