import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { relatos } from '../data/relatosData';
import { Calendar, User, ArrowLeft, Send } from 'lucide-react';
import './Relatos.css'; 

const RelatoDetalle = () => {
  const { id } = useParams();
  const relato = relatos.find(r => r.id === parseInt(id));

  const [comentarios, setComentarios] = useState(relato ? relato.comentarios : []);
  const [nuevoComentario, setNuevoComentario] = useState({ usuario: '', texto: '' });

  if (!relato) {
    return (
      <div className="container text-center" style={{ padding: '100px 0' }}>
        <h2>Relato no encontrado</h2>
        <Link to="/relatos" className="btn btn-primary mt-4">Volver a Relatos</Link>
      </div>
    );
  }

  const handleEnviarComentario = (e) => {
    e.preventDefault();
    if (!nuevoComentario.usuario || !nuevoComentario.texto) return;

    const comentario = {
      id: Date.now(),
      usuario: nuevoComentario.usuario,
      texto: nuevoComentario.texto,
      fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setComentarios([...comentarios, comentario]);
    setNuevoComentario({ usuario: '', texto: '' });
  };

  return (
    <div className="relato-detalle-page">
      <section className="relato-detalle-hero" style={{ backgroundImage: `url(${relato.imagen})` }}>
        <div className="hero-overlay"></div>
        <div className="container">
          <Link to="/relatos" className="back-link"><ArrowLeft size={18} /> Volver a Relatos</Link>
          <div className="hero-content-detail">
            <span className="relato-tag">Historia Local</span>
            <h1>{relato.titulo}</h1>
            <div className="relato-meta detail">
              <span><Calendar size={18} /> {relato.fecha}</span>
              <span><User size={18} /> Por {relato.autor}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relato-body-section">
        <div className="container">
          <div className="relato-main-content">
            <p className="relato-full-text">{relato.contenido}</p>
          </div>

          <div className="comentarios-section">
            <h3>Comentarios ({comentarios.length})</h3>
            
            <div className="comentarios-list">
              {comentarios.length > 0 ? (
                comentarios.map(c => (
                  <div key={c.id} className="comentario-item">
                    <div className="comentario-avatar">{c.usuario.charAt(0).toUpperCase()}</div>
                    <div className="comentario-content">
                      <div className="comentario-header">
                        <strong>{c.usuario}</strong>
                        <span>{c.fecha}</span>
                      </div>
                      <p>{c.texto}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-comments">Aún no hay comentarios. ¡Sé el primero en compartir tu opinión!</p>
              )}
            </div>

            <div className="nuevo-comentario-form">
              <h4>Deja un comentario</h4>
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
                <button type="submit" className="btn btn-primary">
                  Enviar Comentario <Send size={18} style={{ marginLeft: '10px' }} />
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
