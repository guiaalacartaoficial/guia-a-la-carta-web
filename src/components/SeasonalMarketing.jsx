import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, GraduationCap, UserStar, Zap, ShieldCheck } from 'lucide-react';
import { getTemporadaActiva } from '../data/temporadas';
import './SeasonalMarketing.css';

const iconMap = {
  GraduationCap: GraduationCap,
  UserStar: UserStar,
  Zap: Zap,
  ShieldCheck: ShieldCheck
};

const SeasonalMarketing = () => {
  const temporada = getTemporadaActiva();
  if (!temporada) return null;

  const { banner, serviciosPrioritarios } = temporada;

  return (
    <section className="section-seasonal-marketing">
      <div className="container">
        {/* Banner de temporada */}
        <div className="seasonal-banner">
          <div className="seasonal-badge">
            <Sparkles size={16} />
            <span>{banner.badge}</span>
          </div>
          <h2>{banner.titulo}</h2>
          <p>{banner.subtitulo}</p>
          <div className="seasonal-banner-actions">
            <Link to={banner.ctaLink} className="btn btn-seasonal-cta">
              {banner.ctaTexto} <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Header de servicios priorizados */}
        <div className="seasonal-services-header text-center">
          <span className="seasonal-eyebrow">{temporada.tagline}</span>
          <h3>Servicios con Mayor Demanda Operativa</h3>
          <p>{temporada.eslogan}</p>
        </div>

        {/* Grid de servicios priorizados */}
        <div className="seasonal-grid">
          {serviciosPrioritarios.map((s) => {
            const IconComponent = iconMap[s.icono] || Sparkles;
            return (
              <div key={s.id} className="seasonal-card">
                <div className="seasonal-card-top">
                  <div className="seasonal-icon-wrapper">
                    <IconComponent size={28} />
                  </div>
                  <span className="seasonal-card-badge">{s.badge}</span>
                </div>
                <h4>{s.titulo}</h4>
                <p className="seasonal-card-desc">{s.desc}</p>
                <div className="seasonal-features">
                  {s.beneficios.map((b, idx) => (
                    <div key={idx} className="seasonal-feature-item">
                      <CheckCircle2 size={16} className="text-accent" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <div className="seasonal-card-action">
                  <Link to={`/contacto?servicio=${s.id}`} className="btn-link-seasonal">
                    Cotizar este servicio <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SeasonalMarketing;
