import React, { useState } from 'react';
import { GALERIA_FOTOS, CATEGORIAS_GALERIA } from '../data/galeria';
import { Camera, X, ZoomIn, Sparkles } from 'lucide-react';
import './SeasonalGallery.css';

const SeasonalGallery = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [fotoModal, setFotoModal] = useState(null);

  const fotosFiltradas = categoriaActiva === 'Todas'
    ? GALERIA_FOTOS
    : GALERIA_FOTOS.filter(f => f.categoria === categoriaActiva);

  return (
    <section className="section-seasonal-gallery b2b-theme-light">
      <div className="container">
        <div className="sg-header text-center">
          <div className="sg-badge">
            <Sparkles size={16} />
            <span>Galería Oficial</span>
          </div>
          <h2>Nuestra Comunidad en Acción: Temporada Actual</h2>
          <p className="sg-desc">
            Registro fotográfico de operaciones en terreno, excursiones escolares, alta montaña y turismo receptivo en Chile.
          </p>

          {/* Categorías / Filtros */}
          <div className="sg-filters">
            {CATEGORIAS_GALERIA.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`sg-filter-btn ${categoriaActiva === cat ? 'active' : ''}`}
                onClick={() => setCategoriaActiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Fotos */}
        <div className="sg-grid">
          {fotosFiltradas.map((foto) => (
            <div
              key={foto.id}
              className="sg-card"
              onClick={() => setFotoModal(foto)}
            >
              <div className="sg-img-wrapper">
                <img src={foto.src} alt={foto.titulo} loading="lazy" />
                <div className="sg-overlay">
                  <span className="sg-zoom-icon"><ZoomIn size={24} /></span>
                  <span className="sg-tag">{foto.categoria}</span>
                </div>
              </div>
              <div className="sg-info">
                <h4>{foto.titulo}</h4>
                <p>{foto.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox */}
        {fotoModal && (
          <div className="sg-modal-backdrop" onClick={() => setFotoModal(null)}>
            <div className="sg-modal-container" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="sg-modal-close"
                onClick={() => setFotoModal(null)}
                aria-label="Cerrar vista previa"
              >
                <X size={26} />
              </button>
              <img src={fotoModal.src} alt={fotoModal.titulo} className="sg-modal-img" />
              <div className="sg-modal-caption">
                <span className="sg-tag">{fotoModal.categoria}</span>
                <h3>{fotoModal.titulo}</h3>
                <p>{fotoModal.desc}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SeasonalGallery;
