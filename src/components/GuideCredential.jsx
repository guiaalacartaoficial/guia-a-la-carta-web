import React, { useState, useRef } from 'react';
import { X, Check, MessageSquare, Mail, Download, Phone, Loader2, Star, Award, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import './GuideCredential.css';

const GuideCredential = ({ guia, onClose, isExample = false }) => {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Referencia para la exportación perfecta en alta resolución
  const exportRef = useRef(null);

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
    const mailtoLink = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
    
    // Método más robusto para abrir clientes de correo en todos los navegadores
    const link = document.createElement('a');
    link.href = mailtoLink;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (!exportRef.current) return;
    
    setIsGenerating(true);
    try {
      // Usamos el contenedor visible pero forzamos el formato de escritorio en memoria
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Ultra HD (2550px de ancho final)
        useCORS: true, // Crucial para las fotos de perfil y banderas
        filter: (node) => {
          if (node.classList && node.classList.contains('no-export')) {
            return false;
          }
          return true;
        },
        onclone: (document) => {
          const element = document.getElementById('credential-to-download');
          if (element) {
            // Forzamos estilos de escritorio ignorando cualquier media query móvil
            const style = document.createElement('style');
            style.innerHTML = `
              * {
                animation: none !important;
                transition: none !important;
              }
              #credential-to-download {
                width: 850px !important;
                max-width: 850px !important;
                min-width: 850px !important;
                padding: 50px !important;
                margin: 0 !important;
                transform: none !important;
                border-radius: 45px !important;
              }
              .credential-middle-content { grid-template-columns: 280px 1fr !important; }
              .v2-profile-img-container { max-width: 280px !important; }
              .v2-seals-column { flex-direction: column !important; width: auto !important; justify-content: flex-start !important; flex-wrap: nowrap !important; }
              .v2-title-row { flex-direction: row !important; text-align: left !important; }
              .v2-guide-name { font-size: 2.8rem !important; }
              .v2-status-bar { flex-direction: row !important; align-items: center !important; }
              .v2-languages-bar { flex-direction: row !important; }
              .v2-flags-row { flex-wrap: nowrap !important; justify-content: flex-start !important; }
              .v2-header-info-block { padding: 30px 40px !important; border-radius: 40px !important; }
              .credential-top-row { flex-direction: row !important; align-items: stretch !important; gap: 30px !important; }
              .credential-top-left-logos { flex-direction: column !important; justify-content: center !important; }
              .v2-bio-container, .v2-formation-container { padding: 40px !important; }
              .credential-bottom-experience { padding: 50px !important; margin-top: 50px !important; }
              .v2-formation-container h3, .v2-exp-title { font-size: 2.2rem !important; margin-bottom: 25px !important; }
              .v2-formation-container li { font-size: 1.1rem !important; }
            `;
            document.head.appendChild(style);
          }
        }
      });
      
      // Descargamos el PNG generado en memoria
      download(dataUrl, `Credencial_${guia.nombre.replace(/ /g, '_')}_GaC.png`);
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

  const getLevelInfo = (nivel) => {
    switch(nivel?.toLowerCase()) {
      case 'senior': return { label: 'Guía Senior', icon: <Star size={16} fill="currentColor" />, colorClass: 'level-senior' };
      case 'full': return { label: 'Guía Full', icon: <Award size={16} fill="currentColor" />, colorClass: 'level-full' };
      default: return { label: 'Guía Junior', icon: <ShieldCheck size={16} fill="currentColor" />, colorClass: 'level-junior' };
    }
  };

  const levelInfo = getLevelInfo(guia.nivel);

  // Subcomponente de la tarjeta para reutilizar visualización y exportación
  const CredentialCard = ({ innerRef = null }) => {
    return (
      <div 
        id="credential-to-download"
        ref={innerRef}
        className={`credential-card-v2 ${isExample ? 'is-example' : ''} ${levelInfo.colorClass}`} 
        onClick={(e) => (!isExample) && e.stopPropagation()}
      >
        {(!isExample) && (
          <button className="credential-close-v2 no-export" onClick={onClose}>
            <X size={24} />
          </button>
        )}

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
              <div className="v2-pill-level">
                {levelInfo.icon} <span style={{marginLeft: '5px'}}>{levelInfo.label}</span>
              </div>
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
            
            {/* COMPATIBILIDAD CON AMBOS FORMATOS DE CERTIFICACIONES */}
            {(
              (Array.isArray(guia.certificaciones) && guia.certificaciones.length > 0) || 
              (guia.certificaciones?.sernatur || guia.certificaciones?.wfr || guia.certificaciones?.wafa)
            ) && (
              <div className="v2-seals-column">
                {guia.certificaciones?.sernatur && (
                  <div className="v2-seal-wrapper"><img src="/sernatur.png" alt="Sernatur" className="v2-seal-img" /></div>
                )}
                {guia.certificaciones?.wfr && (
                  <div className="v2-seal-wrapper"><img src="/wfr.png" alt="WFR" className="v2-seal-img" /></div>
                )}
                {guia.certificaciones?.wafa && !guia.certificaciones?.wfr && (
                  <div className="v2-seal-wrapper"><img src="/wafa.png" alt="WAFA" className="v2-seal-img" /></div>
                )}
                
                {Array.isArray(guia.certificaciones) && guia.certificaciones.includes('SERNATUR') && (
                  <div className="v2-seal-wrapper"><img src="/sernatur.png" alt="Sernatur" className="v2-seal-img" /></div>
                )}
                {Array.isArray(guia.certificaciones) && guia.certificaciones.includes('Primeros Auxilios') && !guia.certificaciones?.wfr && (
                  <div className="v2-seal-wrapper"><img src="/wfr.png" alt="WFR" className="v2-seal-img" /></div>
                )}
              </div>
            )}
          </div>

          <div className="v2-right-pane">
            <div className="v2-bio-container">
              <p>{guia.biografia}</p>
            </div>

            <div className="v2-formation-container">
              <h3>Formación Profesional</h3>
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
          <h3 className="v2-exp-title">Experiencia en Terreno</h3>
          <div className="v2-experience-grid">
            {guia.experiencia.map((item, idx) => (
              <div key={idx} className="v2-exp-item">
                <span className="v2-bullet">•</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS (solo en visualización real) */}
        {(!isExample) && (
          <div className="v2-credential-actions no-export">
            <div className="v2-main-actions">
              <div className="v2-request-container">
                <button 
                  className={`v2-btn-primary ${showContactOptions ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setShowContactOptions(!showContactOptions); }}
                >
                  <MessageSquare size={18} />
                  Solicitar Guía
                </button>

                {showContactOptions && (
                  <div className="v2-contact-dropdown" onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                {isGenerating ? 'Generando...' : 'Descargar Credencial'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Vista interactiva normal que ahora también sirve como origen para la exportación perfecta */}
      {isExample ? (
        <CredentialCard innerRef={exportRef} />
      ) : (
        <div className="credential-overlay" onClick={onClose}>
          <CredentialCard innerRef={exportRef} />
        </div>
      )}
    </>
  );
};

export default GuideCredential;
