import React, { useState, useEffect } from 'react';
import { AnimatedHeading } from '../components/AnimatedHeading';
import { FadeIn } from '../components/FadeIn';
import { 
  Phone, ShieldAlert, Plus, Edit2, Trash2, 
  Download, CheckCircle, Mic, MicOff, Navigation, X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QRCodeSVG } from 'qrcode.react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import toast, { Toaster } from 'react-hot-toast';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TABS = ['Nearby Finder', 'Contact Vault', 'Anonymous Report', 'Voice Assistant'];

// --- Mock Data ---
const HOSPITALS = [
  { id: 1, name: 'Manipal Hospital', distance: '1.2 km', address: '98 HAL Old Airport Rd', phone: '080-2502-3344', open: true, coords: [12.959, 77.648] as [number, number] },
  { id: 2, name: 'Fortis Hospital', distance: '2.5 km', address: '154/9 Bannerghatta Road', phone: '080-6621-4444', open: true, coords: [12.894, 77.598] as [number, number] },
  { id: 3, name: 'Apollo Hospitals', distance: '3.1 km', address: '154/11 Bannerghatta Road', phone: '080-2630-4050', open: true, coords: [12.895, 77.599] as [number, number] },
  { id: 4, name: 'St. John\'s Medical', distance: '3.8 km', address: 'Sarjapur Road, Koramangala', phone: '080-2206-5000', open: true, coords: [12.929, 77.618] as [number, number] },
  { id: 5, name: 'Sakra World Hospital', distance: '5.0 km', address: 'Devarabeesanahalli Varthur Hobli', phone: '080-4969-4969', open: true, coords: [12.932, 77.684] as [number, number] },
  { id: 6, name: 'Bowring and Lady Curzon', distance: '5.2 km', address: 'Lady Curzon Rd, Shivaji Nagar', phone: '080-2559-1362', open: false, coords: [12.982, 77.602] as [number, number] },
];

const POLICE_STATIONS = [
  { id: 1, name: 'Indiranagar Police Station', distance: '0.8 km', address: '100 Feet Rd, Indiranagar', phone: '100', open: true, coords: [12.978, 77.640] as [number, number] },
  { id: 2, name: 'Koramangala Police', distance: '2.1 km', address: 'Koramangala 8th Block', phone: '100', open: true, coords: [12.938, 77.615] as [number, number] },
  { id: 3, name: 'Ashok Nagar Police', distance: '3.5 km', address: 'Shoppers Stop, MG Road', phone: '100', open: true, coords: [12.972, 77.608] as [number, number] },
  { id: 4, name: 'Halasuru Police Station', distance: '4.2 km', address: 'Old Madras Road', phone: '100', open: true, coords: [12.976, 77.625] as [number, number] },
  { id: 5, name: 'Viveknagar Police', distance: '4.8 km', address: 'Viveknagar Main Rd', phone: '100', open: true, coords: [12.955, 77.619] as [number, number] },
  { id: 6, name: 'Cubbon Park Police', distance: '5.5 km', address: 'Kasturba Road', phone: '100', open: true, coords: [12.977, 77.596] as [number, number] },
];

