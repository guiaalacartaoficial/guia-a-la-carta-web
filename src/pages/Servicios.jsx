import { Briefcase, MapPin, Clock, Settings, Compass, CheckCircle, Award } from 'lucide-react';
import './Servicios.css';

const Servicios = () => {
  return (
    <div className="servicios-page">
      {/* PÁGINA 2: SERVICIOS */}
      <section className="servicios-header">
        <div className="servicios-header-overlay"></div>
        <div className="container text-center" style={{position: 'relative', zIndex: 2}}>
          <h1>Nuestros servicios</h1>
          <p>Soluciones flexibles para empresas que necesitan guías, coordinación y respaldo operativo.</p>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="services-list-modern">
            
            <div className="service-row-modern">
              <div className="service-icon-side"><Briefcase size={40}/></div>
              <div className="service-content">
                <h2>Servicios por Tour</h2>
                <p>Asignación de guías turísticos para jornadas o experiencias específicas, según fecha, idioma, tipo de grupo y características del servicio.</p>
                <div className="service-includes">
                  <strong>Incluye:</strong>
                  <ul>
                    <li><CheckCircle size={16} className="text-accent"/> Asignación de guía</li>
                    <li><CheckCircle size={16} className="text-accent"/> Validación de perfil</li>
                    <li><CheckCircle size={16} className="text-accent"/> Confirmación operativa</li>
                    <li><CheckCircle size={16} className="text-accent"/> Entrega de información al guía</li>
                    <li><CheckCircle size={16} className="text-accent"/> Coordinación previa</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="service-row-modern reverse">
              <div className="service-icon-side"><Settings size={40}/></div>
              <div className="service-content">
                <h2>Servicio Operativo Completo</h2>
                <p>Apoyo integral para empresas que quieren externalizar parcial o totalmente la coordinación del servicio.</p>
                <div className="service-includes">
                  <strong>Incluye:</strong>
                  <ul>
                    <li><CheckCircle size={16} className="text-accent"/> Gestión de reservas</li>
                    <li><CheckCircle size={16} className="text-accent"/> Confirmaciones</li>
                    <li><CheckCircle size={16} className="text-accent"/> Coordinación de guía</li>
                    <li><CheckCircle size={16} className="text-accent"/> Coordinación con conductor</li>
                    <li><CheckCircle size={16} className="text-accent"/> Comunicación centralizada</li>
                    <li><CheckCircle size={16} className="text-accent"/> Apoyo logístico general</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="service-row-modern">
              <div className="service-icon-side"><MapPin size={40}/></div>
              <div className="service-content">
                <h2>Cobertura de temporada alta</h2>
                <p>Apoyo operativo para empresas que necesitan escalar su capacidad sin aumentar estructura fija.</p>
              </div>
            </div>

            <div className="service-row-modern reverse">
              <div className="service-icon-side"><Clock size={40}/></div>
              <div className="service-content">
                <h2>Requerimientos de último minuto</h2>
                <p>Solución para contingencias, reemplazos y necesidades urgentes, sujeta a disponibilidad.</p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* PÁGINA 3: CÓMO FUNCIONA */}
      <section className="section comofunciona-services text-center">
        <div className="container">
          <h2 className="mb-5">Cómo funciona Guía a la Carta</h2>
          
          <div className="pasos-grid">
            <div className="paso-card">
              <div className="paso-numero">1</div>
              <h4>Solicitud del servicio</h4>
              <p>La empresa envía fecha, horario, tipo de tour, idioma y detalles operativos.</p>
            </div>
            <div className="paso-card">
              <div className="paso-numero">2</div>
              <h4>Evaluación de perfil</h4>
              <p>Definimos qué tipo de guía se ajusta mejor a la operación.</p>
            </div>
            <div className="paso-card">
              <div className="paso-numero">3</div>
              <h4>Asignación y confirmación</h4>
              <p>Buscamos, validamos y confirmamos un perfil disponible.</p>
            </div>
            <div className="paso-card">
              <div className="paso-numero">4</div>
              <h4>Coordinación operativa</h4>
              <p>Entregamos al guía información del servicio y alineamos a las partes.</p>
            </div>
            <div className="paso-card">
              <div className="paso-numero">5</div>
              <h4>Ejecución del tour</h4>
              <p>El guía realiza el servicio según lo coordinado.</p>
            </div>
            <div className="paso-card">
              <div className="paso-numero">6</div>
              <h4>Seguimiento</h4>
              <p>Canalizamos observaciones y apoyamos el cierre operativo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PÁGINA 5: COBERTURA */}
      <section className="section cobertura-services">
        <div className="container">
          <div className="cobertura-header text-center">
            <h2>Cobertura operativa</h2>
            <p>Trabajamos en destinos y servicios clave para la operación turística en Chile.</p>
          </div>
          
          <div className="cobertura-tags-large mt-5">
            <span className="tag-large"><Compass size={20}/> Santiago</span>
            <span className="tag-large"><Compass size={20}/> Cordillera de los Andes</span>
            <span className="tag-large"><Compass size={20}/> Farellones</span>
            <span className="tag-large"><Compass size={20}/> Valle Nevado</span>
            <span className="tag-large"><Compass size={20}/> El Colorado</span>
            <span className="tag-large"><Compass size={20}/> Portillo</span>
            <span className="tag-large"><Compass size={20}/> Andes Panorámico</span>
            <span className="tag-large"><Compass size={20}/> Andes Day Sunset</span>
            <span className="tag-large"><Compass size={20}/> Valparaíso</span>
            <span className="tag-large"><Compass size={20}/> Viña del Mar</span>
            <span className="tag-large"><Compass size={20}/> Isla Negra</span>
            <span className="tag-large"><Compass size={20}/> Rutas vinícolas</span>
          </div>

          <p className="text-center mt-5 text-white" style={{opacity: 0.9}}>
            <MapPin size={18} className="text-accent icon-inline"/> La cobertura puede ampliarse según disponibilidad y coordinación previa.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Servicios;
