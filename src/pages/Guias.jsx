import { MapPin, Star, Shield, Award, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, getOptimizedImageUrl } from '../services/supabase';
import GuideCredential from '../components/GuideCredential';
import SelloModal from '../components/SelloModal';
import './Guias.css';

const Guias = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isSelloOpen, setIsSelloOpen] = useState(false);
  const [guiasActivos, setGuiasActivos] = useState([]);
  const [guiasJunior, setGuiasJunior] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const filterGuias = (guiasList) => {
    return guiasList.filter(guia => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' || 
        guia.nombre.toLowerCase().includes(searchLower) || 
        (guia.especialidad && guia.especialidad.toLowerCase().includes(searchLower)) ||
        (guia.idiomas && guia.idiomas.some(i => i.toLowerCase().includes(searchLower)));
        
      const matchRegion = selectedRegion === '' || guia.ubicacion === selectedRegion;
      
      return matchSearch && matchRegion;
    });
  };

  const filteredGuiasActivos = filterGuias(guiasActivos);
  const filteredGuiasJunior = filterGuias(guiasJunior);

  useEffect(() => {
    const fetchApprovedGuides = async () => {
      setLoading(true);
      try {
        const { data: pros, error: errPros } = await supabase.from('postulaciones_guias').select('*').eq('estado', 'aprobado');
        const { data: ests, error: errEsts } = await supabase.from('postulaciones_estudiantes').select('*').eq('estado', 'aprobado');

        const formatGuide = (item, type) => {
          try {
            const rawN = String(item.nombres || item.nombre || 'Guía').trim();
            const nombreVisual = (typeof item.nombre_visual === 'string') ? item.nombre_visual : rawN.split(' ')[0];
            const apellidoVisual = (typeof item.apellido_visual === 'string') ? item.apellido_visual : "";
            
            return {
              id: item.id || Math.random().toString(),
              nombre: `${nombreVisual} ${apellidoVisual}`.trim(),
              edad: item.edad || 'N/A',
              codigo: item.id ? (type === 'guia' ? `PRO:${String(item.id).substring(0, 5).toUpperCase()}` : `EST:${String(item.id).substring(0, 5).toUpperCase()}`) : 'N/A',
              idiomas: Array.isArray(item.idiomas) ? item.idiomas.map(i => i.idioma || i) : [],
              imagen: getOptimizedImageUrl(item.url_foto, 300, 300, 75),
              biografia: item.biografia || '',
              formacion: item.educacion ? item.educacion.split('\n') : [],
              experiencia: item.rutas_experiencia ? item.rutas_experiencia.split('\n') : (item.experiencia_terreno ? item.experiencia_terreno.split('\n') : []),
              certificaciones: {
                sernatur: !!item.url_sernatur,
                wfr: !!item.url_primeros_auxilios,
                otras: !!item.url_otras_certificaciones
              },
              nivel: item.nivel || (type === 'guia' ? 'full' : 'junior'),
              especialidad: 'Guía de Turismo',
              ubicacion: item.ciudad_residencia || 'No especificada'
            };
          } catch (e) {
            console.error("Error formatting guide", item, e);
            return null;
          }
        };

        const parsedPros = (pros || []).map(p => formatGuide(p, 'guia')).filter(Boolean);
        const parsedEsts = (ests || []).map(e => formatGuide(e, 'estudiante')).filter(Boolean);

        setGuiasActivos(parsedPros);
        setGuiasJunior(parsedEsts);
      } catch (error) {
        console.error("Error fetching approved guides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedGuides();
  }, []);

  const getNivelLabel = (nivel) => {
    switch (nivel) {
      case 'senior': return 'Guía Senior';
      case 'full': return 'Guía Full';
      case 'junior': return 'Guía Junior';
      default: return 'Verificado';
    }
  };

  return (
    <div className="guias-page">
      <section className="guias-header">
        <div className="guias-hero-bg"></div>
        <div className="container text-center">
          <h1>Directorio de Guías Profesionales</h1>
          <p>Encuentra al experto perfecto para tu próxima aventura. Todos nuestros profesionales cuentan con certificación y vasta experiencia.</p>
        </div>
      </section>

      <div className="footer-accent-bar" />

      <section className="section text-center" style={{ backgroundColor: 'var(--c-primary-dark)', paddingBottom: '3rem', paddingTop: '4rem' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Niveles de guía disponibles</h2>
          <p className="bajada" style={{ marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>Cada servicio requiere un nivel distinto de experiencia, autonomía y representación.</p>

          <div className="niveles-cards-grid">
            <div className="nivel-detail-card junior-card">
              <div className="nivel-head">
                <h3>Guía Junior</h3>
              </div>
              <div className="nivel-body">
                <p className="perfil-desc">Apoyo operativo o servicios de menor complejidad.</p>
                <div className="ideal-box" style={{ textAlign: 'left' }}>
                  <strong>IDEAL PARA:</strong>
                  <ul>
                    <li><CheckCircle size={16} /> Servicios simples</li>
                    <li><CheckCircle size={16} /> Apoyo en terreno</li>
                    <li><CheckCircle size={16} /> Operaciones menores</li>
                  </ul>
                </div>
                <div className="precio-box">
                  <span>Referencial:</span>
                  <strong style={{ color: 'var(--c-primary-dark)' }}>$40.000 – $50.000</strong>
                </div>
              </div>
            </div>

            <div className="nivel-detail-card destacado full-card">
              <div className="destacado-ribbon">MÁS SOLICITADO</div>
              <div className="nivel-head">
                <h3>Guía Full</h3>
              </div>
              <div className="nivel-body">
                <p className="perfil-desc">Operativo estándar, autónomo y con experiencia comprobable.</p>
                <div className="ideal-box" style={{ textAlign: 'left' }}>
                  <strong>IDEAL PARA:</strong>
                  <ul>
                    <li><CheckCircle size={16} /> Tours regulares</li>
                    <li><CheckCircle size={16} /> Servicios completos</li>
                    <li><CheckCircle size={16} /> Atención a pasajeros</li>
                  </ul>
                </div>
                <div className="precio-box">
                  <span>Referencial:</span>
                  <strong style={{ color: 'var(--c-primary-dark)' }}>Desde $60.000</strong>
                </div>
              </div>
            </div>

            <div className="nivel-detail-card senior-card">
              <div className="nivel-head">
                <h3>Guía Senior</h3>
              </div>
              <div className="nivel-body">
                <p className="perfil-desc">Máxima resolución y capacidad de representación.</p>
                <div className="ideal-box" style={{ textAlign: 'left' }}>
                  <strong>IDEAL PARA:</strong>
                  <ul>
                    <li><CheckCircle size={16} /> Servicios exigentes</li>
                    <li><CheckCircle size={16} /> Grupos especiales / VIP</li>
                    <li><CheckCircle size={16} /> Operaciones delicadas</li>
                  </ul>
                </div>
                <div className="precio-box">
                  <span>Referencial:</span>
                  <strong style={{ color: 'var(--c-primary-dark)' }}>Desde $70.000</strong>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4" style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>* La categoría del guía se define según el nivel de exigencia del servicio, no solo por precio.</p>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN GUÍAS ACTIVOS (FULL Y SENIOR) */}
      <section className="section" style={{ backgroundColor: '#CDE0CC', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container">
          <h2 className="text-center mb-5" style={{ color: 'var(--c-primary-dark)' }}>Nuestros Guías Activos</h2>
          
          <div className="filtros-container mb-5">
            <div className="filtros-wrapper">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, especialidad o idioma..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filtro-input"
                />
              </div>
              <div className="select-box">
                <MapPin size={18} className="select-icon" />
                <select 
                  value={selectedRegion} 
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todas las Regiones</option>
                  <option value="Arica y Parinacota">Arica y Parinacota</option>
                  <option value="Tarapacá">Tarapacá</option>
                  <option value="Antofagasta">Antofagasta</option>
                  <option value="Atacama">Atacama</option>
                  <option value="Coquimbo">Coquimbo</option>
                  <option value="Valparaíso">Valparaíso</option>
                  <option value="Metropolitana">Metropolitana</option>
                  <option value="O'Higgins">O'Higgins</option>
                  <option value="Maule">Maule</option>
                  <option value="Ñuble">Ñuble</option>
                  <option value="Biobío">Biobío</option>
                  <option value="Araucanía">Araucanía</option>
                  <option value="Los Ríos">Los Ríos</option>
                  <option value="Los Lagos">Los Lagos</option>
                  <option value="Aysén">Aysén</option>
                  <option value="Magallanes">Magallanes</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="guias-grid">
              {[1, 2, 3].map(n => (
                <div key={n} className="skeleton-loader">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line subtitle"></div>
                    <div className="skeleton-line text"></div>
                    <div className="skeleton-line text short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGuiasActivos.length > 0 ? (
            <div className="guias-grid">
              {filteredGuiasActivos.map(guia => (
                <div
                  className={`guia-card ${guia.nivel}`}
                  key={guia.id}
                  onClick={() => setSelectedGuide(guia)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="guia-img-container">
                    <img src={guia.imagen} alt={guia.nombre} className="guia-img" />
                    <div className="guia-badge">{getNivelLabel(guia.nivel)}</div>
                  </div>
                  <div className="guia-info">
                    <h3>{guia.nombre}</h3>
                    <p className="guia-especialidad">{guia.especialidad}</p>
                    <div className="guia-details">
                      <span><MapPin size={16} /> {guia.ubicacion}</span>
                      <span><strong>Idiomas:</strong> {guia.idiomas.join(', ')}</span>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', color: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}>Ver Credencial</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Shield size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#475569' }}>Directorio en Actualización</h3>
              <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>Estamos verificando y certificando a los mejores profesionales. Pronto el directorio estará disponible.</p>
            </div>
          )}
        </div>
      </section>      <div className="footer-accent-bar" />

      {/* SECCIÓN SELLO DE CALIDAD */}
      <section className="section-sello-central">
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="sello-card-central text-center">
            <span className="sello-pre-title-simple">Estándar de Calidad</span>
            <h2>Sello Guía a la Carta</h2>
            <p className="sello-subtitle-simple">Certificación profesional para experiencias seguras</p>

            <div className="sello-badge-wrapper">
              <div className="sello-glow-effect"></div>
              <img src="/sello-verificado.webp?v=5" alt="Sello Guía a la Carta Verificado" className="sello-logo-custom" loading="lazy" />
            </div>

            <button onClick={() => setIsSelloOpen(true)} className="btn btn-hero mt-3">Explorar Estándar</button>
          </div>
        </div>
      </section>

      <div className="footer-accent-bar" />

      {/* SECCIÓN RED DE GUÍAS JUNIOR */}
      <section className="junior-section">
        <div className="container">
          <h2>Red de Guías Junior</h2>
          
          <div className="filtros-container mb-5">
            <div className="filtros-wrapper">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, especialidad o idioma..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filtro-input"
                />
              </div>
              <div className="select-box">
                <MapPin size={18} className="select-icon" />
                <select 
                  value={selectedRegion} 
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todas las Regiones</option>
                  <option value="Arica y Parinacota">Arica y Parinacota</option>
                  <option value="Tarapacá">Tarapacá</option>
                  <option value="Antofagasta">Antofagasta</option>
                  <option value="Atacama">Atacama</option>
                  <option value="Coquimbo">Coquimbo</option>
                  <option value="Valparaíso">Valparaíso</option>
                  <option value="Metropolitana">Metropolitana</option>
                  <option value="O'Higgins">O'Higgins</option>
                  <option value="Maule">Maule</option>
                  <option value="Ñuble">Ñuble</option>
                  <option value="Biobío">Biobío</option>
                  <option value="Araucanía">Araucanía</option>
                  <option value="Los Ríos">Los Ríos</option>
                  <option value="Los Lagos">Los Lagos</option>
                  <option value="Aysén">Aysén</option>
                  <option value="Magallanes">Magallanes</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center" style={{ padding: '2rem', color: 'var(--c-text-light)' }}>
              <Clock className="spin" size={24} style={{ marginBottom: '1rem' }} />
            </div>
          ) : filteredGuiasJunior.length > 0 ? (
            <div className="guias-grid">
              {filteredGuiasJunior.map(guia => (
                <div
                  className={`guia-card ${guia.nivel}`}
                  key={guia.id}
                  onClick={() => setSelectedGuide(guia)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="guia-img-container">
                    <img src={guia.imagen} alt={guia.nombre} className="guia-img" />
                    <div className="guia-badge">{getNivelLabel(guia.nivel)}</div>
                  </div>
                  <div className="guia-info">
                    <h3>{guia.nombre}</h3>
                    <p className="guia-especialidad">{guia.especialidad}</p>
                    <div className="guia-details">
                      <span><MapPin size={16} /> {guia.ubicacion}</span>
                      <span><strong>Idiomas:</strong> {guia.idiomas.join(', ')}</span>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', color: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}>Ver Credencial</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '3rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
              <p style={{ color: '#64748b' }}>Aún no hay estudiantes certificados en la red Junior.</p>
            </div>
          )}
        </div>
      </section>
      {/* MODAL DE CREDENCIAL */}
      {selectedGuide && (
        <GuideCredential
          guia={selectedGuide}
          onClose={() => setSelectedGuide(null)}
        />
      )}

      {/* MODAL DEL SELLO */}
      <SelloModal isOpen={isSelloOpen} onClose={() => setIsSelloOpen(false)} />
    </div>
  );
};

export default Guias;
