import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AnimatedHeading } from '../components/AnimatedHeading';
import { FadeIn } from '../components/FadeIn';
import { AlertCircle, AlertTriangle, ShieldCheck, MapPin, Info, Activity } from 'lucide-react';

const MOCK_MARKERS = [
  { id: 1, lat: 12.9716, lng: 77.5946, risk: 'critical', title: 'MG Road', type: 'Protest' },
  { id: 2, lat: 12.9352, lng: 77.6245, risk: 'medium', title: 'Koramangala', type: 'Traffic Block' },
  { id: 3, lat: 12.9121, lng: 77.6446, risk: 'safe', title: 'HSR Layout', type: 'Clear' },
  { id: 4, lat: 12.9780, lng: 77.6380, risk: 'critical', title: 'Indiranagar', type: 'Fire Alert' },
  { id: 5, lat: 12.9698, lng: 77.7499, risk: 'medium', title: 'Whitefield', type: 'Accident' },
  { id: 6, lat: 12.9250, lng: 77.5938, risk: 'safe', title: 'Jayanagar', type: 'Clear' },
  { id: 7, lat: 12.9915, lng: 77.5921, risk: 'medium', title: 'Vasanth Nagar', type: 'Suspicious Activity' },
  { id: 8, lat: 13.0068, lng: 77.5617, risk: 'safe', title: 'Malleshwaram', type: 'Clear' },
  { id: 9, lat: 12.9063, lng: 77.5370, risk: 'critical', title: 'Banashankari', type: 'Medical Emergency' },
  { id: 10, lat: 13.0289, lng: 77.5896, risk: 'medium', title: 'Hebbal', type: 'Road Closure' },
  { id: 11, lat: 12.8996, lng: 77.5855, risk: 'safe', title: 'JP Nagar', type: 'Clear' },
  { id: 12, lat: 12.9553, lng: 77.6698, risk: 'medium', title: 'Marathahalli', type: 'Power Outage' },
];

const INITIAL_INCIDENTS = [
  { id: 1, type: 'Medical Emergency', location: 'Indiranagar', time: '2m ago', severity: 'critical' },
  { id: 2, type: 'Fire Alert', location: 'Whitefield', time: '14m ago', severity: 'high' },
  { id: 3, type: 'Suspicious Activity', location: 'Jayanagar', time: '35m ago', severity: 'medium' },
  { id: 4, type: 'Road Closure', location: 'Cantonment', time: '1h ago', severity: 'low' },
];

const INCIDENT_TYPES = ['Assault Report', 'Accident', 'Riot', 'Gas Leak', 'Theft', 'SOS Triggered'];
const LOCATIONS = ['Majestic', 'Hebbal', 'Yelahanka', 'Malleshwaram', 'BTM Layout', 'Banashankari', 'Rajajinagar'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];

const HEATMAP_ZONES = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  name: `Sector ${String.fromCharCode(65 + i)}`,
  score: Math.floor(Math.random() * 100),
  incidents: Math.floor(Math.random() * 8)
}));

