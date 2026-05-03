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
  const [newRelato, setNewRelato] = useState({ titulo: '', autor: '', hook: '', contenido: '', datos_clave: '', como_se_cuenta: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
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

      let galleryUrls = [];
      if (galleryFiles && galleryFiles.length > 0) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const url = await uploadFile(galleryFiles[i], 'documentos', 'relatos_galeria');
          if (url) galleryUrls.push(url);
        }
      }

      const { error } = await supabase.from('relatos').insert([{
        titulo: newRelato.titulo,
        autor: newRelato.autor,
        hook: newRelato.hook,
        contenido: newRelato.contenido,
        datos_clave: newRelato.datos_clave,
        como_se_cuenta: newRelato.como_se_cuenta,
        imagen_url: imageUrl,
        galeria_urls: galleryUrls,
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
      setNewRelato({ titulo: '', autor: '', hook: '', contenido: '', datos_clave: '', como_se_cuenta: '' });
      setSelectedFile(null);
      setGalleryFiles([]);
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
                    <p>{relato.hook || relato.resumen}</p>
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
                  <label>Nombre del Autor o Actores Múltiples</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez y María Gómez" 
                    className="form-control"
                    value={newRelato.autor}
                    onChange={e => setNewRelato({...newRelato, autor: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Hook (Gancho del relato)</label>
                <textarea 
                  placeholder="Una frase cautivadora para atrapar al lector..." 
                  className="form-control"
                  style={{ height: '80px' }}
                  value={newRelato.hook}
                  onChange={e => setNewRelato({...newRelato, hook: e.target.value})}
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
                <label>Datos Clave del Relato</label>
                <textarea 
                  placeholder="Ej: Altitud, dificultad, mejor época para ir, flora/fauna importante..." 
                  className="form-control"
                  style={{ height: '100px' }}
                  value={newRelato.datos_clave}
                  onChange={e => setNewRelato({...newRelato, datos_clave: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>¿Cómo se cuenta este relato en terreno?</label>
                <textarea 
                  placeholder="Explica en qué momento del tour lo cuentas, en qué lugar específico, de qué manera..." 
                  className="form-control"
                  style={{ height: '100px' }}
                  value={newRelato.como_se_cuenta}
                  onChange={e => setNewRelato({...newRelato, como_se_cuenta: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Foto de Portada (Principal)</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    required
                  />
                  <p className="file-help">Sube una imagen representativa principal de tu historia (JPG, PNG).</p>
                </div>
              </div>
              <div className="form-group">
                <label>Galería de Fotos Adicionales</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    className="form-control"
                    onChange={e => setGalleryFiles(Array.from(e.target.files))}
                  />
                  <p className="file-help">Sube otras imágenes para acompañar tu relato en una galería.</p>
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
