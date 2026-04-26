import React, { useState } from 'react';
import { 
  Briefcase, MapPin, Clock, Settings, Compass, CheckCircle, 
  Award, ShieldCheck, Phone, Zap, Users, 
  Shield, ChevronDown, ChevronUp, Star, AlertCircle, 
  HeartHandshake, Globe, Truck, Lightbulb, CalendarClock, TrendingUp,
  Target, Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Servicios.css';

const WHATSAPP_URL = "https://wa.me/56956048293?text=Hola%2C%20necesito%20cotizar%20un%20servicio%20de%20gu%C3%ADa%20tur%C3%ADstico";

const faqs = [
  {
    q: "¿Con cuánto tiempo de anticipación debo solicitar un guía?",
    a: "Recomendamos solicitar con al menos 48 horas de anticipación para garantizar el perfil ideal. Sin embargo, cubrimos requerimientos de último minuto (menos de 12 horas) sujetos a disponibilidad operativa."
  },
  {
    q: "¿Cómo aseguran la calidad y certificación del guía?",
    a: "Todos nuestros guías pasan por un proceso interno de validación. Verificamos su inscripción en SERNATUR, certificaciones de primeros auxilios (WFR/WAFA), nivel de idiomas y antecedentes profesionales antes de integrarlos a la red."
  },
  {
    q: "¿Qué sucede si el guía asignado tiene una eventualidad?",
    a: "Guía a la Carta asume la responsabilidad de gestionar un reemplazo del mismo nivel a la brevedad, minimizando el impacto en tu operación y manteniendo comunicación permanente con tu equipo."
  },
  {
    q: "¿Ofrecen servicios de transporte además del guiado?",
    a: "Sí. Aunque nuestro core es la asignación de guías, ofrecemos articulación con flotas de transporte registradas para brindar un servicio logístico completo si la empresa lo requiere."
  },
  {
    q: "¿Puedo solicitar siempre al mismo guía para mis operaciones recurrentes?",
    a: "Siempre priorizamos asignar guías que ya conocen tu operatoria. Sin embargo, si el guía habitual no está disponible, garantizamos un perfil equivalente validado para mantener la continuidad."
  },
  {
    q: "¿Cómo funciona el pago y la facturación?",
    a: "La empresa paga directamente el honorario al guía (quien emite su boleta de honorarios). Guía a la Carta emite una factura exenta por el servicio de coordinación e intermediación. Las condiciones de pago se acuerdan previamente."
  }
];

const Servicios = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="servicios-page">
      
      {/* =========================================== */}
      {/* 1. HERO B2B                                */}
      {/* =========================================== */}
      <section className="b2b-hero">
        <div className="b2b-hero-bg"></div>
        <div className="container b2b-hero-content text-center">
          <h1>Soluciones operativas en guiado turístico para empresas</h1>
          <p className="hero-subtitle">
            Asignamos guías certificados, coordinamos logística y entregamos respaldo 
            operativo para que cada experiencia cumpla con tu estándar de servicio.
          </p>
          <div className="b2b-hero-actions">
            <Link to="/reservar" className="btn btn-hero">Solicitar reserva inmediata</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <Phone size={20} style={{marginRight: '8px'}}/> Hablar por WhatsApp
            </a>
          </div>
          
          <div className="b2b-trust-badges">
            <span className="trust-badge"><ShieldCheck className="trust-badge-icon" size={18}/> Guías Certificados</span>
            <span className="trust-badge"><Award className="trust-badge-icon" size={18}/> Registro SERNATUR</span>
            <span className="trust-badge"><Shield className="trust-badge-icon" size={18}/> Primeros Auxilios</span>
            <span className="trust-badge"><MapPin className="trust-badge-icon" size={18}/> Cobertura Nacional</span>
            <span className="trust-badge"><Settings className="trust-badge-icon" size={18}/> Soporte Operativo</span>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 2. QUÉ RESOLVEMOS                          */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-light">
        <div className="container">
          <div className="b2b-section-header">
            <h2>El respaldo operativo que tu empresa necesita</h2>
            <p>Conocemos los desafíos reales de la operación turística. Estas son las situaciones que resolvemos a diario.</p>
          </div>
          
          <div className="pain-points-grid">
            <div className="pain-point-card">
              <div className="pain-icon"><Clock size={24}/></div>
              <div className="pain-content">
                <h4>Reemplazos de último minuto</h4>
                <p>Cubrimos bajas repentinas con guías validados listos para operar, evitando cancelaciones y protegiendo tu reputación.</p>
              </div>
            </div>
            <div className="pain-point-card">
              <div className="pain-icon"><Users size={24}/></div>
              <div className="pain-content">
                <h4>Alta demanda en temporada</h4>
                <p>Escalamos tu capacidad operativa en meses peak sin que aumentes tu estructura de costos fijos.</p>
              </div>
            </div>
            <div className="pain-point-card">
              <div className="pain-icon"><Globe size={24}/></div>
              <div className="pain-content">
                <h4>Requerimientos por idioma</h4>
                <p>Encontramos el perfil exacto cuando necesitas cobertura en portugués, inglés, francés u otros idiomas específicos.</p>
              </div>
            </div>
            <div className="pain-point-card">
              <div className="pain-icon"><Settings size={24}/></div>
              <div className="pain-content">
                <h4>Sobrecarga logística interna</h4>
                <p>Absorbemos la coordinación completa entre guía, transporte y pasajeros, liberando a tu equipo comercial.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 3. SERVICIOS PRINCIPALES                   */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-white">
        <div className="container">
          <div className="b2b-section-header">
            <h2>Nuestros Servicios</h2>
            <p>Desde la asignación puntual de un guía hasta la articulación operativa completa de tu negocio.</p>
          </div>

          {/* Servicios destacados (layout grande) */}
          <div className="services-b2b-grid">
            
            {/* Servicio por Tour */}
            <div className="service-b2b-card">
              <div className="service-b2b-content">
                <h3>Servicio por Tour</h3>
                <p className="service-desc">
                  Para empresas con logística propia que solo necesitan la asignación del profesional. 
                  Proveemos guías turísticos para jornadas específicas, alineados a tu estándar de servicio.
                </p>
                <div className="service-b2b-features">
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Validación de perfil</div>
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Confirmación operativa</div>
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Briefing al guía</div>
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Reemplazo garantizado</div>
                </div>
                <div>
                  <Link to="/reservar" className="btn btn-primary" style={{padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem'}}>Reservar guía ahora</Link>
                </div>
              </div>
              <div className="service-b2b-visual">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop" alt="Servicio por Tour" />
              </div>
            </div>

            {/* Servicio Operativo Completo */}
            <div className="service-b2b-card reverse">
              <div className="service-b2b-content">
                <h3>Servicio Operativo Completo</h3>
                <p className="service-desc">
                  Externalización integral. Coordinamos la reserva, articulamos el transporte, asignamos el guía 
                  y monitoreamos toda la ejecución del servicio en terreno.
                </p>
                <div className="service-b2b-features">
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Gestión de reservas</div>
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Coordinación guía + driver</div>
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Comunicación centralizada</div>
                  <div className="feature-item"><CheckCircle size={18} className="text-accent"/> Apoyo logístico general</div>
                </div>
                <div>
                  <Link to="/reservar" className="btn btn-secondary" style={{padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem'}}>Solicitar operación</Link>
                </div>
              </div>
              <div className="service-b2b-visual">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop" alt="Servicio Operativo Completo" />
              </div>
            </div>
          </div>

          {/* Servicios complementarios (cards compactas) */}
          <div className="services-compact-grid">
            
            <div className="service-compact-card">
              <div className="compact-icon"><CalendarClock size={28}/></div>
              <h4>Cobertura de Temporada Alta</h4>
              <p>Escalamos tu equipo de guías sin costos fijos. Activamos perfiles según la demanda estacional de tu operación.</p>
              <span className="compact-badge"><Users size={14}/> Tour operadores</span>
            </div>

            <div className="service-compact-card">
              <div className="compact-icon"><Zap size={28}/></div>
              <h4>Requerimientos de Último Minuto</h4>
              <p>Respuesta ágil ante contingencias, reemplazos urgentes y necesidades imprevistas, sujeto a disponibilidad.</p>
              <span className="compact-badge"><Clock size={14}/> Respuesta &lt;12h</span>
            </div>

            <div className="service-compact-card">
              <div className="compact-icon"><Target size={28}/></div>
              <h4>Coordinación Logística</h4>
              <p>Articulamos los eslabones operativos: confirmaciones, puntos de encuentro, horarios y comunicación con local providers.</p>
              <span className="compact-badge"><Settings size={14}/> Empresas DMC</span>
            </div>

            <div className="service-compact-card">
              <div className="compact-icon"><Truck size={28}/></div>
              <h4>Articulación con Transporte</h4>
              <p>Coordinamos directamente con flotas de buses y vans registradas para integrar guía y transporte en un solo servicio.</p>
              <span className="compact-badge"><Truck size={14}/> Servicio integral</span>
            </div>

            <div className="service-compact-card">
              <div className="compact-icon"><Lightbulb size={28}/></div>
              <h4>Soporte en Nuevas Experiencias</h4>
              <p>Acompañamos a tu empresa en el diseño y testeo operativo de nuevas rutas, excursiones o productos turísticos.</p>
              <span className="compact-badge"><TrendingUp size={14}/> Innovación</span>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 4. PERFILES DE GUÍA                        */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-light">
        <div className="container">
          <div className="b2b-section-header">
            <h2>Niveles de Especialización</h2>
            <p>Cada servicio exige un perfil diferente. Nosotros te asignamos el match correcto según idioma, complejidad y tipo de pasajero.</p>
          </div>

          <div className="profiles-pricing-grid">
            
            {/* Junior */}
            <div className="profile-tier-card">
              <div className="tier-header">
                <h4>Guía Junior / Asistente</h4>
                <div className="tier-price"><span>desde </span>$40.000<span> CLP</span></div>
              </div>
              <div className="tier-features">
                <ul>
                  <li><CheckCircle className="text-accent" size={18}/> Apoyo logístico y coordinación base</li>
                  <li><CheckCircle className="text-accent" size={18}/> Asistencia a guías Senior en terreno</li>
                  <li><CheckCircle className="text-accent" size={18}/> Grupos masivos, colegios y traslados</li>
                  <li><CheckCircle className="text-accent" size={18}/> Manejo básico de contingencias</li>
                </ul>
              </div>
              <div className="profile-disclaimer">
                <AlertCircle size={28} className="text-accent" />
                <span>Ideal para traslados, asistencia en aeropuerto o segunda voz en tours grandes.</span>
              </div>
            </div>

            {/* Full */}
            <div className="profile-tier-card">
              <div className="profile-tier-badge" style={{background: 'var(--c-primary-dark)'}}>Recomendado</div>
              <div className="tier-header">
                <h4>Guía Full</h4>
                <div className="tier-price"><span>desde </span>$60.000<span> CLP</span></div>
              </div>
              <div className="tier-features">
                <ul>
                  <li><CheckCircle className="text-accent" size={18}/> Alta autonomía resolutiva</li>
                  <li><CheckCircle className="text-accent" size={18}/> Manejo de idiomas (Inglés/Portugués)</li>
                  <li><CheckCircle className="text-accent" size={18}/> Relato estructurado e interpretativo</li>
                  <li><CheckCircle className="text-accent" size={18}/> Manejo de dinámicas grupales</li>
                </ul>
              </div>
              <div className="profile-disclaimer">
                <AlertCircle size={28} className="text-accent" />
                <span>Perfil estándar de alta calidad para City Tours, Viñedos y Full Days regulares.</span>
              </div>
            </div>

            {/* Senior */}
            <div className="profile-tier-card featured">
              <div className="profile-tier-badge">Premium</div>
              <div className="tier-header">
                <h4>Guía Senior / Especializado</h4>
                <div className="tier-price" style={{color: 'var(--b2b-gold)'}}><span>desde </span>$70.000<span> CLP</span></div>
              </div>
              <div className="tier-features">
                <ul>
                  <li><Star fill="var(--b2b-gold)" stroke="var(--b2b-gold)" size={18}/> Especialización técnica (Naturaleza, Vino, Historia)</li>
                  <li><Star fill="var(--b2b-gold)" stroke="var(--b2b-gold)" size={18}/> Certificaciones avanzadas (WFR/WAFA)</li>
                  <li><Star fill="var(--b2b-gold)" stroke="var(--b2b-gold)" size={18}/> Perfil orientado a servicios VIP privados</li>
                  <li><Star fill="var(--b2b-gold)" stroke="var(--b2b-gold)" size={18}/> Manejo de pasajeros de alta exigencia</li>
                </ul>
              </div>
              <div className="profile-disclaimer" style={{background: '#FDF6E3', borderColor: '#D4AF37'}}>
                <AlertCircle size={28} color="#D4AF37" />
                <span>Indispensable para alta montaña, trekking técnico y corporativos de alto nivel.</span>
              </div>
            </div>

          </div>

          <div className="pricing-note">
            <AlertCircle size={20}/>
            La elección del perfil no depende solo del precio, sino del nivel de exigencia, idioma, tipo de pasajero y estándar esperado por la empresa.
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 5. CÓMO FUNCIONA                           */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-white">
        <div className="container">
          <div className="b2b-section-header">
            <h2>Proceso de Coordinación Operativa</h2>
            <p>Metodología estructurada para garantizar respuesta rápida y trazabilidad en cada servicio.</p>
          </div>

          <div className="b2b-timeline">
            <div className="timeline-step">
              <div className="timeline-number">1</div>
              <div className="timeline-content">
                <h4>Solicitud del servicio</h4>
                <p>La empresa nos indica fecha, horario, destino, tipo de grupo, idioma requerido y detalles operativos.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-number">2</div>
              <div className="timeline-content">
                <h4>Evaluación y Match</h4>
                <p>Cruzamos el requerimiento con nuestra base activa y definimos el perfil técnico ideal para tu operación.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-number">3</div>
              <div className="timeline-content">
                <h4>Asignación y Confirmación</h4>
                <p>Bloqueamos la agenda del guía seleccionado y confirmamos la disponibilidad logística a tu empresa.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-number">4</div>
              <div className="timeline-content">
                <h4>Traspaso Operativo</h4>
                <p>Entregamos al guía el itinerario, vouchers de pasajeros y alineamientos específicos de tu marca.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-number">5</div>
              <div className="timeline-content">
                <h4>Ejecución y Monitoreo</h4>
                <p>El guía ejecuta el servicio. Nuestro equipo de soporte está atento ante cualquier contingencia operativa.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-number">6</div>
              <div className="timeline-content">
                <h4>Cierre y Seguimiento</h4>
                <p>Canalizamos reportes de terreno y observaciones para la mejora continua del servicio conjunto.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 6. COBERTURA OPERATIVA                     */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-light">
        <div className="container">
          <div className="b2b-section-header">
            <h2>Red Operativa en Chile</h2>
            <p>Amplia capacidad de respuesta en los polos turísticos y corporativos más exigentes del país.</p>
          </div>

          <div className="b2b-coverage-grid">
            <div className="coverage-box">
              <h4><MapPin size={22} className="text-accent" /> Destinos</h4>
              <div className="coverage-tags">
                <span className="b2b-tag">Santiago Centro y Oriente</span>
                <span className="b2b-tag">Cordillera (Valle Nevado, Portillo)</span>
                <span className="b2b-tag">Andes Panorámico / Farellones</span>
                <span className="b2b-tag">Valparaíso y Viña del Mar</span>
                <span className="b2b-tag">Isla Negra / Litoral Central</span>
                <span className="b2b-tag">Valles Vitivinícolas (Maipo, Casablanca)</span>
              </div>
            </div>
            
            <div className="coverage-box">
              <h4><Compass size={22} className="text-accent" /> Experiencias</h4>
              <div className="coverage-tags">
                <span className="b2b-tag">City Tours Regulares e Históricos</span>
                <span className="b2b-tag">Turismo de Naturaleza y Alta Montaña</span>
                <span className="b2b-tag">Enoturismo Especializado</span>
                <span className="b2b-tag">Servicios Corporativos (MICE)</span>
                <span className="b2b-tag">Asistencias en Aeropuerto</span>
                <span className="b2b-tag">Dinámicas de Cruceros</span>
              </div>
            </div>

            <div className="coverage-box">
              <h4><Languages size={22} className="text-accent" /> Idiomas</h4>
              <div className="coverage-tags">
                <span className="b2b-tag">Español</span>
                <span className="b2b-tag">Inglés</span>
                <span className="b2b-tag">Portugués</span>
                <span className="b2b-tag">Francés</span>
                <span className="b2b-tag">Alemán</span>
                <span className="b2b-tag">Italiano</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 7. MODALIDAD COMERCIAL                     */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-white">
        <div className="container">
          <div className="commercial-model-panel">
            <h3>Modelo transparente de facturación</h3>
            <div className="commercial-flex">
              <div className="commercial-item">
                <ShieldCheck size={40} />
                <h4>Honorario del Guía</h4>
                <p>La empresa paga el honorario tarifario acordado directamente al profesional. El guía emite su correspondiente boleta de honorarios.</p>
              </div>
              <div className="commercial-plus">+</div>
              <div className="commercial-item accent">
                <Zap size={40} />
                <h4>Fee Operativo</h4>
                <p>Guía a la Carta factura a la empresa un fee por el servicio de búsqueda, perfilamiento, articulación logística y respaldo operativo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 8. ¿POR QUÉ TRABAJAR CON NOSOTROS?        */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-light">
        <div className="container">
          <div className="b2b-section-header">
            <h2>Hacemos que tu operación no falle</h2>
            <p>Beneficios concretos de contar con Guía a la Carta como aliado operativo.</p>
          </div>

          <div className="why-us-grid">
            <div className="why-card">
              <div className="why-icon"><Zap size={30}/></div>
              <h4>Agilidad Logística</h4>
              <p>Reducimos las horas-hombre que tu equipo pierde buscando guía tras guía. Nosotros lo resolvemos en horas, no en días.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Shield size={30}/></div>
              <h4>Estándar de Calidad</h4>
              <p>Menos improvisación. Validamos certificaciones, primeros auxilios, idiomas y conocimiento técnico real.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Users size={30}/></div>
              <h4>Flexibilidad de Equipo</h4>
              <p>No engrosas costos fijos anuales, pero mantienes cobertura total cuando la demanda lo requiere.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><HeartHandshake size={30}/></div>
              <h4>Respaldo Real</h4>
              <p>Si algo ocurre en terreno, hay un equipo detrás gestionando la contingencia junto al transporte y la empresa.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Target size={30}/></div>
              <h4>Perfiles Alineados</h4>
              <p>No asignamos al azar. Cada guía se selecciona por perfil técnico, idioma, zona de experiencia y nivel de autonomía.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><TrendingUp size={30}/></div>
              <h4>Continuidad Operativa</h4>
              <p>Mantienes tu estándar de servicio sin depender de una sola persona. Si un guía no está, la red responde.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 9. FAQ                                     */}
      {/* =========================================== */}
      <section className="b2b-section bg-b2b-white">
        <div className="container">
          <div className="b2b-section-header">
            <h2>Preguntas Frecuentes</h2>
            <p>Respondemos las dudas más comunes de empresas que evalúan trabajar con nosotros.</p>
          </div>

          <div className="b2b-faq">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question" 
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  {faq.q}
                  {openFaq === index 
                    ? <ChevronUp size={20} className="text-accent"/> 
                    : <ChevronDown size={20} className="text-accent"/>
                  }
                </button>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 10. CTA FINAL                              */}
      {/* =========================================== */}
      <section className="b2b-section">
        <div className="container">
          <div className="b2b-cta-final">
            <h2>Asegura tu próxima operación hoy</h2>
            <p>
              Cuéntanos fecha, destino, idioma y tipo de grupo. 
              Te ayudamos a encontrar el perfil adecuado para tu operación.
            </p>
            <div className="b2b-cta-actions">
              <Link to="/contacto" className="btn btn-secondary" style={{padding: '0.8rem 2.2rem', fontSize: '1.05rem'}}>
                Solicitar cotización
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{display: 'flex', alignItems: 'center'}}>
                <Phone size={20} style={{marginRight: '8px'}}/> Coordinación por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Servicios;
