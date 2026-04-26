import React from 'react';
import { Link } from 'react-router-dom';
import { relatos } from '../data/relatosData';
import { MessageCircle, Calendar, User, ArrowRight } from 'lucide-react';
import './Relatos.css';

const Relatos = () => {
  return (
    <div className="relatos-page">
      <section className="relatos-header">
        <div className="container text-center">
          <h1>Relatos de Nuestra Tierra</h1>
          <p className="bajada">Historias, cultura y vivencias compartidas por nuestros guías expertos desde los rincones más profundos de Chile.</p>
        </div>
      </section>

      <section className="relatos-grid-section">
        <div className="container">
          <div className="relatos-grid">
            {relatos.map((relato) => (
              <div key={relato.id} className="relato-card">
                <div className="relato-card-image" style={{ backgroundImage: `url(${relato.imagen})` }}>
                  <div className="relato-card-overlay">
                    <span className="relato-tag">Historia Local</span>
                  </div>
                </div>
                <div className="relato-card-content">
                  <div className="relato-meta">
                    <span><Calendar size={14} /> {relato.fecha}</span>
                    <span><User size={14} /> {relato.autor}</span>
                  </div>
                  <h3>{relato.titulo}</h3>
                  <p>{relato.resumen}</p>
                  <div className="relato-card-footer">
                    <span className="comentarios-count">
                      <MessageCircle size={16} /> {relato.comentarios.length} {relato.comentarios.length === 1 ? 'comentario' : 'comentarios'}
                    </span>
                    <Link to={`/relatos/${relato.id}`} className="read-more-btn">
                      Leer más <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relatos-cta">
        <div className="container text-center">
          <div className="cta-glass-box">
            <h2>¿Tienes una historia que contar?</h2>
            <p>Nuestra comunidad crece con las vivencias de cada guía. Si quieres compartir tu experiencia, contáctanos.</p>
            <Link to="/contacto" className="btn btn-primary">Escribir un relato</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Relatos;