export const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  useEffect(() => {
    const timer = setInterval(() => {
      setIncidents(prev => {
        const newInc = {
          id: Date.now(),
          type: INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)],
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
          time: 'just now',
          severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)]
        };
        return [newInc, ...prev].slice(0, 10);
      });
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const getMarkerColor = (risk: string) => {
    if (risk === 'critical') return '#ef4444'; // red-500
    if (risk === 'medium') return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  };

  const getHeatmapBorder = (score: number) => {
    if (score > 75) return 'border-red-500/50 hover:bg-red-500/10';
    if (score > 40) return 'border-amber-500/50 hover:bg-amber-500/10';
    return 'border-green-500/50 hover:bg-green-500/10';
  };

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return map[severity] || map.low;
  };

  return (
    <div className="flex flex-col w-full text-white">
      {/* HERO STRIP */}
      <div className="mb-8">
        <AnimatedHeading 
          text={"Command\nCenter."} 
          className="text-3xl md:text-4xl lg:text-5xl font-normal mb-2 tracking-[-0.04em] leading-tight" 
        />
        <FadeIn delay={400}>
          <p className="text-sm text-gray-400">Live safety intelligence across all active zones.</p>
        </FadeIn>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Incidents', value: '12', trend: '+3 vs last hr', status: 'warning' },
          { label: 'Responders Deployed', value: '47', trend: 'LIVE', status: 'neutral' },
          { label: 'SOS Alerts Today', value: '8', trend: '-2 vs yesterday', status: 'success' },
          { label: 'Zones at Risk', value: '3', trend: 'CRITICAL', status: 'danger' },
        ].map((stat, idx) => (
          <FadeIn key={idx} delay={400 + idx * 200}>
            <div className="liquid-glass border border-white/10 rounded-xl px-6 py-5 flex flex-col h-full hover:bg-white/[0.02] transition-colors">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">{stat.label}</span>
              <span className="text-3xl font-light text-white mb-2">{stat.value}</span>
              <div className="mt-auto flex items-center justify-between">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  stat.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  stat.status === 'danger' ? 'bg-red-500/20 text-red-400' :
                  stat.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-white/10 text-gray-300'
                }`}>
                  {stat.trend}
                </span>
                <Activity size={14} className="text-gray-500 opacity-50" />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* MAIN GRID */}
      <FadeIn delay={1200}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* MAP */}
          <div className="lg:col-span-2 h-[400px] lg:h-[500px] liquid-glass border border-white/10 rounded-xl overflow-hidden relative shadow-lg">
            <div className="absolute top-4 left-4 z-[400] liquid-glass px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold tracking-widest flex items-center gap-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              GLOBAL VIEW
            </div>
            <MapContainer 
              center={[12.9716, 77.5946]} 
              zoom={11} 
              style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {MOCK_MARKERS.map(marker => (
                <CircleMarker
                  key={marker.id}
                  center={[marker.lat, marker.lng]}
                  pathOptions={{ 
                    color: getMarkerColor(marker.risk), 
                    fillColor: getMarkerColor(marker.risk), 
                    fillOpacity: 0.7 
                  }}
                  radius={8}
                >
                  <Popup className="custom-popup">
                    <div className="text-black p-1 min-w-[120px]">
                      <h4 className="font-bold text-sm mb-1">{marker.title}</h4>
                      <p className="text-xs text-gray-700 capitalize flex items-center justify-between">
                        <span>{marker.type}</span>
                        <span className="font-bold" style={{ color: getMarkerColor(marker.risk) }}>{marker.risk}</span>
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* LIVE FEED */}
          <div className="liquid-glass border border-white/10 rounded-xl flex flex-col overflow-hidden h-[500px]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/40">
              <h3 className="text-sm font-semibold tracking-wider text-white">LIVE FEED</h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="flex flex-col gap-2">
                {incidents.map((incident) => (
                  <div 
                    key={incident.id} 
                    className="p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-all flex gap-4 items-start animate-[slideIn_0.3s_ease-out]"
                  >
                    <div className={`mt-1 shrink-0 ${incident.severity === 'critical' ? 'text-red-400' : 'text-gray-400'}`}>
                      {incident.severity === 'critical' || incident.severity === 'high' ? <AlertTriangle size={18} /> : 
                       incident.severity === 'medium' ? <AlertCircle size={18} /> : <Info size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-white truncate pr-2">{incident.type}</h4>
                        <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 py-0.5 rounded shrink-0">{incident.time}</span>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin size={12} />
                          <span className="truncate">{incident.location}</span>
                        </div>
                        <div>
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${getSeverityBadge(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </FadeIn>

      {/* DISASTER HEATMAP ROW */}
      <FadeIn delay={1400}>
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-gray-400" />
            Zone Heatmap Array
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            {HEATMAP_ZONES.map(zone => (
              <div 
                key={zone.id} 
                className={`liquid-glass rounded-lg border p-4 cursor-pointer transition-all border-l-4 group relative ${getHeatmapBorder(zone.score)}`}
                style={{ borderLeftWidth: '4px' }}
              >
                <div className="flex flex-col mb-1 relative z-10">
                  <span className="text-xs text-gray-400 font-mono mb-1">{zone.name}</span>
                  <span className="text-xl font-light text-white">{zone.score}<span className="text-xs text-gray-500">/100</span></span>
                </div>
                
                {/* TOOLTIP */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-black border border-white/20 text-white text-xs px-3 py-2 rounded shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap z-50">
                  Active Incidents: {zone.incidents}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-white/20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
      
      {/* Keyframe styles embedded for component-scope animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Custom map popup styles for dark theme adaptation */
        .leaflet-popup-content-wrapper {
          background-color: #1a1a1a;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background-color: #1a1a1a;
        }
      `}} />
    </div>
  );
};
