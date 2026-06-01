import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabase';
import { 
  Users, FileText, Calendar, CheckCircle, XCircle, 
  Eye, Trash2, Check, Crop,
  Mail, Phone, MapPin, Globe, Award, BookOpen, MessageCircle,
  ShieldCheck, Briefcase, RefreshCw, Edit, Save, X as CloseIcon, Plus, Download
} from 'lucide-react';
import GuideCredential from '../components/GuideCredential';
import CropperModal from '../components/CropperModal';
import './Admin.css';

const exportarAprobados = (lista, nombreArchivo) => {
  const aprobados = lista
    .filter(g => g.estado === 'aprobado')
    .map(g => ({
      'Nombres': g.nombres || '',
      'Apellidos': g.apellidos || '',
      'Correo': g.email || '',
      'Teléfono': g.telefono || ''
    }));

  if (aprobados.length === 0) {
    alert('No hay guías aprobados para exportar.');
    return;
  }

  const hoja = XLSX.utils.json_to_sheet(aprobados);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Aprobados');
  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `${nombreArchivo}_${fecha}.xlsx`);
};

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
  const [manuales, setManuales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [cropModalData, setCropModalData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData } = await supabase.from('reservas').select('*').order('created_at', { ascending: false });
      const { data: guiasData } = await supabase.from('postulaciones_guias').select('*').order('created_at', { ascending: false });
      const { data: estData } = await supabase.from('postulaciones_estudiantes').select('*').order('created_at', { ascending: false });
      const { data: relatoData } = await supabase.from('relatos').select('*').order('fecha', { ascending: false });
      const { data: comData } = await supabase.from('comentarios_relatos').select('*, relatos(titulo)').order('fecha', { ascending: false });
      const { data: manualesData } = await supabase.from('manuales').select('*').order('created_at', { ascending: false });
      
      setReservas(resData || []);
      setPostulacionesGuias(guiasData || []);
      setPostulacionesEstudiantes(estData || []);
      setRelatos(relatoData || []);
      setComentarios(comData || []);
      setManuales(manualesData || []);
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
    try {
      const { data, error } = await supabase.from(table).update({ estado: newStatus }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("El registro no se actualizó. Por favor, intenta nuevamente.");
      }
      fetchData();
    } catch (error) {
      console.error("Error updateStatus:", error);
      alert('Hubo un problema al actualizar. Por favor, intenta nuevamente.');
    }
  };

  const updateField = async (table, id, field, value) => {
    try {
      const { data, error } = await supabase.from(table).update({ [field]: value }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("El registro no se actualizó.");
      }
      fetchData();
    } catch (error) {
      console.error("Error updateField:", error);
      alert('Hubo un problema al actualizar. Por favor, intenta nuevamente.');
    }
  };

  const handleSaveCrop = async (croppedBlob) => {
    setLoading(true);
    try {
      const { table, record } = cropModalData;
      const bucket = 'documentos';
      const fileExt = 'jpg';
      const fileName = `${record.id}-cropped-${Math.random()}.${fileExt}`;
      const filePath = `fotos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      await updateField(table, record.id, 'url_foto', newUrl);
      alert('Foto recortada y actualizada con éxito.');
    } catch (e) {
      console.error(e);
      alert('Error al guardar la foto recortada');
    } finally {
      setLoading(false);
      setCropModalData(null);
    }
  };

  const handleUpdateRecord = async (table, id) => {
    setLoading(true);
    try {
      let finalData = { ...editData };

      if (finalData.idiomas_arr !== undefined) {
        finalData.idiomas = finalData.idiomas_arr;
        delete finalData.idiomas_arr;
      }

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
      if (editData.file_certificaciones instanceof File) {
        finalData.url_certificaciones = await uploadFile(editData.file_certificaciones, 'documentos', 'certificados');
        delete finalData.file_certificaciones;
      }
      if (editData.file_manual instanceof File) {
        finalData.url_archivo = await uploadFile(editData.file_manual, 'documentos', 'manuales');
        delete finalData.file_manual;
      }

      Object.keys(finalData).forEach(key => {
        if (finalData[key] instanceof File || key.startsWith('file_')) delete finalData[key];
      });

      if (id === 'new') {
        const { error } = await supabase.from(table).insert([finalData]);
        if (error) throw error;
        alert("Registro creado correctamente");
      } else {
        const { error } = await supabase.from(table).update(finalData).eq('id', id);
        if (error) {
          if (error.code === '42703') {
            alert("Error: Una de las columnas no existe en la base de datos. Por favor, verifica el SQL en Supabase.");
          }
          throw error;
        }
        alert("Registro actualizado correctamente");
      }
      
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert("Hubo un problema al actualizar. Por favor, intenta nuevamente.");
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
      const { data, error } = await supabase.from(table).delete().eq('id', id).select();
      if (error) {
        console.error("Supabase Delete Error:", error);
        throw error;
      }
      if (!data || data.length === 0) {
        throw new Error("El registro no se pudo eliminar en este momento. Por favor, intenta nuevamente.");
      }
      alert('Registro eliminado correctamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Hubo un problema al eliminar. Por favor, intenta nuevamente.');
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
    let editRec = { ...record };
    if (Array.isArray(editRec.idiomas)) {
      editRec.idiomas_arr = editRec.idiomas.map(i => (typeof i === 'object' ? i.idioma : i));
    } else {
      editRec.idiomas_arr = typeof editRec.idiomas === 'string' ? [editRec.idiomas] : ['Español'];
    }
    setEditData(editRec);
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

  const handleAddIdioma = () => {
    if (editData.idiomaInput && !(editData.idiomas_arr || []).includes(editData.idiomaInput)) {
      setEditData({ 
        ...editData, 
        idiomas_arr: [...(editData.idiomas_arr || []), editData.idiomaInput],
        idiomaInput: ''
      });
    }
  };

  const handleRemoveIdioma = (idiomaToRemove) => {
    setEditData({
      ...editData,
      idiomas_arr: (editData.idiomas_arr || []).filter(i => i !== idiomaToRemove)
    });
  };

  const ActionButtons = ({ table, id, currentStatus, record }) => {
    const isReserva = table === 'reservas';
    const isGuia = table === 'postulaciones_guias';
    const isEstudiante = table === 'postulaciones_estudiantes';

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
          <>
            {(isGuia || isEstudiante) && (
              <>
                <a href={`mailto:${record.email}?subject=Postulación Guía a la Carta&body=Hola ${record.nombres},`} className="btn-action email" title="Enviar Email"><Mail size={16}/></a>
                <a href={`https://wa.me/${record.telefono?.replace(/\s+/g, '').replace('+', '')}`} target="_blank" rel="noreferrer" className="btn-action whatsapp" title="Contactar por WhatsApp"><MessageCircle size={16}/></a>
              </>
            )}

            {isGuia && (
              <select 
                className="status-selector-mini level-selector" 
                value={record?.nivel || 'senior'} 
                onChange={(e) => updateField(table, id, 'nivel', e.target.value)}
                title="Cambiar Nivel"
              >
                <option value="junior">Junior</option>
                <option value="full">Full</option>
                <option value="senior">Senior</option>
              </select>
            )}
            
            {(currentStatus === 'pendiente' || currentStatus === 'nueva') && (
              <>
                <button onClick={() => updateStatus(table, id, 'aprobado')} className="btn-action approve" title="Aprobar"><Check size={16}/></button>
                <button onClick={() => updateStatus(table, id, 'rechazado')} className="btn-action reject" title="Rechazar"><XCircle size={16}/></button>
              </>
            )}
          </>
        )}
        
        <button onClick={() => handleDelete(table, id)} className="btn-action delete" title="Eliminar"><Trash2 size={16}/></button>
      </div>
    );
  };

  const mapToCredential = (g) => {
    if (!g) return {};
    const rawN = String(g.nombres || g.nombre || 'Guía').trim();
    
    return {
      nombre: (typeof g.nombre_visual === 'string') ? g.nombre_visual : rawN.split(' ')[0],
      apellidos: (typeof g.apellido_visual === 'string') ? g.apellido_visual : "",
      edad: g.edad || 0,
      nivel: g.nivel || 'senior',
      codigo: g.codigo || 'S/N',
      idiomas: Array.isArray(g.idiomas) ? g.idiomas.map(i => (typeof i === 'object' ? i?.idioma : i) || 'Español') : ['Español'],
      imagen: g.url_foto || '/guias/placeholder.png',
      biografia: String(g.biografia || 'Sin biografía'),
      formacion: typeof g.educacion === 'string' ? g.educacion.split('\n') : [],
      experiencia: typeof g.rutas_experiencia === 'string' ? g.rutas_experiencia.split('\n') : (typeof g.experiencia_terreno === 'string' ? g.experiencia_terreno.split('\n') : []),
      certificaciones: { 
        sernatur: !!g.url_sernatur, 
        wfr: !!g.url_primeros_auxilios,
        otras: !!g.url_otras_certificaciones
      }
    };
  };

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
        <div className="container-pro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="admin-logo-section">
            <ShieldCheck size={32} className="admin-icon-brand" />
            <div>
              <h1>Panel Administrativo</h1>
              <span>Guía a la Carta • Business Suite v2.0</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={fetchData} className="btn-refresh" disabled={loading}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} /> 
              <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
            <div className="admin-user-pill" style={{ background: 'white', padding: '5px 15px', borderRadius: '30px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '0.8rem' }}>AD</div>
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Administrador</span>
            </div>
          </div>
        </div>
      </header>

      <section className="admin-stats-summary container-pro">
        <div className="stat-pro-card">
          <div className="stat-info">
            <span className="stat-label">Solicitudes</span>
            <span className="stat-value">{reservas.filter(r => r.estado === 'nueva').length}</span>
            <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: '700', marginTop: '5px' }}>Nuevas Entrantes</span>
          </div>
          <div className="stat-icon res"><Calendar size={28}/></div>
        </div>
        <div className="stat-pro-card">
          <div className="stat-info">
            <span className="stat-label">Postulantes</span>
            <span className="stat-value">
              {postulacionesGuias.filter(g => g.estado === 'pendiente').length + 
               postulacionesEstudiantes.filter(e => e.estado === 'pendiente').length}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', marginTop: '5px' }}>En Espera</span>
          </div>
          <div className="stat-icon tal"><Users size={28}/></div>
        </div>
        <div className="stat-pro-card">
          <div className="stat-info">
            <span className="stat-label">Relatos</span>
            <span className="stat-value">
              {relatos.filter(r => r.estado === 'pendiente').length + 
               comentarios.filter(c => c.estado === 'pendiente').length}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#c2410c', fontWeight: '700', marginTop: '5px' }}>Por Moderar</span>
          </div>
          <div className="stat-icon com"><MessageCircle size={28}/></div>
        </div>
      </section>

      <main className="admin-main container-pro">
        <aside className="admin-sidebar">
          <nav>
            <button className={`admin-nav-link ${activeTab === 'reservas' ? 'active' : ''}`} onClick={() => setActiveTab('reservas')}>
              <Briefcase size={22} /> <span>Solicitud de Servicios</span>
            </button>
            <button className={`admin-nav-link ${activeTab === 'talento' ? 'active' : ''}`} onClick={() => { setActiveTab('talento'); setSubTab('guias'); }}>
              <Users size={22} /> <span>Gestión de Postulantes</span>
            </button>
            <button className={`admin-nav-link ${activeTab === 'comunidad' ? 'active' : ''}`} onClick={() => { setActiveTab('comunidad'); setSubTab('relatos'); }}>
              <Globe size={22} /> <span>Gestión de Relatos</span>
            </button>
            <button className={`admin-nav-link ${activeTab === 'manuales' ? 'active' : ''}`} onClick={() => setActiveTab('manuales')}>
              <BookOpen size={22} /> <span>Gestión de Manuales</span>
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
                                <div className="card-dashboard" style={{maxWidth:'800px'}}>
                                  <div className="card-header-pro">
                                    <Briefcase size={20} />
                                    <h4>Detalles de la Solicitud</h4>
                                  </div>
                                  <div className="card-body-pro">
                                    <div className="info-grid-pro">
                                      <div className="field-pro"><span className="field-label">Email de Contacto</span><span className="field-value">{res.email}</span></div>
                                      <div className="field-pro"><span className="field-label">Teléfono</span><span className="field-value">{res.telefono}</span></div>
                                      <div className="field-pro"><span className="field-label">Cantidad de Pasajeros (Pax)</span><span className="field-value">{res.pax}</span></div>
                                      <div className="field-pro"><span className="field-label">Idioma Requerido</span><span className="field-value">{res.idioma}</span></div>
                                      <div className="full-width field-pro" style={{marginTop:'15px'}}>
                                        <span className="field-label">Comentarios Adicionales</span>
                                        <p style={{fontSize:'1rem', color:'var(--text-main)', margin:'10px 0 0 0', lineHeight:'1.6'}}>{res.comentarios || 'Sin comentarios adicionales'}</p>
                                      </div>
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

            {activeTab === 'talento' && subTab === 'guias' && (
              <div className="talento-tab-content">
                <div className="status-summary-bar" style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '10px 15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span><strong>Total Registrados:</strong> {postulacionesGuias.length}</span>
                  <span style={{ color: '#d97706' }}><strong>Pendientes:</strong> {postulacionesGuias.filter(g => g.estado === 'pendiente').length}</span>
                  <span style={{ color: '#dc2626' }}><strong>Rechazados:</strong> {postulacionesGuias.filter(g => g.estado === 'rechazado').length}</span>
                  <span style={{ color: '#16a34a' }}><strong>Aprobados:</strong> {postulacionesGuias.filter(g => g.estado === 'aprobado').length}</span>
                  <button onClick={() => exportarAprobados(postulacionesGuias, 'Guias_Senior_Aprobados')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                    <Download size={15} /> Exportar Aprobados (.xlsx)
                  </button>
                </div>
                <table className="pro-table">
                  <thead><tr><th>Postulante</th><th>Ubicación</th><th>Idiomas</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                  <tbody>
                    {[...postulacionesGuias].sort((a,b) => {
                      const orden = { pendiente: 1, rechazado: 2, aprobado: 3 };
                      return (orden[a.estado] || 4) - (orden[b.estado] || 4);
                    }).map(guia => (
                    <React.Fragment key={guia.id}>
                      <tr className={expandedId === guia.id ? 'row-expanded' : ''}>
                        <td><div className="main-text">{String(guia.nombres || '')} {String(guia.apellidos || '')}</div><div className="sub-text">{guia.email}</div></td>
                        <td>{guia.ciudad_residencia}</td>
                        <td>{Array.isArray(guia.idiomas) ? guia.idiomas.map(i => (typeof i === 'object' ? i.idioma : i)).join(', ') : 'Español'}</td>
                        <td><span className={`status-badge ${guia.estado}`}>{guia.estado}</span></td>
                        <td><ActionButtons table="postulaciones_guias" id={guia.id} currentStatus={guia.estado} record={guia} /></td>
                      </tr>
                      {expandedId === guia.id && (
                        <tr className="detail-row">
                          <td colSpan="5">
                            <div className="detail-content">
                              {editingId === guia.id ? (
                                <div className="edit-form-grid">
                                  <div className="full-width-divider">Edición de Perfil (Interno)</div>
                                  <div className="form-group"><label>Nombres (Registro)</label><input name="nombres" value={editData.nombres} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Apellidos (Registro)</label><input name="apellidos" value={editData.apellidos} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Email de Contacto</label><input name="email" value={editData.email} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Teléfono</label><input name="telefono" value={editData.telefono} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Nacionalidad</label><input name="nacionalidad" value={editData.nacionalidad} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group">
                                    <label>Idiomas</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                      <select name="idiomaInput" value={editData.idiomaInput || ''} onChange={handleEditChange} className="form-control">
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Español">Español</option>
                                        <option value="Inglés">Inglés</option>
                                        <option value="Portugués">Portugués</option>
                                        <option value="Francés">Francés</option>
                                        <option value="Alemán">Alemán</option>
                                        <option value="Italiano">Italiano</option>
                                        <option value="Chino Mandarín">Chino Mandarín</option>
                                        <option value="Japonés">Japonés</option>
                                      </select>
                                      <button type="button" onClick={handleAddIdioma} className="btn-save" style={{ padding: '0 15px', whiteSpace: 'nowrap', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer' }}>Agregar</button>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                      {(editData.idiomas_arr || []).map(idioma => (
                                        <span key={idioma} style={{ background: '#e2e8f0', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                          {idioma}
                                          <XCircle size={14} style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => handleRemoveIdioma(idioma)} />
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <label>Región de Residencia</label>
                                    <select name="ciudad_residencia" value={editData.ciudad_residencia || ''} onChange={handleEditChange} className="form-control">
                                      <option value="" disabled>Seleccione una región</option>
                                      <option value="Arica y Parinacota">Arica y Parinacota</option>
                                      <option value="Tarapacá">Tarapacá</option>
                                      <option value="Antofagasta">Antofagasta</option>
                                      <option value="Atacama">Atacama</option>
                                      <option value="Coquimbo">Coquimbo</option>
                                      <option value="Valparaíso">Valparaíso</option>
                                      <option value="Metropolitana">Metropolitana</option>
                                      <option value="O'Higgins">O'Higgins</option>
                                      <option value="Maule">Maule</option>
                                      <option value="Ñuble">Ñuble</option>
                                      <option value="Biobío">Biobío</option>
                                      <option value="Araucanía">Araucanía</option>
                                      <option value="Los Ríos">Los Ríos</option>
                                      <option value="Los Lagos">Los Lagos</option>
                                      <option value="Aysén">Aysén</option>
                                      <option value="Magallanes">Magallanes</option>
                                    </select>
                                  </div>
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
                                    <label>Habilitado SII</label>
                                    <select name="habilitado_sii" value={editData.habilitado_sii} onChange={handleEditChange} className="form-control">
                                      <option value="si">Sí</option>
                                      <option value="no">No</option>
                                      <option value="tramite">En trámite</option>
                                    </select>
                                  </div>
                                  <div className="full-width"><label>Localidades Extra</label><input name="localidades_extra" value={editData.localidades_extra} onChange={handleEditChange} className="form-control" /></div>
                                  
                                  <div className="full-width-divider">Contenido Visual Credencial (Público B2B)</div>
                                  <div className="form-group"><label>Nombre en Credencial</label><input name="nombre_visual" value={editData.nombre_visual || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: Joaquín" /></div>
                                  <div className="form-group"><label>Apellido en Credencial</label><input name="apellido_visual" value={editData.apellido_visual || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: G." /></div>
                                  <div className="form-group">
                                    <label>Nivel Profesional</label>
                                    <select name="nivel" value={editData.nivel || 'senior'} onChange={handleEditChange} className="form-control">
                                      <option value="full">Guía Full</option>
                                      <option value="senior">Guía Senior</option>
                                      <option value="junior">Guía Junior</option>
                                    </select>
                                  </div>
                                  <div className="form-group"><label>Edad Visual</label><input name="edad" value={editData.edad} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Código de Guía</label><input name="codigo" value={editData.codigo} onChange={handleEditChange} className="form-control" /></div>
                                  
                                  <div className="full-width"><label>Biografía Profesional</label><textarea name="biografia" value={editData.biografia} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>Educación y Títulos</label><textarea name="educacion" value={editData.educacion} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>Experiencia y Rutas</label><textarea name="rutas_experiencia" value={editData.rutas_experiencia} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  
                                  <div className="full-width-divider">Archivos y Documentos</div>
                                  <div className="edit-form-grid" style={{border:'none', padding:0, boxShadow:'none', marginTop:0}}>
                                    <div className="form-group"><label>CV (PDF)</label><input type="file" name="file_cv" onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Foto Perfil</label><input type="file" name="file_foto" onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Sernatur</label><input type="file" name="file_sernatur" onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Primeros Aux</label><input type="file" name="file_wfr" onChange={handleEditChange} className="form-control" /></div>
                                  </div>

                                  <div className="edit-actions">
                                    <button onClick={() => handleUpdateRecord('postulaciones_guias', guia.id)} className="btn btn-save"><Save size={16}/> Guardar Cambios</button>
                                    <button onClick={cancelEditing} className="btn btn-cancel">Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="dashboard-detail-grid">
                                    {/* LEFT COLUMN: ALL INTERNAL REGISTRATION DATA */}
                                    <div className="detail-column-left">
                                      <div className="card-dashboard">
                                        <div className="card-header-pro">
                                          <Users size={20} />
                                          <h4>Datos Completos de Registro (Interno)</h4>
                                        </div>
                                        <div className="card-body-pro">
                                          <div className="info-grid-pro">
                                            <div className="field-pro"><span className="field-label">Nombres</span><span className="field-value">{guia.nombres}</span></div>
                                            <div className="field-pro"><span className="field-label">Apellidos</span><span className="field-value">{guia.apellidos}</span></div>
                                            <div className="field-pro"><span className="field-label">Email de Registro</span><span className="field-value">{guia.email}</span></div>
                                            <div className="field-pro"><span className="field-label">Teléfono Contacto</span><span className="field-value">{guia.telefono}</span></div>
                                            <div className="field-pro"><span className="field-label">Nacionalidad</span><span className="field-value">{guia.nacionalidad}</span></div>
                                            <div className="field-pro"><span className="field-label">Edad Registrada</span><span className="field-value">{guia.edad} años</span></div>
                                            <div className="field-pro"><span className="field-label">Región de Residencia</span><span className="field-value">{guia.ciudad_residencia}</span></div>
                                            <div className="field-pro"><span className="field-label">Zonas de Trabajo</span><span className="field-value">{guia.ciudad_trabajo}</span></div>
                                            <div className="field-pro"><span className="field-label">Nivel de Guía</span><span className="field-value">{guia.nivel?.toUpperCase() || 'SENIOR'}</span></div>
                                            <div className="field-pro"><span className="field-label">Código Profesional</span><span className="field-value">{guia.codigo || 'PENDIENTE'}</span></div>
                                            <div className="field-pro"><span className="field-label">Habilitado SII</span><span className="field-value">{guia.habilitado_sii?.toUpperCase()}</span></div>
                                            <div className="field-pro"><span className="field-label">Localidades Extra</span><span className="field-value">{guia.localidades_extra || 'Ninguna'}</span></div>
                                            <div className="field-pro"><span className="field-label">Estado de Postulación</span><span className="field-value">{guia.estado?.toUpperCase()}</span></div>
                                          </div>
                                          
                                          <div className="field-pro" style={{marginTop:'30px', borderTop:'1px solid var(--border)', paddingTop:'20px'}}>
                                            <span className="field-label">Biografía Profesional (Backend)</span>
                                            <p style={{fontSize:'1rem', color:'var(--text-main)', marginTop:'10px', lineHeight:'1.6'}}>{guia.biografia || 'Sin biografía registrada'}</p>
                                          </div>
                                          <div className="field-pro" style={{marginTop:'20px'}}>
                                            <span className="field-label">Educación y Títulos</span>
                                            <p style={{fontSize:'0.9rem', color:'var(--text-main)', marginTop:'10px', lineHeight:'1.6'}}>{guia.educacion || 'Sin datos registrados'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGHT COLUMN: DOCUMENTS WITH BUTTONS */}
                                    <div className="detail-column-right">
                                      <div className="card-dashboard">
                                        <div className="card-header-pro">
                                          <FileText size={20} />
                                          <h4>Documentación Oficial</h4>
                                        </div>
                                        <div className="card-body-pro">
                                          <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                            {guia.url_foto && (
                                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border)'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                  <Eye size={20} color="#2563eb" />
                                                  <span style={{fontWeight:'700', fontSize:'0.9rem'}}>Foto de Perfil</span>
                                                </div>
                                                <div style={{display:'flex', gap:'10px'}}>
                                                  <a href={guia.url_foto} target="_blank" rel="noreferrer" className="btn-view-doc">Ver</a>
                                                  <button onClick={() => setCropModalData({ table: 'postulaciones_guias', record: guia })} className="btn-view-doc" style={{background:'var(--c-primary)', color:'white', border:'none', cursor:'pointer'}}><Crop size={14} style={{display:'inline', marginBottom:'-2px'}}/> Recortar</button>
                                                </div>
                                              </div>
                                            )}
                                            {guia.url_cv && (
                                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border)'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                  <FileText size={20} color="#dc2626" />
                                                  <span style={{fontWeight:'700', fontSize:'0.9rem'}}>Curriculum Vitae</span>
                                                </div>
                                                <a href={guia.url_cv} target="_blank" rel="noreferrer" className="btn-view-doc">Ver Archivo</a>
                                              </div>
                                            )}
                                            {guia.url_sernatur && (
                                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border)'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                  <Award size={20} color="#16a34a" />
                                                  <span style={{fontWeight:'700', fontSize:'0.9rem'}}>Registro Sernatur</span>
                                                </div>
                                                <a href={guia.url_sernatur} target="_blank" rel="noreferrer" className="btn-view-doc">Ver Archivo</a>
                                              </div>
                                            )}
                                            {guia.url_primeros_auxilios && (
                                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border)'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                  <ShieldCheck size={20} color="#0369a1" />
                                                  <span style={{fontWeight:'700', fontSize:'0.9rem'}}>Primeros Auxilios / WFR</span>
                                                </div>
                                                <a href={guia.url_primeros_auxilios} target="_blank" rel="noreferrer" className="btn-view-doc">Ver Archivo</a>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* BOTTOM SECTION: FULL WIDTH CREDENTIAL PREVIEW */}
                                  <div className="detail-row-bottom">
                                    <div className="card-dashboard">
                                      <div className="card-header-pro">
                                        <Eye size={20} />
                                        <h4>Previsualización de Credencial Pública (Versión Idéntica)</h4>
                                      </div>
                                      <div className="card-body-pro" style={{background:'#f8fafc'}}>
                                        <div className="preview-container-pro">
                                          <div className="credential-wrapper-admin">
                                            <GuideCredential guia={mapToCredential(guia)} isExample={true} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              </div>
            )}

            {activeTab === 'talento' && subTab === 'estudiantes' && (
              <div className="talento-tab-content">
                <div className="status-summary-bar" style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '10px 15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span><strong>Total Registrados:</strong> {postulacionesEstudiantes.length}</span>
                  <span style={{ color: '#d97706' }}><strong>Pendientes:</strong> {postulacionesEstudiantes.filter(e => e.estado === 'pendiente').length}</span>
                  <span style={{ color: '#dc2626' }}><strong>Rechazados:</strong> {postulacionesEstudiantes.filter(e => e.estado === 'rechazado').length}</span>
                  <span style={{ color: '#16a34a' }}><strong>Aprobados:</strong> {postulacionesEstudiantes.filter(e => e.estado === 'aprobado').length}</span>
                  <button onClick={() => exportarAprobados(postulacionesEstudiantes, 'Guias_Junior_Aprobados')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                    <Download size={15} /> Exportar Aprobados (.xlsx)
                  </button>
                </div>
                <table className="pro-table">
                  <thead><tr><th>Estudiante</th><th>Contacto</th><th>Residencia</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                  <tbody>
                    {[...postulacionesEstudiantes].sort((a,b) => {
                      const orden = { pendiente: 1, rechazado: 2, aprobado: 3 };
                      return (orden[a.estado] || 4) - (orden[b.estado] || 4);
                    }).map(est => (
                    <React.Fragment key={est.id}>
                      <tr className={expandedId === est.id ? 'row-expanded' : ''}>
                        <td><div className="main-text">{String(est.nombres || '')} {String(est.apellidos || '')}</div><div className="sub-text">Junior</div></td>
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
                                  <div className="full-width-divider">Edición Estudiante (Interno)</div>
                                  <div className="form-group"><label>Nombres (Registro)</label><input name="nombres" value={editData.nombres} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Apellidos (Registro)</label><input name="apellidos" value={editData.apellidos} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Email de Contacto</label><input name="email" value={editData.email} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Teléfono</label><input name="telefono" value={editData.telefono} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Nacionalidad</label><input name="nacionalidad" value={editData.nacionalidad} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group">
                                    <label>Idiomas</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                      <select name="idiomaInput" value={editData.idiomaInput || ''} onChange={handleEditChange} className="form-control">
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Español">Español</option>
                                        <option value="Inglés">Inglés</option>
                                        <option value="Portugués">Portugués</option>
                                        <option value="Francés">Francés</option>
                                        <option value="Alemán">Alemán</option>
                                        <option value="Italiano">Italiano</option>
                                        <option value="Chino Mandarín">Chino Mandarín</option>
                                        <option value="Japonés">Japonés</option>
                                      </select>
                                      <button type="button" onClick={handleAddIdioma} className="btn-save" style={{ padding: '0 15px', whiteSpace: 'nowrap', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer' }}>Agregar</button>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                      {(editData.idiomas_arr || []).map(idioma => (
                                        <span key={idioma} style={{ background: '#e2e8f0', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                          {idioma}
                                          <XCircle size={14} style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => handleRemoveIdioma(idioma)} />
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="form-group"><label>Edad Visual</label><input name="edad" value={editData.edad} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group">
                                    <label>Región de Residencia</label>
                                    <select name="ciudad_residencia" value={editData.ciudad_residencia || ''} onChange={handleEditChange} className="form-control">
                                      <option value="" disabled>Seleccione una región</option>
                                      <option value="Arica y Parinacota">Arica y Parinacota</option>
                                      <option value="Tarapacá">Tarapacá</option>
                                      <option value="Antofagasta">Antofagasta</option>
                                      <option value="Atacama">Atacama</option>
                                      <option value="Coquimbo">Coquimbo</option>
                                      <option value="Valparaíso">Valparaíso</option>
                                      <option value="Metropolitana">Metropolitana</option>
                                      <option value="O'Higgins">O'Higgins</option>
                                      <option value="Maule">Maule</option>
                                      <option value="Ñuble">Ñuble</option>
                                      <option value="Biobío">Biobío</option>
                                      <option value="Araucanía">Araucanía</option>
                                      <option value="Los Ríos">Los Ríos</option>
                                      <option value="Los Lagos">Los Lagos</option>
                                      <option value="Aysén">Aysén</option>
                                      <option value="Magallanes">Magallanes</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>Habilitado SII</label>
                                    <select name="habilitado_sii" value={editData.habilitado_sii} onChange={handleEditChange} className="form-control">
                                      <option value="si">Sí</option>
                                      <option value="no">No</option>
                                      <option value="tramite">En trámite</option>
                                    </select>
                                  </div>
                                  
                                  <div className="full-width-divider">Visualización Credencial (Junior)</div>
                                  <div className="form-group"><label>Nombre en Credencial</label><input name="nombre_visual" value={editData.nombre_visual || ''} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="form-group"><label>Apellido en Credencial</label><input name="apellido_visual" value={editData.apellido_visual || ''} onChange={handleEditChange} className="form-control" /></div>
                                  <div className="full-width"><label>Biografía Profesional</label><textarea name="biografia" value={editData.biografia} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>Educación / Carrera</label><textarea name="educacion" value={editData.educacion} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  <div className="full-width"><label>Experiencia Terreno</label><textarea name="experiencia_terreno" value={editData.experiencia_terreno} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                  
                                  <div className="full-width-divider">Documentación</div>
                                  <div className="edit-form-grid" style={{border:'none', padding:0, boxShadow:'none', marginTop:0}}>
                                    <div className="form-group"><label>Actualizar CV</label><input type="file" name="file_cv" onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Foto de Perfil</label><input type="file" name="file_foto" onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Certificaciones</label><input type="file" name="file_certificaciones" onChange={handleEditChange} className="form-control" /></div>
                                  </div>
                                  
                                  <div className="edit-actions">
                                    <button onClick={() => handleUpdateRecord('postulaciones_estudiantes', est.id)} className="btn btn-save"><Save size={16}/> Guardar Cambios</button>
                                    <button onClick={cancelEditing} className="btn btn-cancel">Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="dashboard-detail-grid">
                                    {/* LEFT COLUMN: ALL INTERNAL REGISTRATION DATA */}
                                    <div className="detail-column-left">
                                      <div className="card-dashboard">
                                        <div className="card-header-pro">
                                          <Users size={20} />
                                          <h4>Datos Completos de Registro</h4>
                                        </div>
                                        <div className="card-body-pro">
                                          <div className="info-grid-pro">
                                            <div className="field-pro"><span className="field-label">Nombres</span><span className="field-value">{est.nombres}</span></div>
                                            <div className="field-pro"><span className="field-label">Apellidos</span><span className="field-value">{est.apellidos}</span></div>
                                            <div className="field-pro"><span className="field-label">Email de Contacto</span><span className="field-value">{est.email}</span></div>
                                            <div className="field-pro"><span className="field-label">Teléfono</span><span className="field-value">{est.telefono}</span></div>
                                            <div className="field-pro"><span className="field-label">Nacionalidad</span><span className="field-value">{est.nacionalidad}</span></div>
                                            <div className="field-pro"><span className="field-label">Edad Registrada</span><span className="field-value">{est.edad} años</span></div>
                                            <div className="field-pro"><span className="field-label">Región de Residencia</span><span className="field-value">{est.ciudad_residencia}</span></div>
                                            <div className="field-pro"><span className="field-label">Habilitado SII</span><span className="field-value">{est.habilitado_sii?.toUpperCase()}</span></div>
                                            <div className="field-pro"><span className="field-label">Estado</span><span className="field-value">{est.estado?.toUpperCase()}</span></div>
                                          </div>
                                          
                                          <div className="field-pro" style={{marginTop:'30px', borderTop:'1px solid var(--border)', paddingTop:'20px'}}>
                                            <span className="field-label">Biografía Profesional</span>
                                            <p style={{fontSize:'1rem', color:'var(--text-main)', marginTop:'10px', lineHeight:'1.6'}}>{est.biografia || 'Sin biografía registrada'}</p>
                                          </div>
                                          <div className="field-pro" style={{marginTop:'20px'}}>
                                            <span className="field-label">Educación / Carrera</span>
                                            <p style={{fontSize:'0.9rem', color:'var(--text-main)', marginTop:'10px', lineHeight:'1.6'}}>{est.educacion || 'Sin datos registrados'}</p>
                                          </div>
                                          <div className="field-pro" style={{marginTop:'20px'}}>
                                            <span className="field-label">Experiencia en Terreno</span>
                                            <p style={{fontSize:'0.9rem', color:'var(--text-main)', marginTop:'10px', lineHeight:'1.6'}}>{est.experiencia_terreno || 'Sin datos registrados'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGHT COLUMN: DOCUMENTS WITH BUTTONS */}
                                    <div className="detail-column-right">
                                      <div className="card-dashboard">
                                        <div className="card-header-pro">
                                          <FileText size={20} />
                                          <h4>Documentación Adjunta</h4>
                                        </div>
                                        <div className="card-body-pro">
                                          <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                            {est.url_cv && (
                                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border)'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                  <FileText size={20} color="#dc2626" />
                                                  <span style={{fontWeight:'700', fontSize:'0.9rem'}}>Curriculum Vitae</span>
                                                </div>
                                                <a href={est.url_cv} target="_blank" rel="noreferrer" className="btn-view-doc">Ver Archivo</a>
                                              </div>
                                            )}
                                            {est.url_foto && (
                                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border)'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                  <Eye size={20} color="#2563eb" />
                                                  <span style={{fontWeight:'700', fontSize:'0.9rem'}}>Foto de Perfil</span>
                                                </div>
                                                <div style={{display:'flex', gap:'10px'}}>
                                                  <a href={est.url_foto} target="_blank" rel="noreferrer" className="btn-view-doc">Ver</a>
                                                  <button onClick={() => setCropModalData({ table: 'postulaciones_estudiantes', record: est })} className="btn-view-doc" style={{background:'var(--c-primary)', color:'white', border:'none', cursor:'pointer'}}><Crop size={14} style={{display:'inline', marginBottom:'-2px'}}/> Recortar</button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* BOTTOM SECTION: FULL WIDTH CREDENTIAL PREVIEW */}
                                  <div className="detail-row-bottom">
                                    <div className="card-dashboard">
                                      <div className="card-header-pro">
                                        <Eye size={20} />
                                        <h4>Previsualización de Credencial (Versión Idéntica)</h4>
                                      </div>
                                      <div className="card-body-pro" style={{background:'#f8fafc'}}>
                                        <div className="preview-container-pro">
                                          <div className="credential-wrapper-admin">
                                            <GuideCredential guia={mapToCredential({ ...est, nivel: 'junior' })} isExample={true} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              </div>
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

            {activeTab === 'manuales' && (
              <div className="manuales-admin-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3>Manuales de Experiencia</h3>
                  <button 
                    className="btn-add-new" 
                    onClick={() => {
                      setEditingId('new');
                      setEditData({ titulo: '', destino: '', categoria: 'Servicio', descripcion: '' });
                    }}
                  >
                    <Plus size={18} /> Agregar Nuevo Manual
                  </button>
                </div>

                {editingId === 'new' && (
                  <div className="edit-form-grid" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '15px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <div className="form-group"><label>Título del Manual</label><input name="titulo" value={editData.titulo} onChange={handleEditChange} className="form-control" placeholder="Ej: Manual Trekking Torres del Paine" /></div>
                    <div className="form-group"><label>Destino / Zona</label><input name="destino" value={editData.destino} onChange={handleEditChange} className="form-control" placeholder="Ej: Magallanes" /></div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select name="categoria" value={editData.categoria} onChange={handleEditChange} className="form-control">
                        <option value="Servicio">Servicio General</option>
                        <option value="Trekking">Trekking / Aventura</option>
                        <option value="Cultural">Cultural / Histórico</option>
                        <option value="Gastronomía">Gastronomía</option>
                        <option value="Logística">Logística</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Archivo PDF</label><input type="file" name="file_manual" onChange={handleEditChange} className="form-control" accept=".pdf" /></div>
                    <div className="full-width"><label>Descripción Corta</label><textarea name="descripcion" value={editData.descripcion} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                    <div className="edit-actions">
                      <button onClick={() => handleUpdateRecord('manuales', 'new')} className="btn btn-save" disabled={loading}><Save size={16}/> {loading ? 'Subiendo...' : 'Crear Manual'}</button>
                      <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                    </div>
                  </div>
                )}

                <table className="pro-table">
                  <thead>
                    <tr><th>Manual / Categoría</th><th>Destino</th><th>Fecha</th><th className="text-right">Acciones</th></tr>
                  </thead>
                  <tbody>
                    {manuales.map(m => (
                      <React.Fragment key={m.id}>
                        <tr className={expandedId === m.id ? 'row-expanded' : ''}>
                          <td><div className="main-text">{m.titulo}</div><div className="sub-text">{m.categoria}</div></td>
                          <td>{m.destino}</td>
                          <td>{new Date(m.created_at).toLocaleDateString()}</td>
                          <td className="text-right">
                            <div className="admin-actions">
                              <button onClick={() => toggleExpand(m.id)} className="btn-action view"><Eye size={16}/></button>
                              <button onClick={() => startEditing(m)} className="btn-action edit"><Edit size={16}/></button>
                              <a href={m.url_archivo} target="_blank" rel="noreferrer" className="btn-action download"><Download size={16}/></a>
                              <button onClick={() => handleDelete('manuales', m.id)} className="btn-action delete"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === m.id && (
                          <tr className="detail-row">
                            <td colSpan="4">
                              <div className="detail-content">
                                {editingId === m.id ? (
                                  <div className="edit-form-grid">
                                    <div className="form-group"><label>Título</label><input name="titulo" value={editData.titulo} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Destino</label><input name="destino" value={editData.destino} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Categoría</label><input name="categoria" value={editData.categoria} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Actualizar PDF</label><input type="file" name="file_manual" onChange={handleEditChange} className="form-control" accept=".pdf" /></div>
                                    <div className="full-width"><label>Descripción</label><textarea name="descripcion" value={editData.descripcion} onChange={handleEditChange} className="form-control" style={{height:'80px'}}></textarea></div>
                                    <div className="edit-actions">
                                      <button onClick={() => handleUpdateRecord('manuales', m.id)} className="btn btn-save"><Save size={16}/> Guardar Cambios</button>
                                      <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="detail-grid">
                                    <div className="full-width"><strong>Descripción:</strong> {m.descripcion || 'Sin descripción'}</div>
                                    <div className="full-width"><strong>URL Archivo:</strong> <a href={m.url_archivo} target="_blank" rel="noreferrer">{m.url_archivo}</a></div>
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
              </div>
            )}
          </div>
        </div>
      </main>

      {cropModalData && (
        <CropperModal
          imageSrc={cropModalData.record.url_foto}
          onSave={handleSaveCrop}
          onClose={() => setCropModalData(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
