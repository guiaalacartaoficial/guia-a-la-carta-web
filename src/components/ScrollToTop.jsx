import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Forzar el scroll al inicio inmediatamente al cambiar de ruta
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // 'auto' es más confiable que 'smooth' para cambios de página inmediatos
    });
    // Respaldo para navegadores específicos o contenedores con scroll
    document.documentElement.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
