import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabase';
import { 
  Users, FileText, Calendar, CheckCircle, XCircle, 
  Eye, Trash2, Check, Crop,
  Mail, Phone, MapPin, Globe, Award, BookOpen, MessageCircle,
  ShieldCheck, Briefcase, RefreshCw, Edit, Save, X as CloseIcon, Plus, Download, Star, Bell,
  Key, Sun, Moon
} from 'lucide-react';
import GuideCredential from '../components/GuideCredential';
import CropperModal from '../components/CropperModal';
import ToastContainer, { useToast } from '../components/Toast';
import ChatWindow from '../components/ChatWindow';
import emailjs from '@emailjs/browser';
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

const exportarDisponibilidadExcel = (disponibilidad, postulacionesGuias, postulacionesEstudiantes, empresas = []) => {
  if (disponibilidad.length === 0) {
    alert('No hay disponibilidades registradas para exportar.');
    return;
  }

  const dataExport = disponibilidad.map(d => {
    let nombreGuia = 'Guía Desconocido';
    let codigoGuia = '';
    let nivel = '';
    let idiomas = '';
    if (d.tipo_guia === 'guia') {
      const g = postulacionesGuias.find(x => x.id === d.guia_id);
      if (g) {
        nombreGuia = `${g.nombres || ''} ${g.apellidos || ''}`.trim();
        codigoGuia = `PRO:${String(g.id).substring(0, 5).toUpperCase()}`;
        nivel = (g.nivel || 'senior').charAt(0).toUpperCase() + (g.nivel || 'senior').slice(1);
        idiomas = Array.isArray(g.idiomas) ? g.idiomas.map(i => (typeof i === 'object' ? i.idioma : i)).join(', ') : 'Español';
      }
    } else {
      const e = postulacionesEstudiantes.find(x => x.id === d.guia_id);
      if (e) {
        nombreGuia = `${e.nombres || ''} ${e.apellidos || ''}`.trim();
        codigoGuia = `EST:${String(e.id).substring(0, 5).toUpperCase()}`;
        nivel = 'Junior';
        idiomas = Array.isArray(e.idiomas) ? e.idiomas.map(i => (typeof i === 'object' ? i.idioma : i)).join(', ') : 'Español';
      }
    }

    let estadoReserva = 'Libre';
    let empresaNombre = '';
    if (d.estado_bloqueo === 'bloqueado') {
      estadoReserva = 'Reservado';
      const emp = empresas.find(x => x.id === d.bloqueado_por);
      empresaNombre = emp ? emp.nombre_empresa : 'Empresa Asignada';
    }

    return {
      'Nombre Guía': nombreGuia,
      'Código Guía': codigoGuia,
      'Nivel': nivel,
      'Idiomas': idiomas,
      'Fecha Disponible': new Date(d.fecha + 'T12:00:00Z').toLocaleDateString(),
      'Estado Reserva': estadoReserva,
      'Empresa Adjudicada': empresaNombre
    };
  });

  const hoja = XLSX.utils.json_to_sheet(dataExport);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Disponibilidad');
  const fechaStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `Disponibilidad_Guias_${fechaStr}.xlsx`);
};

const exportarEvaluacionesExcel = (evaluaciones, postulacionesGuias, postulacionesEstudiantes, empresas = []) => {
  if (evaluaciones.length === 0) {
    alert('No hay evaluaciones registradas para exportar.');
    return;
  }

  const dataExport = evaluaciones.map(ev => {
    let nombreGuia = 'Guía Desconocido';
    let codigoGuia = 'S/N';
    if (ev.tipo_guia === 'guia') {
      const g = postulacionesGuias.find(x => x.id === ev.guia_id);
      if (g) {
        nombreGuia = `${g.nombres || ''} ${g.apellidos || ''}`.trim();
        codigoGuia = `PRO:${String(g.id).substring(0, 5).toUpperCase()}`;
      }
    } else {
      const e = postulacionesEstudiantes.find(x => x.id === ev.guia_id);
      if (e) {
        nombreGuia = `${e.nombres || ''} ${e.apellidos || ''}`.trim();
        codigoGuia = `EST:${String(e.id).substring(0, 5).toUpperCase()}`;
      }
    }

    const emp = empresas.find(x => x.id === ev.empresa_id);
    const nombreEmpresa = emp ? emp.nombre_empresa : 'Empresa Desconocida';

    return {
      'Guía': nombreGuia,
      'Código': codigoGuia,
      'Empresa': nombreEmpresa,
      'Estrellas': ev.estrellas,
      'Comentario': ev.comentario || 'Sin comentarios',
      'Fecha Evaluación': new Date(ev.created_at).toLocaleDateString('es-CL')
    };
  });

  const hoja = XLSX.utils.json_to_sheet(dataExport);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Evaluaciones');
  const fechaStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `Evaluaciones_Guias_${fechaStr}.xlsx`);
};

