import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, FileText, Compass, Target, Eye,
  ShieldCheck, Shield, BadgeCheck, Handshake,
  Zap, Users, Settings, Star, CheckCircle,
  Briefcase, ArrowRight, Globe
} from 'lucide-react';
import './QuienesSomos.css';

const WHATSAPP_URL = "https://wa.me/56956048293?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20Gu%C3%ADa%20a%20la%20Carta";

/* ========= Intersection Observer Hook ========= */
const useScrollAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ns-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.ns-animate');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
};

/* ========= Datos del equipo ========= */
const teamMembers = [
  {
    name: 'Benjamín Meneses',
    role: 'Fundador / Coordinación General',
    photo: '/team-benjamin.png',
    description: 'Responsable de la visión del proyecto, la coordinación general y el desarrollo operativo y comercial de Guía a la Carta.'
  },
  {
    name: 'Gabriel',
    role: 'Co-Fundador / Plataforma y Área Legal',
    photo: '/team-gabriel.png',
    description: 'Encargado del desarrollo de la estructura digital del proyecto y del ordenamiento legal necesario para su crecimiento.'
  },
  {
    name: 'Camilo',
    role: 'Administrador de Equipo de Guías',
    photo: '/team-camilo.png',
    description: 'Responsable de la gestión, organización y seguimiento del equipo de guías, asegurando orden operativo y alineación con los estándares del servicio.'
  }
];

/* ========= Pilares de enfoque ========= */
const enfoqueItems = [
  {
    icon: <Award size={24} />,
    title: 'Profesionalismo',
    desc: 'Perfiles alineados al servicio, con criterio operativo y buena representación frente al pasajero.'
  },
  {
    icon: <Settings size={24} />,
    title: 'Flexibilidad',
    desc: 'Capacidad de adaptación a servicios programados, requerimientos especiales y necesidades de último minuto.'
  },
  {
    icon: <Zap size={24} />,
    title: 'Rapidez',
    desc: 'Respuesta ágil para facilitar continuidad operativa y reducir fricción en la gestión.'
  },
  {
    icon: <Handshake size={24} />,
    title: 'Confianza',
    desc: 'Relaciones serias, claras y sostenibles con empresas, guías y aliados.'
  },
  {
    icon: <Shield size={24} />,
    title: 'Respaldo operativo',
    desc: 'No solo conectamos personas; aportamos coordinación, seguimiento y soporte.'
  }
];

/* ========= Respaldo items ========= */
const respaldoItems = [
  {
    icon: <ShieldCheck size={26} />,
    title: 'Empresa registrada en SERNATUR',
    desc: 'Cumplimos con los requisitos formales del Servicio Nacional de Turismo para operar en el sector.'
  },
  {
    icon: <Globe size={26} />,
    title: 'Vinculación con Marca Chile',
    desc: 'Contamos con vinculación o autorización asociada a Marca Chile, reforzando nuestro compromiso con un turismo de alto estándar.'
  },
  {
    icon: <BadgeCheck size={26} />,
    title: 'Red de guías con validación documental',
    desc: 'Cada guía de nuestra red pasa por un proceso de verificación de certificaciones, antecedentes y competencias.'
  },
  {
    icon: <Star size={26} />,
    title: 'Compromiso con calidad operativa',
    desc: 'Trabajamos bajo procesos claros de coordinación, seguimiento y mejora continua del servicio.'
  }
];

