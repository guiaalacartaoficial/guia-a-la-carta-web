import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MessageCircle, Calendar, User, ArrowRight, BookOpen, Send, Clock, X } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Relatos.css';

const Relatos = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newRelato, setNewRelato] = useState({ titulo: '', autor: '', resumen: '', contenido: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRelatos();
  }, []);

  const fetchRelatos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatos')
        .select('*, comentarios_relatos(count)')
        .eq('estado', 'aprobado')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setRelatos(data || []);
    } catch (error) {
      console.error("Error fetching relatos:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, bucket, path) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSumbitRelato = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Subir imagen primero
      let imageUrl = '';
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile, 'documentos', 'relatos');
      }

      const { error } = await supabase.from('relatos').insert([{
        ...newRelato,
        imagen_url: imageUrl,
        estado: 'pendiente',
        fecha: new Date().toISOString()
      }]);
      if (error) throw error;

      // Notificar al admin via EmailJS
      try {
        await emailjs.send(
          'service_ihvjiza',
          'template_u6p28e4',
          {
            tipo_solicitud: 'Nuevo Relato para Moderación',
            nombre: newRelato.autor,
            email: 'admin@guiaalacarta.cl',
            mensaje: `El usuario ${newRelato.autor} ha enviado un nuevo relato titulado "${newRelato.titulo}". Revisa el panel administrativo para aprobarlo.`
          },
          '_nmx76wxhMLgNa1ic'
        );
      } catch (err) {
        console.error("Error al notificar relato:", err);
      }

      alert("¡Gracias! Tu relato ha sido enviado y está pendiente de moderación.");
      setIsFormOpen(false);
      setNewRelato({ titulo: '', autor: '', resumen: '', contenido: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error submitting relato:", error);
      alert("Hubo un error al enviar tu relato. Por favor intenta de nuevo. Revisa que el bucket 'documentos' sea público en Supabase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relatos-page">
      <section className="relatos-header">
        <div className="container text-center">
          <span className="pre-title">Bitácora de Experiencias</span>
          <h1>Relatos de Nuestra Tierra</h1>
          <p className="bajada">Historias, cultura y vivencias compartidas por nuestros guías expertos desde los rincones más profundos de Chile.</p>
        </div>
      </section>

      <section className="relatos-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading-state text-center" style={{ padding: '4rem' }}>
              <Clock className="spin" size={32} style={{ color: 'var(--c-primary)', marginBottom: '1rem' }} />
              <p>Cargando historias...</p>
            </div>
          ) : relatos.length > 0 ? (
            <div className="relatos-grid">
              {relatos.map((relato) => (
                <div key={relato.id} className="relato-card">
                  <div className="relato-card-image" style={{ backgroundImage: `url(${relato.imagen_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'})` }}>
                    <div className="relato-card-overlay">
                      <span className="relato-tag">Historia Local</span>
                    </div>
                  </div>
                  <div className="relato-card-content">
                    <div className="relato-meta">
                      <span><Calendar size={14} /> {new Date(relato.fecha).toLocaleDateString('es-CL')}</span>
                      <span><User size={14} /> {relato.autor}</span>
                    </div>
                    <h3>{relato.titulo}</h3>
                    <p>{relato.resumen}</p>
                    <div className="relato-card-footer">
                      <span className="comentarios-count">
                        <MessageCircle size={16} /> {relato.comentarios_relatos?.[0]?.count || 0}
                      </span>
                      <Link to={`/relatos/${relato.id}`} className="read-more-btn">
                        Leer más <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state text-center" style={{ padding: '4rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h3>Aún no hay relatos publicados</h3>
              <p>Sé el primero en compartir una experiencia única.</p>
              <button onClick={() => setIsFormOpen(true)} className="btn btn-primary mt-4">Escribir el primer relato</button>
            </div>
          )}
        </div>
      </section>

      <section className="relatos-cta">
        <div className="container text-center">
          <div className="cta-glass-box">
            <h2>¿Tienes una historia que contar?</h2>
            <p>Nuestra comunidad crece con las vivencias de cada guía. Si quieres compartir tu experiencia, envíanos tu relato ahora.</p>
            <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">Escribir un relato</button>
          </div>
        </div>
      </section>

      {/* MODAL FORMULARIO DE RELATO */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content relato-form-modal">
            <button className="close-modal" onClick={() => setIsFormOpen(false)}><X /></button>
            <div className="modal-header">
              <h2>Compartir mi Historia</h2>
              <p>Tu relato será revisado por nuestro equipo antes de ser publicado.</p>
            </div>
            <form onSubmit={handleSumbitRelato} className="relato-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Título del Relato</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Amanecer en las Torres del Paine" 
                    className="form-control"
                    value={newRelato.titulo}
                    onChange={e => setNewRelato({...newRelato, titulo: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre del Autor</label>
                  <input 
                    type="text" 
                    placeholder="Tu nombre completo" 
                    className="form-control"
                    value={newRelato.autor}
                    onChange={e => setNewRelato({...newRelato, autor: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Resumen Corto (Max 150 caracteres)</label>
                <textarea 
                  placeholder="Una breve descripción para atraer lectores..." 
                  className="form-control"
                  style={{ height: '80px' }}
                  value={newRelato.resumen}
                  onChange={e => setNewRelato({...newRelato, resumen: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Contenido del Relato</label>
                <textarea 
                  placeholder="Escribe tu historia aquí con todo el detalle posible..." 
                  className="form-control"
                  style={{ height: '200px' }}
                  value={newRelato.contenido}
                  onChange={e => setNewRelato({...newRelato, contenido: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Foto de Portada (Documento/Imagen)</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    required
                  />
                  <p className="file-help">Sube una imagen representativa de tu historia (JPG, PNG).</p>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? 'Subiendo imagen y relato...' : 'Enviar para Revisión'} <Send size={18} style={{ marginLeft: '10px' }} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatos;