const AdminDashboard = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('reservas');
  const [subTab, setSubTab] = useState('guias');
  const [reservas, setReservas] = useState([]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('admin-theme', nextTheme);
  };
  const [postulacionesGuias, setPostulacionesGuias] = useState([]);
  const [postulacionesEstudiantes, setPostulacionesEstudiantes] = useState([]);
  const [relatos, setRelatos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [manuales, setManuales] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [adminActiveChatId, setAdminActiveChatId] = useState(null);
  const [adminUnread, setAdminUnread] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [cropModalData, setCropModalData] = useState(null);
  const [notasAdmin, setNotasAdmin] = useState({}); // { [dispId]: string }
  const [reservaFormId, setReservaFormId] = useState(null); // dispId del formulario de reserva abierto
  const [reservaFormData, setReservaFormData] = useState({ empresa_id: '', nombre_servicio: '' });
  const [agregarDiaGuiaId, setAgregarDiaGuiaId] = useState(null); // guia_id del formulario "agregar día" abierto
  const [agregarDiaData, setAgregarDiaData] = useState({ fecha: '', empresa_id: '', nombre_servicio: '' });
  const { toasts, addToast, removeToast } = useToast();

  const loadAdminChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAdminChats(data || []);

      const counts = {};
      for (const chat of (data || [])) {
        const { count, error: countErr } = await supabase
          .from('chat_mensajes')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('leido_admin', false)
          .neq('autor_tipo', 'admin');
        if (!countErr) {
          counts[chat.id] = count || 0;
        }
      }
      setAdminUnread(counts);
    } catch (err) {
      console.error('Error al cargar chats de admin:', err);
    }
  };

  // Reservar un día LIBRE existente (UPDATE → bloqueado)
  const handleReservarDia = async (dispRowId) => {
    if (!reservaFormData.empresa_id) {
      addToast('Selecciona una empresa antes de reservar.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('disponibilidad_guias')
        .update({
          estado_bloqueo: 'bloqueado',
          bloqueado_por: reservaFormData.empresa_id,
          nombre_servicio: reservaFormData.nombre_servicio || null,
          admin_notificado: true,
          estado_servicio: 'pendiente'
        })
        .eq('id', dispRowId);
      if (error) throw error;
      addToast('Día reservado con éxito.', 'success');
      setReservaFormId(null);
      setReservaFormData({ empresa_id: '', nombre_servicio: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Error al reservar el día.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Agregar un día NUEVO y reservarlo directamente (INSERT bloqueado)
  const handleAgregarYReservar = async (guiaId, tipoGuia) => {
    if (!agregarDiaData.fecha || !agregarDiaData.empresa_id) {
      addToast('Selecciona una fecha y una empresa.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('disponibilidad_guias')
        .upsert({
          guia_id: guiaId,
          tipo_guia: tipoGuia,
          fecha: agregarDiaData.fecha,
          estado: 'disponible',
          estado_bloqueo: 'bloqueado',
          bloqueado_por: agregarDiaData.empresa_id,
          nombre_servicio: agregarDiaData.nombre_servicio || null,
          admin_notificado: true,
          estado_servicio: 'pendiente'
        }, { onConflict: 'guia_id, fecha' });
      if (error) throw error;
      addToast('Día agregado y reservado con éxito.', 'success');
      setAgregarDiaGuiaId(null);
      setAgregarDiaData({ fecha: '', empresa_id: '', nombre_servicio: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Error al agregar y reservar el día.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData } = await supabase.from('reservas').select('*').order('created_at', { ascending: false });
      
      const colsGuiasOnly = 'id, nombres, apellidos, nombre_visual, apellido_visual, edad, telefono, email, ciudad_residencia, biografia, educacion, rutas_experiencia, url_foto, url_cv, url_sernatur, url_primeros_auxilios, url_otras_certificaciones, nivel, estado, created_at, idiomas';
      const colsEstsOnly = 'id, nombres, apellidos, nombre_visual, apellido_visual, edad, telefono, email, ciudad_residencia, biografia, educacion, experiencia_terreno, url_foto, url_cv, url_certificaciones, estado, created_at, idiomas';
      const { data: guiasData } = await supabase.from('postulaciones_guias').select(colsGuiasOnly).order('created_at', { ascending: false });
      const { data: estData } = await supabase.from('postulaciones_estudiantes').select(colsEstsOnly).order('created_at', { ascending: false });
      
      const { data: relatoData } = await supabase.from('relatos').select('*').order('fecha', { ascending: false });
      const { data: comData } = await supabase.from('comentarios_relatos').select('*, relatos(titulo)').order('fecha', { ascending: false });
      const { data: manualesData } = await supabase.from('manuales').select('*').order('created_at', { ascending: false });
      
      const colsEmp = 'id, nombre_empresa, email, contacto_nombre, telefono, estado, created_at';
      const { data: empData } = await supabase.from('empresas').select(colsEmp).order('nombre_empresa', { ascending: true });
      
      // Auto-limpieza: eliminar SOLO fechas pasadas LIBRES (no reservadas) de la base de datos
      const hoy = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD
      try {
        await supabase
          .from('disponibilidad_guias')
          .delete()
          .lt('fecha', hoy)
          .eq('estado_bloqueo', 'libre');
      } catch (err) {
        console.warn('Error during auto-cleanup of past libre dates:', err);
      }

      // Traer fechas de hoy en adelante O fechas que estén bloqueadas (para poder marcar como ejecutadas y calificar)
      const { data: dispData } = await supabase
        .from('disponibilidad_guias')
        .select('*')
        .or(`fecha.gte.${hoy},estado_bloqueo.eq.bloqueado`)
        .order('fecha', { ascending: true });

      // Traer evaluaciones de servicios
      let evData = [];
      try {
        const { data } = await supabase
          .from('evaluaciones_servicios')
          .select('*')
          .order('created_at', { ascending: false });
        evData = data || [];
      } catch (err) {
        console.warn('Table evaluaciones_servicios may not exist yet:', err);
      }
      
      setReservas(resData || []);
      setPostulacionesGuias(guiasData || []);
      setPostulacionesEstudiantes(estData || []);
      setRelatos(relatoData || []);
      setComentarios(comData || []);
      setManuales(manualesData || []);
      setDisponibilidad(dispData || []);
      setEmpresas(empData || []);
      setEvaluaciones(evData);
      
      // Load chats too
      loadAdminChats();
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

  // Marcar reservas como vistas cuando el admin entra a la tab de disponibilidad
  const marcarNotificado = async () => {
    try {
      await supabase
        .from('disponibilidad_guias')
        .update({ admin_notificado: true })
        .eq('estado_bloqueo', 'bloqueado')
        .eq('admin_notificado', false);
      // Refrescar state localmente sin recargar todo
      setDisponibilidad(prev =>
        prev.map(d => d.estado_bloqueo === 'bloqueado' && !d.admin_notificado
          ? { ...d, admin_notificado: true }
          : d
        )
      );
    } catch (err) {
      console.warn('Error al marcar notificaciones:', err);
    }
  };

  // Guardar nota interna del admin en una fecha de disponibilidad
  const handleSaveNota = async (dispId, nota) => {
    try {
      const { error } = await supabase
        .from('disponibilidad_guias')
        .update({ nota_interna_admin: nota.trim() || null })
        .eq('id', dispId);
      if (error) throw error;
      setDisponibilidad(prev =>
        prev.map(d => d.id === dispId ? { ...d, nota_interna_admin: nota.trim() || null } : d)
      );
      addToast('Nota guardada correctamente.', 'success', 2500);
    } catch (err) {
      console.error(err);
      addToast('Error al guardar la nota.', 'error');
    }
  };

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
      const updateData = { estado: newStatus };
      const isGuia = table === 'postulaciones_guias';
      const isEstudiante = table === 'postulaciones_estudiantes';

      let generatedPass = null;
      if (newStatus === 'aprobado' && (isGuia || isEstudiante)) {
        // Consultar el registro primero para ver si ya tiene contraseña
        const { data: currentRecVal, error: rpcErr } = await supabase.rpc('get_sensitive_password', { tbl: table, rec_id: id });
        const currentRec = { password: currentRecVal };
        if (currentRec && !currentRec.password) {
          generatedPass = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          updateData.password = generatedPass;
        }
      }

      const { data, error } = await supabase.from(table).update(updateData).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("El registro no se actualizó. Por favor, intenta nuevamente.");
      }

      // Si se aprobó, enviar correo automático con credenciales
      if (newStatus === 'aprobado' && (isGuia || isEstudiante)) {
        const record = data[0];
        const passToSend = record.password || generatedPass;
        if (passToSend) {
          const tipoLabel = isGuia ? 'PRO' : 'EST';
          const guiaCode = `${tipoLabel}:${String(record.id).substring(0, 5).toUpperCase()}`;
          const linkAcceso = 'https://www.guiaalacarta.cl/disponibilidad';

          try {
            await emailjs.send(
              'service_ihvjiza',
              'template_credenciales',
              {
                name: `${record.nombres || ''} ${record.apellidos || ''}`.trim(),
                email: record.email,
                message: `Hola ${record.nombres || ''},\n\n¡Tu postulación ha sido aprobada y tu perfil ya está visible en la página web!\n\nPara ingresar a registrar y actualizar tu disponibilidad en el sitio, utiliza las siguientes credenciales de acceso:\n\n- Usuario (Código): ${guiaCode}\n- Contraseña: ${passToSend}\n\nIngresa aquí para actualizar tu disponibilidad:\n${linkAcceso}\n\n¡Mucho éxito!\nEquipo Guía a la Carta`
              },
              '_nmx76wxhMLgNa1ic'
            );
            addToast('Correo de aprobación y credenciales enviado con éxito.', 'success');
          } catch (mailErr) {
            console.error("Error al enviar email de aprobación:", mailErr);
            addToast('Guía aprobado, pero hubo un error al enviar el correo de credenciales.', 'warning');
          }
        }
      }

      fetchData();
    } catch (error) {
      console.error("Error updateStatus:", error);
      alert('Hubo un problema al actualizar. Por favor, intenta nuevamente.');
    }
  };

  const handleSendCredentials = async (table, record) => {
    setLoading(true);
    try {
      let password = record.password;
      if (!password) {
        const { data: fetchedPass } = await supabase.rpc('get_sensitive_password', { tbl: table, rec_id: record.id });
        password = fetchedPass;
      }
      const isGuia = table === 'postulaciones_guias';
      
      // Si no tiene contraseña asignada, la generamos e insertamos en Supabase
      if (!password) {
        password = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error } = await supabase.from(table).update({ password }).eq('id', record.id);
        if (error) throw error;
        // Actualizar el registro local
        record.password = password;
      }

      const tipoLabel = isGuia ? 'PRO' : 'EST';
      const guiaCode = `${tipoLabel}:${String(record.id).substring(0, 5).toUpperCase()}`;
      const linkAcceso = 'https://www.guiaalacarta.cl/disponibilidad';

      await emailjs.send(
        'service_ihvjiza',
        'template_credenciales',
        {
          name: `${record.nombres || ''} ${record.apellidos || ''}`.trim(),
          email: record.email,
          message: `Hola ${record.nombres || ''},\n\nAquí tienes tus credenciales de acceso para registrar y actualizar tu disponibilidad en la página web:\n\n- Usuario (Código): ${guiaCode}\n- Contraseña: ${password}\n\nIngresa aquí para actualizar tu disponibilidad:\n${linkAcceso}\n\n¡Mucho éxito!\nEquipo Guía a la Carta`
        },
        '_nmx76wxhMLgNa1ic'
      );

      addToast('Credenciales enviadas correctamente por email.', 'success');
      fetchData();
    } catch (err) {
      console.error("Error en handleSendCredentials:", err);
      addToast('Error al generar o enviar las credenciales.', 'error');
    } finally {
      setLoading(false);
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
        finalData.idiomas = finalData.idiomas_arr.map(lang => ({ idioma: lang }));
        delete finalData.idiomas_arr;
      }
      
      if (finalData.idiomaInput !== undefined) {
        delete finalData.idiomaInput;
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
                {currentStatus === 'aprobado' && (
                  <button onClick={() => handleSendCredentials(table, record)} className="btn-action credentials" title="Enviar Credenciales por Email" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', padding: '6px', borderRadius: '6px', width: '32px', height: '32px' }}><Key size={16}/></button>
                )}
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
      <div className={`admin-dashboard-pro admin-login-page ${theme}`}>
        <div className="login-card-pro" style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Panel Administrativo</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Acceso restringido a administradores</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-bg)', color: 'var(--text-main)' }} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-bg)', color: 'var(--text-main)' }} required />
            <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Entrar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard-pro ${theme}`}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="admin-layout-wrapper">
        <aside className="admin-sidebar">
          <div className="admin-logo-section">
            <ShieldCheck size={32} className="admin-icon-brand" />
            <div>
              <h1>Guía a la Carta</h1>
              <span>Business Suite v2.0</span>
            </div>
          </div>
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
            <button
              className={`admin-nav-link ${activeTab === 'disponibilidad' ? 'active' : ''}`}
              onClick={() => { setActiveTab('disponibilidad'); marcarNotificado(); }}
              style={{ position: 'relative' }}
            >
              <Calendar size={22} /> <span>Disponibilidad Guías</span>
              {disponibilidad.filter(d => d.estado_bloqueo === 'bloqueado' && !d.admin_notificado).length > 0 && (
                <span style={{
                  position: 'absolute', top: '8px', right: '10px',
                  background: '#ef4444', color: 'white', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
                }}>
                  {disponibilidad.filter(d => d.estado_bloqueo === 'bloqueado' && !d.admin_notificado).length}
                </span>
              )}
            </button>
            <button className={`admin-nav-link ${activeTab === 'empresas' ? 'active' : ''}`} onClick={() => setActiveTab('empresas')}>
              <Briefcase size={22} /> <span>Clientes B2B</span>
            </button>
            <button className={`admin-nav-link ${activeTab === 'evaluaciones' ? 'active' : ''}`} onClick={() => setActiveTab('evaluaciones')}>
              <Star size={22} /> <span>Evaluaciones B2B</span>
            </button>
            <button 
              className={`admin-nav-link ${activeTab === 'mensajes' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('mensajes'); loadAdminChats(); }} 
              style={{ position: 'relative' }}
            >
              <MessageCircle size={22} /> <span>Mensajes</span>
              {Object.values(adminUnread).reduce((a, b) => a + b, 0) > 0 && (
                <span style={{ 
                  position: 'absolute', top: '8px', right: '10px', 
                  background: '#ef4444', color: 'white', borderRadius: '50%', 
                  width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: '800', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
                }}>
                  {Object.values(adminUnread).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </nav>
        </aside>

        <div className="admin-main-viewport">
          <header className="admin-top-bar">
            <div className="search-bar-pro">
              {/* Buscador estético tipo Mediline */}
              <div className="search-input-wrapper">
                <input type="text" placeholder="Buscar..." disabled />
              </div>
            </div>
            <div className="topbar-actions">
              <button onClick={toggleTheme} className="btn-theme-toggle" title="Cambiar Tema" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={fetchData} className="btn-refresh" disabled={loading}>
                <RefreshCw size={18} className={loading ? 'spin' : ''} /> 
                <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
              <div className="admin-user-pill" style={{ background: 'var(--panel-bg)', padding: '5px 15px', borderRadius: '30px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '0.8rem' }}>AD</div>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>Administrador</span>
              </div>
            </div>
          </header>

          <div className="admin-viewport-content">
            <section className="admin-stats-summary">
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

          {activeTab === 'disponibilidad' && (
            <div className="table-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Calendario de Disponibilidad</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Fechas reportadas como libres por los guías aprobados.</p>
                </div>
                <button 
                  onClick={() => exportarDisponibilidadExcel(disponibilidad, postulacionesGuias, postulacionesEstudiantes, empresas)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  <Download size={18} /> Exportar Excel
                </button>
              </div>
              <table className="pro-table">
                <thead>
                  <tr><th>Guía</th><th>Código</th><th>Total Días Disponibles</th><th className="text-right">Acciones</th></tr>
                </thead>
                <tbody>
                  {(() => {
                    const grouped = disponibilidad.reduce((acc, curr) => {
                      if (!acc[curr.guia_id]) acc[curr.guia_id] = { tipo_guia: curr.tipo_guia, fechas: [] };
                      acc[curr.guia_id].fechas.push(curr);
                      return acc;
                    }, {});

                    const guiasIds = Object.keys(grouped);

                    if (guiasIds.length === 0) {
                      return (
                        <tr>
                          <td colSpan="4" className="text-center" style={{ padding: '2rem' }}>
                            No hay disponibilidades registradas.
                          </td>
                        </tr>
                      );
                    }

                    return guiasIds.map(guia_id => {
                      const data = grouped[guia_id];
                      let nombreGuia = 'Guía Desconocido';
                      let codigoGuia = 'S/N';
                      if (data.tipo_guia === 'guia') {
                        const g = postulacionesGuias.find(x => x.id === guia_id);
                        if (g) {
                          nombreGuia = `${g.nombres || ''} ${g.apellidos || ''}`.trim();
                          codigoGuia = `PRO:${String(g.id).substring(0, 5).toUpperCase()}`;
                        }
                      } else {
                        const e = postulacionesEstudiantes.find(x => x.id === guia_id);
                        if (e) {
                          nombreGuia = `${e.nombres || ''} ${e.apellidos || ''}`.trim();
                          codigoGuia = `EST:${String(e.id).substring(0, 5).toUpperCase()}`;
                        }
                      }

                      // Handler for unblocking a date from Admin panel
                      const handleUnblockDate = async (dispRowId) => {
                        if (!window.confirm("¿Seguro que deseas liberar la reserva de este día para dejarlo disponible nuevamente?")) return;
                        setLoading(true);
                        try {
                          const { error } = await supabase
                            .from('disponibilidad_guias')
                            .update({ estado_bloqueo: 'libre', bloqueado_por: null, estado_servicio: 'pendiente' })
                            .eq('id', dispRowId);
                          if (error) throw error;
                          alert("Día liberado con éxito");
                          fetchData();
                        } catch (err) {
                          console.error(err);
                          alert("Error al liberar el día.");
                        } finally {
                          setLoading(false);
                        }
                      };

                      // Handler for marking a service as executed
                      const handleMarcarEjecutado = async (dispRowId) => {
                        if (!window.confirm("¿Seguro que deseas marcar este servicio como ejecutado? Esto permitirá que la empresa lo evalúe.")) return;
                        setLoading(true);
                        try {
                          const { error } = await supabase
                            .from('disponibilidad_guias')
                            .update({ estado_servicio: 'ejecutado' })
                            .eq('id', dispRowId);
                          if (error) throw error;
                          alert("Servicio marcado como ejecutado.");
                          fetchData();
                        } catch (err) {
                          console.error(err);
                          alert("Error al actualizar el servicio.");
                        } finally {
                          setLoading(false);
                        }
                      };

                      return (
                        <React.Fragment key={guia_id}>
                          <tr className={expandedId === guia_id ? 'row-expanded' : ''}>
                            <td><div className="main-text">{nombreGuia}</div></td>
                            <td><span style={{ fontWeight: '600', color: '#475569' }}>{codigoGuia}</span></td>
                            <td><div className="main-text" style={{ fontWeight: '600' }}>{data.fechas.length} días</div></td>
                            <td>
                              <div className="admin-actions">
                                <button onClick={() => toggleExpand(guia_id)} className="btn-action view" title="Ver Fechas">
                                  <Eye size={16}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedId === guia_id && (
                            <tr className="detail-row">
                              <td colSpan="4">
                                <div className="detail-content" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                  <h5 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1rem' }}>Estado detallado de disponibilidad por fecha:</h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[...data.fechas].sort((a,b) => a.fecha.localeCompare(b.fecha)).map(item => {
                                      const isBlocked = item.estado_bloqueo === 'bloqueado';
                                      const associatedCompany = isBlocked ? empresas.find(x => x.id === item.bloqueado_por) : null;
                                      return (
                                        <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              <Calendar size={16} color={isBlocked ? "#ef4444" : "#16a34a"} />
                                              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{new Date(item.fecha + 'T12:00:00Z').toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                              <span className={`status-badge ${isBlocked ? 'rechazado' : 'aprobado'}`} style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                {isBlocked ? `Reservado por: ${associatedCompany ? associatedCompany.nombre_empresa : 'Empresa B2B'}` : 'Libre / Disponible'}
                                              </span>
                                              {isBlocked && (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                  <span 
                                                    className={`status-badge ${item.estado_servicio === 'ejecutado' ? 'aprobado' : ''}`}
                                                    style={item.estado_servicio !== 'ejecutado' ? { fontSize: '0.75rem', textTransform: 'uppercase', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' } : { fontSize: '0.75rem', textTransform: 'uppercase' }}
                                                  >
                                                    {item.estado_servicio === 'ejecutado' ? 'Ejecutado ✓' : 'Pendiente'}
                                                  </span>
                                                  {item.estado_servicio !== 'ejecutado' && (
                                                    <button 
                                                      onClick={() => handleMarcarEjecutado(item.id)}
                                                      style={{ border: 'none', background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                                                      title="Marcar como Ejecutado"
                                                    >
                                                      Marcar Ejecutado
                                                    </button>
                                                  )}
                                                  <button 
                                                    onClick={() => handleUnblockDate(item.id)} 
                                                    style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                                                    title="Liberar día"
                                                  >
                                                    Liberar día
                                                  </button>
                                                </div>
                                              )}
                                              {!isBlocked && (
                                                <button
                                                  onClick={() => {
                                                    setReservaFormId(reservaFormId === item.id ? null : item.id);
                                                    setReservaFormData({ empresa_id: '', nombre_servicio: '' });
                                                  }}
                                                  style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                                                  title="Reservar este día"
                                                >
                                                  Reservar
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          {isBlocked && (
                                            <div style={{ marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                                <strong>Nombre del servicio (Tour):</strong> <span style={{ color: item.nombre_servicio ? '#0f172a' : '#94a3b8', fontStyle: item.nombre_servicio ? 'normal' : 'italic' }}>{item.nombre_servicio || 'Sin especificar'}</span>
                                              </div>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Nota Interna Admin:</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                  <textarea
                                                    className="form-control"
                                                    style={{ height: '50px', resize: 'vertical', flexGrow: 1, padding: '8px', fontSize: '0.85rem' }}
                                                    placeholder="Escribe una nota interna para este servicio..."
                                                    value={notasAdmin[item.id] !== undefined ? notasAdmin[item.id] : (item.nota_interna_admin || '')}
                                                    onChange={(e) => setNotasAdmin({ ...notasAdmin, [item.id]: e.target.value })}
                                                  />
                                                  <button
                                                    onClick={() => handleSaveNota(item.id, notasAdmin[item.id] !== undefined ? notasAdmin[item.id] : (item.nota_interna_admin || ''))}
                                                    style={{ padding: '0 15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                  >
                                                    <Save size={14} /> Guardar
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {/* Formulario inline de reserva para día LIBRE */}
                                          {!isBlocked && reservaFormId === item.id && (
                                            <div style={{ marginTop: '10px', borderTop: '1px solid #dbeafe', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#eff6ff', padding: '12px', borderRadius: '6px' }}>
                                              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Reservar este día</div>
                                              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' }}>
                                                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Empresa *</label>
                                                  <select
                                                    value={reservaFormData.empresa_id}
                                                    onChange={(e) => setReservaFormData({ ...reservaFormData, empresa_id: e.target.value })}
                                                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                                                  >
                                                    <option value="">Seleccionar empresa...</option>
                                                    {empresas.map(emp => (
                                                      <option key={emp.id} value={emp.id}>{emp.nombre_empresa}</option>
                                                    ))}
                                                  </select>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' }}>
                                                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Nombre del Tour (opcional)</label>
                                                  <input
                                                    type="text"
                                                    placeholder="Ej: Torres del Paine Full Day"
                                                    value={reservaFormData.nombre_servicio}
                                                    onChange={(e) => setReservaFormData({ ...reservaFormData, nombre_servicio: e.target.value })}
                                                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                  />
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                  <button
                                                    onClick={() => handleReservarDia(item.id)}
                                                    disabled={loading}
                                                    style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                                                  >
                                                    {loading ? 'Guardando...' : 'Confirmar Reserva'}
                                                  </button>
                                                  <button
                                                    onClick={() => { setReservaFormId(null); setReservaFormData({ empresa_id: '', nombre_servicio: '' }); }}
                                                    style={{ padding: '6px 14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                                  >
                                                    Cancelar
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}

                                    {/* Botón para agregar y reservar un día nuevo */}
                                    {agregarDiaGuiaId !== guia_id ? (
                                      <button
                                        onClick={() => {
                                          setAgregarDiaGuiaId(guia_id);
                                          setAgregarDiaData({ fecha: '', empresa_id: '', nombre_servicio: '' });
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', color: '#2563eb', border: '2px dashed #93c5fd', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#2563eb'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                                      >
                                        <Plus size={16} /> Agregar y Reservar Día
                                      </button>
                                    ) : (
                                      <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Agregar y Reservar un Día Nuevo</div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '0 0 170px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Fecha *</label>
                                            <input
                                              type="date"
                                              value={agregarDiaData.fecha}
                                              min={new Date().toISOString().slice(0, 10)}
                                              onChange={(e) => setAgregarDiaData({ ...agregarDiaData, fecha: e.target.value })}
                                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                            />
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Empresa *</label>
                                            <select
                                              value={agregarDiaData.empresa_id}
                                              onChange={(e) => setAgregarDiaData({ ...agregarDiaData, empresa_id: e.target.value })}
                                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                                            >
                                              <option value="">Seleccionar empresa...</option>
                                              {empresas.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.nombre_empresa}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Tour (opcional)</label>
                                            <input
                                              type="text"
                                              placeholder="Ej: Glaciar Grey"
                                              value={agregarDiaData.nombre_servicio}
                                              onChange={(e) => setAgregarDiaData({ ...agregarDiaData, nombre_servicio: e.target.value })}
                                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                            />
                                          </div>
                                          <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                              onClick={() => handleAgregarYReservar(guia_id, data.tipo_guia)}
                                              disabled={loading}
                                              style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                                            >
                                              {loading ? 'Guardando...' : 'Confirmar'}
                                            </button>
                                            <button
                                              onClick={() => { setAgregarDiaGuiaId(null); setAgregarDiaData({ fecha: '', empresa_id: '', nombre_servicio: '' }); }}
                                              style={{ padding: '6px 14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                            >
                                              Cancelar
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
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
                        <td data-label="Empresa / Contacto"><div className="main-text">{res.empresa}</div><div className="sub-text">{res.contacto_nombre}</div></td>
                        <td data-label="Servicio / Fecha"><div className="main-text">{new Date(res.fecha_servicio).toLocaleDateString()}</div><div className="sub-text">{res.nivel_guia}</div></td>
                        <td data-label="Destino">{res.destino}</td>
                        <td data-label="Estado"><span className={`status-badge ${res.estado}`}>{res.estado}</span></td>
                        <td data-label="Acciones"><ActionButtons table="reservas" id={res.id} currentStatus={res.estado} record={res} /></td>
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

            {activeTab === 'empresas' && (
              <div className="empresas-admin-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3>Gestión de Clientes B2B (Empresas de Turismo)</h3>
                  <button 
                    className="btn-add-new" 
                    onClick={() => {
                      setEditingId('new');
                      setEditData({ nombre_empresa: '', email: '', password: '', contacto_nombre: '', telefono: '', estado: 'activo' });
                    }}
                  >
                    <Plus size={18} /> Registrar Nueva Empresa
                  </button>
                </div>

                {editingId === 'new' && (
                  <div className="edit-form-grid" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '15px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <div className="form-group"><label>Nombre de la Empresa</label><input name="nombre_empresa" value={editData.nombre_empresa || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: Turismo Patagonia Excursiones" required /></div>
                    <div className="form-group"><label>Correo Electrónico (Login)</label><input type="email" name="email" value={editData.email || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: correo@patagonia.com" required /></div>
                    <div className="form-group"><label>Contraseña de Acceso</label><input type="password" name="password" value={editData.password || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: ********" required /></div>
                    <div className="form-group"><label>Nombre del Contacto</label><input name="contacto_nombre" value={editData.contacto_nombre || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: Carlos Mendoza" /></div>
                    <div className="form-group"><label>Teléfono de Contacto</label><input name="telefono" value={editData.telefono || ''} onChange={handleEditChange} className="form-control" placeholder="Ej: +56 9 8765 4321" /></div>
                    <div className="form-group">
                      <label>Estado</label>
                      <select name="estado" value={editData.estado || 'activo'} onChange={handleEditChange} className="form-control">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                    <div className="edit-actions">
                      <button onClick={() => handleUpdateRecord('empresas', 'new')} className="btn btn-save" disabled={loading}><Save size={16}/> {loading ? 'Creando...' : 'Crear Empresa'}</button>
                      <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                    </div>
                  </div>
                )}

                <table className="pro-table">
                  <thead>
                    <tr><th>Nombre Empresa</th><th>Email</th><th>Contacto</th><th>Estado</th><th className="text-right">Acciones</th></tr>
                  </thead>
                  <tbody>
                    {empresas.map(emp => (
                      <React.Fragment key={emp.id}>
                        <tr className={expandedId === emp.id ? 'row-expanded' : ''}>
                          <td><div className="main-text">{emp.nombre_empresa}</div></td>
                          <td>{emp.email}</td>
                          <td><div className="main-text">{emp.contacto_nombre || 'S/N'}</div><div className="sub-text">{emp.telefono || ''}</div></td>
                          <td><span className={`status-badge ${emp.estado === 'activo' ? 'aprobado' : 'rechazado'}`}>{emp.estado}</span></td>
                          <td className="text-right">
                            <div className="admin-actions">
                              <button onClick={() => toggleExpand(emp.id)} className="btn-action view" title="Ver Bloqueos"><Eye size={16}/></button>
                              <button onClick={() => startEditing(emp)} className="btn-action edit" title="Editar"><Edit size={16}/></button>
                              <button onClick={() => handleDelete('empresas', emp.id)} className="btn-action delete" title="Eliminar"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === emp.id && (
                          <tr className="detail-row">
                            <td colSpan="5">
                              <div className="detail-content">
                                {editingId === emp.id ? (
                                  <div className="edit-form-grid">
                                    <div className="form-group"><label>Nombre Empresa</label><input name="nombre_empresa" value={editData.nombre_empresa || ''} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Email</label><input type="email" name="email" value={editData.email || ''} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Contraseña</label><input type="password" name="password" value={editData.password || ''} onChange={handleEditChange} className="form-control" placeholder="Dejar en blanco para no modificar" /></div>
                                    <div className="form-group"><label>Contacto</label><input name="contacto_nombre" value={editData.contacto_nombre || ''} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group"><label>Teléfono</label><input name="telefono" value={editData.telefono || ''} onChange={handleEditChange} className="form-control" /></div>
                                    <div className="form-group">
                                      <label>Estado</label>
                                      <select name="estado" value={editData.estado || 'activo'} onChange={handleEditChange} className="form-control">
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                      </select>
                                    </div>
                                    <div className="edit-actions">
                                      <button onClick={() => handleUpdateRecord('empresas', emp.id)} className="btn btn-save"><Save size={16}/> Guardar Cambios</button>
                                      <button onClick={cancelEditing} className="btn btn-cancel"><CloseIcon size={16}/> Cancelar</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="detail-grid" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div className="full-width">
                                      <h5 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1rem' }}>Días Bloqueados / Reservados por esta empresa:</h5>
                                      {(() => {
                                        const bookedDays = disponibilidad.filter(d => d.bloqueado_por === emp.id);
                                        if (bookedDays.length === 0) {
                                          return <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Esta empresa no tiene guías reservados actualmente.</p>;
                                        }

                                        return (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {bookedDays.map(item => {
                                              let nombreGuia = 'Guía Desconocido';
                                              let cod = 'S/N';
                                              if (item.tipo_guia === 'guia') {
                                                const g = postulacionesGuias.find(x => x.id === item.guia_id);
                                                if (g) {
                                                  nombreGuia = `${g.nombres || ''} ${g.apellidos || ''}`.trim();
                                                  cod = `PRO:${String(g.id).substring(0, 5).toUpperCase()}`;
                                                }
                                              } else {
                                                const e = postulacionesEstudiantes.find(x => x.id === item.guia_id);
                                                if (e) {
                                                  nombreGuia = `${e.nombres || ''} ${e.apellidos || ''}`.trim();
                                                  cod = `EST:${String(e.id).substring(0, 5).toUpperCase()}`;
                                                }
                                              }

                                              return (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Calendar size={16} color="#ef4444" />
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{new Date(item.fecha + 'T12:00:00Z').toLocaleDateString()}</span>
                                                  </div>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#0f172a' }}>{nombreGuia} ({cod})</span>
                                                    <span className="status-badge rechazado" style={{ fontSize: '0.75rem' }}>Reservado</span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })()}
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
              </div>
            )}

            {activeTab === 'evaluaciones' && (
              <div className="evaluaciones-admin-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h3>Evaluaciones de Servicios Recibidas</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Comentarios y calificaciones internas provistas por las agencias asociadas.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => exportarEvaluacionesExcel(evaluaciones, postulacionesGuias, postulacionesEstudiantes, empresas)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      <Download size={18} /> Exportar Excel
                    </button>
                    <button className="btn-portal-refresh" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <RefreshCw size={15} />
                      <span>Actualizar</span>
                    </button>
                  </div>
                </div>

                {evaluaciones.length > 0 && (() => {
                  const promedioPorGuia = (() => {
                    const map = {};
                    evaluaciones.forEach(ev => {
                      const key = `${ev.guia_id}_${ev.tipo_guia}`;
                      if (!map[key]) {
                        map[key] = {
                          guia_id: ev.guia_id,
                          tipo_guia: ev.tipo_guia,
                          sumaEstrellas: 0,
                          count: 0
                        };
                      }
                      map[key].sumaEstrellas += ev.estrellas;
                      map[key].count += 1;
                    });

                    return Object.values(map).map(item => {
                      let nombre = 'Guía Desconocido';
                      let codigo = 'S/N';
                      if (item.tipo_guia === 'guia') {
                        const g = postulacionesGuias.find(x => x.id === item.guia_id);
                        if (g) {
                          nombre = `${g.nombres || ''} ${g.apellidos || ''}`.trim();
                          codigo = `PRO:${String(g.id).substring(0, 5).toUpperCase()}`;
                        }
                      } else {
                        const e = postulacionesEstudiantes.find(x => x.id === item.guia_id);
                        if (e) {
                          nombre = `${e.nombres || ''} ${e.apellidos || ''}`.trim();
                          codigo = `EST:${String(e.id).substring(0, 5).toUpperCase()}`;
                        }
                      }
                      return {
                        ...item,
                        nombre,
                        codigo,
                        promedio: item.sumaEstrellas / item.count
                      };
                    });
                  })();

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
                      {promedioPorGuia.map(p => (
                        <div key={`${p.guia_id}_${p.tipo_guia}`} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '800' }}>{p.nombre}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{p.codigo}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '3px', color: '#fbbf24' }}>
                              {[1, 2, 3, 4, 5].map((star) => {
                                const difference = p.promedio - star + 1;
                                let fill = 'none';
                                if (difference >= 1) fill = '#fbbf24';
                                else if (difference > 0) fill = 'url(#halfStarGradient)'; // partial star
                                return (
                                  <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <defs>
                                      <linearGradient id="halfStarGradient">
                                        <stop offset="50%" stopColor="#fbbf24" />
                                        <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                                      </linearGradient>
                                    </defs>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                );
                              })}
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a' }}>{p.promedio.toFixed(1)}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Basado en {p.count} evaluación{p.count > 1 ? 'es' : ''}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {evaluaciones.length === 0 ? (
                  <div className="portal-empty-state" style={{ padding: '3rem', background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div className="empty-icon" style={{ margin: '0 auto 1rem auto', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
                      <Star size={24} />
                    </div>
                    <h4>No hay evaluaciones aún</h4>
                    <p style={{ color: '#64748b' }}>Las evaluaciones aparecerán aquí una vez que los clientes califiquen sus servicios ejecutados.</p>
                  </div>
                ) : (
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>Guía</th>
                        <th>Empresa</th>
                        <th>Calificación</th>
                        <th>Comentario</th>
                        <th>Fecha de Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluaciones.map(ev => {
                        let nombreGuia = 'Guía Desconocido';
                        let codigoGuia = 'S/N';
                        if (ev.tipo_guia === 'guia') {
                          const g = postulacionesGuias.find(x => x.id === ev.guia_id);
                          if (g) {
                            nombreGuia = `${g.nombres || ''} ${g.apellidos || ''}`.trim();
                            codigoGuia = `PRO:${String(g.id).substring(0, 5).toUpperCase()}`;
                          }
                        } else {
                          const e = postulacionesEstudiantes.find(x => x.id === ev.guia_id);
                          if (e) {
                            nombreGuia = `${e.nombres || ''} ${e.apellidos || ''}`.trim();
                            codigoGuia = `EST:${String(e.id).substring(0, 5).toUpperCase()}`;
                          }
                        }

                        const emp = empresas.find(x => x.id === ev.empresa_id);
                        const nombreEmpresa = emp ? emp.nombre_empresa : 'Empresa Desconocida';

                        return (
                          <tr key={ev.id}>
                            <td>
                              <div className="main-text" style={{ fontWeight: '600' }}>{nombreGuia}</div>
                              <div className="sub-text" style={{ fontSize: '0.75rem', color: '#64748b' }}>{codigoGuia}</div>
                            </td>
                            <td>
                              <div className="main-text">{nombreEmpresa}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '3px', color: '#fbbf24' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    size={16} 
                                    fill={star <= ev.estrellas ? '#fbbf24' : 'none'} 
                                    stroke={star <= ev.estrellas ? '#fbbf24' : '#d1d5db'}
                                  />
                                ))}
                              </div>
                            </td>
                            <td>
                              <div className="main-text" style={{ fontStyle: ev.comentario ? 'normal' : 'italic', color: ev.comentario ? '#334155' : '#94a3b8', maxWidth: '350px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {ev.comentario || 'Sin comentarios adicionales'}
                              </div>
                            </td>
                            <td>
                              <div className="sub-text">{new Date(ev.created_at).toLocaleDateString('es-CL', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'mensajes' && (
              <div className="table-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'white', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1.2rem', fontWeight: '800' }}>Centro de Mensajes</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Canales de comunicación entre empresas, guías y administración.</p>
                  </div>
                  <button 
                    onClick={loadAdminChats} 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
                  >
                    <RefreshCw size={16} /> Actualizar
                  </button>
                </div>

                {adminChats.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <MessageCircle size={48} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>No hay chats activos registrados aún.</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>Los chats se generan automáticamente al confirmar una reserva.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {adminChats.map(chat => {
                      const unread = adminUnread[chat.id] || 0;
                      const isActive = adminActiveChatId === chat.id;
                      return (
                        <div 
                          key={chat.id} 
                          onClick={() => setAdminActiveChatId(isActive ? null : chat.id)} 
                          style={{ 
                            background: isActive ? '#f0fdf4' : 'white', 
                            border: isActive ? '2px solid #10b981' : '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            padding: '1.25rem', 
                            cursor: 'pointer', 
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 4px 12px rgba(16,185,129,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>
                                {chat.empresa_nombre} ↔ {chat.guia_nombre}
                              </p>
                              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>
                                  {chat.nombre_servicio || 'Servicio de Guiado'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {chat.fecha_servicio && new Date(chat.fecha_servicio + 'T12:00:00Z').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            {unread > 0 && (
                              <span style={{ 
                                background: '#ef4444', 
                                color: 'white', 
                                borderRadius: '50%', 
                                width: '22px', 
                                height: '22px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.75rem', 
                                fontWeight: '800', 
                                flexShrink: 0,
                                boxShadow: '0 2px 5px rgba(239,68,68,0.3)'
                              }}>
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {adminActiveChatId && (() => {
                  const chat = adminChats.find(c => c.id === adminActiveChatId);
                  if (!chat) return null;
                  return (
                    <div style={{ maxWidth: '750px', margin: '1.5rem auto 0 auto' }}>
                      <ChatWindow 
                        chatId={adminActiveChatId} 
                        autorTipo="admin" 
                        autorNombre="Administrador" 
                        titulo={`${chat.empresa_nombre} ↔ ${chat.guia_nombre}`} 
                        subtitulo={[chat.nombre_servicio, chat.fecha_servicio && new Date(chat.fecha_servicio + 'T12:00:00Z').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })].filter(Boolean).join(' · ')} 
                        onClose={() => { 
                          setAdminActiveChatId(null); 
                          loadAdminChats(); 
                        }} 
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>

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
