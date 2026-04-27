import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AnimatedHeading } from '../components/AnimatedHeading';
import { FadeIn } from '../components/FadeIn';
import { Shield, PlusSquare, Truck, Navigation, X, MapPin, LayoutDashboard, Video, Lock, Key } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { IncidentManagementTable } from '../components/admin/IncidentManagementTable';
import { AnalyticsRow } from '../components/admin/AnalyticsRow';
import { CCTVIntegration } from '../components/admin/CCTVIntegration';

// Blue animated marker icon for all responders
const createResponderIcon = () => {
  return L.divIcon({
    className: 'custom-responder-icon',
    html: `<div class="relative w-4 h-4">
            <div class="absolute inset-0 bg-blue-500 rounded-full opacity-60 animate-ping"></div>
            <div class="absolute inset-[3px] bg-blue-500 rounded-full border-[1.5px] border-white shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
           </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const ZONES = ['North', 'South', 'East', 'West'];

// Zone definitions with bounds, color, and status
const ZONE_POLYGONS: Record<string, { bounds: [number, number][], color: string, status: string }> = {
  'North': { bounds: [[13.0, 77.55], [13.0, 77.65], [12.98, 77.65], [12.98, 77.55]], color: '#ef4444', status: 'Active Incident' },
  'South': { bounds: [[12.93, 77.55], [12.93, 77.65], [12.91, 77.65], [12.91, 77.55]], color: '#22c55e', status: 'Secured' },
  'East': { bounds: [[12.97, 77.65], [12.97, 77.75], [12.95, 77.75], [12.95, 77.65]], color: '#22c55e', status: 'Secured' },
  'West': { bounds: [[12.97, 77.45], [12.97, 77.55], [12.95, 77.55], [12.95, 77.45]], color: '#ef4444', status: 'Active Incident' },
};

const INITIAL_RESPONDERS = [
  { id: 'AMB-01', type: 'Ambulance', zone: 'North', status: 'En Route', lat: 12.99, lng: 77.60, target: 'MG Road Accident', ping: '10s ago' },
  { id: 'FTR-04', type: 'Fire Truck', zone: 'North', status: 'On Scene', lat: 12.985, lng: 77.61, target: 'Warehouse Fire', ping: '12s ago' },
  { id: 'PAT-12', type: 'Patrol Car', zone: 'North', status: 'Patrolling', lat: 12.982, lng: 77.58, target: 'Routine', ping: '5s ago' },
  { id: 'AMB-02', type: 'Ambulance', zone: 'South', status: 'Available', lat: 12.92, lng: 77.60, target: 'None', ping: '2s ago' },
  { id: 'PAT-08', type: 'Patrol Car', zone: 'East', status: 'Patrolling', lat: 12.96, lng: 77.70, target: 'Routine', ping: '8s ago' },
  { id: 'FTR-02', type: 'Fire Truck', zone: 'West', status: 'Available', lat: 12.96, lng: 77.50, target: 'None', ping: '1s ago' },
];

const DISPATCH_TYPES = [
  { type: 'Ambulance', icon: PlusSquare, initialCount: 12, color: 'text-blue-400' },
  { type: 'Fire Truck', icon: Truck, initialCount: 8, color: 'text-red-400' },
  { type: 'Patrol Car', icon: Shield, initialCount: 24, color: 'text-amber-400' },
];

// Helper component to capture map clicks
const MapClickDetector = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const AdminPanel: React.FC = () => {
  const [mainTab, setMainTab] = useState<'overview' | 'cctv'>('overview');
  const [activeZone, setActiveZone] = useState(ZONES[0]);
  const [responders, setResponders] = useState(INITIAL_RESPONDERS);
  const [counts, setCounts] = useState(DISPATCH_TYPES.map(t => t.initialCount));
  
  const [showModal, setShowModal] = useState(false);
  const [dispatchType, setDispatchType] = useState('Ambulance');
  const [dispatchLoc, setDispatchLoc] = useState<[number, number] | null>(null);
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
      toast.success('Access Granted', { style: { background: '#1a1a1a', border: '1px solid #22c55e', color: '#fff' } });
    } else {
      setAuthError(true);
      toast.error('Invalid Credentials', { style: { background: '#1a1a1a', border: '1px solid #ef4444', color: '#fff' } });
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  // Move responders slightly every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setResponders(prev => prev.map(r => ({
        ...r,
        lat: r.lat + (Math.random() - 0.5) * 0.0015,
        lng: r.lng + (Math.random() - 0.5) * 0.0015,
      })));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Update ping status every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setResponders(prev => prev.map(r => ({
        ...r,
        ping: `${Math.floor(Math.random() * 10) + 1}s ago`
      })));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleDispatchOpen = (type: string) => {
    setDispatchType(type);
    setDispatchLoc(null);
    setDispatchNotes('');
    setShowModal(true);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchLoc) {
      toast.error('Please select a target location on the map.', { style: { background: '#1a1a1a', border: '1px solid #ef4444', color: '#fff' } });
      return;
    }
    
    const typeIdx = DISPATCH_TYPES.findIndex(t => t.type === dispatchType);
    if (counts[typeIdx] <= 0) {
      toast.error(`No ${dispatchType}s available!`, { style: { background: '#1a1a1a', border: '1px solid #ef4444', color: '#fff' } });
      return;
    }
    
    // Decrement unit count
    const newCounts = [...counts];
    newCounts[typeIdx] -= 1;
    setCounts(newCounts);
    
    // Deploy new responder to the active zone
    const newId = `${dispatchType.substring(0,3).toUpperCase()}-${Math.floor(Math.random() * 100)}`;
    setResponders(prev => [{
      id: newId,
      type: dispatchType,
      zone: activeZone,
      status: 'En Route',
      lat: dispatchLoc[0],
      lng: dispatchLoc[1],
      target: dispatchNotes || 'Emergency Response',
      ping: 'Just now'
    }, ...prev]);

    setShowModal(false);
    toast.success(`${dispatchType} dispatched successfully!`, { style: { background: '#1a1a1a', border: '1px solid #22c55e', color: '#fff' } });
  };

  const filteredResponders = responders.filter(r => r.zone === activeZone);
  const activePolygon = ZONE_POLYGONS[activeZone];
  const mapCenter = activePolygon.bounds[0];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col w-full text-white min-h-[80vh] items-center justify-center p-4">
        <Toaster position="top-right" />
        <FadeIn className="w-full max-w-sm">
          <div className="liquid-glass border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            {/* Background glow */}
            <div className={`absolute inset-0 bg-blue-500/5 transition-colors duration-300 ${authError ? 'bg-red-500/10' : ''}`} />
            
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 relative z-10 shadow-lg">
              <Lock size={32} className={authError ? 'text-red-400' : 'text-blue-400'} />
            </div>
            
            <h1 className="text-2xl font-bold tracking-widest uppercase text-white mb-2 relative z-10">Restricted Access</h1>
            <p className="text-sm text-gray-400 mb-8 relative z-10">Admin privileges required. Please authenticate to access the Command Center.</p>
            
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 relative z-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password (admin)"
                  className={`w-full bg-black/50 border rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-all ${
                    authError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'
                  }`}
                  autoFocus
                />
              </div>
              
              <button 
                type="submit"
                className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                  authError ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-white hover:bg-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                }`}
              >
                Authenticate
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-white pb-10 relative">
      <Toaster position="top-right" />

      {/* Page Header & Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <AnimatedHeading text={"Command\nCenter."} className="text-3xl md:text-4xl lg:text-5xl font-normal mb-2 tracking-[-0.04em] leading-tight" />
          <FadeIn delay={400}>
            <p className="text-sm text-gray-400">Live city oversight, resource dispatch, and multi-zone incident management.</p>
          </FadeIn>
        </div>
        
        {/* Main Tabs */}
        <FadeIn delay={450} className="flex bg-white/5 border border-white/10 rounded-lg p-1 w-max">
          <button 
            onClick={() => setMainTab('overview')}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${mainTab === 'overview' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={16} /> Overview
          </button>
          <button 
            onClick={() => setMainTab('cctv')}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${mainTab === 'cctv' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Video size={16} /> CCTV Integration
          </button>
        </FadeIn>
      </div>

      {mainTab === 'overview' ? (
        <>
          {/* Zone Tabs */}
      <FadeIn delay={500} className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {ZONES.map(z => (
          <button 
            key={z} 
            onClick={() => setActiveZone(z)}
            className={`transition-all duration-300 liquid-glass border rounded-lg px-6 py-2.5 text-sm font-medium whitespace-nowrap ${
              activeZone === z ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {z} Zone
          </button>
        ))}
      </FadeIn>

      {/* Live Command Map */}
      <FadeIn delay={600} className="mb-8">
        <div className="h-[400px] w-full liquid-glass border border-white/10 rounded-xl overflow-hidden relative shadow-2xl">
          {/* Key ensures map re-centers on zone change */}
          <MapContainer key={activeZone} center={mapCenter as [number, number]} zoom={13} style={{ height: '100%', width: '100%', background: '#0a0a0a' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <Polygon 
              positions={activePolygon.bounds} 
              pathOptions={{ color: activePolygon.color, fillColor: activePolygon.color, fillOpacity: 0.1, weight: 2 }} 
            />
            {filteredResponders.map(r => (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={createResponderIcon()}>
                <Popup className="custom-popup">
                  <div className="text-black text-xs min-w-[140px] p-1">
                    <strong className="text-sm block mb-1">{r.id} - {r.type}</strong>
                    <div className="text-gray-600 mb-1">Target: {r.target}</div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">{r.status}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono shadow-lg">
            <span className={`w-2 h-2 rounded-full animate-pulse ${activePolygon.color === '#ef4444' ? 'bg-red-500' : 'bg-green-500'}`} />
            {activeZone.toUpperCase()} ZONE: {activePolygon.status.toUpperCase()}
          </div>
        </div>
      </FadeIn>

      {/* Dispatch Control Row */}
      <FadeIn delay={700} className="mb-8">
        <h3 className="text-sm font-semibold tracking-wider mb-4 flex items-center gap-2 text-white">
          <Navigation size={14} className="text-blue-400" /> DISPATCH CONTROLS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DISPATCH_TYPES.map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={d.type} className="liquid-glass border border-white/10 rounded-xl p-5 flex flex-col hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${d.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-white font-medium text-lg leading-tight">{d.type}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Available: <span className="font-mono text-white ml-1 px-1.5 py-0.5 bg-white/10 rounded">{counts[i]}</span></div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDispatchOpen(d.type)}
                  className="mt-auto w-full py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Dispatch Unit
                </button>
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Responder Tracking Table */}
      <FadeIn delay={800}>
        <div className="liquid-glass border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 bg-black/20">
            <h3 className="text-sm font-semibold tracking-wider">RESPONDER TRACKING - {activeZone.toUpperCase()} ZONE</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider bg-black/40">
                  <th className="text-left px-5 py-4 font-medium">Unit ID</th>
                  <th className="text-left px-5 py-4 font-medium">Type</th>
                  <th className="text-left px-5 py-4 font-medium">Location</th>
                  <th className="text-left px-5 py-4 font-medium">Assignment</th>
                  <th className="text-left px-5 py-4 font-medium">Status</th>
                  <th className="text-left px-5 py-4 font-medium">Last Ping</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">No units active in this zone.</td>
                  </tr>
                ) : filteredResponders.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors animate-[slideIn_0.4s_ease-out_forwards] opacity-0" style={{ animationDelay: `${i * 100}ms` }}>
                    <td className="px-5 py-4 font-mono font-medium text-white">{r.id}</td>
                    <td className="px-5 py-4 text-gray-300">{r.type}</td>
                    <td className="px-5 py-4 text-gray-400 font-mono text-xs">{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</td>
                    <td className="px-5 py-4 text-gray-300">{r.target}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] border px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                        r.status === 'En Route' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        r.status === 'On Scene' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {r.ping}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="liquid-glass border border-white/10 rounded-2xl p-6 max-w-lg w-full flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                Deploy Responder Unit
              </h4>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400 hover:text-white transition-colors" /></button>
            </div>
            
            <form onSubmit={handleConfirmDispatch} className="flex flex-col gap-5">
              <div>
                <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">Select Unit Type</label>
                <select 
                  value={dispatchType} 
                  onChange={e => setDispatchType(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors [&>option]:bg-zinc-900"
                >
                  {DISPATCH_TYPES.map(d => (
                    <option key={d.type} value={d.type}>{d.type} ({counts[DISPATCH_TYPES.findIndex(x=>x.type===d.type)]} available)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 flex items-center justify-between mb-2 uppercase tracking-wider">
                  Target Location (Click Map)
                  {dispatchLoc && <span className="text-green-400 font-mono text-[10px] normal-case bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">{dispatchLoc[0].toFixed(4)}, {dispatchLoc[1].toFixed(4)}</span>}
                </label>
                <div className="h-[220px] w-full rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
                  <MapContainer center={mapCenter as [number, number]} zoom={13} style={{ height: '100%', width: '100%', background: '#0a0a0a' }} zoomControl={false} attributionControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <MapClickDetector onMapClick={(lat, lng) => setDispatchLoc([lat, lng])} />
                    {dispatchLoc && <Marker position={dispatchLoc} icon={createResponderIcon()} />}
                  </MapContainer>
                  {!dispatchLoc && (
                    <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
                      <div className="bg-black/80 border border-white/10 px-4 py-2 rounded-lg text-xs font-medium text-white backdrop-blur-md flex items-center gap-2 shadow-xl">
                        <MapPin size={14} className="text-blue-400 animate-bounce" /> Click map to set target
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">Assignment Notes</label>
                <input 
                  value={dispatchNotes}
                  onChange={e => setDispatchNotes(e.target.value)}
                  placeholder="e.g. Critical condition, proceed with caution"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-white hover:bg-gray-200 text-black rounded-xl text-sm font-bold transition-colors shadow-lg">
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Analytics & Management Sections */}
      <FadeIn delay={900} className="mb-8 mt-4">
        <AnalyticsRow />
      </FadeIn>

      <FadeIn delay={1000}>
        <IncidentManagementTable />
      </FadeIn>
      
      </>
      ) : (
        <CCTVIntegration />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
};
