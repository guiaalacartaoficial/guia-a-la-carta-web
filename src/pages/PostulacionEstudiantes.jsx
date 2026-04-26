import React, { useState } from 'react';
import { AlertTriangle, User, Mail, Phone, MapPin, Globe, Calendar, Award, FileText, UploadCloud, GraduationCap, Plus, X } from 'lucide-react';
import GuideCredential from '../components/GuideCredential';
import './Postulacion.css';
import { supabase } from '../services/supabase';

const PostulacionEstudiantes = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // === ESTADOS PARA EL SELECTOR MÚLTIPLE DE IDIOMAS ===
  const idiomasOptions = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Mandarín", "Otro"];
  const nivelesOptions = ["Nativo", "Avanzado (C1/C2)", "Intermedio (B1/B2)", "Básico (A1/A2)"];
  
  const [selectedLanguage, setSelectedLanguage] = useState("Inglés");
  const [selectedLevel, setSelectedLevel] = useState("Intermedio (B1/B2)");
  const [idiomasList, setIdiomasList] = useState([
    { idioma: "Español", nivel: "Nativo" }
  ]);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    nacionalidad: '',
    edad: '',
    ciudad_residencia: '',
    biografia: '',
    educacion: '',
    experiencia_terreno: '',
    habilitado_sii: 'si'
  });

  const [files, setFiles] = useState({
    cv: null,
    foto: null,
    certificaciones: null
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    setFiles({ ...files, [field]: e.target.files[0] });
  };

  const handleAddIdioma = (e) => {
    e.preventDefault();
    if (idiomasList.some(i => i.idioma === selectedLanguage)) return; // Evitar duplicados
    setIdiomasList([...idiomasList, { idioma: selectedLanguage, nivel: selectedLevel }]);
  };

  const handleRemoveIdioma = (idiomaToRemove) => {
    setIdiomasList(idiomasList.filter(i => i.idioma !== idiomaToRemove));
  };

  const uploadFile = async (file, bucket, path) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url_cv = await uploadFile(files.cv, 'documentos', 'estudiantes/cvs');
      const url_foto = await uploadFile(files.foto, 'documentos', 'estudiantes/fotos');

      const { error } = await supabase
        .from('postulaciones_estudiantes')
        .insert([{
          ...formData,
          idiomas: idiomasList,
          url_cv,
          url_foto,
          estado: 'pendiente'
        }]);

      if (error) throw error;
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error detallado al postular estudiante:', error);
      alert(`Error al enviar postulación: ${error.message || 'Error desconocido'}. Revisa que el bucket "documentos" exista en Supabase Storage.`);
    } finally {
      setLoading(false);
    }
  };

  const [showExample, setShowExample] = useState(false);

  const guiaEstudianteEjemplo = {
    nombre: "Camila Soto G.",
    edad: 23,
    codigo: "EST:012",
    idiomas: ["Español", "Inglés"],
    imagen: "/guias/guia2.png", 
    biografia: "Estudiante de 3er año de Administración en Ecoturismo en Duoc UC. Apasionada por la interpretación del patrimonio natural y con gran vocación por el servicio al cliente y las experiencias al aire libre.",
    formacion: [
      "Cursando Administración Ecoturismo",
      "Primeros Auxilios Básicos (RCP)"
    ],
    experiencia: [
      "Terreno Parque Nacional La Campana",
      "Voluntariado Reforestación CONAF",
      "Práctica Inicial Tour Operador Local"
    ],
    certificaciones: null 
  };

  if (submitted) {
    return (
      <div className="postulacion-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text-center" style={{ maxWidth: '600px', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#ECFDF5', color: '#10B981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <Award size={48} />
          </div>
          <h2 style={{ color: 'var(--c-primary-dark)' }}>Postulación Recibida</h2>
          <p style={{ color: 'var(--c-text-light)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            ¡Gracias por postular! Revisaremos tu perfil de estudiante y nos pondremos en contacto contigo para una entrevista o charla operativa.
          </p>
          <a href="/" className="btn btn-primary">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="postulacion-page">
      <section className="postulacion-header">
        <div className="container text-center">
          <h1>Postulación de Estudiantes</h1>
          <p>El punto de partida de tu carrera. Fórmate, apóyate en nuestro equipo y únete a la red más grande de Chile incluso antes de egresar.</p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl postulacion-form-container">
          
          <div className="form-warning-box">
            <AlertTriangle size={28} />
            <div className="form-warning-content">
              <h4>Atención: Requisitos Educativos Estrictos</h4>
              <p>
                La postulación está restringida exclusivamente a estudiantes de carreras ligadas a Turismo (Ecoturismo, Turismo Aventura, Administración Turística). Exigimos que te encuentres cursando desde el <strong>2do año de carrera (modalidad técnica)</strong> o desde el <strong>3er año (modalidad profesional)</strong>. Además, toda tu información ortográfica y fotográfica debe mantener estándares premium.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* INTRODUCCION A LA CREDENCIAL (BOTON DESPLEGABLE) */}
            <div className="example-credential-wrapper">
              <h4>Visualiza tu Futura Credencial de Estudiante</h4>
              <p>Así es como agencias de turismo verán tu perfil como prospecto a Guía Junior.</p>
              
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
                  <GuideCredential guia={guiaEstudianteEjemplo} isExample={true} />
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
                    <input type="text" name="nombres" className="form-control" placeholder="Ej: Camila Andrea" onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Apellidos</label>
                  <div className="input-icon-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="apellidos" className="form-control" placeholder="Ej: Soto Gómez" onChange={handleInputChange} required />
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
                  <label className="form-label">Ciudad de Residencia</label>
                  <div className="input-icon-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <input type="text" name="ciudad_residencia" className="form-control" placeholder="Ej: Santiago" onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Localidades extra (Opcional)</label>
                  <div className="input-icon-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <input type="text" className="form-control" placeholder="Ej: Cajón del Maipo" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: EXPERIENCIA Y CREDENCIAL */}
            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><Award size={24}/></div>
                <h3>2. Resumen de Credencial y Experiencia</h3>
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
                <label className="form-label">Biografía Profesional (Para el Perfil Junior)</label>
                <textarea name="biografia" className="form-textarea" placeholder="Escribe sobre tus motivaciones..." style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Educación Formal (Institución y Año en Curso)</label>
                <textarea name="educacion" className="form-textarea" placeholder="Ej: 'Cursando 2do año...'" style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Experiencia en Terreno (Salidas universitarias, voluntariados, etc.)</label>
                <textarea name="experiencia_terreno" className="form-textarea" placeholder="Menciona salidas a terreno..." style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}></textarea>
              </div>
            </div>

            {/* CARD 3: DOCUMENTOS */}
            <div className="form-card">
              <div className="form-section-header">
                <div className="form-section-icon"><UploadCloud size={24}/></div>
                <h3>3. Carga de Documentación Oficial</h3>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Currículum Vitae (Adaptado a Turismo)</label>
                  <div className="file-upload-block">
                    <input type="file" className="form-control-file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'cv')} required />
                    <span className="file-upload-info"><FileText size={14} style={{display:'inline', marginBottom:'-2px'}}/> Formatos válidos: PDF, Word. Límite: 5MB.</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Foto de Rostro Profesional</label>
                  <div className="file-upload-block">
                    <input type="file" className="form-control-file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, 'foto')} required />
                    <span className="file-upload-info"><User size={14} style={{display:'inline', marginBottom:'-2px'}}/> Para crear tu futura credencial de pasante.</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cetificaciones Adicionales (Opcional)</label>
                <div className="file-upload-block">
                  <input type="file" className="form-control-file" accept=".pdf, image/*" multiple onChange={(e) => handleFileChange(e, 'certificaciones')} />
                  <span className="file-upload-info"><GraduationCap size={14} style={{display:'inline', marginBottom:'-2px'}}/> RCP Básica, Leave No Trace u otros diplomas. Permite subir múltiples.</span>
                </div>
              </div>

              <div className="form-group" style={{marginTop: '2rem'}}>
                <label className="form-label">¿Está legalmente habilitado para emitir boletas de honorarios en el SII?</label>
                <select name="habilitado_sii" className="form-select" style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}} onChange={handleInputChange}>
                  <option value="si">Sí, poseo inicio de actividades.</option>
                  <option value="no">No, no poseo.</option>
                  <option value="tramite">No actualmente, pero está en trámite.</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-submit-premium" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Postulación'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PostulacionEstudiantes;
