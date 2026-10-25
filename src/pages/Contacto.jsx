import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Mail, Phone, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import './Contacto.css';

const Contacto = () => {
  const [searchParams] = useSearchParams();
  const [tipoServicio, setTipoServicio] = useState('Seleccione una opción...');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const s = searchParams.get('servicio');
    if (s === 'giras-estudio') {
      setTipoServicio('Coordinación de Giras de Estudio');
    } else if (s === 'nieve') {
      setTipoServicio('Operación en Nieve y Centros Invernales');
    } else if (s === 'guia-sos') {
      setTipoServicio('Requerimientos de último minuto (Guía SOS)');
    } else if (s === 'provision-guias') {
      setTipoServicio('Provisión de guías por tour');
    }
  }, [searchParams]);
  return (
    <div className="section contacto-page">
      <div className="container text-center mb-5">
        <h1 style={{color: 'var(--c-primary-dark)', marginBottom: '1rem'}}>Conversemos sobre tu operación</h1>
        <p style={{fontSize: '1.15rem', color: 'var(--c-text-light)', maxWidth: '700px', margin: '0 auto'}}>
          Si tu empresa necesita fortalecer su operación turística con guías certificados y una coordinación más confiable, escríbenos o agenda una reunión.
        </p>
      </div>

      <div className="footer-accent-bar" />

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
                <select
                  className="form-control"
                  value={tipoServicio}
                  onChange={(e) => setTipoServicio(e.target.value)}
                >
                  <option value="Seleccione una opción...">Seleccione una opción...</option>
                  <option value="Coordinación de Giras de Estudio">Coordinación de Giras de Estudio (Nuevo)</option>
                  <option value="Provisión de guías por tour">Provisión de guías por tour</option>
                  <option value="Cobertura de temporada alta">Cobertura de temporada alta</option>
                  <option value="Servicio operativo completo">Servicio operativo completo</option>
                  <option value="Requerimientos de último minuto (Guía SOS)">Requerimientos de último minuto (Guía SOS)</option>
                  <option value="Operación en Nieve y Centros Invernales">Operación en Nieve y Centros Invernales</option>
                  <option value="DrivePlus+ (Transporte + Conductor)">DrivePlus+ (Transporte + Conductor)</option>
                  <option value="Otro">Otro</option>
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
