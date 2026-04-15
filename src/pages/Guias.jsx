import { MapPin, Star, Shield, Award, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { guiasData } from '../data/guiasData';
import GuideCredential from '../components/GuideCredential';
import './Guias.css';

const Guias = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guiasActivos = guiasData.filter(g => g.nivel === 'full' || g.nivel === 'senior');
  const guiasJunior = guiasData.filter(g => g.nivel === 'junior');

  // Helper para mostrar el label del nivel
  const getNivelLabel = (nivel) => {
    switch(nivel) {
      case 'senior': return 'Guía Senior';
      case 'full': return 'Guía Full';
      case 'junior': return 'Guía Junior';
      default: return 'Verificado';
    }
  };

  return (
    <div className="guias-page">
      <section className="guias-header">
        <div className="container text-center">
          <h1>Directorio de Guías Profesionales</h1>
          <p>Encuentra al experto perfecto para tu próxima aventura. Todos nuestros profesionales cuentan con certificación y vasta experiencia.</p>
        </div>
      </section>

      {/* PÁGINA 4: NIVELES DE GUÍA */}
      <section className="section bg-light text-center" style={{paddingBottom: '3rem', paddingTop: '4rem'}}>
        <div className="container">
          <h2 style={{color: 'var(--c-primary-dark)', marginBottom: '1rem'}}>Niveles de guía disponibles</h2>
          <p className="bajada" style={{marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto', color: 'var(--c-text-light)', fontSize: '1.1rem'}}>Cada servicio requiere un nivel distinto de experiencia, autonomía y representación.</p>
          
          <div className="niveles-cards-grid">
            <div className="nivel-detail-card">
              <div className="nivel-head">
                <h3>Guía Junior</h3>
              </div>
              <div className="nivel-body">
                <p className="perfil-desc">Apoyo operativo o servicios de menor complejidad.</p>
                <div className="ideal-box" style={{textAlign: 'left'}}>
                  <strong>Ideal para:</strong>
                  <ul>
                    <li><CheckCircle size={14}/> Servicios simples</li>
                    <li><CheckCircle size={14}/> Apoyo en terreno</li>
                    <li><CheckCircle size={14}/> Operaciones con menor exigencia</li>
                  </ul>
                </div>
                <div className="precio-box">
                  <span>Rango referencial:</span>
                  <strong>$40.000 – $50.000</strong>
                </div>
              </div>
            </div>
            
            <div className="nivel-detail-card destacado">
              <div className="destacado-ribbon">Más solicitado</div>
              <div className="nivel-head">
                <h3>Guía Full</h3>
              </div>
              <div className="nivel-body">
                <p className="perfil-desc">Guía operativo estándar, autónomo y con experiencia comprobable.</p>
                <div className="ideal-box" style={{textAlign: 'left'}}>
                  <strong>Ideal para:</strong>
                  <ul>
                    <li><CheckCircle size={14}/> Tours regulares</li>
                    <li><CheckCircle size={14}/> Servicios completos</li>
                    <li><CheckCircle size={14}/> Atención general de pasajeros</li>
                  </ul>
                </div>
                <div className="precio-box">
                  <span>Referencial:</span>
                  <strong>Desde $60.000</strong>
                </div>
              </div>
            </div>
            
            <div className="nivel-detail-card premium">
              <div className="nivel-head">
                <h3>Guía Senior</h3>
              </div>
              <div className="nivel-body">
                <p className="perfil-desc">Mayor experiencia, resolución y capacidad de representación.</p>
                <div className="ideal-box" style={{textAlign: 'left'}}>
                  <strong>Ideal para:</strong>
                  <ul>
                    <li><CheckCircle size={14}/> Servicios exigentes</li>
                    <li><CheckCircle size={14}/> Grupos especiales</li>
                    <li><CheckCircle size={14}/> Pasajeros premium</li>
                    <li><CheckCircle size={14}/> Operaciones delicadas</li>
                  </ul>
                </div>
                <div className="precio-box">
                  <span>Referencial:</span>
                  <strong>Desde $70.000</strong>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4" style={{fontSize: '0.9rem', color: 'var(--c-text-light)'}}>* La categoría del guía se define según el nivel de exigencia del servicio, no solo por precio.</p>
        </div>
      </section>

      {/* SECCIÓN GUÍAS ACTIVOS (FULL Y SENIOR) */}
      <section className="section" style={{paddingTop: '2rem'}}>
        <div className="container">
          <h2 className="text-center mb-5" style={{color: 'var(--c-primary-dark)'}}>Nuestros Guías Activos</h2>
          <div className="guias-grid">
            {guiasActivos.map(guia => (
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
                    <span><MapPin size={16}/> {guia.ubicacion}</span>
                    <span><strong>Idiomas:</strong> {guia.idiomas.join(', ')}</span>
                  </div>
                  <button className="btn btn-outline" style={{width: '100%', marginTop: '1rem', color: 'var(--c-primary)', borderColor: 'var(--c-primary)'}}>Ver Credencial</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Sello Guía a la Carta */}
      <section className="section-sello">
        <div className="container" style={{display: 'flex', justifyContent: 'center'}}>
          <div className="sello-glass-container text-center">
            <h2>Sello Guía a la carta</h2>
            <p>Estándar de calidad para el turismo del futuro</p>

            <div className="sello-badge-wrapper">
              <img src="/sello-verificado.png" alt="Sello Guía a la Carta Verificado" className="sello-logo-custom" />
            </div>

            <Link to="/sello" className="btn btn-hero">Explora</Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN RED DE GUÍAS JUNIOR */}
      <section className="junior-section">
        <div className="container">
          <h2>Red de Guías Junior</h2>
          <div className="guias-grid">
            {guiasJunior.map(guia => (
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
                    <span><MapPin size={16}/> {guia.ubicacion}</span>
                    <span><strong>Idiomas:</strong> {guia.idiomas.join(', ')}</span>
                  </div>
                  <button className="btn btn-outline" style={{width: '100%', marginTop: '1rem', color: 'var(--c-primary)', borderColor: 'var(--c-primary)'}}>Ver Credencial</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* MODAL DE CREDENCIAL */}
      {selectedGuide && (
        <GuideCredential 
          guia={selectedGuide} 
          onClose={() => setSelectedGuide(null)} 
        />
      )}
    </div>
  );
};

export default Guias;
