import React from 'react';
import { Check } from 'lucide-react';

const GuideCredentialPrint = ({ guia, images, levelInfo, innerRef }) => {
  if (!guia) return null;

  return (
    <div
      ref={innerRef}
      style={{
        width: '850px',
        height: 'auto', 
        minHeight: '1400px',
        backgroundColor: levelInfo?.color || '#1c4c44',
        borderRadius: '45px',
        padding: '50px',
        boxSizing: 'border-box',
        color: '#ffffff',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* TOP ROW */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '30px', marginBottom: '40px' }}>
        
        {/* Logos Izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', width: '90px' }}>
          {images.logo && (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden' }}>
              <img src={images.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
            </div>
          )}
          {images.verified && (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden' }}>
              <img src={images.verified} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Verified" />
            </div>
          )}
        </div>

        {/* Info Central */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.2)', 
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '40px', 
          padding: '30px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '15px' }}>
            <h1 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.8rem', fontWeight: 800, margin: 0, color: '#ffffff', lineHeight: 1.1 }}>
              {guia.nombre}
            </h1>
            <div style={{ fontSize: '1.6rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {guia.edad} años
            </div>
            {images.flagChile && (
              <img src={images.flagChile} style={{ height: '32px', width: '48px', borderRadius: '4px', objectFit: 'cover' }} alt="Chile" />
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', margin: '15px 0', alignItems: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', color: '#ffffff', padding: '6px 18px', borderRadius: '50px', fontWeight: 600, fontSize: '0.95rem' }}>
              {guia.codigo}
            </div>
            <div style={{ background: levelInfo?.accent || '#9FC05A', color: '#000000', padding: '6px 18px', borderRadius: '50px', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
               {levelInfo?.label || 'Guía'}
            </div>
            <div style={{ background: '#ffffff', color: levelInfo?.color || '#1c4c44', padding: '6px 20px 6px 6px', borderRadius: '50px', fontWeight: 900, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ background: '#2ecc71', color: '#ffffff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Check size={14} strokeWidth={4} />
               </div>
               <span>DISPONIBLE</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '5px', alignItems: 'center' }}>
            {images.iconVoz && (
              <img src={images.iconVoz} style={{ width: '32px', height: '32px' }} alt="Voz" />
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              {guia.idiomas?.map((lang, idx) => {
                const flagSrc = images[`flag_${lang}`];
                if (flagSrc) return <img key={idx} src={flagSrc} style={{ height: '24px', width: '36px', objectFit: 'cover', borderRadius: '3px' }} alt={lang} />;
                return null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', minHeight: '600px' }}>
        
        {/* Left Pane (Foto + Sellos) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Foto */}
          <div style={{ width: '280px', height: '280px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
            {images.profile ? (
              <img src={images.profile} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={guia.nombre} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#000000' }} />
            )}
          </div>
          
          {/* Sellos */}
          {((guia.certificaciones?.sernatur || guia.certificaciones?.wfr || guia.certificaciones?.wafa || (Array.isArray(guia.certificaciones) && guia.certificaciones.length > 0))) && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '40px 15px', borderRadius: '50px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              {((guia.certificaciones?.sernatur) || (Array.isArray(guia.certificaciones) && guia.certificaciones.includes('SERNATUR'))) && images.sernatur && (
                <div style={{ width: '85px', height: '85px' }}><img src={images.sernatur} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Sernatur" /></div>
              )}
              {((guia.certificaciones?.wfr) || (Array.isArray(guia.certificaciones) && guia.certificaciones.includes('Primeros Auxilios'))) && images.wfr && (
                <div style={{ width: '85px', height: '85px' }}><img src={images.wfr} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="WFR" /></div>
              )}
              {(guia.certificaciones?.wafa && !guia.certificaciones?.wfr) && images.wafa && (
                <div style={{ width: '85px', height: '85px' }}><img src={images.wafa} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="WAFA" /></div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane (Bio + Formación) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '40px', fontSize: '1.15rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.95)' }}>
            <p style={{ margin: 0, color: '#ffffff' }}>{guia.biografia}</p>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '40px', borderRadius: '40px', flexGrow: 1 }}>
            <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.2rem', marginBottom: '25px', marginTop: 0, color: '#ffffff' }}>Formación Profesional</h3>
            <ul style={{ padding: 0, margin: 0 }}>
              {guia.formacion?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '12px', fontSize: '1.1rem', listStyle: 'none', display: 'flex', gap: '15px', color: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ color: levelInfo?.accent || '#9FC05A' }}>•</span> <span style={{ color: '#ffffff' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM EXPERIENCE */}
      <div style={{ marginTop: '40px', padding: '50px', background: 'rgba(0,0,0,0.2)', borderRadius: '45px' }}>
        <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.2rem', marginBottom: '25px', marginTop: 0, color: '#ffffff' }}>
          Experiencia en Terreno
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px 40px' }}>
          {guia.experiencia?.map((item, idx) => (
            <div key={idx} style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', display: 'flex', gap: '12px' }}>
              <span style={{ color: levelInfo?.accent || '#9FC05A' }}>•</span> <span style={{ color: '#ffffff' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default GuideCredentialPrint;
