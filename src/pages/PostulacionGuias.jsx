import React, { useState } from 'react';
import { AlertTriangle, User, Mail, Phone, MapPin, Globe, Calendar, Award, FileText, CheckSquare, UploadCloud, GraduationCap, Plus, X, ShieldCheck, Loader2, Compass } from 'lucide-react';
import GuideCredential from '../components/GuideCredential';
import TipoGuiaSelector from '../components/TipoGuiaSelector';
import './Postulacion.css';
import { supabase } from '../services/supabase';
import { uploadToStorage } from '../services/fileUpload';
import emailjs from '@emailjs/browser';

const PostulacionGuias = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [formError, setFormError] = useState('');
  
  // === ESTADOS PARA EL SELECTOR MÚLTIPLE DE IDIOMAS ===
  const idiomasOptions = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Mandarín", "Otro"];
  const nivelesOptions = ["Nativo", "Avanzado (C1/C2)", "Intermedio (B1/B2)", "Básico (A1/A2)"];
  
  const [selectedLanguage, setSelectedLanguage] = useState("Inglés");
  const [selectedLevel, setSelectedLevel] = useState("Avanzado (C1/C2)");
  const [idiomasList, setIdiomasList] = useState([
    { idioma: "Español", nivel: "Nativo" }
  ]);

  // === TIPOS DE GUÍA (selección múltiple + "Otro") ===
  const [tiposGuia, setTiposGuia] = useState([]);
  const [tiposGuiaOtros, setTiposGuiaOtros] = useState([]);
  const [tiposError, setTiposError] = useState('');

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    nombre_visual: '',
    apellido_visual: '',
    email: '',
    telefono: '',
    nacionalidad: '',
    edad: '',
    ciudad_residencia: '',
    ciudad_trabajo: '',
    localidades_extra: '',
    biografia: '',
    educacion: '',
    rutas_experiencia: '',
    habilitado_sii: 'si'
  });

  const [files, setFiles] = useState({
    cv: null,
    foto: null,
    sernatur: null,
    primeros_auxilios: null,
    otras_certificaciones: null
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    if (e.target.multiple) {
      setFiles({ ...files, [field]: Array.from(e.target.files) });
    } else {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleAddIdioma = (e) => {
    e.preventDefault();
    if (idiomasList.some(i => i.idioma === selectedLanguage)) return; // Evitar duplicados
    setIdiomasList([...idiomasList, { idioma: selectedLanguage, nivel: selectedLevel }]);
  };

  const handleRemoveIdioma = (idiomaToRemove) => {
    setIdiomasList(idiomasList.filter(i => i.idioma !== idiomaToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: al menos un tipo de guía (de la lista u "Otro")
    if (tiposGuia.length === 0 && tiposGuiaOtros.length === 0) {
      setTiposError('Selecciona al menos un tipo de guía o agrega una especialidad en "Otro".');
      document.getElementById('seccion-tipos-guia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setTiposError('');

    setLoading(true);
    setFormError('');
    setUploadProgressText('Iniciando carga de documentación...');

    try {
      // 1. Subir archivos con compresión automática y sanitización
      const url_cv = await uploadToStorage(supabase, files.cv, 'documentos', 'cvs', 'Currículum Vitae', setUploadProgressText);
      const url_foto = await uploadToStorage(supabase, files.foto, 'documentos', 'fotos', 'Foto de Rostro', setUploadProgressText);
      const url_sernatur = await uploadToStorage(supabase, files.sernatur, 'documentos', 'certificados', 'Certificado SERNATUR', setUploadProgressText);
      const url_primeros_auxilios = await uploadToStorage(supabase, files.primeros_auxilios, 'documentos', 'certificados', 'Certificado de Primeros Auxilios', setUploadProgressText);
      const url_otras_certificaciones = await uploadToStorage(supabase, files.otras_certificaciones, 'documentos', 'certificados', 'Otras Certificaciones', setUploadProgressText);

      setUploadProgressText('Registrando datos en la base de datos...');

      // Generar Código Automático
      const autoCode = `PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 2. Guardar en DB
      const insertData = {
          ...formData,
          edad: formData.edad ? parseInt(formData.edad, 10) : null,
          idiomas: idiomasList,
          tipos_guia: tiposGuia,
          tipos_guia_otros: tiposGuiaOtros,
          codigo: autoCode,
          url_cv,
          url_foto,
          url_sernatur,
          url_primeros_auxilios,
          estado: 'pendiente'
      };
      
      if (url_otras_certificaciones) {
        insertData.url_otras_certificaciones = url_otras_certificaciones;
      }

      const { error } = await supabase
        .from('postulaciones_guias')
        .insert([insertData]);

      if (error) {
        throw new Error(`Error en base de datos: ${error.message || 'No fue posible registrar la postulación'}`);
      }

      setUploadProgressText('Notificando al equipo...');

      // Notificar al admin
      try {
        await emailjs.send(
          'service_ihvjiza',
          'template_u6p28e4',
          {
            tipo_solicitud: 'Postulación de Guía Profesional',
            nombre: `${formData.nombres} ${formData.apellidos}`,
            email: formData.email,
            mensaje: `El guía ${formData.nombres} ${formData.apellidos} ha enviado una postulación. Revisa el panel de administración.`
          },
          '_nmx76wxhMLgNa1ic'
        );
      } catch (err) {
        console.error("Error al notificar:", err);
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error detallado al postular:', error);
      setFormError(error.message || 'Hubo un problema al procesar tu postulación. Por favor verifica tus archivos e intenta nuevamente.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } finally {
      setLoading(false);
      setUploadProgressText('');
    }
  };

  const [showExample, setShowExample] = useState(false);

  // === GUIA DE EJEMPLO PARA MOSTRAR CREDENCIAL ===
  const guiaDeEjemplo = {
    nombre: "Joaquín G.",
    edad: 26,
    codigo: "GV:005",
    idiomas: ["Español", "Portugués", "Inglés"],
    imagen: "/guias/guia1.webp",
    biografia: "Guía de ecoturismo certificado con amplia experiencia en la coordinación y manejo de grupos nacionales e internacionales. Especializado en experiencias outdoor y culturales.",
    formacion: [
      "Administración Ecoturismo (Duoc UC)", 
      "WFR Certificado", 
      "Inglés Avanzado"
    ],
    experiencia: [
      "Tour Embalse del Yeso", 
      "Portillo", 
      "Guía para cruceros", 
      "Termas Colina", 
      "Valle Nevado"
    ],
    certificaciones: { sernatur: true, wfr: true }
  };

  if (submitted) {
    return (
      <div className="postulacion-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text-center" style={{ maxWidth: '650px', padding: '3.5rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#ECFDF5', color: '#10B981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <Award size={48} />
          </div>
          <h2 style={{ color: 'var(--c-primary-dark)', marginBottom: '1rem' }}>¡Postulación Recibida con Éxito!</h2>
          <p style={{ color: 'var(--c-text-light)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            Gracias por tu interés en unirte a <strong>Guía a la Carta</strong>. Tu documentación y perfil profesional han sido recibidos satisfactoriamente.
          </p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.95rem', color: '#475569' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--c-primary-dark)' }}>ℹ️ ¿Qué ocurre a continuación?</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>Nuestro equipo validará tus antecedentes y certificaciones oficiales.</li>
              <li>Una vez aprobada tu postulación, <strong>recibirás un correo electrónico</strong> con tus credenciales de acceso (Código de Guía y Contraseña).</li>
              <li>Con esas credenciales podrás ingresar a la sección <strong>"Mi Disponibilidad"</strong> en el menú superior para publicar tus días libres y recibir solicitudes de servicio.</li>
            </ul>
          </div>
          <a href="/" className="btn btn-primary">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="postulacion-page">
      <section className="postulacion-header">
        <div className="container text-center">
          <h1>Únete como Guía Profesional</h1>
          <p>Potencia tu carrera y únete a la red más exclusiva de turismo receptivo y operativo en Chile.</p>
        </div>
      </section>

      <div className="footer-accent-bar" />

      <section className="section">
        <div className="container max-w-3xl postulacion-form-container">
          
          <div className="form-warning-box">
            <AlertTriangle size={28} />
            <div className="form-warning-content">
              <h4>Información de Alto Valor</h4>
              <p>
                Los perfiles aprobados serán publicados en nuestro directorio corporativo para clientes B2B (Agencias y Hoteles). <strong>Tu información representa tu calidad profesional.</strong> Asegúrate de que tus datos tengan gramática perfecta y la documentación adjunta sea real y legible. Las postulaciones inconsistentes son descartadas automáticamente.
              </p>
            </div>
          </div>

          {formError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              color: '#991B1B',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0, color: '#DC2626' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '2px' }}>Atención al enviar la postulación</strong>
                <span style={{ fontSize: '0.92rem' }}>{formError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
            {/* INTRODUCCION A LA CREDENCIAL (BOTON DESPLEGABLE) */}
            <div className="example-credential-wrapper">
              <h4>Visualiza tu Futura Credencial</h4>
              <p>Así es como las agencias de turismo verán tu perfil oficial una vez seas aprobado.</p>
              
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => setShowExample(!showExample)}
                style={{borderColor: 'var(--c-primary-dark)', color: 'var(--c-primary-dark)', marginBottom: showExample ? '2rem' : '0'}}
              >
                {showExample ? 'Ocultar Credencial de Muestra' : 'Desplegar Credencial de Muestra'}
              </button>

              {showExample && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', animation: 'slideDownFade 0.4s ease-out' }}>
                  <GuideCredential guia={guiaDeEjemplo} isExample={true} />
                </div>
              )}
            </div>

            {/* CARD 1: DATOS PERSONALES */}
            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><User size={24}/></div>
                <h3>1. Datos Personales</h3>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombres</label>
                  <div className="input-icon-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="nombres" className="form-control" placeholder="Ej: Juan Andrés" onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Apellidos</label>
                  <div className="input-icon-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="apellidos" className="form-control" placeholder="Ej: Pérez Silva" onChange={handleInputChange} required />
                  </div>
                </div>
              </div>



              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <div className="input-icon-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input type="email" name="email" className="form-control" placeholder="correo@ejemplo.com" onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <div className="input-icon-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" name="telefono" className="form-control" placeholder="+56 9 0000 0000" onChange={handleInputChange} required />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nacionalidad</label>
                  <div className="input-icon-wrapper">
                    <Globe className="input-icon" size={18} />
                    <input type="text" name="nacionalidad" className="form-control" placeholder="Ej: Chilena" onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <div className="input-icon-wrapper">
                    <Calendar className="input-icon" size={18} />
                    <input type="number" name="edad" className="form-control" placeholder="Años" min="18" max="99" onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Región de Residencia</label>
                  <div className="input-icon-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <select name="ciudad_residencia" className="form-control" onChange={handleInputChange} required defaultValue="">
                      <option value="" disabled>Seleccione una región</option>
                      <option value="Arica y Parinacota">Arica y Parinacota</option>
                      <option value="Tarapacá">Tarapacá</option>
                      <option value="Antofagasta">Antofagasta</option>
                      <option value="Atacama">Atacama</option>
                      <option value="Coquimbo">Coquimbo</option>
                      <option value="Valparaíso">Valparaíso</option>
                      <option value="Metropolitana">Metropolitana</option>
                      <option value="O'Higgins">O'Higgins</option>
                      <option value="Maule">Maule</option>
                      <option value="Ñuble">Ñuble</option>
                      <option value="Biobío">Biobío</option>
                      <option value="Araucanía">Araucanía</option>
                      <option value="Los Ríos">Los Ríos</option>
                      <option value="Los Lagos">Los Lagos</option>
                      <option value="Aysén">Aysén</option>
                      <option value="Magallanes">Magallanes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ciudad Central de Trabajo</label>
                  <div className="input-icon-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <input type="text" name="ciudad_trabajo" className="form-control" placeholder="Zonas donde operas" onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Localidades extra dispuestas a trabajar de manera extendida</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <input type="text" name="localidades_extra" className="form-control" placeholder="Ej: San Pedro de Atacama..." onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* CARD 2: TIPO DE GUÍA */}
            <div className="form-card" id="seccion-tipos-guia" style={{ scrollMarginTop: '100px' }}>
              <div className="form-section-header">
                <div className="form-section-icon"><Compass size={24}/></div>
                <h3>2. Tipo de Guía y Especialidades</h3>
              </div>
              <TipoGuiaSelector
                selected={tiposGuia}
                onChangeSelected={(v) => { setTiposGuia(v); if (v.length) setTiposError(''); }}
                otros={tiposGuiaOtros}
                onChangeOtros={(v) => { setTiposGuiaOtros(v); if (v.length) setTiposError(''); }}
                error={tiposError}
              />
            </div>

            {/* CARD 3: EXPERIENCIA Y CREDENCIAL */}
            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><Award size={24}/></div>
                <h3>3. Resumen de Credencial y Experiencia</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Idiomas Dominados</label>
                <div className="idiomas-selector-container">
                  <div className="idiomas-input-row">
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      {idiomasOptions.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>

                    <select 
                      value={selectedLevel} 
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      {nivelesOptions.map(nv => <option key={nv} value={nv}>{nv}</option>)}
                    </select>

                    <button className="btn-add-idioma" onClick={handleAddIdioma}>
                      <Plus size={16} style={{ marginBottom: '-3px' }}/> Añadir
                    </button>
                  </div>

                  {idiomasList.length > 0 && (
                    <div className="idiomas-chips-container">
                      {idiomasList.map((item, idx) => (
                        <div key={idx} className="idioma-chip">
                          {item.idioma} <span style={{ opacity: 0.6, fontSize: '0.8em' }}>({item.nivel})</span>
                          <button type="button" onClick={() => handleRemoveIdioma(item.idioma)} title="Eliminar">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Biografía Profesional Privada (Para el Perfil Premium)</label>
                <textarea name="biografia" className="form-textarea" placeholder="Escribe un párrafo atractivo sobre ti..." style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Educación Formal (Académica o Técnica)</label>
                <textarea name="educacion" className="form-textarea" placeholder="Nombra los diplomados..." style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Rutas de Experiencia (Excursiones/Tours manejados)</label>
                <textarea name="rutas_experiencia" className="form-textarea" placeholder="Nombra excursiones..." style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}></textarea>
              </div>
            </div>

            {/* CARD 4: DOCUMENTOS */}
            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><UploadCloud size={24}/></div>
                <h3>4. Carga de Documentación Oficial</h3>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Currículum Vitae</label>
                  <div className="file-upload-block">
                    <input type="file" className="form-control-file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => handleFileChange(e, 'cv')} required />
                    <span className="file-upload-info"><FileText size={14} style={{display:'inline', marginBottom:'-2px'}}/> Formatos válidos: PDF, Word. Límite: 15MB.</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Foto de Rostro Profesional</label>
                  <div className="file-upload-block">
                    <input type="file" className="form-control-file" accept="image/*,.heic,.heif" onChange={(e) => handleFileChange(e, 'foto')} required />
                    <span className="file-upload-info"><User size={14} style={{display:'inline', marginBottom:'-2px'}}/> Fondo neutro, con uniforme o tenida outdoor (se optimiza automáticamente).</span>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Certificado de Registro Nacional de Guías (SERNATUR)</label>
                  <div className="file-upload-block">
                    <input type="file" className="form-control-file" accept=".pdf,image/*,.heic,.heif" onChange={(e) => { handleFileChange(e, 'sernatur'); }} required />
                    <span className="file-upload-info"><Award size={14} style={{display:'inline', marginBottom:'-2px'}}/> Adjunta el comprobante o carnet vigente (PDF o Imagen).</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Certificación de Primeros Auxilios (WFA / WAFA / WFR)</label>
                  <div className="file-upload-block">
                    <input type="file" className="form-control-file" accept=".pdf,image/*,.heic,.heif" onChange={(e) => { handleFileChange(e, 'primeros_auxilios'); }} required />
                    <span className="file-upload-info"><CheckSquare size={14} style={{display:'inline', marginBottom:'-2px'}}/> Debe estar vigente al momento de la postulación (PDF o Imagen).</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Otras Certificaciones (Opcional)</label>
                <div className="file-upload-block">
                  <input type="file" className="form-control-file" accept=".pdf,image/*,.heic,.heif" multiple onChange={(e) => handleFileChange(e, 'otras_certificaciones')} />
                  <span className="file-upload-info"><GraduationCap size={14} style={{display:'inline', marginBottom:'-2px'}}/> Leave No Trace, Rescate Acuático, Avalanchas, Licencia Clase A. Permite subir múltiples.</span>
                </div>
              </div>

              <div className="form-group" style={{marginTop: '2rem'}}>
                <label className="form-label">¿Está legalmente habilitado para emitir boletas de honorarios en el SII?</label>
                <select name="habilitado_sii" className="form-select" style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}>
                  <option value="si">Sí, poseo inicio de actividades.</option>
                  <option value="no">No, buscaré integrarme mediante otro esquema laboral.</option>
                  <option value="tramite">No actualmente, pero está en trámite.</option>
                </select>
              </div>
            </div>

            {loading && uploadProgressText && (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.25rem',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.95rem'
              }}>
                <Loader2 size={18} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <span>{uploadProgressText}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-submit-premium" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  {uploadProgressText || 'Enviando postulación...'}
                </>
              ) : 'Enviar Postulación'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PostulacionGuias;
