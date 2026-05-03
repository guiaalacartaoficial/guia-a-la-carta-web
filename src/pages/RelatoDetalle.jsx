import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Calendar, User, ArrowLeft, Send, Clock, ShieldCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Relatos.css'; 

const RelatoDetalle = () => {
  const { id } = useParams();
  const [relato, setRelato] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState({ usuario: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetchRelatoYComentarios();
  }, [id]);

  const fetchRelatoYComentarios = async () => {
    setLoading(true);
    try {
      // Fetch Relato
      const { data: relatoData, error: relatoError } = await supabase
        .from('relatos')
        .select('*')
        .eq('id', id)
        .single();

      if (relatoError) throw relatoError;
      setRelato(relatoData);

      // Fetch Comentarios Aprobados
      const { data: comentariosData, error: comError } = await supabase
        .from('comentarios_relatos')
        .select('*')
        .eq('relato_id', id)
        .eq('estado', 'aprobado')
        .order('fecha', { ascending: true });

      if (comError) throw comError;
      setComentarios(comentariosData || []);

    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.usuario || !nuevoComentario.texto) return;
    setEnviando(true);

    try {
      const { error } = await supabase.from('comentarios_relatos').insert([{
        relato_id: id,
        usuario_nombre: nuevoComentario.usuario,
        texto: nuevoComentario.texto,
        estado: 'pendiente', // Los comentarios pasan por moderación
        fecha: new Date().toISOString()
      }]);

      if (error) throw error;
      
      // Notificar al admin via EmailJS
      try {
        await emailjs.send(
          'service_ihvjiza',
          'template_u6p28e4',
          {
            tipo_solicitud: 'Nuevo Comentario en Relato',
            nombre: nuevoComentario.usuario,
            email: 'admin@guiaalacarta.cl',
            mensaje: `El usuario ${nuevoComentario.usuario} ha comentado en el relato "${relato.titulo}": "${nuevoComentario.texto}". Moderación requerida.`
          },
          '_nmx76wxhMLgNa1ic'
        );
      } catch (err) {
        console.error("Error al notificar comentario:", err);
      }

      alert("¡Gracias! Tu comentario ha sido enviado y aparecerá una vez sea aprobado.");
      setNuevoComentario({ usuario: '', texto: '' });
    } catch (error) {
      console.error("Error enviando comentario:", error);
      alert("No se pudo enviar el comentario. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '150px 0' }}>
        <Clock className="spin" size={40} style={{ color: 'var(--c-primary)', marginBottom: '1rem' }} />
        <p>Cargando relato...</p>
      </div>
    );
  }

  if (!relato) {
    return (
      <div className="container text-center" style={{ padding: '100px 0' }}>
        <h2>Relato no encontrado</h2>
        <Link to="/relatos" className="btn btn-primary mt-4">Volver a Relatos</Link>
      </div>
    );
  }

  return (
    <div className="relato-detalle-page">
      <section className="relato-detalle-hero" style={{ backgroundImage: `url(${relato.imagen_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'})` }}>
        <div className="hero-overlay"></div>
        <div className="container">
          <Link to="/relatos" className="back-link"><ArrowLeft size={18} /> Volver a Relatos</Link>
          <div className="hero-content-detail">
            <span className="relato-tag">Historia Local</span>
            <h1>{relato.titulo}</h1>
            <div className="relato-meta detail">
              <span><Calendar size={18} /> {new Date(relato.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span><User size={18} /> Por {relato.autor}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relato-body-section">
        <div className="container">
          <div className="relato-main-content">
            {relato.datos_clave && (
              <div className="relato-datos-clave">
                <h4>Datos Clave</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{relato.datos_clave}</p>
              </div>
            )}
            
            <p className="relato-full-text" style={{ whiteSpace: 'pre-wrap' }}>{relato.contenido}</p>
            
            {relato.como_se_cuenta && (
              <div className="relato-como-se-cuenta">
                <h4>¿Cómo se cuenta en terreno?</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{relato.como_se_cuenta}</p>
              </div>
            )}

            {relato.galeria_urls && relato.galeria_urls.length > 0 && (
              <div className="relato-galeria">
                <h4>Galería del Relato</h4>
                <div className="galeria-grid">
                  {relato.galeria_urls.map((url, i) => (
                    <img key={i} src={url} alt={`Galería ${i}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="comentarios-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              <ShieldCheck size={28} color="var(--c-primary)" />
              <h3 style={{ margin: 0 }}>Comunidad y Opiniones ({comentarios.length})</h3>
            </div>
            
            <div className="comentarios-list">
              {comentarios.length > 0 ? (
                comentarios.map(c => (
                  <div key={c.id} className="comentario-item">
                    <div className="comentario-avatar">{c.usuario_nombre.charAt(0).toUpperCase()}</div>
                    <div className="comentario-content">
                      <div className="comentario-header">
                        <strong>{c.usuario_nombre}</strong>
                        <span>{new Date(c.fecha).toLocaleDateString()}</span>
                      </div>
                      <p>{c.texto}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-comments">Aún no hay comentarios aprobados. ¡Sé el primero en compartir tu opinión!</p>
              )}
            </div>

            <div className="nuevo-comentario-form">
              <h4>Deja un comentario</h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Comparte tu perspectiva. Tu comentario será moderado para mantener la calidad de la comunidad.</p>
              <form onSubmit={handleEnviarComentario}>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Tu nombre" 
                    className="form-control"
                    value={nuevoComentario.usuario}
                    onChange={(e) => setNuevoComentario({...nuevoComentario, usuario: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    placeholder="Escribe tu comentario aquí..." 
                    className="form-textarea"
                    value={nuevoComentario.texto}
                    onChange={(e) => setNuevoComentario({...nuevoComentario, texto: e.target.value})}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar Comentario'} <Send size={18} style={{ marginLeft: '10px' }} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RelatoDetalle;
