import './Postulacion.css';

const PostulacionEstudiantes = () => {
  return (
    <div className="postulacion-page">
      <section className="postulacion-header">
        <div className="container text-center">
          <h1>Pasantías y Estudiantes</h1>
          <p>Inicia tu carrera profesional aprendiendo en la red más grande de Chile.</p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          <form className="postulacion-form">
            <h3 className="form-section-title">Datos del Estudiante</h3>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nombres</label><input type="text" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Apellidos</label><input type="text" className="form-control" /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Correo Electrónico</label><input type="email" className="form-control" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input type="tel" className="form-control" /></div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Institución Educativa</label>
              <input type="text" className="form-control" placeholder="Universidad, Instituto, etc." />
            </div>
            
            <div className="form-group">
              <label className="form-label">Carrera</label>
              <input type="text" className="form-control" placeholder="Ej: Turismo Sustentable, Ecoturismo..." />
            </div>

            <div className="form-group">
              <label className="form-label">¿Por qué te gustaría hacer tu práctica con nosotros?</label>
              <textarea className="form-textarea"></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Enlace a tu CV y/o Carta de Motivación (Drive / Dropbox)</label>
              <input type="url" className="form-control" placeholder="https://" />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '2rem'}}>Enviar Postulación de Práctica</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PostulacionEstudiantes;
