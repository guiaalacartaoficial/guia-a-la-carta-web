import { Award, FileText, Compass, CheckCircle } from 'lucide-react';
import './QuienesSomos.css';

const QuienesSomos = () => {
  return (
    <div className="section" style={{paddingTop: '120px', paddingBottom: '80px', backgroundColor: '#F8FAF6'}}>
      <div className="container">
        <h1 className="text-center" style={{marginBottom: '3rem', color: 'var(--c-primary-dark)'}}>Sobre Guía a la Carta</h1>
        
        <div className="nosotros-layouts">
          <div className="nosotros-card">
            <Award size={48} className="text-accent mb-3"/>
            <h3>Quiénes somos</h3>
            <p>
              Guía a la Carta es una empresa enfocada en entregar soluciones operativas para empresas de turismo en Chile, 
              conectándolas con guías turísticos certificados y perfiles adecuados para cada servicio.
            </p>
          </div>

          <div className="nosotros-card">
            <FileText size={48} className="text-accent mb-3"/>
            <h3>Cómo nacimos</h3>
            <p>
              Nacimos desde la experiencia real en terreno, al identificar una necesidad crítica del sector: la dificultad 
              de encontrar guías confiables, disponibles y alineados al nivel de servicio que cada operación necesita.
            </p>
          </div>

          <div className="nosotros-card">
            <Compass size={48} className="text-accent mb-3"/>
            <h3>Nuestra visión</h3>
            <p>
              Buscamos profesionalizar la forma en que se coordinan y gestionan los guías turísticos, aportando más orden, 
              trazabilidad y estándar al sector del turismo operativo.
            </p>
          </div>
        </div>

        <div className="enfoque-section text-center mt-5">
          <h2 style={{color: 'var(--c-primary-dark)', marginBottom: '2rem'}}>Nuestro enfoque</h2>
          <div className="enfoque-grid">
            <div className="enfoque-item"><CheckCircle className="text-accent"/> Profesionalismo</div>
            <div className="enfoque-item"><CheckCircle className="text-accent"/> Flexibilidad</div>
            <div className="enfoque-item"><CheckCircle className="text-accent"/> Rapidez</div>
            <div className="enfoque-item"><CheckCircle className="text-accent"/> Confianza</div>
            <div className="enfoque-item"><CheckCircle className="text-accent"/> Respaldo operativo</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuienesSomos;
