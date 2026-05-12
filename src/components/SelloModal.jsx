import React, { useEffect } from 'react';
import { X, ShieldCheck, Activity, Award, Globe, CheckCircle } from 'lucide-react';
import './SelloModal.css';

const SelloModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sello-modal-overlay" onClick={onClose}>
      <div className="sello-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="sello-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <X size={24} />
        </button>

        <div className="sello-modal-header">
          <div className="sello-modal-logo-container">
            <img src="/sello-verificado.png" alt="Sello Guía a la Carta" className="sello-modal-logo" />
            <div className="sello-modal-logo-glow"></div>
          </div>
          <h2>Sello Guía a la Carta</h2>
          <p className="sello-modal-subtitle">Estándar de calidad turística para el futuro</p>
        </div>

        <div className="sello-modal-body">
          <div className="sello-intro-text">
            <p>
              El <strong>Sello Guía a la Carta</strong> es nuestro compromiso con la excelencia operativa. 
              No es solo un distintivo visual; es la garantía de que cada guía en nuestra red 
              ha superado un riguroso proceso de validación y está alineado con un estándar profesional superior.
            </p>
          </div>

          <div className="sello-pillars-grid">
            <div className="sello-pillar-card">
              <div className="sello-pillar-icon validation">
                <ShieldCheck size={28} />
              </div>
              <div className="sello-pillar-info">
                <h4>Validación Documental</h4>
                <p>Verificación técnica de títulos, certificaciones SERNATUR y antecedentes vigentes.</p>
              </div>
            </div>

            <div className="sello-pillar-card">
              <div className="sello-pillar-icon safety">
                <Activity size={28} />
              </div>
              <div className="sello-pillar-info">
                <h4>Seguridad y Prevención</h4>
                <p>Guías con conocimientos en primeros auxilios (WFR/WAFA) y protocolos de gestión de riesgos.</p>
              </div>
            </div>

            <div className="sello-pillar-card">
              <div className="sello-pillar-icon quality">
                <Award size={28} />
              </div>
              <div className="sello-pillar-info">
                <h4>Calidad de Servicio</h4>
                <p>Estricto manual de atención al cliente, puntualidad y resolución autónoma de problemas.</p>
              </div>
            </div>

            <div className="sello-pillar-card">
              <div className="sello-pillar-icon institutional">
                <Globe size={28} />
              </div>
              <div className="sello-pillar-info">
                <h4>Respaldo Institucional</h4>
                <p>Compromiso con la formalidad del sector y vinculación con pilares de Marca Chile.</p>
              </div>
            </div>
          </div>

          <div className="sello-verification-steps">
            <h3>Nuestro Proceso de Verificación</h3>
            <ul>
              <li><CheckCircle size={16} /> Entrevista técnica presencial o remota.</li>
              <li><CheckCircle size={16} /> Revisión de historial y referencias operativas.</li>
              <li><CheckCircle size={16} /> Capacitación en estándares Guía a la Carta.</li>
              <li><CheckCircle size={16} /> Monitoreo y feedback constante tras cada servicio.</li>
            </ul>
          </div>
        </div>

        <div className="sello-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
};

export default SelloModal;
