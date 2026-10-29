import React, { useEffect, useState } from 'react';
import { Star, ExternalLink, PenLine, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { GOOGLE_REVIEWS_DEFAULT } from '../data/reseñasGoogle';
import './GoogleReviews.css';

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.3 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const Stars = ({ value, size = 16 }) => (
  <span className="gr-stars" aria-label={`${value} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        fill={i <= Math.round(value) ? '#FBBC04' : 'none'}
        stroke={i <= Math.round(value) ? '#FBBC04' : '#CBD5E1'}
      />
    ))}
  </span>
);

const ReviewCard = ({ r }) => {
  const [expanded, setExpanded] = useState(false);
  const long = r.texto.length > 220;
  return (
    <article className="gr-card">
      <Quote className="gr-quote" size={28} />
      <header className="gr-card-head">
        {r.foto ? (
          <img src={r.foto} alt="" className="gr-avatar" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <span className="gr-avatar gr-avatar-fallback">{r.autor.charAt(0)}</span>
        )}
        <div>
          <strong className="gr-author">{r.autor}</strong>
          <span className="gr-time">{r.tiempoRelativo}</span>
        </div>
      </header>
      <Stars value={r.rating} />
      <p className={`gr-text ${expanded ? 'expanded' : ''}`}>{r.texto || 'Calificó con estrellas sin dejar comentario.'}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
        {long ? (
          <button type="button" className="gr-more" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Ver menos' : 'Leer más'}
          </button>
        ) : <span />}
        {r.link && (
          <a href={r.link} target="_blank" rel="noreferrer" className="gr-review-link" title="Ver reseña verificada en Google Maps">
            <ExternalLink size={13} /> Ver en Google
          </a>
        )}
      </div>
    </article>
  );
};

const GoogleReviews = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [page, setPage] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch('/api/google-reviews')
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!alive) return;
        if (ok && j.reviews?.length) {
          setData(j);
          setStatus('ok');
        } else {
          // Si aún no está configurada la API Key en el servidor, usamos los comentarios verificados de respaldo
          setData(GOOGLE_REVIEWS_DEFAULT);
          setStatus('ok');
        }
      })
      .catch(() => {
        if (!alive) return;
        setData(GOOGLE_REVIEWS_DEFAULT);
        setStatus('ok');
      });
    return () => { alive = false; };
  }, []);

  const perPage = 3;
  const reviews = data?.reviews || [];
  const pages = Math.max(1, Math.ceil(reviews.length / perPage));
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="section-google-reviews">
      <div className="container">
        <div className="gr-header">
          <div>
            <span className="gr-eyebrow"><GoogleLogo /> Reseñas verificadas de Google</span>
            <h2>Lo que dicen quienes ya trabajan con nosotros</h2>
          </div>
          {data && (
            <div className="gr-summary">
              <span className="gr-score">{data.rating?.toFixed(1)}</span>
              <div>
                <Stars value={data.rating} size={20} />
                <span className="gr-total">
                  {typeof data.total === 'number' ? `${data.total} reseñas en Google` : 'Reseñas Verificadas en Google Maps'}
                </span>
              </div>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="gr-grid">
            {[0, 1, 2].map((i) => <div key={i} className="gr-card gr-skeleton" />)}
          </div>
        )}

        {status === 'error' && import.meta.env.DEV && (
          <div className="gr-dev-note">
            <strong>Modo desarrollo:</strong> las reseñas aún no están configuradas. Agrega
            <code>GOOGLE_PLACES_API_KEY</code> y <code>GOOGLE_PLACE_ID</code> al archivo <code>.env</code> y reinicia <code>npm run dev</code>.
            (Este aviso no aparece en producción; allí la sección simplemente se oculta.)
          </div>
        )}

        {status === 'ok' && (
          <>
            <div className="gr-grid">
              {visible.map((r, i) => <ReviewCard key={`${page}-${i}`} r={r} />)}
            </div>

            <div className="gr-footer">
              {pages > 1 && (
                <div className="gr-pager">
                  <button type="button" aria-label="Anteriores" onClick={() => setPage((page - 1 + pages) % pages)}><ChevronLeft size={20} /></button>
                  <span>{page + 1} / {pages}</span>
                  <button type="button" aria-label="Siguientes" onClick={() => setPage((page + 1) % pages)}><ChevronRight size={20} /></button>
                </div>
              )}
              <div className="gr-actions">
                {data.mapsUrl && (
                  <a href={data.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline-gr">
                    Ver todas en Google <ExternalLink size={16} />
                  </a>
                )}
                <a href={data.escribirResenaUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                  <PenLine size={16} /> Déjanos tu reseña
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;
