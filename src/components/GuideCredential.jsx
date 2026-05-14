import React, { useState } from 'react';
import { X, Check, MessageSquare, Mail, Download, Phone, Loader2, Star, Award, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import download from 'downloadjs';
import GuideCredentialPrint from './GuideCredentialPrint';
import './GuideCredential.css';

const GuideCredential = ({ guia, onClose, isExample = false }) => {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  

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

  const [exportData, setExportData] = useState(null);

  // Función para pre-cargar cualquier imagen como Base64
  const fetchToBase64 = async (url) => {
    if (!url) return null;
    try {
      const fetchUrl = new URL(url, window.location.href);
      fetchUrl.searchParams.append('cb', new Date().getTime());
      const response = await fetch(fetchUrl.toString(), { mode: 'cors', cache: 'no-cache' });
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // 1. PRE-CARGA ABSOLUTA (Cero Red durante la captura)
      const images = {
        logo: await fetchToBase64('/logo.png'),
        verified: await fetchToBase64('/sello-verificado.png?v=5'),
        flagChile: await fetchToBase64(getFlagUrl('Chile')),
        iconVoz: await fetchToBase64('/icono-voz.png'),
        profile: await fetchToBase64(guia.imagen),
        sernatur: await fetchToBase64('/sernatur.png'),
        wfr: await fetchToBase64('/wfr.png'),
        wafa: await fetchToBase64('/wafa.png')
      };
      
      if (guia.idiomas) {
        for (const lang of guia.idiomas) {
          images[`flag_${lang}`] = await fetchToBase64(getFlagUrl(lang));
        }
      }

      setExportData(images);

      // 2. Dar tiempo a React para inyectar el componente oculto con las imágenes cargadas
      await new Promise(resolve => setTimeout(resolve, 300));

      const captureNode = document.getElementById('credential-print-node');
      if (!captureNode) throw new Error("No se encontró la plantilla de exportación");

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // 3. Captura Limpia (html2canvas ya no se bloquea porque las imágenes son texto)
      const canvas = await html2canvas(captureNode, {
        scale: isMobile ? 1.5 : 2, 
        useCORS: true,
        allowTaint: false,
        backgroundColor: levelInfo.color,
        logging: false
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Fallo en la creación final del archivo.");

      const filename = `Credencial_${guia.nombre.replace(/ /g, '_')}_GaC.png`;
      
      // 4. Compartir Nativo (iOS/Móviles)
      if (isMobile && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: `Credencial ${guia.nombre}` });
            return;
          } catch (shareErr) {
            // Cancelado
          }
        }
      }
      
      // Fallback
      download(blob, filename, "image/png");
      
    } catch (err) {
      console.error(err);
      alert(`Error en Safari: ${err.message || 'Desconocido'}`);
    } finally {
      setIsGenerating(false);
      setExportData(null);
    }
  };

  const getFlagUrl = (idioma) => {
    const flags = {
      'Español': 'https://flagcdn.com/w80/es.png',
      'Inglés': 'https://flagcdn.com/w80/us.png',
      'Portugués': 'https://flagcdn.com/w80/br.png',
      'Alemán': 'https://flagcdn.com/w80/de.png',
      'Francés': 'https://flagcdn.com/w80/fr.png',
      'Italiano': 'https://flagcdn.com/w80/it.png',
      'Chile': 'https://flagcdn.com/w80/cl.png'
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

  // Subcomponente de la tarjeta (La vista interactiva que SÍ ve el usuario)
  const CredentialCard = () => {
    return (
      <div 
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
              <img src="/logo.png" alt="Guia a la Carta" crossOrigin="anonymous" />
            </div>
            <div className="logo-circle-v2 verified">
              <img src="/sello-verificado.png?v=5" alt="Verificado" crossOrigin="anonymous" />
            </div>
          </div>
          
          <div className="v2-header-info-block">
            <div className="v2-title-column">
              <h1 className="v2-guide-name">
                {guia.nombre}
              </h1>
              <div className="v2-guide-age">{guia.edad} años</div>
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

        {/* ACTIONS */}
        {(!isExample) && (
          <div className="v2-credential-actions">
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
      {/* VISTA PRINCIPAL */}
      {isExample ? (
        <CredentialCard />
      ) : (
        <div className="credential-overlay" onClick={onClose}>
          
          {/* Pantalla de carga superpuesta mientras se descargan recursos en segundo plano */}
          {exportData === null && isGenerating && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(28, 76, 68, 0.95)', zIndex: 99999, display: 'flex', 
              flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff'
            }}>
              <Loader2 className="animate-spin" size={60} color="#9FC05A" />
              <h2 style={{marginTop: '25px', fontFamily: 'var(--font-heading)', color: '#9FC05A'}}>Generando Credencial...</h2>
              <p style={{marginTop: '10px', fontSize: '1.1rem', opacity: 0.8}}>Procesando diseño gráfico nativo</p>
            </div>
          )}

          <CredentialCard />
        </div>
      )}

      {/* COMPONENTE MAESTRO DE IMPRESIÓN (Oculto en flujo absoluto) */}
      {exportData && (
        <div style={{ position: 'absolute', top: '-15000px', left: '-15000px' }}>
          <div id="credential-print-node">
            <GuideCredentialPrint guia={guia} images={exportData} levelInfo={levelInfo} />
          </div>
        </div>
      )}
    </>
  );
};

export default GuideCredential;
