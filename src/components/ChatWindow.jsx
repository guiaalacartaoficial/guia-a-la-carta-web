import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Send, X, MessageCircle, ChevronDown, Paperclip, Image as ImageIcon, FileText, Download } from 'lucide-react';
import './ChatWindow.css';

/**
 * ChatWindow — Panel de chat en tiempo real (Supabase Realtime) con adjuntos
 *
 * Props:
 *   chatId       {string}  UUID del chat
 *   autorTipo    {string}  'empresa' | 'guia' | 'admin'
 *   autorNombre  {string}  Nombre para mostrar en los mensajes
 *   titulo       {string}  Título del panel (ej: "Chat con Empresa XYZ")
 *   subtitulo    {string}  Subtítulo opcional (ej: "Tour Villarrica — 15 jul")
 *   onClose      {func}    Callback para cerrar el panel
 */
const ChatWindow = ({ chatId, autorTipo, autorNombre, titulo, subtitulo, onClose }) => {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const bodyRef = useRef(null);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_mensajes')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      setMensajes(data || []);
      marcarLeidos(data || []);
    };

    loadMessages();

    // Suscripción en tiempo real
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_mensajes', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMensajes(prev => {
            // Evitar duplicados
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          marcarLeidoSingle(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [chatId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  // Marcar mensajes como leídos según el tipo de actor
  const marcarLeidos = async (msgs) => {
    if (!msgs || msgs.length === 0) return;
    const campo = autorTipo === 'empresa' ? 'leido_empresa'
                : autorTipo === 'guia'    ? 'leido_guia'
                : 'leido_admin';
    const noLeidos = msgs.filter(m => !m[campo]).map(m => m.id);
    if (noLeidos.length === 0) return;
    await supabase
      .from('chat_mensajes')
      .update({ [campo]: true })
      .in('id', noLeidos);
  };

  const marcarLeidoSingle = async (msg) => {
    const campo = autorTipo === 'empresa' ? 'leido_empresa'
                : autorTipo === 'guia'    ? 'leido_guia'
                : 'leido_admin';
    await supabase
      .from('chat_mensajes')
      .update({ [campo]: true })
      .eq('id', msg.id);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const texto = input.trim();
    if (!texto || sending) return;

    setSending(true);
    setInput('');

    const nuevoMensaje = {
      chat_id: chatId,
      autor_tipo: autorTipo,
      autor_nombre: autorNombre,
      contenido: texto,
      leido_empresa: autorTipo === 'empresa',
      leido_guia: autorTipo === 'guia',
      leido_admin: autorTipo === 'admin',
    };

    await supabase.from('chat_mensajes').insert(nuevoMensaje);
    setSending(false);
  };

  // Subir archivos y fotos al Storage y mandar el mensaje
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `chat_adjuntos/${chatId}/${fileName}`;

      // Subir a bucket "documentos" (que ya está configurado y es público en el proyecto)
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);
      const fileUrl = data.publicUrl;

      // El contenido del mensaje será una etiqueta especial o JSON indicando que es un archivo
      // Usaremos un formato plano amigable: [archivo:URL:nombre]
      const adjuntoMeta = `[archivo:${fileUrl}:${file.name}]`;

      const nuevoMensaje = {
        chat_id: chatId,
        autor_tipo: autorTipo,
        autor_nombre: autorNombre,
        contenido: adjuntoMeta,
        leido_empresa: autorTipo === 'empresa',
        leido_guia: autorTipo === 'guia',
        leido_admin: autorTipo === 'admin',
      };

      await supabase.from('chat_mensajes').insert(nuevoMensaje);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      alert('Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) return 'Hoy';
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    if (d.toDateString() === ayer.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  // Agrupar mensajes por fecha
  const getMsgGroups = () => {
    const groups = [];
    let lastDate = null;
    mensajes.forEach(m => {
      const fecha = new Date(m.created_at).toDateString();
      if (fecha !== lastDate) {
        groups.push({ type: 'separator', fecha: m.created_at, id: `sep-${m.id}` });
        lastDate = fecha;
      }
      groups.push({ type: 'message', data: m });
    });
    return groups;
  };

  const getAutorColor = (tipo) => {
    if (tipo === 'empresa') return 'var(--chat-empresa)';
    if (tipo === 'guia')    return 'var(--chat-guia)';
    return 'var(--chat-admin)';
  };

  const isOwnMessage = (msg) => msg.autor_tipo === autorTipo;

  // Analizar y renderizar contenido (Texto vs Archivos)
  const renderMessageContent = (contenido) => {
    if (contenido.startsWith('[archivo:') && contenido.endsWith(']')) {
      const parts = contenido.slice(9, -1).split(':');
      // parts[0] es la URL de descarga (contiene "https://..." y posiblemente dos puntos, por lo que debemos juntar)
      // El formato es [archivo:URL:nombre]
      // Para evitar romper por los ":" de la URL, buscamos los índices
      const primerColon = contenido.indexOf(':');
      const ultimoColon = contenido.lastIndexOf(':');
      const url = contenido.substring(primerColon + 1, ultimoColon);
      const nombre = contenido.substring(ultimoColon + 1, contenido.length - 1);

      const ext = nombre.split('.').pop().toLowerCase();
      const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);

      if (esImagen) {
        return (
          <div className="chat-attachment-image">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img src={url} alt={nombre} style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', maxHeight: '180px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
            </a>
            <span style={{ display: 'block', fontSize: '0.72rem', marginTop: '4px', opacity: 0.8, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {nombre}
            </span>
          </div>
        );
      } else {
        return (
          <div className="chat-attachment-file" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <FileText size={20} style={{ color: '#0E5B4C' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{nombre}</p>
            </div>
            <a href={url} download={nombre} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '1px solid #cbd5e1', color: '#475569' }} title="Descargar">
              <Download size={14} />
            </a>
          </div>
        );
      }
    }

    return <p className="chat-bubble-text">{contenido}</p>;
  };

  return (
    <div className="chat-window" role="dialog" aria-label="Chat en tiempo real">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="chat-title">{titulo || 'Chat'}</p>
            {subtitulo && <span className="chat-subtitle">{subtitulo}</span>}
          </div>
        </div>
        <div className="chat-header-actions">
          <span className="chat-online-dot" title="En línea" />
          {onClose && (
            <button className="chat-close-btn" onClick={onClose} aria-label="Cerrar chat">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="chat-body" ref={bodyRef} onScroll={handleScroll}>
        {mensajes.length === 0 && (
          <div className="chat-empty">
            <MessageCircle size={32} />
            <p>Sé el primero en enviar un mensaje</p>
            <span>Los mensajes y adjuntos son visibles para todas las partes</span>
          </div>
        )}

        {getMsgGroups().map(item => {
          if (item.type === 'separator') {
            return (
              <div key={item.id} className="chat-date-separator">
                <span>{formatDate(item.fecha)}</span>
              </div>
            );
          }

          const msg = item.data;
          const esPropio = isOwnMessage(msg);

          return (
            <div
              key={msg.id}
              className={`chat-msg-row ${esPropio ? 'own' : 'other'}`}
            >
              {!esPropio && (
                <div
                  className="chat-msg-avatar"
                  style={{ background: getAutorColor(msg.autor_tipo) }}
                  title={msg.autor_nombre}
                >
                  {(msg.autor_nombre || '?')[0].toUpperCase()}
                </div>
              )}
              <div className={`chat-bubble ${esPropio ? 'own' : 'other'}`}>
                {!esPropio && (
                  <span
                    className="chat-bubble-author"
                    style={{ color: getAutorColor(msg.autor_tipo) }}
                  >
                    {msg.autor_nombre}
                    <span className="chat-bubble-role">
                      {msg.autor_tipo === 'empresa' ? ' · Empresa' : msg.autor_tipo === 'admin' ? ' · Admin' : ' · Guía'}
                    </span>
                  </span>
                )}
                {renderMessageContent(msg.contenido)}
                <span className="chat-bubble-time">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Botón scroll to bottom */}
      {showScrollBtn && (
        <button className="chat-scroll-btn" onClick={scrollToBottom} aria-label="Ir al final">
          <ChevronDown size={18} />
        </button>
      )}

      {/* Footer / Input */}
      <form className="chat-footer" onSubmit={handleSend}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="chat-attach-btn"
          disabled={uploading || sending}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #cbd5e1', background: 'white', color: '#64748b', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
          title={uploading ? 'Subiendo...' : 'Adjuntar archivo o imagen'}
        >
          {uploading ? (
            <div className="spinner-mini" style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTopColor: '#0E5B4C', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          ) : (
            <Paperclip size={18} />
          )}
        </button>

        <input
          className="chat-input"
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending || uploading}
          maxLength={1000}
          autoComplete="off"
        />
        <button
          className="chat-send-btn"
          type="submit"
          disabled={!input.trim() || sending || uploading}
          aria-label="Enviar mensaje"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
