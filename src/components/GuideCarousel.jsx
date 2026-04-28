import React, { useState, useEffect } from 'react';
import './GuideCarousel.css';
import { supabase } from '../services/supabase';

const GuideCarousel = () => {
  const [index, setIndex] = useState(0);
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedGuides = async () => {
      setLoading(true);
      try {
        const { data: pros, error: errPros } = await supabase
          .from('postulaciones_guias')
          .select('*')
          .eq('estado', 'aprobado');
        
        const { data: ests, error: errEsts } = await supabase
          .from('postulaciones_estudiantes')
          .select('*')
          .eq('estado', 'aprobado');

        if (errPros) console.error("Error fetching pros:", errPros);
        if (errEsts) console.error("Error fetching ests:", errEsts);

        const formatForCarousel = (item, type) => {
          let certName = 'Guía Verificado';
          if (item.url_sernatur) certName = 'Registro SERNATUR';
          if (type === 'estudiante') certName = 'Guía Junior (Est)';

          return {
            id: item.id,
            nombre: `${item.nombres || ''} ${item.apellidos || ''}`.trim(),
            especialidad: type === 'guia' ? 'Guía Profesional' : 'Guía Junior',
            cert: certName,
            img: item.url_foto || '/placeholder-user.png'
          };
        };

        const allGuias = [
          ...(pros || []).map(p => formatForCarousel(p, 'guia')),
          ...(ests || []).map(e => formatForCarousel(e, 'estudiante'))
        ];

        setGuias(allGuias);
      } catch (error) {
        console.error("Error in GuideCarousel fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedGuides();
  }, []);

  useEffect(() => {
    if (guias.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % guias.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [guias.length]);

  // Función para determinar la posición relativa
  const getPositionClass = (i) => {
    if (guias.length === 0) return 'hidden';
    const diff = (i - index + guias.length) % guias.length;
    
    // Si hay pocos guías, ajustamos la lógica del arco
    if (guias.length === 1) return diff === 0 ? 'center' : 'hidden';
    
    if (diff === 0) return 'center';
    if (diff === 1 || diff === guias.length - 1) return diff === 1 ? 'right-1' : 'left-1';
    if (diff === 2 || diff === guias.length - 2) return diff === 2 ? 'right-2' : 'left-2';
    
    return 'hidden';
  };

  if (loading) {
    return (
      <div className="guide-arc-container">
        <div className="loading-carousel">Cargando guías...</div>
      </div>
    );
  }

  if (guias.length === 0) {
    return (
      <div className="guide-arc-container">
        <div className="empty-carousel">
          <p>Directorio en actualización profesional</p>
        </div>
      </div>
    );
  }

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
