import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone, X, Plus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Guardian { id: number; name: string; relation: string; phone: string; notified?: string; }

const INITIAL: Guardian[] = [
  { id: 1, name: 'Meera Sharma', relation: 'Mother', phone: '+91 98765 43210' },
  { id: 2, name: 'Raj Verma', relation: 'Brother', phone: '+91 91234 56789' },
  { id: 3, name: 'Deepa Nair', relation: 'Friend', phone: '+91 80123 45678' },
];

function initials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase(); }

const COLORS = ['bg-purple-500/30 text-purple-300', 'bg-blue-500/30 text-blue-300', 'bg-green-500/30 text-green-300', 'bg-amber-500/30 text-amber-300'];

interface Props { sosActive: boolean; }

export const GuardianContacts: React.FC<Props> = ({ sosActive }) => {
  const [guardians, setGuardians] = useState<Guardian[]>(INITIAL.map(g =>
    sosActive ? { ...g, notified: new Date().toLocaleTimeString() } : g
  ));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', relation: '', phone: '' });

  React.useEffect(() => {
    if (sosActive) {
      const now = new Date().toLocaleTimeString();
      setGuardians(prev => prev.map(g => ({ ...g, notified: g.notified ?? now })));
    }
  }, [sosActive]);

  const notify = (id: number) => {
    const now = new Date().toLocaleTimeString();
    setGuardians(prev => prev.map(g => g.id === id ? { ...g, notified: now } : g));
    toast.success('Guardian notified!', { style: { background: '#1a1a1a', border: '1px solid #22c55e', color: '#fff' } });
  };

  const addGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setGuardians(prev => [...prev, { id: Date.now(), ...form }]);
    setForm({ name: '', relation: '', phone: '' });
    setShowModal(false);
    toast.success('Guardian added!', { style: { background: '#1a1a1a', border: '1px solid #22c55e', color: '#fff' } });
  };

  return (
    <div className="liquid-glass border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2">
          <Phone size={14} className="text-blue-400" /> GUARDIAN CONTACTS
        </h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-colors">
          <Plus size={11} /> Add
        </button>
      </div>

      <div className="flex flex-col gap-3 h-full justify-center">
        {guardians.map((g, i) => (
          <div key={g.id} className="liquid-glass border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${COLORS[i % COLORS.length]}`}>
                {initials(g.name)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{g.name}</div>
                <div className="text-[10px] text-gray-400">{g.relation}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-mono">{g.phone}</div>
            {g.notified ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-lg">
                <CheckCircle size={10} /> NOTIFIED · {g.notified}
              </span>
            ) : (
              <button onClick={() => notify(g.id)} className="text-[11px] bg-white/10 hover:bg-white/20 rounded-lg py-1.5 text-white transition-colors font-medium">
                Notify
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="liquid-glass border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-semibold">Add Guardian</h4>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={addGuardian} className="flex flex-col gap-3">
              {[['Name', 'name', 'Full name'], ['Relation', 'relation', 'e.g. Mother, Friend'], ['Phone', 'phone', '+91 XXXXX XXXXX']].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input
                    placeholder={ph}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
