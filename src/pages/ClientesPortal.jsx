import React, { useState, useEffect } from 'react';
import { supabase, getOptimizedImageUrl } from '../services/supabase';
import {
  ShieldCheck, Calendar, Filter, CheckCircle2,
  LogOut, Eye, Search, RefreshCw, Lock, ArrowRight, Star, X, Trash2,
  MessageCircle
} from 'lucide-react';
import GuideCredential from '../components/GuideCredential';
import ChatWindow from '../components/ChatWindow';
import ToastContainer, { useToast } from '../components/Toast';
import './ClientesPortal.css';

const ClientesPortal = () => {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Portal State
  const [guiasDisponibles, setGuiasDisponibles] = useState([]);
  const [guiasAprobados, setGuiasAprobados] = useState([]);
  const [estudiantesAprobados, setEstudiantesAprobados] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evalForm, setEvalForm] = useState({});
  const [activePortalTab, setActivePortalTab] = useState('buscar');

  // Modal reserva
  const [bookingModal, setBookingModal] = useState(null); // { rowId, fecha, nombreGuia, guiaId, tipoGuia }
  const [nombreServicioInput, setNombreServicioInput] = useState('');

  // Selected guide credential
  const [selectedGuideForCredential, setSelectedGuideForCredential] = useState(null);

  // Chat state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Search/Filters State
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedIdioma, setSelectedIdioma] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [searchBookingQuery, setSearchBookingQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('empresa_b2b');
    if (stored) {
      setEmpresa(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (empresa) {
      fetchPortalData();
      loadChats();
    }
  }, [empresa]);

  const loadChats = async () => {
    if (!empresa) return;
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('empresa_id', empresa.id)
      .eq('activo', true)
      .order('created_at', { ascending: false });
    setChats(data || []);

    // Calcular no leídos por empresa
    const counts = {};
    for (const chat of (data || [])) {
      const { count } = await supabase
        .from('chat_mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chat.id)
        .eq('leido_empresa', false)
        .neq('autor_tipo', 'empresa');
      counts[chat.id] = count || 0;
    }
    setUnreadCounts(counts);
  };

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const hoy = new Date().toISOString().slice(0, 10);

      const { data: dispData } = await supabase
        .from('disponibilidad_guias')
        .select('*')
        .or(`fecha.gte.${hoy},bloqueado_por.eq.${empresa.id}`)
        .order('fecha', { ascending: true });

      const colsGuias = 'id, nombres, apellidos, nombre_visual, apellido_visual, edad, idiomas, url_foto, biografia, educacion, rutas_experiencia, url_sernatur, url_primeros_auxilios, url_otras_certificaciones, nivel';
      const colsEsts = 'id, nombres, apellidos, nombre_visual, apellido_visual, edad, idiomas, url_foto, biografia, educacion, experiencia_terreno';

      const { data: guiasData } = await supabase
        .from('postulaciones_guias')
        .select(colsGuias)
        .eq('estado', 'aprobado');

      const { data: estData } = await supabase
        .from('postulaciones_estudiantes')
        .select(colsEsts)
        .eq('estado', 'aprobado');

      let evData = [];
      try {
        const { data } = await supabase
          .from('evaluaciones_servicios')
          .select('*')
          .eq('empresa_id', empresa.id);
        evData = data || [];
      } catch (err) {
        console.warn('evaluaciones_servicios table may not exist yet:', err);
      }

      setGuiasAprobados(guiasData || []);
      setEstudiantesAprobados(estData || []);
      setEvaluaciones(evData);

      const mapped = (dispData || []).map(d => {
        let nombre = 'Guía';
        let codigo = '';
        let nivel = 'Senior';
        let idiomas = ['Español'];
        let urlFoto = '/placeholder-user.png';
        const OPT = getOptimizedImageUrl;
        let info = null;

        if (d.tipo_guia === 'guia') {
          info = (guiasData || []).find(x => x.id === d.guia_id);
          if (info) {
            nombre = `${info.nombres || ''} ${info.apellidos || ''}`.trim();
            codigo = `PRO:${String(info.id).substring(0, 5).toUpperCase()}`;
            nivel = info.nivel
              ? info.nivel.charAt(0).toUpperCase() + info.nivel.slice(1)
              : 'Senior';
            idiomas = Array.isArray(info.idiomas)
              ? info.idiomas.map(i => (typeof i === 'object' ? i.idioma : i))
              : ['Español'];
            urlFoto = OPT(info.url_foto, 200, 200, 70);
          }
        } else {
          info = (estData || []).find(x => x.id === d.guia_id);
          if (info) {
            nombre = `${info.nombres || ''} ${info.apellidos || ''}`.trim();
            codigo = `EST:${String(info.id).substring(0, 5).toUpperCase()}`;
            nivel = 'Junior';
            idiomas = Array.isArray(info.idiomas)
              ? info.idiomas.map(i => (typeof i === 'object' ? i.idioma : i))
              : ['Español'];
            urlFoto = OPT(info.url_foto, 200, 200, 70);
          }
        }

        return { ...d, nombre, codigo, nivel, idiomas, urlFoto, originalRecord: info };
      });

      setGuiasDisponibles(mapped);
      setMyBookings(
        mapped.filter(m => m.bloqueado_por === empresa.id && m.estado_bloqueo === 'bloqueado')
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('verify_empresa_login', {
        input_email: email.trim(),
        input_password: password.trim()
      });

      if (rpcError) throw rpcError;

      if (!data || !data.success) {
        setError(data?.error || 'Credenciales incorrectas o empresa inactiva.');
        return;
      }

      const userCompany = data.empresa;
      localStorage.setItem('empresa_b2b', JSON.stringify(userCompany));
      setEmpresa(userCompany);
    } catch (err) {
      setError('Error al conectar con la base de datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('empresa_b2b');
    setEmpresa(null);
    setEmail('');
    setPassword('');
  };

  // Evaluación con estrellas
  const handleStarClick = (itemId, star) => {
    setEvalForm(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), estrellas: star } }));
  };

  const handleCommentChange = (itemId, value) => {
    setEvalForm(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), comentario: value } }));
  };

  const handleSubmitEvaluation = async (disponibilidadId, guiaId, tipoGuia, estrellas, comentario) => {
    if (!estrellas || estrellas < 1 || estrellas > 5) {
      addToast('Por favor selecciona una calificación de 1 a 5 estrellas.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('evaluaciones_servicios')
        .insert({
          disponibilidad_id: disponibilidadId,
          empresa_id: empresa.id,
          guia_id: guiaId,
          tipo_guia: tipoGuia,
          estrellas,
          comentario: comentario ? comentario.trim() : ''
        });

      if (error) throw error;
      addToast('¡Evaluación enviada exitosamente! Gracias por tu feedback.', 'success');
      fetchPortalData();
    } catch (err) {
      console.error(err);
      addToast('Hubo un problema al enviar la evaluación. Inténtalo de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de reserva
  const openBookingModal = (item) => {
    setBookingModal({
      rowId: item.id,
      fecha: item.fecha,
      nombreGuia: item.nombre,
      guiaId: item.guia_id,
      tipoGuia: item.tipo_guia,
    });
    setNombreServicioInput('');
  };

  // Confirmar reserva desde modal + crear chat automáticamente
  const handleConfirmBooking = async () => {
    if (!bookingModal) return;
    setLoading(true);
    try {
      const updatePayload = {
        estado_bloqueo: 'bloqueado',
        bloqueado_por: empresa.id,
        admin_notificado: false,
      };
      if (nombreServicioInput.trim()) {
        updatePayload.nombre_servicio = nombreServicioInput.trim();
      }

      const { error } = await supabase
        .from('disponibilidad_guias')
        .update(updatePayload)
        .eq('id', bookingModal.rowId);

      if (error) throw error;

      // Crear sala de chat vinculada a esta reserva
      const chatExistente = chats.find(c => c.disponibilidad_id === bookingModal.rowId);
      if (!chatExistente) {
        await supabase.from('chats').insert({
          disponibilidad_id: bookingModal.rowId,
          empresa_id: empresa.id,
          empresa_nombre: empresa.nombre_empresa,
          guia_id: bookingModal.guiaId,
          tipo_guia: bookingModal.tipoGuia,
          guia_nombre: bookingModal.nombreGuia,
          nombre_servicio: nombreServicioInput.trim() || null,
          fecha_servicio: bookingModal.fecha,
          activo: true,
        });
      }

      addToast(`¡Reserva confirmada! Guía: ${bookingModal.nombreGuia} — ${new Date(bookingModal.fecha + 'T12:00:00Z').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}`, 'success', 5000);
      setBookingModal(null);
      setNombreServicioInput('');
      fetchPortalData();
      loadChats();
    } catch (err) {
      console.error(err);
      addToast('Error al realizar la reserva. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar reserva desde portal B2B
  const handleCancelBooking = async (rowId, nombreGuia, fecha) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('disponibilidad_guias')
        .update({
          estado_bloqueo: 'libre',
          bloqueado_por: null,
          nombre_servicio: null,
          admin_notificado: true,
        })
        .eq('id', rowId);

      if (error) throw error;
      addToast(`Reserva cancelada: ${nombreGuia} — ${new Date(fecha + 'T12:00:00Z').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}`, 'info', 5000);
      fetchPortalData();
    } catch (err) {
      console.error(err);
      addToast('Error al cancelar la reserva. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mapToCredentialFormat = (item) => {
    if (!item || !item.originalRecord) return null;
    const r = item.originalRecord;
    const rawN = String(r.nombres || r.nombre || 'Guía').trim();
    return {
      nombre: typeof r.nombre_visual === 'string' ? r.nombre_visual : rawN.split(' ')[0],
      apellidos: typeof r.apellido_visual === 'string' ? r.apellido_visual : '',
      edad: r.edad || 0,
      nivel: item.nivel || 'senior',
      codigo: item.codigo || 'S/N',
      idiomas: Array.isArray(r.idiomas)
        ? r.idiomas.map(i => (typeof i === 'object' ? i?.idioma : i) || 'Español')
        : ['Español'],
      imagen: getOptimizedImageUrl(r.url_foto, 300, 300, 75),
      biografia: String(r.biografia || 'Sin biografía'),
      formacion: typeof r.educacion === 'string' ? r.educacion.split('\n') : [],
      experiencia:
        typeof r.rutas_experiencia === 'string'
          ? r.rutas_experiencia.split('\n')
          : typeof r.experiencia_terreno === 'string'
          ? r.experiencia_terreno.split('\n')
          : [],
      certificaciones: {
        sernatur: !!r.url_sernatur,
        wfr: !!r.url_primeros_auxilios,
        otras: !!r.url_otras_certificaciones,
      },
    };
  };

  const filteredDisponibilidad = guiasDisponibles.filter(item => {
    if (item.estado_bloqueo === 'bloqueado') return false;
    if (selectedFecha && item.fecha !== selectedFecha) return false;
    if (selectedNivel && item.nivel.toLowerCase() !== selectedNivel.toLowerCase()) return false;
    if (selectedIdioma) {
      const ok = item.idiomas.some(l => l.toLowerCase().includes(selectedIdioma.toLowerCase()));
      if (!ok) return false;
    }
    return true;
  });

  return (
    <div className="portal-b2b-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ===================== MODAL RESERVA ===================== */}
      {bookingModal && (
        <div className="portal-modal-overlay" onClick={() => setBookingModal(null)}>
          <div className="portal-modal-box" onClick={e => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3><Calendar size={18} style={{ display: 'inline', marginRight: 8 }} />Confirmar Reserva</h3>
              <button className="portal-modal-close" onClick={() => setBookingModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="portal-modal-body">
              <div className="portal-modal-info">
                <div className="portal-modal-info-row">
                  <span className="portal-modal-label">Guía</span>
                  <span className="portal-modal-value">{bookingModal.nombreGuia}</span>
                </div>
                <div className="portal-modal-info-row">
                  <span className="portal-modal-label">Fecha</span>
                  <span className="portal-modal-value">
                    {new Date(bookingModal.fecha + 'T12:00:00Z').toLocaleDateString('es-CL', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="portal-modal-field">
                <label>Nombre del tour o destino <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  placeholder="Ej: Tour Volcán Villarrica, City Tour Santiago..."
                  value={nombreServicioInput}
                  onChange={e => setNombreServicioInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-modal-btn-cancel" onClick={() => setBookingModal(null)}>
                Cancelar
              </button>
              <button
                className="portal-modal-btn-confirm"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== LOGIN ===================== */}
      {!empresa ? (
        <section className="portal-login-section">
          <div className="login-box-premium">
            <div className="login-logo-area">
              <div className="login-logo-circle">
                <ShieldCheck size={32} />
              </div>
              <h2>Portal de Operadores Turísticos</h2>
              <p>Acceso exclusivo para empresas y agencias de turismo asociadas a Guía a la Carta.</p>
            </div>

            {error && <div className="portal-error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group-portal">
                <label>Correo</label>
                <input
                  type="email"
                  placeholder="empresa@turismo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-portal">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-portal-submit" disabled={loading}>
                {loading ? 'Validando...' : (
                  <>Ingresar al Portal <ArrowRight size={18} style={{ display: 'inline', marginLeft: 6 }} /></>
                )}
              </button>
            </form>

            <p className="login-footer-note">
              <Lock size={12} /> Acceso seguro y encriptado
            </p>
          </div>
        </section>
      ) : (
        <div className="portal-dashboard">
          {/* ===================== HEADER ===================== */}
          <header className="portal-header">
            <div className="portal-header-inner">
              <div className="brand-section">
                <div className="brand-icon-wrap">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="brand-name">{empresa.nombre_empresa}</p>
                  <span className="badge-partner">Agencia Asociada</span>
                </div>
              </div>

              <div className="portal-nav-tabs">
                <button
                  className={`tab-link ${activePortalTab === 'buscar' ? 'active' : ''}`}
                  onClick={() => setActivePortalTab('buscar')}
                >
                  <Search size={15} />
                  Buscar Guías
                </button>
                <button
                  className={`tab-link ${activePortalTab === 'mis-reservas' ? 'active' : ''}`}
                  onClick={() => setActivePortalTab('mis-reservas')}
                >
                  <Calendar size={15} />
                  Servicios Agendados
                  <span className="tab-badge">{myBookings.filter(b => b.estado_servicio !== 'ejecutado').length}</span>
                </button>
                <button
                  className={`tab-link ${activePortalTab === 'ejecutados' ? 'active' : ''}`}
                  onClick={() => setActivePortalTab('ejecutados')}
                >
                  <CheckCircle2 size={15} />
                  Servicios Ejecutados
                  <span className="tab-badge" style={myBookings.filter(b => b.estado_servicio === 'ejecutado').length > 0 ? { background: '#059669' } : {}}>{myBookings.filter(b => b.estado_servicio === 'ejecutado').length}</span>
                </button>
                <button
                  className={`tab-link ${activePortalTab === 'mensajes' ? 'active' : ''}`}
                  onClick={() => { setActivePortalTab('mensajes'); loadChats(); }}
                  style={{ position: 'relative' }}
                >
                  <MessageCircle size={15} />
                  Mensajes
                  {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                    <span className="tab-badge" style={{ background: '#ef4444' }}>
                      {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </button>
              </div>

              <button className="btn-logout" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </header>

          {/* ===================== HERO ===================== */}
          <section className="portal-hero">
            <div className="portal-hero-content">
              <div className="portal-hero-badge">
                <Calendar size={13} />
                Disponibilidad en Tiempo Real
              </div>
              <h1>
                Guías disponibles para{' '}
                <span>tu próximo servicio</span>
              </h1>
              <p>
                Busca, selecciona y bloquea las fechas con nuestros guías certificados. Confirmación instantánea, sin intermediarios.
              </p>
            </div>
          </section>

          {/* ===================== CONTENIDO ===================== */}
          <main className="portal-container main-content-layout">
            {activePortalTab === 'buscar' && (
              <>
                {/* Sidebar Filtros */}
                <aside className="portal-filters-sidebar">
                  <div className="card-filter">
                    <div className="card-filter-header">
                      <div className="card-filter-icon">
                        <Filter size={16} />
                      </div>
                      <h4>Filtrar Disponibilidad</h4>
                    </div>

                    <div className="filter-group">
                      <label>Seleccionar Fecha</label>
                      <input
                        type="date"
                        value={selectedFecha}
                        onChange={(e) => setSelectedFecha(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                      />
                    </div>

                    <div className="filter-group">
                      <label>Nivel de Guía</label>
                      <select value={selectedNivel} onChange={(e) => setSelectedNivel(e.target.value)}>
                        <option value="">Todos los niveles</option>
                        <option value="Senior">Senior</option>
                        <option value="Full">Full</option>
                        <option value="Junior">Junior (Estudiante)</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Idioma Requerido</label>
                      <select value={selectedIdioma} onChange={(e) => setSelectedIdioma(e.target.value)}>
                        <option value="">Cualquier idioma</option>
                        <option value="Español">Español</option>
                        <option value="Inglés">Inglés</option>
                        <option value="Portugués">Portugués</option>
                        <option value="Francés">Francés</option>
                        <option value="Alemán">Alemán</option>
                      </select>
                    </div>

                    <button
                      className="btn-clear-filters"
                      onClick={() => {
                        setSelectedFecha('');
                        setSelectedIdioma('');
                        setSelectedNivel('');
                      }}
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </aside>

                {/* Grid de Guías */}
                <section className="portal-results-section">
                  <div className="results-header">
                    <h3>
                      Días Disponibles
                      <span className="results-count-badge">{filteredDisponibilidad.length}</span>
                    </h3>
                  </div>

                  {loading ? (
                    <div className="portal-loader">
                      <div className="portal-loader-spinner"></div>
                      <span>Cargando disponibilidad...</span>
                    </div>
                  ) : filteredDisponibilidad.length === 0 ? (
                    <div className="portal-empty-state">
                      <div className="empty-icon">
                        <Calendar size={28} />
                      </div>
                      <h4>Sin disponibilidades</h4>
                      <p>Prueba ajustando los filtros de fecha, nivel o idioma.</p>
                    </div>
                  ) : (
                    <div className="guides-grid-layout">
                      {filteredDisponibilidad.map(item => (
                        <div key={item.id} className="guide-portal-card">
                          <div className="card-color-bar"></div>
                          <div className="card-body">
                            <div
                              className="card-top"
                              onClick={() => setSelectedGuideForCredential(item)}
                              title="Clic para ver la credencial completa del guía"
                            >
                              <div className="card-top-avatar">
                                <img src={item.urlFoto} alt={item.nombre} />
                              </div>
                              <div className="card-top-text">
                                <h5>{item.nombre}</h5>
                                <span className="guide-code">{item.codigo}</span>
                                <div className="credential-hint">
                                  <Eye size={11} /> Ver credencial completa
                                </div>
                              </div>
                              <div className="eye-icon-corner">
                                <Eye size={13} />
                              </div>
                            </div>

                            <div className="card-info-row">
                              <span className={`level-tag ${item.nivel.toLowerCase()}`}>
                                {item.nivel}
                              </span>
                              <div className="date-badge">
                                <Calendar size={13} />
                                <span>
                                  {new Date(item.fecha + 'T12:00:00Z').toLocaleDateString('es-CL', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="languages-box">
                              <strong>Idiomas:</strong> {item.idiomas.join(', ')}
                            </div>
                          </div>

                          <div className="card-footer">
                            <button
                              className="btn-book-guide"
                              onClick={() => openBookingModal(item)}
                            >
                              <Calendar size={16} />
                              Reservar / Bloquear Día
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ===================== MIS RESERVAS ===================== */}
            {/* ===================== SERVICIOS AGENDADOS ===================== */}
            {activePortalTab === 'mis-reservas' && (() => {
              const query = searchBookingQuery.trim().toLowerCase();
              const bookingsActivos = myBookings.filter(b => b.estado_servicio !== 'ejecutado').filter(b => {
                if (!query) return true;
                const matchName = b.nombre.toLowerCase().includes(query);
                const matchCode = b.codigo.toLowerCase().includes(query);
                const matchService = (b.nombre_servicio || '').toLowerCase().includes(query);
                return matchName || matchCode || matchService;
              });

              return (
                <section className="portal-full-width-section">
                  <div className="tab-section-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h3>Servicios Agendados</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Reservas activas pendientes de ejecución.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="search-box-bookings" style={{ position: 'relative', minWidth: '260px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          placeholder="Buscar por guía, código o tour..."
                          value={searchBookingQuery}
                          onChange={(e) => setSearchBookingQuery(e.target.value)}
                          style={{
                            padding: '8px 12px 8px 36px',
                            border: '1.5px solid #d4e4e0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                            background: '#f8faf9',
                            fontFamily: 'inherit'
                          }}
                        />
                        {searchBookingQuery && (
                          <button
                            onClick={() => setSearchBookingQuery('')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button className="btn-portal-refresh" onClick={fetchPortalData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        <RefreshCw size={15} />
                        <span>Actualizar</span>
                      </button>
                    </div>
                  </div>

                  {bookingsActivos.length === 0 ? (
                    <div className="portal-empty-state" style={{ margin: '1rem 0', padding: '2rem' }}>
                      <div className="empty-icon">
                        <Calendar size={24} />
                      </div>
                      <h4>No tienes servicios agendados</h4>
                      <p>Busca en el catálogo de guías disponibles para reservar fechas de servicio.</p>
                    </div>
                  ) : (
                    <div className="booking-table-wrapper">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Guía</th>
                            <th>Código</th>
                            <th>Nivel</th>
                            <th>Fecha Reservada</th>
                            <th>Tour / Destino</th>
                            <th>Estado</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingsActivos.map(item => (
                            <tr key={item.id}>
                              <td>
                                <div
                                  className="table-guide-cell"
                                  onClick={() => setSelectedGuideForCredential(item)}
                                  title="Ver credencial del guía"
                                >
                                  <img
                                    src={item.urlFoto}
                                    alt={item.nombre}
                                    className="table-guide-avatar"
                                  />
                                  <span className="table-guide-name">{item.nombre}</span>
                                  <Eye size={14} style={{ color: 'var(--portal-primary)', flexShrink: 0 }} />
                                </div>
                              </td>
                              <td>
                                <span className="guide-code" style={{ fontSize: '0.8rem' }}>
                                  {item.codigo}
                                </span>
                              </td>
                              <td>
                                <span className={`level-tag ${item.nivel.toLowerCase()}`}>
                                  {item.nivel}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700 }}>
                                  <Calendar size={14} color="#ef4444" />
                                  {new Date(item.fecha + 'T12:00:00Z').toLocaleDateString('es-CL', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'long',
                                  })}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.85rem', color: item.nombre_servicio ? '#334155' : '#94a3b8', fontStyle: item.nombre_servicio ? 'normal' : 'italic' }}>
                                  {item.nombre_servicio || 'Sin especificar'}
                                </span>
                              </td>
                              <td>
                                <span className="badge-confirmed">
                                  <CheckCircle2 size={12} />
                                  Confirmado
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleCancelBooking(item.id, item.nombre, item.fecha)}
                                  disabled={loading}
                                  title="Cancelar esta reserva"
                                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', whiteSpace: 'nowrap' }}
                                >
                                  <Trash2 size={13} />
                                  Cancelar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ===================== SERVICIOS EJECUTADOS ===================== */}
            {activePortalTab === 'ejecutados' && (() => {
              const query = searchBookingQuery.trim().toLowerCase();
              const bookingsEjecutados = myBookings.filter(b => b.estado_servicio === 'ejecutado').filter(b => {
                if (!query) return true;
                const matchName = b.nombre.toLowerCase().includes(query);
                const matchCode = b.codigo.toLowerCase().includes(query);
                const matchService = (b.nombre_servicio || '').toLowerCase().includes(query);
                return matchName || matchCode || matchService;
              });

              return (
                <section className="portal-full-width-section">
                  <div className="tab-section-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h3>Servicios Ejecutados</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Evalúa los servicios completados con nuestros guías.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="search-box-bookings" style={{ position: 'relative', minWidth: '260px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          placeholder="Buscar por guía, código o tour..."
                          value={searchBookingQuery}
                          onChange={(e) => setSearchBookingQuery(e.target.value)}
                          style={{
                            padding: '8px 12px 8px 36px',
                            border: '1.5px solid #d4e4e0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                            background: '#f8faf9',
                            fontFamily: 'inherit'
                          }}
                        />
                        {searchBookingQuery && (
                          <button
                            onClick={() => setSearchBookingQuery('')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button className="btn-portal-refresh" onClick={fetchPortalData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        <RefreshCw size={15} />
                        <span>Actualizar</span>
                      </button>
                    </div>
                  </div>

                  {bookingsEjecutados.length === 0 ? (
                    <div className="portal-empty-state" style={{ margin: '1rem 0', padding: '2rem' }}>
                      <div className="empty-icon" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                        <CheckCircle2 size={24} />
                      </div>
                      <h4>No hay servicios ejecutados registrados</h4>
                      <p>Los servicios marcados como "ejecutados" por el administrador aparecerán aquí para su evaluación.</p>
                    </div>
                  ) : (
                    <div className="executed-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                      {bookingsEjecutados.map(item => {
                        const evalExistente = evaluaciones.find(e => e.disponibilidad_id === item.id);
                        const userRating = evalForm[item.id]?.estrellas || 0;
                        const userComment = evalForm[item.id]?.comentario || '';

                        return (
                          <div key={item.id} className="executed-service-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={14} color="var(--portal-primary)" />
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>
                                  {new Date(item.fecha + 'T12:00:00Z').toLocaleDateString('es-CL', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                {item.nombre_servicio && (
                                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '4px' }}>
                                    — {item.nombre_servicio}
                                  </span>
                                )}
                              </div>
                              <span className="status-badge" style={{ fontSize: '0.75rem', textTransform: 'uppercase', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                                Ejecutado ✓
                              </span>
                            </div>

                            <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                onClick={() => setSelectedGuideForCredential(item)}
                                title="Ver credencial del guía"
                              >
                                <img
                                  src={item.urlFoto}
                                  alt={item.nombre}
                                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--portal-primary)' }}
                                />
                                <div>
                                  <h5 style={{ margin: 0, fontSize: '1rem', color: 'var(--portal-dark)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {item.nombre}
                                    <Eye size={14} style={{ color: 'var(--portal-primary)' }} />
                                  </h5>
                                  <span className="guide-code" style={{ fontSize: '0.75rem' }}>{item.codigo}</span>
                                </div>
                              </div>

                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                {evalExistente ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Tu calificación:</span>
                                      <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <Star key={star} size={14} fill={star <= evalExistente.estrellas ? '#fbbf24' : 'none'} stroke={star <= evalExistente.estrellas ? '#fbbf24' : '#cbd5e1'} />
                                        ))}
                                      </div>
                                    </div>
                                    {evalExistente.comentario && (
                                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', lineBreak: 'anywhere' }}>
                                        "{evalExistente.comentario}"
                                      </p>
                                    )}
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', display: 'block', marginTop: '0.2rem' }}>
                                      Evaluado el {new Date(evalExistente.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Evaluar Servicio:
                                      </label>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        {[1, 2, 3, 4, 5].map(star => {
                                          const active = star <= userRating;
                                          return (
                                            <Star
                                              key={star}
                                              size={24}
                                              onClick={() => handleStarClick(item.id, star)}
                                              fill={active ? '#fbbf24' : 'none'}
                                              stroke={active ? '#fbbf24' : '#cbd5e1'}
                                              style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                              className="star-interactive"
                                              title={`Calificar con ${star} estrellas`}
                                            />
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div>
                                      <textarea
                                        value={userComment}
                                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                        placeholder="Escribe un comentario interno sobre el servicio del guía (opcional)..."
                                        style={{ width: '100%', minHeight: '80px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleSubmitEvaluation(item.id, item.guia_id, item.tipo_guia, userRating, userComment)}
                                      disabled={userRating === 0 || loading}
                                      style={{ width: '100%', padding: '10px', background: userRating > 0 ? 'var(--portal-primary)' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', cursor: userRating > 0 ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}
                                    >
                                      Enviar Calificación
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ===================== MENSAJES / CHAT ===================== */}
            {activePortalTab === 'mensajes' && (
              <section className="portal-full-width-section">
                <div className="tab-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3>Mensajes con Guías</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Comunicación directa con guías y el equipo Guía a la Carta.</p>
                  </div>
                  <button onClick={loadChats} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    <RefreshCw size={15} />
                    Actualizar
                  </button>
                </div>

                {chats.length === 0 ? (
                  <div className="portal-empty-state" style={{ margin: '1rem 0', padding: '2.5rem' }}>
                    <div className="empty-icon"><MessageCircle size={28} /></div>
                    <h4>Sin chats activos</h4>
                    <p>Los chats se crean automáticamente al reservar un guía.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {chats.map(chat => {
                      const unread = unreadCounts[chat.id] || 0;
                      const isActive = activeChatId === chat.id;
                      return (
                        <div
                          key={chat.id}
                          style={{
                            background: isActive ? '#f0fdf4' : 'white',
                            border: isActive ? '2px solid var(--portal-primary)' : '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '1rem 1.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 4px 16px rgba(14,91,76,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                          onClick={() => setActiveChatId(isActive ? null : chat.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0E5B4C, #1a7a68)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1rem', flexShrink: 0 }}>
                                {(chat.guia_nombre || 'G')[0].toUpperCase()}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{chat.guia_nombre}</p>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {chat.nombre_servicio || 'Sin tour especificado'}
                                  {chat.fecha_servicio && ` · ${new Date(chat.fecha_servicio + 'T12:00:00Z').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}`}
                                </span>
                              </div>
                            </div>
                            {unread > 0 && (
                              <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', flexShrink: 0 }}>
                                {unread}
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              Chat creado: {new Date(chat.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: isActive ? 'var(--portal-primary)' : '#64748b' }}>
                              {isActive ? '▲ Ocultar chat' : '💬 Abrir chat'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Panel de chat activo */}
                {activeChatId && (
                  <div style={{ marginTop: '1.5rem', maxWidth: '680px', margin: '1.5rem auto 0' }}>
                    {(() => {
                      const chat = chats.find(c => c.id === activeChatId);
                      if (!chat) return null;
                      return (
                        <ChatWindow
                          chatId={activeChatId}
                          autorTipo="empresa"
                          autorNombre={empresa.nombre_empresa}
                          titulo={`Chat con ${chat.guia_nombre}`}
                          subtitulo={[chat.nombre_servicio, chat.fecha_servicio && new Date(chat.fecha_servicio + 'T12:00:00Z').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })].filter(Boolean).join(' · ')}
                          onClose={() => { setActiveChatId(null); loadChats(); }}
                        />
                      );
                    })()}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      )}

      {/* ===================== MODAL CREDENCIAL ===================== */}
      {selectedGuideForCredential && (
        <GuideCredential
          guia={mapToCredentialFormat(selectedGuideForCredential)}
          onClose={() => setSelectedGuideForCredential(null)}
        />
      )}
    </div>
  );
};

export default ClientesPortal;
