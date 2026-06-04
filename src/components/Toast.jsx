import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

// ─── Hook for easy toast usage ───────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

// ─── Single Toast Item ────────────────────────────────────────
const ToastItem = ({ id, message, type, duration, onRemove }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error:   <XCircle size={18} />,
    info:    <Info size={18} />,
    warning: <AlertTriangle size={18} />,
  };

  return (
    <div
      className={`toast ${type} ${exiting ? 'exiting' : ''}`}
      style={{ '--duration': `${duration}ms` }}
    >
      <span className="toast-icon">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={handleClose} aria-label="Cerrar">
        <X size={14} />
      </button>
      <div className="toast-progress" />
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
