import React, { useState, useRef } from 'react';
import { X, Check, MessageSquare, Mail, Download, Phone, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import './GuideCredential.css';

const GuideCredential = ({ guia, onClose }) => {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef(null);

  if (!guia) return null;

  const contactInfo = {
    whatsapp: '56956048293',
    email: 'guiaalacartaoficial@gmail.com'
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hola, me interesa solicitar el servicio del guía ${guia.nombre} (Código: ${guia.codigo}).`);
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Solicitud de Guía: ${guia.nombre}`);
    const body = encodeURIComponent(`Hola Guía a la Carta,\n\nMe gustaría solicitar el servicio del guía ${guia.nombre} con código ${guia.codigo}.\n\nSaludos.`);
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
  };

  const handleGenerate = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      // Configuraciones para máxima calidad y limpieza
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        // Eliminamos backgroundColor fijo para permitir que las esquinas sean transparentes (redondeadas)
        filter: (node) => {
          // Excluimos elementos con la clase 'no-print'
          if (node.classList && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        }
      });
      
      download(dataUrl, `Credencial_${guia.nombre.replace(/ /g, '_')}.png`);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Hubo un error al generar la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFlagUrl = (idioma) => {
    const flags = {
      'Español': 'https://flagcdn.com/es.svg',
      'Inglés': 'https://flagcdn.com/us.svg',
      'Portugués': 'https://flagcdn.com/br.svg',
      'Alemán': 'https://flagcdn.com/de.svg',
      'Francés': 'https://flagcdn.com/fr.svg',
      'Italiano': 'https://flagcdn.com/it.svg',
      'Chile': 'https://flagcdn.com/cl.svg'
    };
    return flags[idioma] || '';
  };

  return (
    <div className="credential-overlay" onClick={onClose}>
      <div 
        ref={cardRef}
        className="credential-card-v2" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="credential-close-v2 no-print" onClick={onClose}>
          <X size={20} />
        </button>

        {/* TOP ROW */}
        <div className="credential-top-row">
          <div className="credential-top-left-logos">
            <div className="logo-circle-v2">
              <img src="/logo.png" alt="Guia a la Carta" />
            </div>
            <div className="logo-circle-v2 verified">
              <img src="/sello-verificado.png" alt="Verificado" />
            </div>
          </div>
          
          <div className="v2-header-info-block">
            <div className="v2-title-row">
              <h1 className="v2-guide-name">
                {guia.nombre} | {guia.edad} años 
              </h1>
              <img src={getFlagUrl('Chile')} alt="Chile" className="v2-main-flag" />
            </div>
            
            <div className="v2-status-bar">
              <div className="v2-pill-code">{guia.codigo}</div>
              <div className="v2-pill-available">
                <div className="v2-check-circle"><Check size={14} strokeWidth={4} /></div>
                <span>DISPONIBLE</span>
              </div>
            </div>

            <div className="v2-languages-bar">
              <div className="v2-speaker-icon">
                <img src="/icono-voz.png" alt="Voz" />
              </div>
              <div className="v2-flags-row">
                {guia.idiomas.map((lang, idx) => (
                  <img key={idx} src={getFlagUrl(lang)} alt={lang} className="v2-lang-flag" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE CONTENT */}
        <div className="credential-middle-content">
          <div className="v2-left-pane">
            <div className="v2-profile-img-container">
              <img src={guia.imagen} alt={guia.nombre} className="v2-profile-img" />
            </div>
            
            <div className="v2-seals-column">
              {guia.certificaciones?.sernatur && (
                <div className="v2-seal-wrapper">
                  <img src="/sernatur.png" alt="Sernatur" className="v2-seal-img" />
                </div>
              )}
              {guia.certificaciones?.wfr && (
                <div className="v2-seal-wrapper">
                  <img src="/wfr.png" alt="WFR" className="v2-seal-img" />
                </div>
              )}
              {guia.certificaciones?.wafa && !guia.certificaciones?.wfr && (
                <div className="v2-seal-wrapper">
                  <img src="/wafa.png" alt="WAFA" className="v2-seal-img" />
                </div>
              )}
            </div>
          </div>

          <div className="v2-right-pane">
            <div className="v2-bio-container">
              <p>{guia.biografia}</p>
            </div>

            <div className="v2-formation-container">
              <h3>Formación</h3>
              <ul>
                {guia.formacion.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* EXPERIENCE */}
        <div className="credential-bottom-experience">
          <h3 className="v2-exp-title">Experiencia</h3>
          <div className="v2-experience-grid">
            {guia.experiencia.map((item, idx) => (
              <div key={idx} className="v2-exp-item">
                <span className="v2-bullet">•</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="v2-credential-actions no-print">
          <div className="v2-main-actions">
            <div className="v2-request-container">
              <button 
                className={`v2-btn-primary ${showContactOptions ? 'active' : ''}`}
                onClick={() => setShowContactOptions(!showContactOptions)}
              >
                <MessageSquare size={18} />
                Solicitar Guía
              </button>

              {showContactOptions && (
                <div className="v2-contact-dropdown">
                  <button className="v2-contact-opt whatsapp" onClick={handleWhatsApp}>
                    <Phone size={16} /> WhatsApp
                  </button>
                  <button className="v2-contact-opt email" onClick={handleEmail}>
                    <Mail size={16} /> Correo
                  </button>
                </div>
              )}
            </div>

            <button 
              className="v2-btn-secondary" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {isGenerating ? 'Generando...' : 'Generar Credencial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCredential;
