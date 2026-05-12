import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { FileText, Download, Eye, MapPin, BookOpen, Search } from 'lucide-react';
import './Manuales.css';

const Manuales = () => {
  const [manuales, setManuales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchManuales();
  }, []);

  const fetchManuales = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manuales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Usando datos de prueba (Tabla manuales no detectada)');
        setManuales([
          { id: 1, titulo: 'Manual de Senderismo Portillo', destino: 'Cordillera de Los Andes', categoria: 'Aventura', url_archivo: '#' },
          { id: 2, titulo: 'Guía de Avistamiento de Aves', destino: 'Valle del Elqui', categoria: 'Naturaleza', url_archivo: '#' },
          { id: 3, titulo: 'Protocolo de Seguridad Náutica', destino: 'Lago Llanquihue', categoria: 'Seguridad', url_archivo: '#' }
        ]);
      } else {
        setManuales(data || []);
      }
    } catch (error) {
      console.error('Error fetching manuales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManuales = manuales.filter(m => {
    const titleMatch = (m.titulo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const destinationMatch = (m.destino || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = (m.categoria || '').toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || destinationMatch || categoryMatch;
  });

  return (
    <div className="manuales-page">
      <section className="manuales-hero">
        <div className="container">
          <h1>Manuales de Experiencia</h1>
          <p>Documentación técnica y estándares operativos para cada uno de nuestros servicios en terreno.</p>
          
          {/* Search Bar integrated into Hero */}
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por manual o destino..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* Content Grid */}
      <section className="manuales-grid-section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : filteredManuales.length > 0 ? (
            <div className="manuals-grid">
              {filteredManuales.map((manual) => (
                <div key={manual.id} className="manual-card">
                  <div className="manual-card-header">
                    <div className="manual-icon-box">
                      <BookOpen size={24} />
                    </div>
                    <span className="manual-category">{manual.categoria || 'Servicio'}</span>
                  </div>
                  
                  <div className="manual-card-body">
                    <h3>{manual.titulo}</h3>
                    <div className="manual-location">
                      <MapPin size={14} />
                      <span>{manual.destino}</span>
                    </div>
                    <p>{manual.descripcion || 'Manual técnico con protocolos operativos y estándares de servicio para guías.'}</p>
                  </div>

                  <div className="manual-card-footer">
                    <a href={manual.url_archivo} target="_blank" rel="noreferrer" className="btn-manual view">
                      <Eye size={18} /> Ver Online
                    </a>
                    <a href={manual.url_archivo} download className="btn-manual download">
                      <Download size={18} /> Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results text-center py-5">
              <FileText size={48} className="mb-3 text-muted" />
              <h3>No se encontraron manuales</h3>
              <p>Intenta con otros términos de búsqueda.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Manuales;
