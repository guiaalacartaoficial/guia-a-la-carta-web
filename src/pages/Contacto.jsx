import { MapPin, Mail, Phone, Send, MessageCircle } from 'lucide-react';
import './Contacto.css';

const Contacto = () => {
  return (
    <div className="section contacto-page">
      <div className="container text-center mb-5">
        <h1 style={{color: 'var(--c-primary-dark)', marginBottom: '1rem'}}>Conversemos sobre tu operación</h1>
        <p style={{fontSize: '1.15rem', color: 'var(--c-text-light)', maxWidth: '700px', margin: '0 auto'}}>
          Si tu empresa necesita fortalecer su operación turística con guías certificados y una coordinación más confiable, escríbenos o agenda una reunión.
        </p>
      </div>

      <div className="container contacto-grid">
        
        <div className="contacto-info-card">
          <h3 className="mb-4">Información de Contacto</h3>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{color: 'var(--c-accent)'}}><MapPin size={24}/></div>
              <div>
                <strong>Dirección Operativa</strong>
                <p>Santiago, Región Metropolitana, Chile</p>
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{color: 'var(--c-accent)'}}><Phone size={24}/></div>
              <div>
                <strong>Teléfono / WhatsApp</strong>
                <p>+56 9 5604 8293</p>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{color: 'var(--c-accent)'}}><Mail size={24}/></div>
              <div>
                <strong>Email</strong>
                <p>guiaalacartaoficial@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <a href="https://wa.me/56956048293" target="_blank" rel="noreferrer" className="btn btn-whatsapp-full">
              <MessageCircle size={20} style={{marginRight: '10px'}}/> Hablar por WhatsApp
            </a>
          </div>
        </div>

        <div className="contacto-form-card">
          <h3 className="mb-4">Envíanos una solicitud</h3>
          <form>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label text-dark-blue">Nombre y Apellido</label>
                <input type="text" className="form-control" placeholder="Ej: Juan Pérez" />
              </div>
              <div className="form-group">
                <label className="form-label text-dark-blue">Empresa</label>
                <input type="text" className="form-control" placeholder="Nombre de tu empresa" />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label text-dark-blue">Cargo</label>
                <input type="text" className="form-control" placeholder="Tu cargo actual" />
              </div>
              <div className="form-group">
                <label className="form-label text-dark-blue">Teléfono / WhatsApp</label>
                <input type="tel" className="form-control" placeholder="+56 9..." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-dark-blue">Correo Electrónico</label>
              <input type="email" className="form-control" placeholder="tu@empresa.com" />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label text-dark-blue">Tipo de servicio requerido</label>
                <select className="form-control">
                  <option>Seleccione una opción...</option>
                  <option>Provisión de guías por tour</option>
                  <option>Cobertura de temporada alta</option>
                  <option>Servicio operativo completo</option>
                  <option>Requerimientos de último minuto</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label text-dark-blue">Idioma(s)</label>
                <input type="text" className="form-control" placeholder="Ej: Inglés, Portugués..." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-dark-blue">Mensaje o necesidad específica</label>
              <textarea className="form-textarea" placeholder="Cuéntanos más sobre cómo podemos ayudarte con tu operación..." rows="4"></textarea>
            </div>
            
            <button type="button" className="btn btn-primary" style={{width: '100%', fontSize: '1.1rem', marginTop: '1rem'}}>
              <Send size={18} style={{marginRight: '8px', display: 'inline-block'}}/> Enviar Solicitud
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contacto;
