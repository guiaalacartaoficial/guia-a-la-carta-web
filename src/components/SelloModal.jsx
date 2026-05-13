import React from 'react';
import { X, ShieldCheck, CheckCircle, Award } from 'lucide-react';
import './SelloModal.css';

const SelloModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('sello-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="sello-modal-overlay" onClick={handleOverlayClick}>
      <div className="sello-modal-content">
        <button className="sello-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <X size={24} />
        </button>

        <div className="sello-modal-header">
          <div className="sello-modal-badge-wrapper">
            <div className="sello-modal-glow"></div>
            <img src="/sello-verificado.png?v=5" alt="Sello Guía a la Carta" className="sello-modal-icon-img" />
          </div>
          <span className="sello-modal-subtitle">Estándar de Calidad</span>
          <h2>SELLO "GUÍA A LA CARTA"</h2>
        </div>

        <div className="sello-modal-body">
          <div className="sello-info-block">
            <h3><Award size={20} className="text-accent" /> ¿Qué es?</h3>
            <p>
              El <strong>Sello Guía a la Carta</strong> es una validación interna de calidad, profesionalismo y cumplimiento operacional creada por Guía a la Carta para identificar a los guías, operadores y colaboradores que cumplen con los estándares definidos por la red.
            </p>
            <p>
              No es solo una imagen o distintivo visual: funciona como un <strong>sistema de confianza y control de calidad</strong> dentro de la operación turística.
            </p>
          </div>

          <div className="sello-info-block">
            <h3><ShieldCheck size={20} className="text-accent" /> Objetivo del Sello</h3>
            <p>Garantizar que cada servicio entregado bajo la marca mantenga:</p>
            <ul className="sello-features-list">
              <li><CheckCircle size={18} className="text-accent" /> Estándares profesionales homogéneos</li>
              <li><CheckCircle size={18} className="text-accent" /> Buena experiencia para el pasajero</li>
              <li><CheckCircle size={18} className="text-accent" /> Cumplimiento operacional</li>
              <li><CheckCircle size={18} className="text-accent" /> Comunicación clara</li>
              <li><CheckCircle size={18} className="text-accent" /> Puntualidad y presentación profesional</li>
              <li><CheckCircle size={18} className="text-accent" /> Seguridad y responsabilidad en terreno</li>
            </ul>
          </div>

          <div className="sello-conclusion">
            <p>El sello permite que una empresa o pasajero entienda rápidamente que está trabajando con alguien validado por la red de Guía a la Carta.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelloModal;
