import React, { useState, useEffect } from 'react';
import './GuideCarousel.css';

import { guiasData } from '../data/guiasData';

const guias = guiasData.map(g => {
  let certName = 'Guía Certificado';
  if (g.certificaciones?.wfr) certName = 'WFR Certified';
  else if (g.nivel === 'senior') certName = 'Guía Senior';
  else if (g.certificaciones?.sernatur) certName = 'Registro Sernatur';
  else if (g.nivel === 'junior') certName = 'Guía Junior';
  
  return {
    id: g.id,
    nombre: g.nombre,
    especialidad: g.especialidad,
    cert: certName,
    img: g.imagen
  };
});

const GuideCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % guias.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Función para determinar la posición relativa
  const getPositionClass = (i) => {
    const diff = (i - index + guias.length) % guias.length;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === guias.length - 1) return diff === 1 ? 'right-1' : 'left-1';
    if (diff === 2 || diff === guias.length - 2) return diff === 2 ? 'right-2' : 'left-2';
    if (diff === 3 || diff === guias.length - 3) return diff === 3 ? 'right-3' : 'left-3';
    return 'hidden';
  };

  return (
    <div className="guide-arc-container">
      <div className="arc-wrapper">
        {guias.map((guia, i) => {
          const posClass = getPositionClass(i);
          return (
            <div 
              key={`${guia.id}-${i}`} 
              className={`guide-circle ${posClass}`}
              style={{ backgroundImage: `url(${guia.img})` }}
              onClick={() => setIndex(i)}
            >
              <div className="guide-gold-border"></div>
              {posClass === 'center' && (
                <div className="guide-info-center">
                  <h4>{guia.nombre}</h4>
                  <p>{guia.especialidad}</p>
                  <span className="guide-badge">{guia.cert}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuideCarousel;
