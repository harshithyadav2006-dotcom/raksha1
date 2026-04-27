import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Share2, X } from 'lucide-react';

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

interface Props { sosActive: boolean; }

export const GPSLocationCard: React.FC<Props> = ({ sosActive }) => {
  const BASE = { lat: 12.9716, lng: 77.5946 };
  const [coords, setCoords] = useState(BASE);
  const [accuracy] = useState(4.2);
  const [shareUrl, setShareUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setCoords(p => ({
        lat: +(p.lat + (Math.random() - 0.5) * 0.0002).toFixed(6),
        lng: +(p.lng + (Math.random() - 0.5) * 0.0002).toFixed(6),
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleShare = () => {
    const url = `https://raksha.nexus/track?lat=${coords.lat}&lng=${coords.lng}&uid=USER_${Date.now()}`;
    setShareUrl(url);
    setShowQR(true);
  };

  return (
    <div className="liquid-glass border border-white/10 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2">
          <MapPin size={14} className="text-green-400" /> LIVE GPS LOCATION
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Sharing Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[['Latitude', coords.lat], ['Longitude', coords.lng]].map(([label, val]) => (
          <div key={label as string} className="bg-black/40 rounded-lg px-3 py-2">
            <div className="text-[10px] text-gray-500 uppercase mb-1">{label}</div>
            <div className="font-mono text-white text-sm">{val}</div>
          </div>
        ))}
        <div className="bg-black/40 rounded-lg px-3 py-2">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Accuracy</div>
          <div className="font-mono text-green-400 text-sm">±{accuracy}m</div>
        </div>
        <div className="bg-black/40 rounded-lg px-3 py-2">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Status</div>
          <div className="text-green-400 text-sm font-medium">{sosActive ? 'SOS Broadcasting' : 'Active'}</div>
        </div>
      </div>

      <div className="h-[160px] rounded-lg overflow-hidden border border-white/5">
        <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <Marker position={[coords.lat, coords.lng]} />
          <Recenter lat={coords.lat} lng={coords.lng} />
        </MapContainer>
      </div>

      <button onClick={handleShare} className="flex items-center justify-center gap-2 w-full py-2.5 liquid-glass border border-white/10 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
        <Share2 size={14} /> Share Live Link
      </button>

      {showQR && createPortal(
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="liquid-glass border border-white/10 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <h4 className="text-sm font-semibold">Live Tracking Link</h4>
              <button onClick={() => setShowQR(false)}><X size={16} className="text-gray-400 hover:text-white" /></button>
            </div>
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={shareUrl} size={180} />
            </div>
            <p className="text-[10px] text-gray-400 text-center break-all font-mono">{shareUrl}</p>
            <button onClick={() => { navigator.clipboard?.writeText(shareUrl); }} className="w-full py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Copy Link
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
