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
      // 1. SOLUCIÓN DEFINITIVA PARA SAFARI/iOS: Convertir todas las imágenes a Base64 manualmente.
      // Safari bloquea imágenes externas dentro de SVG foreignObject (lo que usa html-to-image),
      // incluso con useCORS: true. Al inyectar Base64 directamente, esquivamos la restricción de red.
      const images = exportRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        if (img.src.startsWith('data:')) return Promise.resolve();
        
        try {
          // Crear URL absoluta y añadir cache-busting para evitar que Safari use una versión cacheada sin CORS
          const url = new URL(img.src, window.location.href);
          url.searchParams.append('cb', new Date().getTime());
          
          const response = await fetch(url.toString(), { 
            mode: 'cors', 
            cache: 'no-cache' 
          });
          
          if (!response.ok) throw new Error('Network error');
          
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              img.src = reader.result; // Reemplazar con Base64
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

      // 2. Hack para iOS/Safari: primera llamada para "calentar" el renderizado de recursos
      await toPng(exportRef.current, { cacheBust: true, useCORS: true }).catch(() => {});

      // 3. Espera para asegurar que los Base64 estén renderizados en el DOM
      await new Promise(resolve => setTimeout(resolve, 800));

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: isMobile ? 2 : 3, // 2x en móvil para evitar límites de memoria, 3x en desktop
        useCORS: true,
        backgroundColor: levelInfo.color, // Forzar el color de fondo del nivel
        style: {
          visibility: 'visible',
          opacity: '1',
          transform: 'none'
        }
      });
      
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
      case 'senior': return { label: 'Guía Senior', icon: <Star size={16} fill="currentColor" />, colorClass: 'level-senior', color: '#1c4c44' };
      case 'full': return { label: 'Guía Full', icon: <Award size={16} fill="currentColor" />, colorClass: 'level-full', color: '#0E5B4C' };
      default: return { label: 'Guía Junior', icon: <ShieldCheck size={16} fill="currentColor" />, colorClass: 'level-junior', color: '#2A6B5A' };
    }
  };

  const levelInfo = getLevelInfo(guia.nivel);

  // Subcomponente de la tarjeta para reutilizar visualización y exportación
  const CredentialCard = ({ innerRef = null, isExport = false }) => {
    return (
      <div 
        id={isExport ? "credential-export-node" : "credential-to-view"}
        ref={innerRef}
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
      {/* 1. VISTA INTERACTIVA (Sensible a responsividad) */}
      {isExample ? (
        <CredentialCard />
      ) : (
        <div className="credential-overlay" onClick={onClose}>
          <CredentialCard />
        </div>
      )}

      <div 
        className="export-container-hidden no-export"
        style={{ 
          position: 'fixed', 
          left: '0', 
          top: '0', 
          width: '850px',
          height: 'auto',
          overflow: 'hidden',
          zIndex: 9990, // Justo debajo de la modal (9999) para que sea "visible" al navegador pero oculta al usuario
          pointerEvents: 'none',
          visibility: 'visible',
          opacity: '0.02', // Mínima opacidad para forzar el pintado en iOS Safari
          background: 'transparent'
        }}
      >
        <CredentialCard innerRef={exportRef} isExport={true} />
      </div>
    </>
  );
};

export default GuideCredential;
