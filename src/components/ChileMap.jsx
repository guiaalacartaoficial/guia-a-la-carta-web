import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
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
  const chileCenter = [-35.6751, -71.543]; // Center of Chile
  
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
            
            {regionesChile.map((region) => (
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
