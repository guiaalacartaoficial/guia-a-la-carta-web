import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../services/supabase';
import 'leaflet/dist/leaflet.css';
import './ChileMap.css';

// Custom Logo Icon for the pins
const logoIcon = new L.Icon({
  iconUrl: '/logo.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'custom-logo-marker'
});

const regionesChile = [
  { id: 1, nombre: 'Arica y Parinacota', lat: -18.4746, lng: -70.2979, guias: 12 },
  { id: 2, nombre: 'Tarapacá', lat: -20.2307, lng: -70.1357, guias: 15 },
  { id: 3, nombre: 'Antofagasta', lat: -23.6509, lng: -70.3975, guias: 28 },
  { id: 4, nombre: 'Atacama', lat: -27.3671, lng: -70.3322, guias: 10 },
  { id: 5, nombre: 'Coquimbo', lat: -29.9533, lng: -71.2519, guias: 35 },
  { id: 6, nombre: 'Valparaíso', lat: -33.0472, lng: -71.6127, guias: 42 },
  { id: 7, nombre: 'Metropolitana', lat: -33.4489, lng: -70.6693, guias: 156 },
  { id: 8, nombre: 'O\'Higgins', lat: -34.1708, lng: -70.7444, guias: 22 },
  { id: 9, nombre: 'Maule', lat: -35.4264, lng: -71.6554, guias: 18 },
  { id: 10, nombre: 'Ñuble', lat: -36.6063, lng: -72.1033, guias: 14 },
  { id: 11, nombre: 'Biobío', lat: -36.8201, lng: -73.0447, guias: 25 },
  { id: 12, nombre: 'Araucanía', lat: -38.7359, lng: -72.5904, guias: 38 },
  { id: 13, nombre: 'Los Ríos', lat: -39.8196, lng: -73.2452, guias: 30 },
  { id: 14, nombre: 'Los Lagos', lat: -41.4693, lng: -72.9421, guias: 45 },
  { id: 15, nombre: 'Aysén', lat: -45.5712, lng: -72.0685, guias: 20 },
  { id: 16, nombre: 'Magallanes', lat: -53.1638, lng: -70.9171, guias: 33 },
];

const ChileMap = () => {
  const [regiones, setRegiones] = useState(regionesChile);
  const chileCenter = [-35.6751, -71.543]; // Center of Chile

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Obtenemos todos los registros para que el mapa se actualice apenas se registran (como pidió el usuario)
        const { data: guias, error: errG } = await supabase.from('postulaciones_guias').select('ciudad_residencia');
        const { data: ests, error: errE } = await supabase.from('postulaciones_estudiantes').select('ciudad_residencia');

        if (errG || errE) throw errG || errE;

        const allRecords = [...(guias || []), ...(ests || [])];
        
        // Función para normalizar texto (quitar acentos y pasar a minúsculas)
        const normalizeText = (text) => {
          if (!text) return "";
          return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        };

        // Mapeo robusto de ciudad a región
        const getRegionFromCity = (city) => {
          if (!city) return null;
          const c = normalizeText(city);
          
          if (c.includes('santiago') || c.includes('metropol') || c.includes('puente alto') || c.includes('maipu') || c.includes('la florida') || c.includes('san bernardo') || c.includes('independencia') || c.includes('providencia')) return 'Metropolitana';
          if (c.includes('valparaiso') || c.includes('vina') || c.includes('concon') || c.includes('quilpue') || c.includes('villa alemana') || c.includes('san antonio')) return 'Valparaíso';
          if (c.includes('arica') || c.includes('parinacota')) return 'Arica y Parinacota';
          if (c.includes('tarapaca') || c.includes('iquique')) return 'Tarapacá';
          if (c.includes('antofagasta') || c.includes('calama') || c.includes('san pedro')) return 'Antofagasta';
          if (c.includes('atacama') || c.includes('copiapo') || c.includes('vallenar')) return 'Atacama';
          if (c.includes('coquimbo') || c.includes('la serena') || c.includes('ovalle')) return 'Coquimbo';
          if (c.includes('ohiggins') || c.includes('rancagua') || c.includes('san fernando') || c.includes('machali')) return 'O\'Higgins';
          if (c.includes('maule') || c.includes('talca') || c.includes('curico') || c.includes('linares')) return 'Maule';
          if (c.includes('nuble') || c.includes('chillan')) return 'Ñuble';
          if (c.includes('biobio') || c.includes('concepcion') || c.includes('talcahuano') || c.includes('los angeles')) return 'Biobío';
          if (c.includes('araucania') || c.includes('temuco') || c.includes('pucon') || c.includes('villarrica')) return 'Araucanía';
          if (c.includes('rios') || c.includes('valdivia')) return 'Los Ríos';
          if (c.includes('lagos') || c.includes('puerto montt') || c.includes('castro') || c.includes('chiloe') || c.includes('puerto varas')) return 'Los Lagos';
          if (c.includes('aysen') || c.includes('coyhaique')) return 'Aysén';
          if (c.includes('magallanes') || c.includes('punta arenas') || c.includes('puerto natales')) return 'Magallanes';
          
          return null;
        };

        // Contamos por región inferida
        const counts = allRecords.reduce((acc, curr) => {
          const regionName = getRegionFromCity(curr.ciudad_residencia);
          if (regionName) {
            acc[regionName] = (acc[regionName] || 0) + 1;
          }
          return acc;
        }, {});

        // Actualizamos el estado con los datos reales
        setRegiones(prev => prev.map(r => ({
          ...r,
          guias: counts[r.nombre] || 0
        })));
      } catch (error) {
        console.error("Error cargando datos del mapa:", error);
      }
    };

    fetchRealData();
  }, []);
  
  return (
    <section className="chile-map-section">
      <div className="container">
        <div className="map-header text-center mb-5">
          <h2 className="map-titleHighlight">Nuestra Red Nacional</h2>
          <p className="map-subtitle">Con presencia en todas las regiones, aseguramos cobertura donde la necesites.</p>
        </div>
        
        <div className="map-container-wrapper">
          <MapContainer 
            center={chileCenter} 
            zoom={4} 
            scrollWheelZoom={false}
            className="leaflet-map-custom"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {regiones.map((region) => (
              <Marker 
                key={region.id} 
                position={[region.lat, region.lng]} 
                icon={logoIcon}
              >
                <Popup>
                  <div className="map-popup-content">
                    <h4>{region.nombre}</h4>
                    <p className="guide-count">
                      <strong>{region.guias}</strong> guías registrados
                    </p>
                    <a href="/guias" className="popup-link">Ver directorio</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default ChileMap;
