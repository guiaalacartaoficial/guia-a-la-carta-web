import React, { useState, useEffect } from 'react';
import { supabase, getOptimizedImageUrl } from '../services/supabase';
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, Lock, LogOut } from 'lucide-react';
import ToastContainer, { useToast } from '../components/Toast';
import emailjs from '@emailjs/browser';
import './Disponibilidad.css';

const Disponibilidad = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  // Login Form State
  const [codigo, setCodigo] = useState('');
  const [pin, setPin] = useState('');

  // Logged In Guide Data
  const [guideData, setGuideData] = useState(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [savedDates, setSavedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]); // Fechas reservadas por empresa

  // Guardar disponibilidad con lógica de sincronización
  const handleSaveAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const hoy = new Date().toISOString().slice(0, 10);

      // 1. Auto-limpieza: eliminar fechas pasadas LIBRES de este guía
      await supabase
        .from('disponibilidad_guias')
        .delete()
        .eq('guia_id', guideData.original_id)
        .lt('fecha', hoy)
        .eq('estado_bloqueo', 'libre');

      // 2. Fechas que se deben ELIMINAR (estaban guardadas pero el guía las deseleccionó)
      const fechasAEliminar = savedDates.filter(f => !selectedDates.includes(f));
      if (fechasAEliminar.length > 0) {
        await supabase
          .from('disponibilidad_guias')
          .delete()
          .eq('guia_id', guideData.original_id)
          .in('fecha', fechasAEliminar)
          .eq('estado_bloqueo', 'libre'); // solo eliminar libres, no reservadas
      }

      // 3. Fechas NUEVAS que se deben insertar
      const fechasNuevas = selectedDates.filter(f => !savedDates.includes(f));
      if (fechasNuevas.length > 0) {
        const insertData = fechasNuevas.map(date => ({
          guia_id: guideData.original_id,
          tipo_guia: guideData.tipo,
          fecha: date,
          estado: 'disponible'
        }));

        const { error: dbError } = await supabase
          .from('disponibilidad_guias')
          .upsert(insertData, { onConflict: 'guia_id, fecha' });

        if (dbError) {
          console.warn('Error al guardar disponibilidad:', dbError);
        }
      }

      // Calcular resumen de cambios
      const agregadas = fechasNuevas.length;
      const eliminadas = fechasAEliminar.length;
      let mensaje = '¡Disponibilidad actualizada con éxito!';
      if (agregadas > 0 && eliminadas > 0) {
        mensaje = `¡Listo! Se agregaron ${agregadas} día(s) y se removieron ${eliminadas} día(s).`;
      } else if (agregadas > 0) {
        mensaje = `¡Listo! Se agregaron ${agregadas} día(s) disponibles.`;
      } else if (eliminadas > 0) {
        mensaje = `¡Listo! Se removieron ${eliminadas} día(s) de tu disponibilidad.`;
      }

      addToast(mensaje, 'success');
      setStep(1);
      setGuideData(null);
      setCodigo('');
      setPin('');
      setSelectedDates([]);
      setSavedDates([]);
      setBlockedDates([]);

    } catch (err) {
      console.error(err);
      setError('Hubo un problema al guardar la disponibilidad.');
      addToast('Hubo un problema al guardar. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Recovery Mode State
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRequestPassword = async (e) => {
    if (e) e.preventDefault();
    const searchCode = codigo.trim().toUpperCase();
    if (!searchCode) {
      setError('Por favor, ingresa tu Código de Credencial antes de solicitar la contraseña.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { data: pros, error: errPros } = await supabase.from('postulaciones_guias').select('*').eq('estado', 'aprobado');
      const { data: ests, error: errEsts } = await supabase.from('postulaciones_estudiantes').select('*').eq('estado', 'aprobado');

      if (errPros || errEsts) {
        throw new Error('Error al consultar la base de datos.');
      }

      let match = null;
      let tipo = '';
      let table = '';

      for (const p of (pros || [])) {
        const expectedCode = `PRO:${String(p.id).substring(0, 5).toUpperCase()}`;
        if (expectedCode === searchCode) {
          match = p;
          tipo = 'guia';
          table = 'postulaciones_guias';
          break;
        }
      }

      if (!match) {
        for (const est of (ests || [])) {
          const expectedCode = `EST:${String(est.id).substring(0, 5).toUpperCase()}`;
          if (expectedCode === searchCode) {
            match = est;
            tipo = 'estudiante';
            table = 'postulaciones_estudiantes';
            break;
          }
        }
      }

      if (!match) {
        setError('No encontramos un guía o estudiante aprobado con ese código de credencial.');
        setLoading(false);
        return;
      }

      let password = match.password;
      if (!password) {
        password = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error: updErr } = await supabase.from(table).update({ password }).eq('id', match.id);
        if (updErr) throw updErr;
      }

      const linkAcceso = 'https://www.guiaalacarta.cl/disponibilidad';

      await emailjs.send(
        'service_ihvjiza',
        'template_credenciales',
        {
          name: `${match.nombres || ''} ${match.apellidos || ''}`.trim(),
          email: match.email,
          message: `Hola ${match.nombres || ''},\n\nHas solicitado recordar tus credenciales de acceso para registrar y actualizar tu disponibilidad en la página web:\n\n- Usuario (Código): ${searchCode}\n- Contraseña: ${password}\n\nIngresa aquí para actualizar tu disponibilidad:\n${linkAcceso}\n\n¡Mucho éxito!\nEquipo Guía a la Carta`
        },
        '_nmx76wxhMLgNa1ic'
      );

      const emailText = match.email || '';
      const parts = emailText.split('@');
      let maskedEmail = emailText;
      if (parts.length === 2) {
        const first = parts[0];
        const maskedFirst = first.length > 2 ? first.substring(0, 2) + '*'.repeat(first.length - 2) : first + '*';
        maskedEmail = `${maskedFirst}@${parts[1]}`;
      }

      addToast(`Contraseña enviada con éxito al correo registrado (${maskedEmail}).`, 'success');
      setIsRecovering(false);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al intentar enviar la contraseña. Intenta nuevamente o contacta al administrador.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: pros, error: errPros } = await supabase.from('postulaciones_guias').select('*').eq('estado', 'aprobado');
      const { data: ests, error: errEsts } = await supabase.from('postulaciones_estudiantes').select('*').eq('estado', 'aprobado');

      if (errPros || errEsts) {
        throw new Error('Error al consultar la base de datos.');
      }

      let match = null;
      let tipo = '';
      const searchCode = codigo.trim().toUpperCase();
      const searchPin = pin.trim();

      for (const p of (pros || [])) {
        const expectedCode = `PRO:${String(p.id).substring(0, 5).toUpperCase()}`;
        if (expectedCode === searchCode) {
          if (!p.password) {
            setError('Tu perfil no tiene una contraseña registrada. Por favor, contacta al administrador para que te genere y envíe tus credenciales.');
            setLoading(false);
            return;
          }
          if (searchPin !== p.password.trim()) {
            setError('La contraseña ingresada no es correcta.');
            setLoading(false);
            return;
          }
          match = p;
          tipo = 'guia';
          break;
        }
      }

      if (!match && !error) {
        for (const est of (ests || [])) {
          const expectedCode = `EST:${String(est.id).substring(0, 5).toUpperCase()}`;
          if (expectedCode === searchCode) {
            if (!est.password) {
              setError('Tu perfil no tiene una contraseña registrada. Por favor, contacta al administrador para que te genere y envíe tus credenciales.');
              setLoading(false);
              return;
            }
            if (searchPin !== est.password.trim()) {
              setError('La contraseña ingresada no es correcta.');
              setLoading(false);
              return;
            }
            match = est;
            tipo = 'estudiante';
            break;
          }
        }
      }

      if (match) {
        setGuideData({
          ...match,
          tipo,
          codigo: searchCode,
          original_id: match.id,
          nombre_mostrar: String(match.nombres || match.nombre || 'Guía')
        });

        const hoy = new Date().toISOString().slice(0, 10);

        // Cargar TODAS las fechas futuras de este guía
        const { data: todasLasFechas } = await supabase
          .from('disponibilidad_guias')
          .select('fecha, estado_bloqueo')
          .eq('guia_id', match.id)
          .gte('fecha', hoy)
          .order('fecha', { ascending: true });

        const libres = (todasLasFechas || [])
          .filter(f => f.estado_bloqueo !== 'bloqueado')
          .map(f => f.fecha);

        const bloqueadas = (todasLasFechas || [])
          .filter(f => f.estado_bloqueo === 'bloqueado')
          .map(f => f.fecha);

        setSelectedDates(libres);
        setSavedDates(libres);
        setBlockedDates(bloqueadas);
        setStep(2);
      } else if (!error) {
        setError('No encontramos un guía aprobado con esos datos. Verifica tu código y PIN.');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // --- Calendar Logic ---
  const toggleDate = (dateStr) => {
    if (blockedDates.includes(dateStr)) return; // no editable
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    if (
      targetDate.getFullYear() > today.getFullYear() ||
      (targetDate.getFullYear() === today.getFullYear() && targetDate.getMonth() >= today.getMonth())
    ) {
      setCurrentDate(targetDate);
    }
  };

  const hasChanges = () => {
    if (selectedDates.length !== savedDates.length) return true;
    const sorted1 = [...selectedDates].sort();
    const sorted2 = [...savedDates].sort();
    return sorted1.some((d, i) => d !== sorted2[i]);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const isPast = dateObj < today;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = selectedDates.includes(dateStr);
      const wasSaved = savedDates.includes(dateStr);
      const isBlocked = blockedDates.includes(dateStr);

      let className = 'calendar-day';
      if (isPast) className += ' past';
      else if (isBlocked) className += ' blocked';
      else if (isSelected && wasSaved) className += ' selected saved';
      else if (isSelected && !wasSaved) className += ' selected new';
      else if (!isSelected && wasSaved) className += ' removed';

      let tooltip = '';
      if (isBlocked) tooltip = 'Reservado por un operador — no editable';
      else if (wasSaved && isSelected) tooltip = 'Ya guardado — clic para deseleccionar';
      else if (wasSaved && !isSelected) tooltip = 'Será eliminado al guardar';
      else if (isSelected) tooltip = 'Nuevo — se guardará';

      days.push(
        <div
          key={dateStr}
          className={className}
          onClick={() => !isPast && !isBlocked && toggleDate(dateStr)}
          title={tooltip}
        >
          {i}
          {isBlocked && <span className="blocked-dot" />}
        </div>
      );
    }

    return (
      <div className="custom-calendar">
        <div className="calendar-header">
          <button onClick={prevMonth} type="button"><ChevronLeft /></button>
          <h3>{monthNames[month]} {year}</h3>
          <button onClick={nextMonth} type="button"><ChevronRight /></button>
        </div>
        <div className="calendar-grid">
          {dayNames.map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="disponibilidad-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <section className="disp-hero">
        <div className="container">
          <h1>Mi Disponibilidad</h1>
          <p>Mantén tu calendario actualizado para recibir asignaciones que se ajusten a tus tiempos libres.</p>
        </div>
      </section>

      <section className="disp-content">
        <div className="disp-card">
          {step === 1 && (
            <div className="disp-step-1">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--c-primary-dark)' }}>{isRecovering ? 'Recuperar Contraseña' : 'Verificación de Guía'}</h2>
              {error && (
                <div className="disp-error">
                  <AlertCircle size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  {error}
                </div>
              )}

              <form onSubmit={isRecovering ? handleRequestPassword : handleLogin}>
                <div className="disp-form-group">
                  <label htmlFor="codigo">Código de Credencial</label>
                  <input
                    type="text"
                    id="codigo"
                    placeholder="Ej: PRO:ABCDE o EST:12345"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                  />
                </div>
                
                {!isRecovering && (
                  <div className="disp-form-group">
                    <label htmlFor="pin">
                      <Lock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                      Contraseña de Seguridad
                    </label>
                    <input
                      type="password"
                      id="pin"
                      placeholder="Ingresa tu contraseña"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>
                      Ingresa la contraseña que te fue enviada por correo electrónico al ser aprobado.
                    </small>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  {!isRecovering ? (
                    <>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '280px', padding: '0.8rem 1rem' }}
                      >
                        {loading ? 'Verificando...' : 'Acceder al Calendario'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRecovering(true)}
                        className="btn-link"
                        disabled={loading}
                        style={{ color: 'var(--c-primary-dark)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem' }}
                      >
                        Recuperar mi contraseña
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '280px', padding: '0.8rem 1rem', fontSize: '0.85rem' }}
                      >
                        {loading ? 'Enviando...' : 'Recuperar mi contraseña'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRecovering(false)}
                        className="btn-link"
                        disabled={loading}
                        style={{ color: '#64748b', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem' }}
                      >
                        Volver a iniciar sesión
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}

          {step === 2 && guideData && (
            <div className="disp-step-2">
              <div className="disp-guide-info">
                <img src={getOptimizedImageUrl(guideData.url_foto, 150, 150, 75)} alt={guideData.nombre_mostrar} />
                <div className="disp-guide-details">
                  <h4>{guideData.nombre_mostrar}</h4>
                  <p>Código: {guideData.codigo} • {guideData.tipo === 'guia' ? 'Profesional' : 'Estudiante'}</p>
                </div>
              </div>

              {savedDates.length > 0 && (
                <div className="disp-info-box">
                  <CheckCircle size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>
                    Tienes <strong>{savedDates.length} día(s)</strong> guardados.
                    {blockedDates.length > 0 && (
                      <> Además, <strong>{blockedDates.length} día(s)</strong> están reservados por un operador y no son editables.</>
                    )}
                  </span>
                </div>
              )}

              {blockedDates.length > 0 && savedDates.length === 0 && (
                <div className="disp-info-box" style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', color: '#92400e' }}>
                  <CalendarIcon size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Tienes <strong>{blockedDates.length} día(s) reservados</strong> por un operador turístico. Esas fechas están marcadas en el calendario y no pueden ser editadas.
                  </span>
                </div>
              )}

              <h3 style={{ marginBottom: '0.5rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={20} /> Selecciona tus días libres
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Haz clic en los días en que estás disponible. Los días en naranja ya están reservados y no son editables.
              </p>

              <div className="disp-legend">
                <span className="legend-item"><span className="legend-dot new"></span> Nuevo</span>
                <span className="legend-item"><span className="legend-dot saved"></span> Ya guardado</span>
                <span className="legend-item"><span className="legend-dot removed"></span> Será eliminado</span>
                <span className="legend-item"><span className="legend-dot blocked-legend"></span> Reservado</span>
              </div>

              {renderCalendar()}

              <div className="disp-actions">
                <button type="button" className="btn btn-outline" onClick={() => {
                  setStep(1);
                  setGuideData(null);
                  setCodigo('');
                  setPin('');
                  setSelectedDates([]);
                  setSavedDates([]);
                  setBlockedDates([]);
                }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAvailability}
                  disabled={loading || !hasChanges()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={18} />
                  {loading ? 'Guardando...' : hasChanges() ? `Guardar Cambios (${selectedDates.length} días)` : 'Sin cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Disponibilidad;
