import React, { useState, useEffect, useRef } from 'react';
import { Camera, Folder, Send } from 'lucide-react';

interface Evidence { id: number; timestamp: string; label: string; }

export const HiddenCamera: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [vault, setVault] = useState<Evidence[]>([]);
  const [showVault, setShowVault] = useState(false);
  const [counter, setCounter] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (counterRef.current) clearInterval(counterRef.current);
      setCounter(30);
      return;
    }

    setCounter(30);
    counterRef.current = setInterval(() => {
      setCounter(c => c <= 1 ? 30 : c - 1);
    }, 1000);

    timerRef.current = setInterval(() => {
      setVault(prev => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        label: `Frame_${String(prev.length + 1).padStart(3, '0')}.jpg`,
      }, ...prev].slice(0, 20));
      setCounter(30);
    }, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (counterRef.current) clearInterval(counterRef.current);
    };
  }, [enabled]);

  return (
    <div className="liquid-glass border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2">
            <Camera size={14} className={enabled ? 'text-amber-400' : 'text-gray-400'} /> SILENT CAMERA MODE
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Captures frames silently every 30s. Stored in Evidence Vault.</p>
        </div>
        <button
          onClick={() => setEnabled(e => !e)}
          className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-amber-500/30 border border-amber-500/50' : 'bg-white/10 border border-white/10'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${enabled ? 'right-0.5 bg-amber-400' : 'left-0.5 bg-gray-500'}`} />
        </button>
      </div>

      {/* Mock Viewfinder */}
      {enabled && (
        <div className="relative h-28 bg-black/80 border border-amber-500/20 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)' }} />
          {/* Corner brackets */}
          {[['top-2 left-2 border-t border-l',''],['top-2 right-2 border-t border-r',''],['bottom-2 left-2 border-b border-l',''],['bottom-2 right-2 border-b border-r','']].map(([cls], i) => (
            <div key={i} className={`absolute w-4 h-4 border-amber-400/60 ${cls}`} />
          ))}
          <div className="flex flex-col items-center gap-1">
            <Camera size={20} className="text-amber-400/60" />
            <span className="text-[10px] text-amber-400/60 font-mono">CAPTURING · {counter}s</span>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] text-amber-400 font-mono">REC</span>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowVault(v => !v)}
        className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors w-full justify-center"
      >
        <Folder size={13} /> Evidence Vault ({vault.length} frames)
      </button>

      {showVault && (
        <div className="mt-3 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {vault.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No evidence captured yet.</p>
          ) : vault.map(e => (
            <div key={e.id} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg px-3 py-2">
              <div>
                <div className="text-xs text-white font-mono">{e.label}</div>
                <div className="text-[10px] text-gray-500">{e.timestamp}</div>
              </div>
              <button className="flex items-center gap-1 text-[10px] text-blue-400 border border-blue-500/20 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors">
                <Send size={9} /> Send
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
