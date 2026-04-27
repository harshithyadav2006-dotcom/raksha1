import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Phone } from 'lucide-react';

// Blue marker for police stations
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const STATIONS = [
  { id: 1, name: 'Indiranagar PS', dist: '0.8 km', phone: '080-22952299', hours: '24/7', lat: 12.9784, lng: 77.6408 },
  { id: 2, name: 'Koramangala PS', dist: '1.4 km', phone: '080-25530585', hours: '24/7', lat: 12.9352, lng: 77.6245 },
  { id: 3, name: 'MG Road PS', dist: '2.1 km', phone: '080-22944070', hours: '24/7', lat: 12.9758, lng: 77.6096 },
  { id: 4, name: 'Whitefield PS', dist: '3.0 km', phone: '080-28453710', hours: '24/7', lat: 12.9698, lng: 77.7499 },
  { id: 5, name: 'Jayanagar PS', dist: '3.8 km', phone: '080-26578001', hours: '24/7', lat: 12.9250, lng: 77.5938 },
  { id: 6, name: 'Malleshwaram PS', dist: '4.5 km', phone: '080-23343001', hours: '24/7', lat: 13.0068, lng: 77.5617 },
];

export const PoliceLocator: React.FC = () => {
  return (
    <div className="liquid-glass border border-white/10 rounded-xl p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2">
        <Shield size={14} className="text-blue-400" /> NEARBY POLICE STATIONS
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STATIONS.map(s => (
          <div key={s.id} className="liquid-glass border border-white/10 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-white">{s.name}</div>
                <div className="text-[10px] text-blue-400 font-mono">{s.dist} away</div>
              </div>
              <span className="text-[9px] text-green-400 border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 rounded-full">{s.hours}</span>
            </div>
            <div className="text-xs text-gray-400 font-mono">{s.phone}</div>
            <a href={`tel:${s.phone}`} className="flex items-center justify-center gap-1.5 text-[11px] font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg py-1.5 transition-colors">
              <Phone size={11} /> Call Now
            </a>
          </div>
        ))}
      </div>

      <div className="h-[220px] rounded-xl overflow-hidden border border-white/5">
        <MapContainer center={[12.9550, 77.6300]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {STATIONS.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={blueIcon}>
              <Popup>
                <div className="text-black text-xs">
                  <strong>{s.name}</strong><br />{s.dist} · {s.phone}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
