import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 18 fotografías de la temporada organizadas en diapositivas de collage asimétrico (4 fotos por diapositiva)
const SLIDES = [
  [
    { id: 1, src: '/gallery/temporada-2026-01.webp', alt: 'Experiencia en terreno' },
    { id: 2, src: '/gallery/temporada-2026-02.webp', alt: 'Guías de turismo' },
    { id: 3, src: '/gallery/temporada-2026-03.webp', alt: 'Coordinación de grupos' },
    { id: 4, src: '/gallery/temporada-2026-04.webp', alt: 'Ruta y senderismo' },
  ],
  [
    { id: 5, src: '/gallery/temporada-2026-05.webp', alt: 'Panorámicas cordillera' },
    { id: 6, src: '/gallery/temporada-2026-06.webp', alt: 'Guías certificados' },
    { id: 7, src: '/gallery/temporada-2026-07.webp', alt: 'Giras de estudio y delegaciones' },
    { id: 8, src: '/gallery/temporada-2026-08.webp', alt: 'Ruta patrimonial' },
  ],
  [
    { id: 9, src: '/gallery/temporada-2026-09.webp', alt: 'Operación receptiva' },
    { id: 10, src: '/gallery/temporada-2026-10.webp', alt: 'Seguridad en terreno' },
    { id: 11, src: '/gallery/temporada-2026-11.webp', alt: 'Parques y áreas naturales' },
    { id: 12, src: '/gallery/temporada-2026-12.webp', alt: 'Hitos turísticos' },
  ],
  [
    { id: 13, src: '/gallery/temporada-2026-13.webp', alt: 'Atención personalizada' },
    { id: 14, src: '/gallery/temporada-2026-14.webp', alt: 'Turismo montaña' },
    { id: 15, src: '/gallery/temporada-2026-15.webp', alt: 'Actividades grupales' },
    { id: 16, src: '/gallery/temporada-2026-16.webp', alt: 'Cultura e historia' },
  ],
  [
    { id: 17, src: '/gallery/temporada-2026-17.webp', alt: 'Logística de transporte' },
    { id: 18, src: '/gallery/temporada-2026-18.webp', alt: 'Red de guías en acción' },
    { id: 19, src: '/gallery/temporada-2026-07.webp', alt: 'Conducción de grupos' },
    { id: 20, src: '/gallery/temporada-2026-14.webp', alt: 'Experiencia cordillera' },
  ]
];

const SeasonalGallery = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const prevSlide = () => {
    setActiveIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setActiveIdx((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section className="section-gallery b2b-theme-light">
      <div className="container">
        <div className="section-header text-center mb-5">
          <h2 className="gallery-title">Nuestra Comunidad en Acción</h2>
          <p className="gallery-desc">
            Resumen visual de las experiencias y el estándar operativo que entregamos en cada rincón de Chile.
          </p>
        </div>

        <div className="collage-slider-wrapper">
          <div className="collage-slider">
            {SLIDES.map((slide, sIdx) => (
              <div
                key={sIdx}
                className={`collage-slide ${sIdx === activeIdx ? 'active' : ''}`}
              >
                <div className="custom-collage-grid">
                  <div className="collage-item item-1">
                    <img src={slide[0].src} alt={slide[0].alt} loading="lazy" />
                  </div>
                  <div className="collage-item item-2">
                    <img src={slide[1].src} alt={slide[1].alt} loading="lazy" />
                  </div>
                  <div className="collage-item item-3">
                    <img src={slide[2].src} alt={slide[2].alt} loading="lazy" />
                  </div>
                  <div className="collage-item item-4">
                    <img src={slide[3].src} alt={slide[3].alt} loading="lazy" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-controls">
            <button
              type="button"
              className="slider-btn prev"
              aria-label="Diapositiva anterior"
              onClick={prevSlide}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              type="button"
              className="slider-btn next"
              aria-label="Diapositiva siguiente"
              onClick={nextSlide}
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="slider-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a diapositiva ${i + 1}`}
                className={`dot ${i === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalGallery;
