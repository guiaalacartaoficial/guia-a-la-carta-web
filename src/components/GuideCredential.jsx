import React, { useState, useRef } from 'react';
import { X, Check, MessageSquare, Mail, Download, Phone, Loader2, Star, Award, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import './GuideCredential.css';

const GuideCredential = ({ guia, onClose, isExample = false }) => {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);
  
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
    const captureNode = document.getElementById('credential-to-view');
    if (!captureNode) return;
    
    setIsGenerating(true);
    setIsExportMode(true); // Activa el layout de escritorio en el nodo visible
    
    try {
      // 1. Dar tiempo a React para aplicar la clase is-export y al navegador para recalcular el layout
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. SOLUCIÓN DEFINITIVA PARA SAFARI/iOS: Convertir imágenes a Base64 en el nodo activo
      const images = captureNode.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        if (img.src.startsWith('data:')) return Promise.resolve();
        try {
          const url = new URL(img.src, window.location.href);
          url.searchParams.append('cb', new Date().getTime());
          const response = await fetch(url.toString(), { mode: 'cors', cache: 'no-cache' });
          if (!response.ok) throw new Error('Network error');
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              img.src = reader.result;
              resolve();
            };
            reader.onerror = resolve;
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.warn('Fallo al convertir a Base64 (Safari fallback):', img.src);
          return Promise.resolve();
        }
      });
      await Promise.all(imagePromises);

      // 3. Espera para que Safari pinte los Base64
      await new Promise(resolve => setTimeout(resolve, 500));

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // 4. Capturar el nodo que AHORA es 100% visible y renderizado
      const dataUrl = await toPng(captureNode, {
        cacheBust: true,
        pixelRatio: isMobile ? 2 : 3,
        useCORS: true,
        backgroundColor: levelInfo.color,
        style: { transform: 'none' },
        filter: (node) => {
          if (node.classList && node.classList.contains('no-export')) return false;
          return true;
        }
      });
      
      download(dataUrl, `Credencial_${guia.nombre.replace(/ /g, '_')}_GaC.png`);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Hubo un error al generar la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
      setIsExportMode(false); // Restaura el layout móvil
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
      case 'senior': return { label: 'Guía Senior', icon: <Star size={16} fill="currentColor" />, colorClass: 'level-senior', color: '#1c4c44' };
      case 'full': return { label: 'Guía Full', icon: <Award size={16} fill="currentColor" />, colorClass: 'level-full', color: '#0E5B4C' };
      default: return { label: 'Guía Junior', icon: <ShieldCheck size={16} fill="currentColor" />, colorClass: 'level-junior', color: '#2A6B5A' };
    }
  };

  const levelInfo = getLevelInfo(guia.nivel);

  // Subcomponente de la tarjeta
  const CredentialCard = ({ isExport = false }) => {
    return (
      <div 
        id="credential-to-view"
        className={`credential-card-v2 ${isExample ? 'is-example' : ''} ${isExport ? 'is-export' : ''} ${levelInfo.colorClass}`} 
        onClick={(e) => (!isExample && !isExport) && e.stopPropagation()}
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
              <img src="/logo.png" alt="Guia a la Carta" crossOrigin="anonymous" />
            </div>
            <div className="logo-circle-v2 verified">
              <img src="/sello-verificado.png" alt="Verificado" crossOrigin="anonymous" />
            </div>
          </div>
          
          <div className="v2-header-info-block">
            <div className="v2-title-row">
              <h1 className="v2-guide-name">
                {guia.nombre} | {guia.edad} años 
              </h1>
              <img src={getFlagUrl('Chile')} alt="Chile" className="v2-main-flag" crossOrigin="anonymous" />
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
                <img src="/icono-voz.png" alt="Voz" crossOrigin="anonymous" />
              </div>
              <div className="v2-flags-row">
                {guia.idiomas?.map((lang, idx) => (
                  <img key={idx} src={getFlagUrl(lang)} alt={lang} className="v2-lang-flag" crossOrigin="anonymous" />
                )) || <span className="v2-no-data">No especificado</span>}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE CONTENT */}
        <div className="credential-middle-content">
          <div className="v2-left-pane">
            <div className="v2-profile-img-container">
              <img src={guia.imagen} alt={guia.nombre} className="v2-profile-img" crossOrigin="anonymous" />
            </div>
            
            {/* COMPATIBILIDAD CON AMBOS FORMATOS DE CERTIFICACIONES */}
            {(
              (Array.isArray(guia.certificaciones) && guia.certificaciones.length > 0) || 
              (guia.certificaciones?.sernatur || guia.certificaciones?.wfr || guia.certificaciones?.wafa)
            ) && (
              <div className="v2-seals-column">
                {guia.certificaciones?.sernatur && (
                  <div className="v2-seal-wrapper"><img src="/sernatur.png" alt="Sernatur" className="v2-seal-img" crossOrigin="anonymous" /></div>
                )}
                {guia.certificaciones?.wfr && (
                  <div className="v2-seal-wrapper"><img src="/wfr.png" alt="WFR" className="v2-seal-img" crossOrigin="anonymous" /></div>
                )}
                {guia.certificaciones?.wafa && !guia.certificaciones?.wfr && (
                  <div className="v2-seal-wrapper"><img src="/wafa.png" alt="WAFA" className="v2-seal-img" crossOrigin="anonymous" /></div>
                )}
                
                {Array.isArray(guia.certificaciones) && guia.certificaciones.includes('SERNATUR') && (
                  <div className="v2-seal-wrapper"><img src="/sernatur.png" alt="Sernatur" className="v2-seal-img" crossOrigin="anonymous" /></div>
                )}
                {Array.isArray(guia.certificaciones) && guia.certificaciones.includes('Primeros Auxilios') && !guia.certificaciones?.wfr && (
                  <div className="v2-seal-wrapper"><img src="/wfr.png" alt="WFR" className="v2-seal-img" crossOrigin="anonymous" /></div>
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
                {guia.formacion?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                )) || <li>Información en proceso</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* EXPERIENCE */}
        <div className="credential-bottom-experience">
          <h3 className="v2-exp-title">Experiencia en Terreno</h3>
          <div className="v2-experience-grid">
            {guia.experiencia?.map((item, idx) => (
              <div key={idx} className="v2-exp-item">
                <span className="v2-bullet">•</span> {item}
              </div>
            )) || <div className="v2-exp-item">Amplia experiencia en terreno</div>}
          </div>
        </div>

        {/* ACTIONS (solo en visualización real) */}
        {(!isExample && !isExport) && (
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
      {/* VISTA PRINCIPAL (Se adapta para la exportación temporalmente) */}
      {isExample ? (
        <CredentialCard />
      ) : (
        <div className="credential-overlay" onClick={onClose}>
          
          {/* Pantalla de carga que cubre la deformación temporal en móviles */}
          {isExportMode && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: '#1c4c44', zIndex: 99999, display: 'flex', 
              flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff'
            }}>
              <Loader2 className="animate-spin" size={60} color="#9FC05A" />
              <h2 style={{marginTop: '25px', fontFamily: 'var(--font-heading)', color: '#9FC05A'}}>Generando Credencial HD...</h2>
              <p style={{marginTop: '10px', fontSize: '1.1rem', opacity: 0.8}}>Por favor espera, optimizando imágenes para Safari.</p>
            </div>
          )}

          <CredentialCard isExport={isExportMode} />
        </div>
      )}
    </>
  );
};

export default GuideCredential;