export const PublicTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // --- NEARBY FINDER STATE ---
  const [finderType, setFinderType] = useState<'Hospitals' | 'Police Stations'>('Hospitals');
  const finderData = finderType === 'Hospitals' ? HOSPITALS : POLICE_STATIONS;

  // --- CONTACT VAULT STATE ---
  interface Contact { id: string; name: string; relation: string; phone: string; }
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('raksha_contacts');
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('raksha_contacts', JSON.stringify(newContacts));
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newContact = {
      id: editingContact ? editingContact.id : Date.now().toString(),
      name: fd.get('name') as string,
      relation: fd.get('relation') as string,
      phone: fd.get('phone') as string,
    };
    
    if (editingContact) {
      saveContacts(contacts.map(c => c.id === editingContact.id ? newContact : c));
      toast.success('Contact updated');
    } else {
      saveContacts([...contacts, newContact]);
      toast.success('Contact added');
    }
    setShowContactModal(false);
    setEditingContact(null);
  };

  const exportContacts = () => {
    const csv = "Name,Relationship,Phone\n" + contacts.map(c => `${c.name},${c.relation},${c.phone}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emergency_contacts.csv';
    a.click();
    toast.success('Contacts exported successfully');
  };

  // --- ANONYMOUS REPORT STATE ---
  const [reportCoords, setReportCoords] = useState<[number, number] | null>(null);
  const [urgency, setUrgency] = useState('Medium');
  const [reportSubmitted, setReportSubmitted] = useState<string | null>(null);

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setReportCoords([e.latlng.lat, e.latlng.lng]);
      }
    });
    return reportCoords ? <Marker position={reportCoords} /> : null;
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(`CASE_${Math.floor(Math.random() * 10000)}`);
    toast.success('Anonymous report filed securely.');
  };

  // --- VOICE ASSISTANT STATE ---
  const [voiceAction, setVoiceAction] = useState<string | null>(null);

  const handleVoiceCommand = (msg: string) => {
    setVoiceAction(msg);
    const u = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(u);
  };

  const commands = [
    { command: '* nearest hospital', callback: () => handleVoiceCommand('Locating the nearest hospital. Preparing directions.') },
    { command: '* call police', callback: () => handleVoiceCommand('Calling police. Connecting you to dispatch.') },
    { command: '* activate SOS', callback: () => handleVoiceCommand('SOS Activated. Broadcasting your location to emergency contacts.') },
    { command: '* safe route home', callback: () => handleVoiceCommand('Calculating safest route home avoiding reported hazard zones.') },
    { command: 'nearest hospital', callback: () => handleVoiceCommand('Locating the nearest hospital. Preparing directions.') },
    { command: 'call police', callback: () => handleVoiceCommand('Calling police. Connecting you to dispatch.') },
    { command: 'activate SOS', callback: () => handleVoiceCommand('SOS Activated. Broadcasting your location to emergency contacts.') },
    { command: 'safe route home', callback: () => handleVoiceCommand('Calculating safest route home avoiding reported hazard zones.') }
  ];

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  const toggleListen = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setVoiceAction(null);
    }
  };

  return (
    <div className="flex flex-col w-full text-white min-h-screen relative pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', border: '1px solid #333', color: '#fff' } }} />

      <div className="mb-8">
        <AnimatedHeading text={"Public\nTools."} className="text-3xl md:text-4xl lg:text-5xl font-normal mb-2 tracking-[-0.04em] leading-tight" />
        <FadeIn delay={200}>
          <p className="text-sm md:text-base text-gray-400">Emergency finders, anonymous reporting, contact vault, and voice guidance.</p>
        </FadeIn>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-8 pb-2 custom-scrollbar">
        {TABS.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`shrink-0 liquid-glass border rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-black border-white' : 'border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TAB CONTENT --- */}
      
      {activeTab === 'Nearby Finder' && (
        <FadeIn>
          <div className="flex gap-2 mb-6">
            {['Hospitals', 'Police Stations'].map(type => (
              <button 
                key={type}
                onClick={() => setFinderType(type as any)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${finderType === type ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {finderData.map(loc => (
                <div key={loc.id} className="liquid-glass border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white">{loc.name}</h3>
                    <span className="text-[10px] px-2 py-1 bg-white/10 rounded font-mono text-gray-300 shrink-0">{loc.distance}</span>
                  </div>
                  <p className="text-xs text-gray-400">{loc.address}</p>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <Phone size={12} className="text-gray-500" /> {loc.phone}
                    <span className="mx-1 text-gray-600">|</span>
                    <span className={loc.open ? "text-green-400" : "text-red-400"}>{loc.open ? 'OPEN' : 'CLOSED'}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <button className="flex-1 bg-white text-black hover:bg-gray-200 transition-colors text-xs rounded px-3 py-2 font-medium flex justify-center items-center gap-1">
                      <Phone size={14} /> Call Now
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 transition-colors text-white text-xs rounded px-3 py-2 flex justify-center items-center gap-1">
                      <Navigation size={14} /> Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-2 h-[400px] lg:h-[600px] rounded-xl overflow-hidden border border-white/10 relative z-0">
               <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
                 <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                 {finderData.map(loc => (
                   <Marker key={loc.id} position={loc.coords} />
                 ))}
               </MapContainer>
            </div>
          </div>
        </FadeIn>
      )}

      {activeTab === 'Contact Vault' && (
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-medium">Emergency Contacts</h2>
             <button onClick={exportContacts} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/5">
               <Download size={16} /> Export CSV
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 border border-white/10 rounded-xl border-dashed">
                No emergency contacts added yet. Click the + button to add one.
              </div>
            )}
            {contacts.map(contact => (
              <div key={contact.id} className="liquid-glass border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-medium shrink-0 border border-blue-500/30">
                  {contact.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{contact.name}</h3>
                  <div className="text-xs text-gray-400 mb-1">{contact.relation}</div>
                  <div className="text-sm font-mono text-gray-300">{contact.phone}</div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => { setEditingContact(contact); setShowContactModal(true); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => saveContacts(contacts.filter(c => c.id !== contact.id))} className="p-1.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Add Button */}
          <button 
            onClick={() => { setEditingContact(null); setShowContactModal(true); }}
            className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform z-10"
          >
            <Plus size={24} />
          </button>
        </FadeIn>
      )}

      {activeTab === 'Anonymous Report' && (
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            {reportSubmitted ? (
              <div className="liquid-glass border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="text-2xl font-light mb-2">Report Successfully Submitted</h3>
                <p className="text-gray-400 mb-6">Your identity has been fully anonymized. Please save your case number and QR code for future reference.</p>
                
                <div className="bg-white p-4 rounded-xl mb-6">
                  <QRCodeSVG value={reportSubmitted} size={150} />
                </div>
                
                <div className="text-xl font-mono tracking-widest bg-white/5 border border-white/10 px-6 py-3 rounded-lg mb-8">
                  {reportSubmitted}
                </div>
                
                <button 
                  onClick={() => { setReportSubmitted(null); setReportCoords(null); }}
                  className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-2.5 rounded-lg text-sm border border-white/5"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <div className="liquid-glass border border-white/10 rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-medium mb-6 flex items-center gap-2"><ShieldAlert className="text-red-400"/> File Anonymous Report</h2>
                
                <form onSubmit={handleReportSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Incident Type</label>
                    <select required className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30">
                      <option value="">Select Type...</option>
                      <option>Harassment</option>
                      <option>Accident / Medical</option>
                      <option>Suspicious Activity</option>
                      <option>Violence / Assault</option>
                      <option>Infrastructure Hazard</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Description</label>
                    <textarea required rows={4} placeholder="Describe what you witnessed in detail..." className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400 flex justify-between">
                      <span>Pin Location on Map</span>
                      {reportCoords && <span className="text-green-400 text-xs">Coordinates set</span>}
                    </label>
                    <div className="h-[250px] w-full rounded-lg overflow-hidden border border-white/10 relative z-0">
                      <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <LocationPicker />
                      </MapContainer>
                      {!reportCoords && (
                         <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400] bg-black/20 backdrop-blur-[1px]">
                            <span className="bg-black/80 text-white px-4 py-2 rounded-full text-xs border border-white/10">Click map to pin location</span>
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm text-gray-400">Urgency Level</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map(level => (
                        <button 
                          key={level}
                          type="button"
                          onClick={() => setUrgency(level)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                            urgency === level 
                              ? (level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/50' : level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50')
                              : 'bg-black/30 border-white/5 text-gray-500 hover:bg-white/5'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/10">
                    <button type="submit" className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-200 transition-colors">
                      Submit Anonymously
                    </button>
                    <p className="text-[10px] text-center text-gray-500 mt-3">Your IP address and metadata are stripped before submission.</p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {activeTab === 'Voice Assistant' && (
        <FadeIn>
          <div className="flex flex-col items-center justify-center min-h-[500px] max-w-2xl mx-auto text-center gap-8">
            
            <div className="relative">
               {listening && (
                 <>
                   <div className="absolute inset-0 bg-blue-500 rounded-full blur-[40px] opacity-20 animate-pulse" />
                   <div className="absolute inset-0 bg-purple-500 rounded-full blur-[60px] opacity-10 animate-ping" style={{ animationDuration: '3s' }} />
                 </>
               )}
               <button 
                 onClick={toggleListen}
                 className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                   listening ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-105' : 'liquid-glass border border-white/10 text-white hover:bg-white/5 hover:scale-105'
                 }`}
               >
                 {listening ? <Mic size={48} /> : <MicOff size={48} />}
               </button>
            </div>

            <div className="flex flex-col gap-2 h-20">
               {listening ? (
                 <>
                   <p className="text-xl font-light text-white animate-pulse">Listening...</p>
                   <p className="text-sm text-gray-400 italic">"{transcript || 'Say something like nearest hospital...'}"</p>
                 </>
               ) : (
                 <>
                   <p className="text-xl font-light text-gray-400">Tap microphone to start</p>
                   <p className="text-sm text-gray-600">Voice Assistant is sleeping</p>
                 </>
               )}
            </div>

            {voiceAction && (
              <FadeIn>
                <div className="liquid-glass border border-blue-500/30 bg-blue-500/5 rounded-xl p-6 flex flex-col gap-3 w-full max-w-md mx-auto">
                  <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Assistant Response</span>
                  <p className="text-lg font-medium text-white">{voiceAction}</p>
                </div>
              </FadeIn>
            )}

            {!browserSupportsSpeechRecognition && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                Your browser does not support Speech Recognition. Try Chrome or Edge.
              </div>
            )}

            <div className="w-full max-w-lg mx-auto pt-8 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-4">TRY SAYING</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['nearest hospital', 'call police', 'activate SOS', 'safe route home'].map(cmd => (
                  <span key={cmd} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>

          </div>
        </FadeIn>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="liquid-glass border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-medium text-lg">{editingContact ? 'Edit Contact' : 'Add Emergency Contact'}</h3>
                <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors"><X size={18}/></button>
              </div>
              <form onSubmit={handleContactSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Full Name</label>
                  <input required name="name" defaultValue={editingContact?.name} type="text" className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" placeholder="e.g. John Doe" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Relationship</label>
                  <input required name="relation" defaultValue={editingContact?.relation} type="text" className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" placeholder="e.g. Brother, Friend" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Phone Number</label>
                  <input required name="phone" defaultValue={editingContact?.phone} type="tel" className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" placeholder="e.g. +91 9876543210" />
                </div>
                <button type="submit" className="mt-4 w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  {editingContact ? 'Save Changes' : 'Save Contact'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
