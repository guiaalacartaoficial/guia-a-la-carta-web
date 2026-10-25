import React, { useState } from 'react';
import { Check, ChevronDown, Plus, X, PenLine } from 'lucide-react';
import { SECTORES_GUIA } from '../data/tiposGuia';
import './TipoGuiaSelector.css';

/**
 * Selector múltiple de tipos de guía agrupados por sector.
 * - `selected`: array de nombres de tipos seleccionados
 * - `otros`: array de textos libres ("Otro")
 */
const TipoGuiaSelector = ({ selected, onChangeSelected, otros, onChangeOtros, error }) => {
  const [openSectors, setOpenSectors] = useState(() => new Set([SECTORES_GUIA[0].id]));
  const [otroActivo, setOtroActivo] = useState(otros.length > 0);
  const [otroInput, setOtroInput] = useState('');

  const toggleSector = (id) => {
    setOpenSectors((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTipo = (nombre) => {
    onChangeSelected(
      selected.includes(nombre) ? selected.filter((t) => t !== nombre) : [...selected, nombre]
    );
  };

  const addOtro = () => {
    const value = otroInput.trim();
    if (!value) return;
    if (!otros.some((o) => o.toLowerCase() === value.toLowerCase())) {
      onChangeOtros([...otros, value]);
    }
    setOtroInput('');
  };

  const toggleOtro = () => {
    if (otroActivo) {
      onChangeOtros([]);
      setOtroInput('');
    }
    setOtroActivo(!otroActivo);
  };

  const total = selected.length + otros.length;

  return (
    <div className={`tipo-guia-selector ${error ? 'has-error' : ''}`}>
      <div className="tgs-summary">
        <span>Selecciona todas las especialidades en las que te desempeñas.</span>
        <span className={`tgs-counter ${total > 0 ? 'active' : ''}`}>
          {total} seleccionada{total === 1 ? '' : 's'}
        </span>
      </div>

      {SECTORES_GUIA.map((sector, idx) => {
        const isOpen = openSectors.has(sector.id);
        const countInSector = sector.tipos.filter((t) => selected.includes(t.nombre)).length;
        return (
          <div key={sector.id} className={`tgs-sector ${isOpen ? 'open' : ''}`}>
            <button type="button" className="tgs-sector-header" onClick={() => toggleSector(sector.id)} aria-expanded={isOpen}>
              <span className="tgs-sector-num">{idx + 1}</span>
              <span className="tgs-sector-text">
                <strong>{sector.nombre}</strong>
                <small>{sector.descripcion}</small>
              </span>
              {countInSector > 0 && <span className="tgs-sector-badge">{countInSector}</span>}
              <ChevronDown size={20} className="tgs-chevron" />
            </button>

            {isOpen && (
              <div className="tgs-options">
                {sector.tipos.map((tipo) => {
                  const checked = selected.includes(tipo.nombre);
                  return (
                    <label key={tipo.nombre} className={`tgs-option ${checked ? 'checked' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleTipo(tipo.nombre)} />
                      <span className="tgs-check">{checked && <Check size={14} strokeWidth={3} />}</span>
                      <span className="tgs-option-text">
                        <strong>{tipo.nombre}</strong>
                        <small>{tipo.alcance}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* OTRO */}
      <div className={`tgs-sector tgs-otro ${otroActivo ? 'open' : ''}`}>
        <label className={`tgs-option tgs-otro-toggle ${otroActivo ? 'checked' : ''}`}>
          <input type="checkbox" checked={otroActivo} onChange={toggleOtro} />
          <span className="tgs-check">{otroActivo && <Check size={14} strokeWidth={3} />}</span>
          <span className="tgs-option-text">
            <strong><PenLine size={15} style={{ marginBottom: '-2px' }} /> Otro</strong>
            <small>¿Realizas una especialidad que no aparece en la lista? Agrégala aquí (puedes añadir más de una).</small>
          </span>
        </label>

        {otroActivo && (
          <div className="tgs-otro-body">
            <div className="tgs-otro-input-row">
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Guía de Turismo Rural, Guía de Fotografía..."
                value={otroInput}
                maxLength={80}
                onChange={(e) => setOtroInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addOtro(); }
                }}
              />
              <button type="button" className="btn-add-idioma" onClick={addOtro}>
                <Plus size={16} style={{ marginBottom: '-3px' }} /> Añadir
              </button>
            </div>
            {otros.length > 0 ? (
              <div className="idiomas-chips-container">
                {otros.map((o) => (
                  <div key={o} className="idioma-chip">
                    {o}
                    <button type="button" onClick={() => onChangeOtros(otros.filter((x) => x !== o))} title="Eliminar">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="tgs-hint">Escribe la especialidad y presiona “Añadir” o Enter.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="tgs-error">{error}</p>}
    </div>
  );
};

export default TipoGuiaSelector;
