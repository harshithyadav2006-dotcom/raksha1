import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Clock, ArrowRight } from 'lucide-react';

const SAFE_ROUTE: [number, number][] = [
  [12.9716, 77.5946], [12.9730, 77.5980], [12.9755, 77.6010],
  [12.9780, 77.6040], [12.9800, 77.6080], [12.9820, 77.6100],
];

const UNSAFE_ZONES: { center: [number, number]; radius: number; label: string }[] = [
  { center: [12.9740, 77.6060], radius: 250, label: 'High-Risk Zone A' },
  { center: [12.9810, 77.5990], radius: 180, label: 'Reported Incidents' },
];

const DESTINATIONS = ['Home', 'Office', 'Police Station', 'Hospital', 'Custom…'];

export const SafeRoute: React.FC = () => {
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [calculating, setCalculating] = useState(false);
  const [routeActive, setRouteActive] = useState(true);

  const calculate = () => {
    setCalculating(true);
    setTimeout(() => { setCalculating(false); setRouteActive(true); }, 1200);
  };

  const safetyScore = 87;
  const scoreColor = safetyScore >= 80 ? 'text-green-400 bg-green-500/20 border-green-500/30'
    : safetyScore >= 60 ? 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    : 'text-red-400 bg-red-500/20 border-red-500/30';

  return (
    <div className="liquid-glass border border-white/10 rounded-xl p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2">
        <Navigation size={14} className="text-green-400" /> SAFE ROUTE NAVIGATION
      </h3>

      {/* Destination selector */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 uppercase mb-1 block">Destination</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50"
          >
            {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={calculate}
            disabled={calculating}
            className="px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {calculating ? <span className="animate-spin">↻</span> : <ArrowRight size={14} />}
            {calculating ? 'Calculating…' : 'Route'}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-[220px] rounded-xl overflow-hidden border border-white/5 relative">
        <MapContainer center={[12.9758, 77.6025]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {UNSAFE_ZONES.map((z, i) => (
            <Circle key={i} center={z.center} radius={z.radius}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.18, weight: 1.5, dashArray: '6 4' }} />
          ))}
          {routeActive && (
            <Polyline positions={SAFE_ROUTE}
              pathOptions={{ color: '#22c55e', weight: 4, opacity: 0.85, dashArray: '12 6' }} />
          )}
        </MapContainer>
        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[400] flex gap-3 text-[10px]">
          <span className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md backdrop-blur">
            <span className="w-3 border-t-2 border-green-400 border-dashed inline-block" /> Safe Route
          </span>
          <span className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md backdrop-blur">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50 border border-red-500 inline-block" /> Unsafe Zone
          </span>
        </div>
      </div>

      {/* Route stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/40 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 mb-1"><Clock size={9} />ETA</div>
          <div className="text-sm font-mono text-white">12 min</div>
        </div>
        <div className="bg-black/40 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Distance</div>
          <div className="text-sm font-mono text-white">2.4 km</div>
        </div>
        <div className={`rounded-lg px-3 py-2 text-center border ${scoreColor}`}>
          <div className="text-[10px] uppercase mb-1 opacity-70">Safety</div>
          <div className="text-sm font-bold">{safetyScore}/100</div>
        </div>
      </div>
    </div>
  );
};
