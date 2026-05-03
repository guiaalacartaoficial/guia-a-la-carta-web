import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Users, FileText, Calendar, CheckCircle, XCircle, 
  Clock, ExternalLink, Eye, Trash2, Check, ArrowLeft,
  Mail, Phone, MapPin, Globe, Award, BookOpen, MessageCircle,
  ShieldCheck, Briefcase, RefreshCw, Edit, Save, X as CloseIcon
} from 'lucide-react';
import GuideCredential from '../components/GuideCredential';
import './Admin.css';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('reservas');
  const [subTab, setSubTab] = useState('guias');
  const [reservas, setReservas] = useState([]);
  const [postulacionesGuias, setPostulacionesGuias] = useState([]);
  const [postulacionesEstudiantes, setPostulacionesEstudiantes] = useState([]);
  const [relatos, setRelatos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    console.log("Fetching admin data...");
    try {
      const { data: resData } = await supabase.from('reservas').select('*').order('created_at', { ascending: false });
      const { data: guiasData } = await supabase.from('postulaciones_guias').select('*').order('created_at', { ascending: false });
      const { data: estData } = await supabase.from('postulaciones_estudiantes').select('*').order('created_at', { ascending: false });
      const { data: relatoData } = await supabase.from('relatos').select('*').order('fecha', { ascending: false });
      const { data: comData } = await supabase.from('comentarios_relatos').select('*, relatos(titulo)').order('fecha', { ascending: false });
      
      setReservas(resData || []);
      setPostulacionesGuias(guiasData || []);
      setPostulacionesEstudiantes(estData || []);
      setRelatos(relatoData || []);
      setComentarios(comData || []);
      console.log("Data fetched successfully.");
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsAuthenticated(true);
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  const updateStatus = async (table, id, newStatus) => {
    console.log(`Updating ${table} ID: ${id} to Status: ${newStatus}`);
    try {
      const { data, error } = await supabase.from(table).update({ estado: newStatus }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("El registro no se actualizó. Revisa las políticas de seguridad (RLS) en Supabase.");
      }
      fetchData();
    } catch (error) {
      console.error("Error updateStatus:", error);
      alert('Error al actualizar: ' + error.message);
    }
  };

  const handleUpdateRecord = async (table, id) => {
    setLoading(true);
    try {
      let finalData = { ...editData };

      // Si hay archivos nuevos, subirlos
      if (editData.file_cv instanceof File) {
        finalData.url_cv = await uploadFile(editData.file_cv, 'documentos', 'cvs');
        delete finalData.file_cv;
      }
      if (editData.file_foto instanceof File) {
        finalData.url_foto = await uploadFile(editData.file_foto, 'documentos', 'fotos');
        delete finalData.file_foto;
      }
      if (editData.file_sernatur instanceof File) {
        finalData.url_sernatur = await uploadFile(editData.file_sernatur, 'documentos', 'certificados');
        delete finalData.file_sernatur;
      }
      if (editData.file_wfr instanceof File) {
        finalData.url_primeros_auxilios = await uploadFile(editData.file_wfr, 'documentos', 'certificados');
        delete finalData.file_wfr;
      }
      if (editData.file_otras instanceof File) {
        finalData.url_otras_certificaciones = await uploadFile(editData.file_otras, 'documentos', 'certificados');
        delete finalData.file_otras;
      }

      // Limpiar campos que no deben ir a la DB si son objetos File que no manejamos arriba
      Object.keys(finalData).forEach(key => {
        if (finalData[key] instanceof File) delete finalData[key];
      });

      const { error } = await supabase.from(table).update(finalData).eq('id', id);
      if (error) {
        if (error.code === '42703') {
          alert("Error: Una de las columnas no existe en la base de datos. Por favor, verifica el SQL en Supabase.");
        }
        throw error;
      }
      alert("Registro actualizado correctamente");
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (table, id) => {
    if (!window.confirm('¿Eliminar permanentemente este registro?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error("Supabase Delete Error:", error);
        throw error;
      }
      alert('Registro eliminado correctamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingId(null);
  };

  const startEditing = (record) => {
    setEditingId(record.id);
    setEditData(record);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setEditData({ ...editData, [name]: files[0] });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const ActionButtons = ({ table, id, currentStatus, record }) => {
    const isReserva = table === 'reservas';

    return (
      <div className="admin-actions">
        <button onClick={() => toggleExpand(id)} className="btn-action view" title="Ver Detalles"><Eye size={16}/></button>
        <button onClick={() => startEditing(record)} className="btn-action edit" title="Editar Datos"><Edit size={16}/></button>
        
        {isReserva ? (
          <>
            <a href={`mailto:${record.email}?subject=Respuesta Solicitud Guía a la Carta&body=Hola ${record.contacto_nombre},`} className="btn-action email" title="Responder por Email" onClick={(e) => { if(!record.email) { e.preventDefault(); alert("No hay email registrado"); } }}><Mail size={16}/></a>
            <a href={`https://wa.me/${record.telefono?.replace(/\s+/g, '').replace('+', '')}`} target="_blank" rel="noreferrer" className="btn-action whatsapp" title="Contactar por WhatsApp"><MessageCircle size={16}/></a>
            <select 
              className="status-selector-mini" 
              value={currentStatus} 
              onChange={(e) => updateStatus(table, id, e.target.value)}
            >
              <option value="nueva">Nueva</option>
              <option value="atendido">Atendido</option>
              <option value="realizado">Realizado</option>
            </select>
          </>
        ) : (
          (currentStatus === 'pendiente' || currentStatus === 'nueva') && (
            <>
              <button onClick={() => updateStatus(table, id, 'aprobado')} className="btn-action approve" title="Aprobar"><Check size={16}/></button>
              <button onClick={() => updateStatus(table, id, 'rechazado')} className="btn-action reject" title="Rechazar"><XCircle size={16}/></button>
            </>
          )
        )}
        
        <button onClick={() => handleDelete(table, id)} className="btn-action delete" title="Eliminar"><Trash2 size={16}/></button>
      </div>
    );
  };

  const mapToCredential = (g) => ({
    nombre: g.nombres ? g.nombres.split(' ')[0] : 'Guía',
    edad: g.edad || 0,
    nivel: g.nivel || 'senior',
    codigo: g.codigo || 'S/N',
    idiomas: Array.isArray(g.idiomas) ? g.idiomas.map(i => i.idioma) : ['Español'],
    imagen: g.url_foto || '/guias/placeholder.png',
    biografia: g.biografia || 'Sin biografía',
    formacion: g.educacion ? g.educacion.split('\n') : [],
    experiencia: g.rutas_experiencia ? g.rutas_experiencia.split('\n') : [],
    certificaciones: { 
      sernatur: !!g.url_sernatur, 
      wfr: !!g.url_primeros_auxilios 
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="admin-dashboard-pro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: '#0f172a', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Panel Administrativo</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Acceso restringido a administradores</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
            <button type="submit" style={{ background: '#0f172a', color: 'white', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Entrar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-pro">
      <header className="admin-top-bar">
        <div className="container-pro">
          <div className="admin-logo-section">
            <ShieldCheck size={28} className="admin-icon-brand" />
            <div>
              <h1>Panel Administrativo</h1>
              <span>Guía a la Carta • Admin Suite</span>
            </div>
          </div>
          <button onClick={fetchData} className="btn-refresh" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Actualizar
          </button>
        </div>
      </header>

      <section className="admin-stats-summary container-pro">
        <div className="stat-pro-card">
          <div className="stat-icon res"><Calendar size={22}/></div>
          <div className="stat-info">
            <span className="stat-label">Solicitudes de Servicios</span>
            <span className="stat-value">{reservas.filter(r => r.estado === 'nueva').length}</span>
          </div>
        </div>
        <div className="stat-pro-card">
          <div className="stat-icon tal"><Users size={22}/></div>
          <div className="stat-info">
            <span className="stat-label">Postulaciones Pendientes</span>
            <span className="stat-value">
              {postulacionesGuias.filter(g => g.estado === 'pendiente').length + 
               postulacionesEstudiantes.filter(e => e.estado === 'pendiente').length}
            </span>
          </div>
        </div>
        <div className="stat-pro-card">
          <div className="stat-icon com"><MessageCircle size={22}/></div>
          <div className="stat-info">
            <span className="stat-label">Relatos Pendientes</span>
            <span className="stat-value">
              {relatos.filter(r => r.estado === 'pendiente').length + 
               comentarios.filter(c => c.estado === 'pendiente').length}
            </span>
          </div>
        </div>
      </section>

      <main className="admin-main container-pro">
        <aside className="admin-sidebar">
          <nav>
            <button className={`admin-nav-link ${activeTab === 'reservas' ? 'active' : ''}`} onClick={() => setActiveTab('reservas')}>
              <Briefcase size={20} /> Solicitud de Servicios
            </button>
            <button className={`admin-nav-link ${activeTab === 'talento' ? 'active' : ''}`} onClick={() => { setActiveTab('talento'); setSubTab('guias'); }}>
              <Users size={20} /> Gestión de Postulantes
            </button>
            <button className={`admin-nav-link ${activeTab === 'comunidad' ? 'active' : ''}`} onClick={() => { setActiveTab('comunidad'); setSubTab('relatos'); }}>
              <Globe size={20} /> Gestión de Relatos
            </button>
          </nav>
        </aside>

        <div className="admin-content-panel">
          {activeTab === 'talento' && (
            <div className="subtabs-bar">
              <button className={`subtab-btn ${subTab === 'guias' ? 'active' : ''}`} onClick={() => setSubTab('guias')}>Guías Full/Senior</button>
              <button className={`subtab-btn ${subTab === 'estudiantes' ? 'active' : ''}`} onClick={() => setSubTab('estudiantes')}>Guías Junior</button>
            </div>
          )}
          {activeTab === 'comunidad' && (
            <div className="subtabs-bar">
              <button className={`subtab-btn ${subTab === 'relatos' ? 'active' : ''}`} onClick={() => setSubTab('relatos')}>Relatos</button>
              <button className={`subtab-btn ${subTab === 'comentarios' ? 'active' : ''}`} onClick={() => setSubTab('comentarios')}>Comentarios</button>
            </div>
          )}

          <div className="table-wrapper">
            {activeTab === 'reservas' && (
              <table className="pro-table">
                <thead>
                  <tr><th>Empresa / Contacto</th><th>Servicio / Fecha</th><th>Destino</th><th>Estado</th><th className="text-right">Acciones</th></tr>
                </thead>
                <tbody>
                  {reservas.map(res => (
                    <React.Fragment key={res.id}>
                      <tr className={expandedId === res.id ? 'row-expanded' : ''}>
                        <td><div className="main-text">{res.empresa}</div><div className="sub-text">{res.contacto_nombre}</div></td>
                        <td><div className="main-text">{new Date(res.fecha_servicio).toLocaleDateString()}</div><div className="sub-text">{res.nivel_guia}</div></td>
                        <td>{res.destino}</td>
                        <td><span className={`status-badge ${res.estado}`}>{res.estado}</span></td>
                        <td><ActionButtons table="reservas" id={res.id} currentStatus={res.estado} record={res} /></td>
                      </tr>
                      {expandedId === res.id && (
                        <tr className="detail-row">
                          <td colSpan="5">
                            <div className="detail-content">
                              {editingId === res.id ? (
                                <div className="edit-form-grid">
                                  <div className="form-group"><label>Empresa</label><input name="empresa" value={editData.empresa} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Contacto</label><input name="contacto_nombre" value={editData.contacto_nombre} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Email</label><input name="email" value={editData.email} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Teléfono</label><input name="telefono" value={editData.telefono} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Destino</label><input name="destino" value={editData.destino} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="full-width"><label>Comentarios</label><textarea name="comentarios" value={editData.comentarios} onChange={handleEditChange} className="form-control" style={{height:'100px'}}></textarea></div>
                                  <div className="edit-actions">
                                    <button onClick={() => handleUpdateRecord('reservas', res.id)} className="btn btn-save"><Save size={16}/> Guardar</button>
                                    <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="detail-grid">
                                  <div><strong>Email:</strong> {res.email}</div>
                                  <div><strong>Teléfono:</strong> {res.telefono}</div>
                                  <div><strong>Pax:</strong> {res.pax}</div>
                                  <div><strong>Idioma:</strong> {res.idioma}</div>
                                  <div className="full-width"><strong>Comentarios:</strong> {res.comentarios || 'Sin comentarios'}</div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'talento' && subTab === 'guias' && (
              <table className="pro-table">
                <thead><tr><th>Postulante</th><th>Ubicación</th><th>Idiomas</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {postulacionesGuias.map(guia => (
                    <React.Fragment key={guia.id}>
                      <tr className={expandedId === guia.id ? 'row-expanded' : ''}>
                        <td><div className="main-text">{guia.nombres} {guia.apellidos}</div><div className="sub-text">{guia.email}</div></td>
                        <td>{guia.ciudad_residencia}</td>
                        <td>{Array.isArray(guia.idiomas) ? guia.idiomas.map(i => i.idioma).join(', ') : 'Español'}</td>
                        <td><span className={`status-badge ${guia.estado}`}>{guia.estado}</span></td>
                        <td><ActionButtons table="postulaciones_guias" id={guia.id} currentStatus={guia.estado} record={guia} /></td>
                      </tr>
                      {expandedId === guia.id && (
                        <tr className="detail-row">
                          <td colSpan="5">
                            <div className="detail-content">
                              {editingId === guia.id ? (
                                <div className="edit-form-grid">
                                  <div className="form-group"><label>Email</label><input name="email" value={editData.email} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Teléfono</label><input name="telefono" value={editData.telefono} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Nacionalidad</label><input name="nacionalidad" value={editData.nacionalidad} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Ciudad Residencia</label><input name="ciudad_residencia" value={editData.ciudad_residencia} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Ciudad Trabajo</label><input name="ciudad_trabajo" value={editData.ciudad_trabajo} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group">
                                    <label>Estado del Perfil</label>
                                    <select name="estado" value={editData.estado} onChange={handleEditChange} className="form-control">
                                      <option value="pendiente">Pendiente</option>
                                      <option value="aprobado">Aprobado</option>
                                      <option value="rechazado">Rechazado</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>Fecha Caducidad de Perfil</label>
                                    <input type="date" name="fecha_caducidad" value={editData.fecha_caducidad || ''} onChange={handleEditChange} className="form-control" />
                                  </div>
                                  
                                  <div className="full-width-divider">Visual Credential Content</div>
                                  <div className="form-group">
                                    <label>Distintivo de Nivel (Badge)</label>
                                    <select name="nivel" value={editData.nivel || 'senior'} onChange={handleEditChange} className="form-control">
                                      <option value="full">Guía Full</option>
                                      <option value="senior">Guía Senior</option>
                                      <option value="junior">Guía Junior</option>
                                    </select>
                                  </div>
                                  <div className="form-group"><label>Nombre en Credencial</label><input name="nombres" value={editData.nombres} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Apellidos en Credencial</label><input name="apellidos" value={editData.apellidos} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Edad en Credencial</label><input name="edad" value={editData.edad} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Código Profesional</label><input name="codigo" value={editData.codigo} onChange={handleEditChange} className="form-control" /></div>
                                  
                                  <div className="full-width"><label>Biografía (Credential)</label><textarea name="biografia" value={editData.biografia} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>Educación (Credential)</label><textarea name="educacion" value={editData.educacion} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>Rutas y Experiencia (Credential)</label><textarea name="rutas_experiencia" value={editData.rutas_experiencia} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  
                                  <div className="full-width-divider">Document Management</div>
                                  <div className="form-group"><label>Actualizar CV (PDF)</label><input type="file" name="file_cv" onChange={handleEditChange} className="form-control" accept=".pdf" /></div>
                                  <div className="form-group"><label>Actualizar Foto</label><input type="file" name="file_foto" onChange={handleEditChange} className="form-control" accept="image/*" /></div>
                                  <div className="form-group"><label>Actualizar SERNATUR</label><input type="file" name="file_sernatur" onChange={handleEditChange} className="form-control" accept=".pdf,image/*" /></div>
                                  <div className="form-group"><label>Actualizar WFR</label><input type="file" name="file_wfr" onChange={handleEditChange} className="form-control" accept=".pdf,image/*" /></div>
                                  <div className="form-group"><label>Otras Certificaciones</label><input type="file" name="file_otras" onChange={handleEditChange} className="form-control" accept=".pdf,image/*" /></div>

                                  <div className="edit-actions">
                                    <button onClick={() => handleUpdateRecord('postulaciones_guias', guia.id)} className="btn btn-save"><Save size={16}/> Guardar</button>
                                    <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="guide-detail-wrapper">
                                  <div className="detail-grid">
                                    <div><strong>Teléfono:</strong> {guia.telefono}</div>
                                    <div><strong>Edad:</strong> {guia.edad} años</div>
                                    <div><strong>Nacionalidad:</strong> {guia.nacionalidad}</div>
                                    <div><strong>Zonas de Trabajo:</strong> {guia.ciudad_trabajo}</div>
                                    <div className="full-width"><strong>Localidades Extra:</strong> {guia.localidades_extra}</div>
                                    <div className="full-width"><strong>Biografía:</strong> {guia.biografia}</div>
                                    <div className="full-width"><strong>Educación:</strong> {guia.educacion}</div>
                                    <div className="full-width"><strong>Rutas/Exp:</strong> {guia.rutas_experiencia}</div>
                                    <div><strong>SII Habilitado:</strong> {guia.habilitado_sii}</div>
                                    <div className="doc-links-large">
                                      <strong>Documentos:</strong>
                                      {guia.url_cv && <a href={guia.url_cv} target="_blank" rel="noreferrer" className="btn-doc"><FileText size={16}/> CV</a>}
                                      {guia.url_foto && <a href={guia.url_foto} target="_blank" rel="noreferrer" className="btn-doc"><Eye size={16}/> Foto</a>}
                                      {guia.url_sernatur && <a href={guia.url_sernatur} target="_blank" rel="noreferrer" className="btn-doc"><Award size={16}/> SERNATUR</a>}
                                      {guia.url_primeros_auxilios && <a href={guia.url_primeros_auxilios} target="_blank" rel="noreferrer" className="btn-doc"><ShieldCheck size={16}/> P. Auxilios</a>}
                                      {guia.url_otras_certificaciones && <a href={guia.url_otras_certificaciones} target="_blank" rel="noreferrer" className="btn-doc"><BookOpen size={16}/> Otras Cert.</a>}
                                    </div>
                                    <div className="full-width">
                                      <strong>Otras Certificaciones:</strong>
                                      <p style={{fontSize:'0.9rem', color:'#64748b'}}>Archivos adjuntos adicionales cargados por el postulante.</p>
                                    </div>
                                  </div>
                                  
                                  <div className="credential-preview-admin">
                                    <h4>Previsualización de Credencial</h4>
                                    <div className="credential-mini-container">
                                      <GuideCredential 
                                        guia={mapToCredential(editingId === guia.id ? editData : guia)} 
                                        isExample={true} 
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'talento' && subTab === 'estudiantes' && (
              <table className="pro-table">
                <thead><tr><th>Estudiante</th><th>Contacto</th><th>Residencia</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {postulacionesEstudiantes.map(est => (
                    <React.Fragment key={est.id}>
                      <tr className={expandedId === est.id ? 'row-expanded' : ''}>
                        <td><div className="main-text">{est.nombres} {est.apellidos}</div><div className="sub-text">Junior</div></td>
                        <td>{est.email}</td>
                        <td>{est.ciudad_residencia}</td>
                        <td><span className={`status-badge ${est.estado}`}>{est.estado}</span></td>
                        <td><ActionButtons table="postulaciones_estudiantes" id={est.id} currentStatus={est.estado} record={est} /></td>
                      </tr>
                      {expandedId === est.id && (
                        <tr className="detail-row">
                          <td colSpan="5">
                            <div className="detail-content">
                              {editingId === est.id ? (
                                <div className="edit-form-grid">
                                  <div className="form-group"><label>Nombres</label><input name="nombres" value={editData.nombres} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Apellidos</label><input name="apellidos" value={editData.apellidos} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="edit-actions">
                                    <button onClick={() => handleUpdateRecord('postulaciones_estudiantes', est.id)} className="btn btn-save"><Save size={16}/> Guardar</button>
                                    <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="detail-grid">
                                  <div><strong>Teléfono:</strong> {est.telefono}</div>
                                  <div><strong>Edad:</strong> {est.edad} años</div>
                                  <div><strong>Nacionalidad:</strong> {est.nacionalidad}</div>
                                  <div className="full-width"><strong>Educación:</strong> {est.educacion}</div>
                                  <div className="full-width"><strong>Exp. Terreno:</strong> {est.experiencia_terreno}</div>
                                  <div className="full-width"><strong>Biografía:</strong> {est.biografia}</div>
                                  <div><strong>SII Habilitado:</strong> {est.habilitado_sii}</div>
                                  <div className="doc-links-large">
                                    <strong>Documentos:</strong>
                                    {est.url_cv && <a href={est.url_cv} target="_blank" rel="noreferrer" className="btn-doc"><FileText size={16}/> CV</a>}
                                    {est.url_foto && <a href={est.url_foto} target="_blank" rel="noreferrer" className="btn-doc"><Eye size={16}/> Foto</a>}
                                    {est.url_certificaciones && <a href={est.url_certificaciones} target="_blank" rel="noreferrer" className="btn-doc"><BookOpen size={16}/> Certificados</a>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'comunidad' && subTab === 'relatos' && (
              <table className="pro-table">
                <thead><tr><th>Título / Autor</th><th>Ubicación / Fecha</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {relatos.map(rel => (
                    <React.Fragment key={rel.id}>
                      <tr className={expandedId === rel.id ? 'row-expanded' : ''}>
                        <td><div className="main-text">{rel.titulo}</div><div className="sub-text">Por: {rel.autor}</div></td>
                        <td><div className="main-text">{rel.ubicacion}</div><div className="sub-text">{new Date(rel.fecha).toLocaleDateString()}</div></td>
                        <td><span className={`status-badge ${rel.estado}`}>{rel.estado}</span></td>
                        <td><ActionButtons table="relatos" id={rel.id} currentStatus={rel.estado} record={rel} /></td>
                      </tr>
                      {expandedId === rel.id && (
                        <tr className="detail-row">
                          <td colSpan="5">
                            <div className="detail-content">
                              {editingId === rel.id ? (
                                <div className="edit-form-grid">
                                  <div className="form-group"><label>Título</label><input name="titulo" value={editData.titulo || ''} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Hook / Resumen</label><input name="hook" value={editData.hook || editData.resumen || ''} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="full-width"><label>Contenido</label><textarea name="contenido" value={editData.contenido || ''} onChange={handleEditChange} className="form-control" style={{height:'150px'}}></textarea></div>
                                  <div className="full-width"><label>Datos Clave</label><textarea name="datos_clave" value={editData.datos_clave || ''} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>¿Cómo se cuenta?</label><textarea name="como_se_cuenta" value={editData.como_se_cuenta || ''} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="edit-actions">
                                    <button onClick={() => handleUpdateRecord('relatos', rel.id)} className="btn btn-save"><Save size={16}/> Guardar</button>
                                    <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relato-preview">
                                  {rel.imagen_url && <img src={rel.imagen_url} alt="Vista previa" className="detail-preview-img" />}
                                  <div className="relato-text">
                                    <strong>Hook / Resumen:</strong>
                                    <p style={{marginBottom: '1rem', fontWeight: 'bold'}}>{rel.hook || rel.resumen}</p>
                                    <strong>Contenido Completo:</strong>
                                    <p style={{marginBottom: '1rem'}}>{rel.contenido}</p>
                                    {rel.datos_clave && (
                                      <>
                                        <strong>Datos Clave:</strong>
                                        <p style={{marginBottom: '1rem'}}>{rel.datos_clave}</p>
                                      </>
                                    )}
                                    {rel.como_se_cuenta && (
                                      <>
                                        <strong>¿Cómo se cuenta en terreno?:</strong>
                                        <p style={{marginBottom: '1rem'}}>{rel.como_se_cuenta}</p>
                                      </>
                                    )}
                                    {rel.galeria_urls && rel.galeria_urls.length > 0 && (
                                      <div className="relato-gallery-preview">
                                        <strong>Galería adjunta:</strong>
                                        <div style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
                                          {rel.galeria_urls.map((url, i) => (
                                            <img key={i} src={url} alt={`Galería ${i}`} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'comunidad' && subTab === 'comentarios' && (
              <table className="pro-table">
                <thead><tr><th>Usuario / Comentario</th><th>Relato</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {comentarios.map(com => (
                    <tr key={com.id}>
                      <td><div className="main-text">{com.usuario_nombre}</div><div className="sub-text italic">"{com.texto}"</div></td>
                      <td>{com.relatos?.titulo || 'Desconocido'}</td>
                      <td><span className={`status-badge ${com.estado}`}>{com.estado}</span></td>
                      <td><ActionButtons table="comentarios_relatos" id={com.id} currentStatus={com.estado} record={com} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
