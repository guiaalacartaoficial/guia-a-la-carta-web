import { useState, useEffect, useRef } from 'react';

/**
 * Componente reutilizable para lazy-load de background-image.
 * Solo carga la imagen cuando el elemento entra en el viewport,
 * evitando descargas innecesarias de imágenes fuera de pantalla.
 */
const LazyBackground = ({ src, className, children, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          img.onload = () => setLoaded(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        backgroundImage: loaded ? `url(${src})` : 'none',
        backgroundColor: loaded ? undefined : '#1a3a32'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default LazyBackground;
