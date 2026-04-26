import React, { useState } from 'react';
import { Calendar, Users, MapPin, Languages, Clock, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import './Postulacion.css'; // Reusing some styles for consistency

const Reserva = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    contacto_nombre: '',
    email: '',
    telefono: '',
    fecha_servicio: '',
    pax: '',
    destino: '',
    idioma: 'Español',
    nivel_guia: 'Full',
    comentarios: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('reservas')
        .insert([formData]);

      if (error) throw error;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      alert('Hubo un problema al enviar tu solicitud. Por favor, intenta de nuevo o contáctanos por WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="postulacion-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text-center" style={{ maxWidth: '600px', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#ECFDF5', color: '#10B981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ color: 'var(--c-primary-dark)' }}>Solicitud de Reserva Enviada</h2>
          <p style={{ color: 'var(--c-text-light)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Hemos recibido los detalles de tu requerimiento. Un coordinador operativo de **Guía a la Carta** se pondrá en contacto contigo en breve para confirmar disponibilidad y presupuesto.
          </p>
          <a href="/" className="btn btn-primary">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="postulacion-page">
      <section className="postulacion-header">
        <div className="container text-center">
          <h1>Reserva de Guía Operativo</h1>
          <p>Cuéntanos los detalles de tu servicio y asignaremos al profesional ideal para tu operación.</p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl postulacion-form-container">
          <form onSubmit={handleSubmit}>
            
            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><Users size={24}/></div>
                <h3>1. Información de la Empresa / Contacto</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de la Empresa / Agencia</label>
                <input 
                  type="text" 
                  name="empresa"
                  className="form-control" 
                  placeholder="Ej: Travel Chile DMC" 
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre del Coordinador</label>
                  <input 
                    type="text" 
                    name="contacto_nombre"
                    className="form-control" 
                    placeholder="Ej: María José" 
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono de Contacto</label>
                  <input 
                    type="tel" 
                    name="telefono"
                    className="form-control" 
                    placeholder="+56 9 0000 0000" 
                    required
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  placeholder="operaciones@agencia.com" 
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><Calendar size={24}/></div>
                <h3>2. Detalles del Servicio</h3>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Fecha del Servicio</label>
                  <div className="input-icon-wrapper">
                    <Calendar className="input-icon" size={18} />
                    <input 
                      type="date" 
                      name="fecha_servicio"
                      className="form-control" 
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad de Pasajeros (Pax)</label>
                  <div className="input-icon-wrapper">
                    <Users className="input-icon" size={18} />
                    <input 
                      type="number" 
                      name="pax"
                      className="form-control" 
                      placeholder="Ej: 15" 
                      min="1"
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Destino / Tour</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="destino"
                    className="form-control" 
                    placeholder="Ej: Valle del Yeso o City Tour Privado" 
                    required
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Idioma Requerido</label>
                  <select name="idioma" className="form-select" onChange={handleChange}>
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Portugués">Portugués</option>
                    <option value="Francés">Francés</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nivel de Guía Sugerido</label>
                  <select name="nivel_guia" className="form-select" onChange={handleChange}>
                    <option value="Junior">Junior (Asistencia)</option>
                    <option value="Full">Full (Operativo estándar)</option>
                    <option value="Senior">Senior (Especializado/VIP)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comentarios o Requerimientos Especiales</label>
                <textarea 
                  name="comentarios"
                  className="form-textarea" 
                  placeholder="Ej: El grupo tiene movilidad reducida. Necesitamos que el guía tenga licencia clase A2..."
                  rows="4"
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-submit-premium" 
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {loading ? 'Enviando...' : (
                <>
                  Solicitar Reserva de Guía <ArrowRight size={20} />
                </>
              )}
            </button>
            
            <p className="text-center mt-3" style={{ fontSize: '0.9rem', color: 'var(--c-text-light)' }}>
              * Al enviar esta solicitud, nuestro equipo recibirá un aviso inmediato para gestionar el profesional.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Reserva;
