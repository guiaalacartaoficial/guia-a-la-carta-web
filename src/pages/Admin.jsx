import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Users, FileText, Calendar, CheckCircle, XCircle, 
  Clock, ExternalLink, Eye, Trash2, Check, ArrowLeft,
  Mail, Phone, MapPin, Globe, Award
} from 'lucide-react';
import './Admin.css';

import GuideCredential from '../components/GuideCredential';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('reservas');
  const [selectedItem, setSelectedItem] = useState(null); 
  
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [reservas, setReservas] = useState([]);
  const [postulacionesGuias, setPostulacionesGuias] = useState([]);
  const [postulacionesEstudiantes, setPostulacionesEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData } = await supabase.from('reservas').select('*').order('created_at', { ascending: false });
      const { data: guiasData } = await supabase.from('postulaciones_guias').select('*').order('created_at', { ascending: false });
      const { data: estData } = await supabase.from('postulaciones_estudiantes').select('*').order('created_at', { ascending: false });
      
      setReservas(resData || []);
      setPostulacionesGuias(guiasData || []);
      setPostulacionesEstudiantes(estData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      alert('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const handleApprove = async (table, item) => {
    try {
      const { error } = await supabase.from(table).update({ estado: 'aprobado' }).eq('id', item.id);
      if (error) throw error;
      
      const subject = encodeURIComponent('¡Felicidades! Tu perfil en Guía a la Carta ha sido aprobado');
      const body = encodeURIComponent(`Hola ${item.nombres},\n\nTenemos el agrado de informarte que tu perfil ha superado nuestro proceso de revisión y acaba de ser publicado oficialmente en el directorio de Guía a la Carta.\n\nYa puedes ver tu credencial profesional en nuestra página web.\n\nSaludos cordiales,\nEquipo de Operaciones\nGuía a la Carta`);
      window.location.href = `mailto:${item.email}?subject=${subject}&body=${body}`;

      alert('Estado actualizado a aprobado');
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar');
    }
  };

  const handleApproveReserva = async (item) => {
    try {
      const { error } = await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', item.id);
      if (error) throw error;
      
      const subject = encodeURIComponent(`Confirmación de Reserva de Guía B2B - ${item.destino}`);
      const body = encodeURIComponent(`Hola ${item.contacto_nombre},\n\nTenemos el agrado de confirmarte que tu solicitud de reserva para el destino ${item.destino} ha sido aprobada.\n\nNos pondremos en contacto contigo a la brevedad para coordinar los detalles operativos y asignación final del profesional.\n\nSaludos cordiales,\nEquipo de Operaciones\nGuía a la Carta`);
      window.location.href = `mailto:${item.email}?subject=${subject}&body=${body}`;

      alert('Reserva confirmada');
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al confirmar reserva');
    }
  };

  const initiateRejection = (table, item) => {
    setRejectingItem({ table, id: item.id, email: item.email, nombres: item.nombres });
    setRejectionReason('');
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Por favor, ingresa el motivo del rechazo.");
      return;
    }
    try {
      const { error } = await supabase.from(rejectingItem.table).update({ estado: 'rechazado' }).eq('id', rejectingItem.id);
      if (error) throw error;

      const subject = encodeURIComponent(rejectingItem.table === 'reservas' ? 'Actualización sobre tu solicitud de Reserva B2B' : 'Actualización sobre tu postulación en Guía a la Carta');
      const body = encodeURIComponent(`Hola ${rejectingItem.nombres || rejectingItem.contacto_nombre},\n\nGracias por confiar en Guía a la Carta.\n\nLamentablemente, en esta ocasión no hemos podido aprobar tu solicitud debido a la siguiente razón:\n\n${rejectionReason}\n\nSi necesitas más información o quieres plantear una alternativa, no dudes en contactarnos.\n\nSaludos cordiales,\nEquipo de Operaciones\nGuía a la Carta`);
      window.location.href = `mailto:${rejectingItem.email}?subject=${subject}&body=${body}`;

      alert('Perfil rechazado exitosamente');
      fetchData();
      setSelectedItem(null);
      setRejectingItem(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar');
    }
  };

  const updateStatus = async (table, id, newStatus) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ estado: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      alert(`Estado actualizado a ${newStatus}`);
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (table, id) => {
    if (!window.confirm("¿Estás súper seguro de que quieres eliminar esto permanentemente? Se borrará de la base de datos.")) {
      return;
    }
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      alert("Registro eliminado exitosamente.");
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al eliminar. Revisa los permisos RLS en Supabase.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container" style={{ padding: '4rem', textAlign: 'center', height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Acceso Privado - Guía a la Carta</h2>
        <p style={{color:'#666', marginTop:'0.5rem'}}>Ingresa con tu cuenta corporativa</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', marginTop: '2rem' }}>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="form-control"
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="form-control"
            required
          />
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
        </form>
      </div>
    );
  }

  // VISTA DETALLADA
  if (selectedItem) {
    const item = selectedItem.data;
    const type = selectedItem.type;

    if (type === 'reserva') {
      return (
        <div className="admin-detail-view container" style={{ padding: '4rem 0' }}>
          <button onClick={() => setSelectedItem(null)} className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '2rem', color: 'var(--c-primary)' }}>
            <ArrowLeft size={20} /> Volver al listado
          </button>
          
          <div className="detail-card" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '3rem', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--c-primary)', letterSpacing: '1px' }}>
                  Reserva Corporativa B2B
                </span>
                <h1 style={{ margin: '0.5rem 0' }}>{item.empresa}</h1>
                <p style={{ color: '#666' }}><Clock size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Solicitud recibida: {new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div className={`status-badge ${item.estado}`} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: item.estado === 'nueva' ? '#DBEAFE' : item.estado === 'confirmada' ? '#D1FAE5' : '#FEE2E2', color: item.estado === 'nueva' ? '#1E40AF' : item.estado === 'confirmada' ? '#065F46' : '#991B1B', fontWeight: 'bold' }}>
                {item.estado.toUpperCase()}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#334155' }}>Información del Cliente</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <p><strong>Contacto:</strong> {item.contacto_nombre}</p>
                  <p><strong>Email:</strong> {item.email}</p>
                  <p><strong>Teléfono:</strong> {item.telefono}</p>
                </div>
              </section>

              <section style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#334155' }}>Detalles del Servicio</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <p><strong>Fecha de Servicio:</strong> {new Date(item.fecha_servicio).toLocaleDateString()}</p>
                  <p><strong>Destino/Ruta:</strong> {item.destino}</p>
                  <p><strong>Pasajeros (Pax):</strong> {item.pax}</p>
                  <p><strong>Idioma Requerido:</strong> {item.idioma}</p>
                  <p><strong>Nivel de Guía:</strong> {item.nivel_guia}</p>
                </div>
              </section>

              <section style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#334155' }}>Comentarios Adicionales</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{item.comentarios || 'Sin comentarios adicionales.'}</p>
              </section>

              <div className="admin-actions-box" style={{ padding: '1.5rem', background: '#F8FAF6', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleApproveReserva(item)}
                  className="btn btn-primary" 
                  style={{ background: '#10B981', borderColor: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Check size={18} /> Confirmar y Notificar
                </button>
                <button 
                  onClick={() => initiateRejection('reservas', item)}
                  className="btn btn-outline" 
                  style={{ color: '#EF4444', borderColor: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <XCircle size={18} /> Rechazar y Explicar
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Adaptar datos para el componente GuideCredential
    const guiaPreview = {
      nombre: `${item.nombres} ${item.apellidos}`,
      edad: item.edad,
      codigo: type === 'guia' ? `PRO:${item.id.substring(0,5).toUpperCase()}` : `EST:${item.id.substring(0,5).toUpperCase()}`,
      idiomas: item.idiomas ? item.idiomas.map(i => i.idioma) : [],
      imagen: item.url_foto || '/placeholder-user.png',
      biografia: item.biografia,
      formacion: item.educacion ? item.educacion.split('\n') : [],
      experiencia: item.rutas_experiencia ? item.rutas_experiencia.split('\n') : (item.experiencia_terreno ? item.experiencia_terreno.split('\n') : []),
      certificaciones: item.url_sernatur ? ['SERNATUR'] : []
    };

    return (
      <div className="admin-detail-view container" style={{ padding: '4rem 0' }}>
        <button onClick={() => setSelectedItem(null)} className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '2rem', color: 'var(--c-primary)' }}>
          <ArrowLeft size={20} /> Volver al listado
        </button>

        <div className="detail-card" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '3rem', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--c-primary)', letterSpacing: '1px' }}>
                Postulación {type === 'guia' ? 'Guía Profesional' : 'Estudiante'}
              </span>
              <h1 style={{ margin: '0.5rem 0' }}>{item.nombres} {item.apellidos}</h1>
              <p style={{ color: '#666' }}><Clock size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Recibida el: {new Date(item.created_at).toLocaleString()}</p>
            </div>
            <div className={`status-badge ${item.estado}`} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: item.estado === 'pendiente' ? '#FEF3C7' : item.estado === 'aprobado' ? '#D1FAE5' : '#FEE2E2', color: item.estado === 'pendiente' ? '#92400E' : item.estado === 'aprobado' ? '#065F46' : '#991B1B', fontWeight: 'bold' }}>
              {item.estado.toUpperCase()}
            </div>
          </div>

          <div className="detail-vertical-layout" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* 1. Información Textual (Arriba) */}
            <div className="detail-info-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#334155' }}>Datos de Contacto</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p><strong>Email:</strong> {item.email}</p>
                  <p><strong>Teléfono:</strong> {item.telefono}</p>
                  <p><strong>Residencia:</strong> {item.ciudad_residencia}</p>
                  {type === 'guia' && <p><strong>Habilitado SII:</strong> {item.habilitado_sii?.toUpperCase()}</p>}
                </div>
              </div>
              <div>
                <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#334155' }}>Resumen Perfil</h3>
                <p><strong>Biografía:</strong> <span style={{ color: '#444' }}>{item.biografia || 'Sin biografía.'}</span></p>
                <p style={{ marginTop: '0.5rem' }}><strong>Educación:</strong> <span style={{ color: '#444' }}>{item.educacion}</span></p>
              </div>
            </div>

            {/* 2. Previsualización de Credencial (Centro) */}
            <div className="detail-preview-credential" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--c-primary-dark)' }}>Previsualización de Credencial Oficial</h3>
              <div style={{ width: '100%', maxWidth: '350px' }}>
                <GuideCredential guia={guiaPreview} isExample={true} />
              </div>
            </div>

            {/* 3. Documentación y Acciones (Abajo) */}
            <div className="detail-documents-actions" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Documentación Adjunta</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  
                  {/* Foto Section */}
                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>📸 Foto de Perfil</p>
                    {item.url_foto ? (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                         <img src={item.url_foto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No adjuntada</span>}
                  </div>

                  {/* CV Section */}
                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>📄 Currículum Vitae</p>
                    {item.url_cv ? (
                      <a href={item.url_cv} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} /> Abrir PDF
                      </a>
                    ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No adjuntado</span>}
                  </div>

                  {/* SERNATUR Section */}
                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>🏷️ Registro SERNATUR</p>
                    {item.url_sernatur ? (
                      <a href={item.url_sernatur} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={16} /> Ver PDF
                      </a>
                    ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No adjuntado</span>}
                  </div>

                  {/* 1ros Auxilios Section */}
                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>🩺 Primeros Auxilios</p>
                    {item.url_primeros_auxilios ? (
                      <a href={item.url_primeros_auxilios} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} /> Ver PDF
                      </a>
                    ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No adjuntado</span>}
                  </div>

                </div>
              </div>

              <div className="admin-actions-box" style={{ padding: '1.5rem', background: '#F8FAF6', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleApprove(type === 'guia' ? 'postulaciones_guias' : 'postulaciones_estudiantes', item)}
                  className="btn btn-primary" 
                  style={{ background: '#10B981', borderColor: '#10B981', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                >
                  <Check size={18} /> Aprobar y Notificar
                </button>
                <button 
                  onClick={() => initiateRejection(type === 'guia' ? 'postulaciones_guias' : 'postulaciones_estudiantes', item)}
                  className="btn btn-outline" 
                  style={{ color: '#EF4444', borderColor: '#EF4444', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                >
                  <XCircle size={18} /> Rechazar y Explicar
                </button>
                <div style={{ flexBasis: '100%', height: '0' }}></div>
                <button 
                  onClick={() => handleDelete(type === 'guia' ? 'postulaciones_guias' : 'postulaciones_estudiantes', item.id)}
                  className="btn btn-outline" 
                  style={{ color: '#64748b', borderColor: '#cbd5e1', padding: '0.6rem 1.5rem', fontSize: '1rem', background: 'transparent' }}
                  title="Dar de baja / Eliminar de la base de datos permanentemente"
                >
                  <Trash2 size={16} /> Eliminar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Rechazo */}
        {rejectingItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
              <h3 style={{ color: '#EF4444', marginBottom: '1rem' }}>Rechazar Solicitud</h3>
              <p style={{ marginBottom: '1rem', color: '#475569' }}>Por favor, escribe el motivo del rechazo. Esto se incluirá automáticamente en el correo que se generará para el destinatario.</p>
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: El certificado de primeros auxilios no está adjunto o está vencido."
                style={{ width: '100%', height: '120px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontFamily: 'inherit' }}
              ></textarea>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setRejectingItem(null)} className="btn btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444', background: 'transparent' }}>Cancelar</button>
                <button onClick={confirmRejection} className="btn btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444' }}>Confirmar Rechazo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-dashboard container" style={{ padding: '4rem 0' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ color: 'var(--c-primary-dark)', fontSize: '2.5rem' }}>Panel de Control Operativo</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Gestiona las reservas y valida nuevos profesionales para la red.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> Actualizar Datos
          </button>
        </div>
      </div>

      <div className="admin-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#E0F2FE', color: '#0369A1', padding: '1rem', borderRadius: '10px' }}><Calendar size={24}/></div>
          <div><h4 style={{ margin: 0, color: '#666' }}>Reservas Nuevas</h4><p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{reservas.filter(r => r.estado === 'nueva').length}</p></div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#F3E8FF', color: '#7E22CE', padding: '1rem', borderRadius: '10px' }}><Users size={24}/></div>
          <div><h4 style={{ margin: 0, color: '#666' }}>Guías Pendientes</h4><p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{postulacionesGuias.filter(g => g.estado === 'pendiente').length}</p></div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ECFDF5', color: '#047857', padding: '1rem', borderRadius: '10px' }}><Award size={24}/></div>
          <div><h4 style={{ margin: 0, color: '#666' }}>Estudiantes</h4><p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{postulacionesEstudiantes.filter(e => e.estado === 'pendiente').length}</p></div>
        </div>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '10px', width: 'fit-content' }}>
        <button 
          className={`tab-btn ${activeTab === 'reservas' ? 'active' : ''}`} 
          onClick={() => setActiveTab('reservas')}
          style={{ padding: '0.6rem 1.5rem', border: 'none', background: activeTab === 'reservas' ? 'white' : 'transparent', color: activeTab === 'reservas' ? 'var(--c-primary)' : '#64748b', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'reservas' ? 'bold' : '500', boxShadow: activeTab === 'reservas' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          Reservas B2B
        </button>
        <button 
          className={`tab-btn ${activeTab === 'guias' ? 'active' : ''}`} 
          onClick={() => setActiveTab('guias')}
          style={{ padding: '0.6rem 1.5rem', border: 'none', background: activeTab === 'guias' ? 'white' : 'transparent', color: activeTab === 'guias' ? 'var(--c-primary)' : '#64748b', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'guias' ? 'bold' : '500', boxShadow: activeTab === 'guias' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          Postulaciones Guías
        </button>
        <button 
          className={`tab-btn ${activeTab === 'estudiantes' ? 'active' : ''}`} 
          onClick={() => setActiveTab('estudiantes')}
          style={{ padding: '0.6rem 1.5rem', border: 'none', background: activeTab === 'estudiantes' ? 'white' : 'transparent', color: activeTab === 'estudiantes' ? 'var(--c-primary)' : '#64748b', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'estudiantes' ? 'bold' : '500', boxShadow: activeTab === 'estudiantes' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          Estudiantes
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '4rem' }}><Clock className="spin" /> <p>Cargando datos operativos...</p></div> : (
        <div className="admin-content-table" style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {activeTab === 'reservas' && (
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <tr>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Empresa / Contacto</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Fecha Servicio</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Destino / Pax</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(res => (
                  <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{res.empresa}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{res.contacto_nombre} • {res.email}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {new Date(res.fecha_servicio).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#475569' }}>
                      <div style={{ fontWeight: '500' }}>{res.destino}</div>
                      <div style={{ fontSize: '0.85rem' }}>{res.pax} Pasajeros • {res.idioma}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '20px', background: res.estado === 'nueva' ? '#DBEAFE' : '#D1FAE5', color: res.estado === 'nueva' ? '#1E40AF' : '#065F46', fontWeight: 'bold' }}>
                        {res.estado.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <button className="btn-icon" title="Ver detalles" onClick={() => setSelectedItem({ type: 'reserva', data: res })} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }}><Eye size={20}/></button>
                    </td>
                  </tr>
                ))}
                {reservas.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay reservas en el sistema.</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'guias' && (
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <tr>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Postulante</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Ubicación</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Documentos</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {postulacionesGuias.map(guia => (
                  <tr key={guia.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                          <img src={guia.url_foto || '/placeholder-user.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{guia.nombres} {guia.apellidos}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{guia.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#475569' }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }}/> {guia.ciudad_residencia}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {guia.url_cv && <FileText size={18} color="#64748b" />}
                        {guia.url_sernatur && <Award size={18} color="#64748b" />}
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '20px', background: guia.estado === 'pendiente' ? '#FEF3C7' : '#D1FAE5', color: guia.estado === 'pendiente' ? '#92400E' : '#065F46', fontWeight: 'bold' }}>
                        {guia.estado.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setSelectedItem({ type: 'guia', data: guia })} className="btn btn-outline btn-sm" style={{ padding: '0.4rem 1rem', color: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}>Revisar Perfil</button>
                        <button onClick={() => handleDelete('postulaciones_guias', guia.id)} className="btn btn-outline btn-sm" style={{ padding: '0.4rem', color: '#EF4444', borderColor: '#EF4444' }} title="Eliminar Perfil"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {postulacionesGuias.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay postulaciones pendientes.</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'estudiantes' && (
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <tr>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Estudiante</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Institución / Carrera</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {postulacionesEstudiantes.map(est => (
                  <tr key={est.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{est.nombres} {est.apellidos}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{est.email}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#475569' }}>
                      <div style={{ fontWeight: '500' }}>{est.educacion}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '20px', background: est.estado === 'pendiente' ? '#FEF3C7' : '#D1FAE5', color: est.estado === 'pendiente' ? '#92400E' : '#065F46', fontWeight: 'bold' }}>
                        {est.estado.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setSelectedItem({ type: 'estudiante', data: est })} className="btn btn-outline btn-sm" style={{ padding: '0.4rem 1rem', color: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}>Revisar Perfil</button>
                        <button onClick={() => handleDelete('postulaciones_estudiantes', est.id)} className="btn btn-outline btn-sm" style={{ padding: '0.4rem', color: '#EF4444', borderColor: '#EF4444' }} title="Eliminar Perfil"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {postulacionesEstudiantes.length === 0 && <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay estudiantes registrados.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
