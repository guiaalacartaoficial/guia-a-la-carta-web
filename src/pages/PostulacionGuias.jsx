import './Postulacion.css';

const PostulacionGuias = () => {
  return (
    <div className="postulacion-page">
      <section className="postulacion-header">
        <div className="container text-center">
          <h1>Únete como Guía</h1>
          <p>Potencia tu carrera, forma parte de la red líder de guías en Chile.</p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          <form className="postulacion-form">
            <h3 className="form-section-title">1. Datos Personales</h3>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nombres</label><input type="text" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Apellidos</label><input type="text" className="form-control" /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Correo Electrónico</label><input type="email" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input type="tel" className="form-control" /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nacionalidad</label><input type="text" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Edad</label><input type="number" className="form-control" /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Ciudad de Residencia</label><input type="text" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Ciudad de Trabajo</label><input type="text" className="form-control" /></div>
            </div>
            <div className="form-group"><label className="form-label">Localidades extra dispuestas a trabajar</label><input type="text" className="form-control" /></div>

            <h3 className="form-section-title">2. Datos de Credencial y Experiencia</h3>
            <div className="form-group">
              <label className="form-label">Idiomas y Nivel</label>
              <input type="text" className="form-control" placeholder="Ej: Inglés (Avanzado), Portugués (Intermedio)" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción Profesional</label>
              <textarea className="form-textarea" placeholder="Cuéntanos sobre tu perfil como guía..."></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Formación Educacional</label>
              <textarea className="form-textarea" placeholder="Títulos, cursos, instituciones..."></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Experiencia como Guía</label>
              <textarea className="form-textarea" placeholder="Lugares, años de experiencia, tipo de tours..."></textarea>
            </div>

            <h3 className="form-section-title">3. Documentación</h3>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Currículum Vitae (Link drive o similar)</label><input type="url" className="form-control" placeholder="https://..." /></div>
              <div className="form-group"><label className="form-label">Link a Foto de Perfil Profesional</label><input type="url" className="form-control" placeholder="https://..." /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Registro SERNATUR (Nº o Vigencia)</label><input type="text" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Certificado Primeros Auxilios</label><input type="text" className="form-control" placeholder="Entidad y Vencimiento" /></div>
            </div>
            <div className="form-group"><label className="form-label">Otras Certificaciones (WFR, Leave No Trace, etc.)</label><input type="text" className="form-control" /></div>
            <div className="form-group">
              <label className="form-label">¿Está habilitado para emitir boletas de honorarios?</label>
              <select className="form-select">
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '2rem'}}>Enviar Postulación</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PostulacionGuias;