const QuienesSomos = () => {
  const pageRef = useScrollAnimation();

  return (
    <div className="nosotros-page" ref={pageRef}>

      {/* =========================================== */}
      {/* 1. HERO PRINCIPAL                          */}
      {/* =========================================== */}
      <section className="ns-hero" id="hero-nosotros">
        <div className="ns-hero-bg"></div>
        <div className="container ns-hero-content text-center">
          <span className="ns-hero-label">
            <Compass size={16} /> Sobre Guía a la Carta
          </span>
          <h1>Operamos soluciones turísticas con guías confiables, certificados y alineados a cada servicio.</h1>
          <p className="hero-subtitle">
            En Guía a la Carta conectamos empresas de turismo con guías turísticos certificados,
            entregando una solución operativa profesional, flexible y confiable.
          </p>
          <div className="ns-hero-actions">
            <Link to="/servicios" className="btn btn-secondary">Conocer servicios</Link>
            <Link to="/contacto" className="btn btn-hero">Contacto</Link>
          </div>
          <div className="ns-trust-badges">
            <span className="ns-badge"><ShieldCheck className="ns-badge-icon" size={18} /> Registro SERNATUR</span>
            <span className="ns-badge"><BadgeCheck className="ns-badge-icon" size={18} /> Guías Certificados</span>
            <span className="ns-badge"><Briefcase className="ns-badge-icon" size={18} /> Enfoque Operativo</span>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 2. QUIÉNES SOMOS                           */}
      {/* =========================================== */}
      <section className="ns-section bg-ns-white" id="quienes-somos">
        <div className="container">
          <div className="ns-quienes-block ns-animate">
            <div className="ns-quienes-visual">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop"
                alt="Equipo Guía a la Carta trabajando"
              />
            </div>
            <div className="ns-quienes-text">
              <div className="ns-accent-line"></div>
              <h2>Quiénes somos</h2>
              <p>
                Guía a la Carta es una empresa chilena enfocada en entregar soluciones operativas para empresas
                de turismo, conectándolas con guías turísticos certificados y perfiles adecuados para cada tipo de servicio.
              </p>
              <p>
                Trabajamos para reducir la improvisación en la operación turística, facilitando el acceso a guías
                confiables, disponibles y preparados para representar con profesionalismo cada experiencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 3. CÓMO NACIMOS                            */}
      {/* =========================================== */}
      <section className="ns-section bg-ns-light" id="como-nacimos">
        <div className="container">
          <div className="ns-origin-card ns-animate">
            <div className="ns-origin-content">
              <div className="ns-origin-icon-block">
                <FileText size={32} />
              </div>
              <div className="ns-origin-text">
                <h3>Cómo nacimos</h3>
                <p>
                  Nacimos desde la experiencia directa en terreno, al identificar una necesidad crítica del sector:
                  la dificultad de encontrar guías confiables, disponibles y alineados con el nivel de servicio
                  que cada operación necesita.
                </p>
                <p>
                  A partir de esa realidad, decidimos construir una red profesional que permitiera a las empresas
                  operar con más orden, rapidez y seguridad, conectando cada servicio con el guía correcto.
                </p>
                <div className="ns-origin-highlight">
                  <div className="ns-origin-stat">
                    <span className="stat-number">2024</span>
                    <span className="stat-label">Año de fundación</span>
                  </div>
                  <div className="ns-origin-stat">
                    <span className="stat-number">Santiago</span>
                    <span className="stat-label">Base operativa</span>
                  </div>
                  <div className="ns-origin-stat">
                    <span className="stat-number">B2B</span>
                    <span className="stat-label">Enfoque comercial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 4. MISIÓN Y VISIÓN                         */}
      {/* =========================================== */}
      <section className="ns-section bg-ns-white" id="mision-vision">
        <div className="container">
          <div className="ns-section-header">
            <span className="ns-section-label"><Target size={14} /> Propósito</span>
            <h2>Lo que nos mueve como empresa</h2>
          </div>
          <div className="ns-mv-grid">
            <div className="ns-mv-card mision ns-animate">
              <div className="ns-mv-icon">
                <Target size={28} />
              </div>
              <h3>Nuestra Misión</h3>
              <p>
                Facilitar la gestión de guías turísticos en Chile mediante una red confiable de guías certificados,
                garantizando excelencia operativa, respuesta ágil y una coordinación más eficiente para empresas
                del rubro turístico.
              </p>
            </div>
            <div className="ns-mv-card vision ns-animate ns-animate-delay-2">
              <div className="ns-mv-icon">
                <Eye size={28} />
              </div>
              <h3>Nuestra Visión</h3>
              <p>
                Ser la red de guías turísticos más confiable y reconocida de Chile, referente en profesionalismo,
                respaldo operativo y estándar de calidad, con capacidad de escalar hacia nuevas soluciones para
                la industria turística nacional e internacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 5. NUESTRO ENFOQUE                         */}
      {/* =========================================== */}
      <section className="ns-section bg-ns-light" id="nuestro-enfoque">
        <div className="container">
          <div className="ns-section-header">
            <span className="ns-section-label"><Compass size={14} /> Enfoque</span>
            <h2>Pilares de nuestra operación</h2>
            <p>
              Cada pilar define cómo nos relacionamos con las empresas, cómo seleccionamos guías
              y cómo garantizamos que el servicio cumpla con el estándar esperado.
            </p>
          </div>
          <div className="ns-enfoque-grid">
            {enfoqueItems.map((item, idx) => (
              <div
                className={`ns-enfoque-card ns-animate ns-animate-delay-${idx + 1}`}
                key={idx}
              >
                <div className="ns-enfoque-icon">{item.icon}</div>
                <div className="ns-enfoque-content">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 6. NUESTRO EQUIPO                          */}
      {/* =========================================== */}
      <section className="ns-section bg-ns-white" id="nuestro-equipo">
        <div className="container">
          <div className="ns-section-header">
            <span className="ns-section-label"><Users size={14} /> Equipo</span>
            <h2>Las personas detrás de Guía a la Carta</h2>
            <p>
              Un equipo comprometido con profesionalizar la gestión de guías turísticos en Chile,
              desde la coordinación operativa hasta la estructura legal y digital.
            </p>
          </div>
          <div className="ns-team-grid">
            {teamMembers.map((member, idx) => (
              <div
                className={`ns-team-card ns-animate ns-animate-delay-${idx + 1}`}
                key={idx}
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="ns-team-photo"
                />
                <h4>{member.name}</h4>
                <span className="ns-team-role">{member.role}</span>
                <p className="ns-team-desc">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 7. RESPALDO Y FORMALIDAD                   */}
      {/* =========================================== */}
      <section className="ns-section bg-ns-light" id="respaldo-formalidad">
        <div className="container">
          <div className="ns-section-header">
            <span className="ns-section-label"><ShieldCheck size={14} /> Respaldo</span>
            <h2>Respaldo y formalidad empresarial</h2>
          </div>
          <div className="ns-respaldo-wrapper">
            <p className="ns-respaldo-intro ns-animate">
              En Guía a la Carta creemos que la confianza también se construye con respaldo formal.
              Por eso trabajamos con enfoque profesional, estructura operativa clara y compromiso con la
              calidad del servicio. Somos una empresa registrada en SERNATUR y contamos con vinculación
              o autorización asociada a Marca Chile, reforzando nuestro compromiso con un turismo más confiable,
              ordenado y alineado con altos estándares.
            </p>
            <div className="ns-respaldo-grid">
              {respaldoItems.map((item, idx) => (
                <div
                  className={`ns-respaldo-card ns-animate ns-animate-delay-${idx + 1}`}
                  key={idx}
                >
                  <div className="ns-respaldo-seal">{item.icon}</div>
                  <div className="ns-respaldo-text">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* 8. CTA FINAL                               */}
      {/* =========================================== */}
      <section className="ns-section" id="cta-nosotros">
        <div className="container">
          <div className="ns-cta-final ns-animate">
            <h2>¿Quieres conocer cómo trabajamos?</h2>
            <p>
              Si buscas una solución más confiable para la gestión de guías turísticos,
              estamos listos para ayudarte a operar con mayor orden, rapidez y respaldo.
            </p>
            <div className="ns-cta-actions">
              <Link to="/servicios" className="btn btn-secondary" style={{ padding: '0.8rem 2.2rem', fontSize: '1.05rem' }}>
                Ver servicios <ArrowRight size={18} style={{ marginLeft: '6px' }} />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: '0.8rem 2.2rem', fontSize: '1.05rem' }}
              >
                Contactar al equipo
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default QuienesSomos;
