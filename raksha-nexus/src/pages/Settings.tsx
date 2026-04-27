import React, { useState } from 'react';
import { AnimatedHeading } from '../components/AnimatedHeading';
import { FadeIn } from '../components/FadeIn';
import { Bell, Moon, Globe, Smartphone, Volume2, Eye, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const NOTIFICATION_SETTINGS = [
  { label: 'Critical Alerts (SOS)', desc: 'Push notifications for SOS and critical incidents', enabled: true },
  { label: 'Zone Update Alerts', desc: 'Notify when zone risk level changes', enabled: true },
  { label: 'Daily Summary Digest', desc: 'Receive a daily incident summary at 18:00', enabled: false },
  { label: 'AI Prediction Warnings', desc: 'Get advance notices from predictive models', enabled: true },
  { label: 'System Health Alerts', desc: 'Alerts for mesh node failures or API downtime', enabled: false },
];

const DISPLAY_THEMES = ['Cyber Dark', 'High Contrast', 'Stealth (Minimal)'];
const LANGUAGES = ['English', 'हिन्दी (Hindi)', 'ಕನ್ನಡ (Kannada)', 'தமிழ் (Tamil)', 'বাংলা (Bengali)'];
const ALERT_SOUNDS = ['Tactical Beep', 'Soft Chime', 'Silent', 'Siren'];

export const Settings: React.FC = () => {
  const [notifs, setNotifs] = useState(NOTIFICATION_SETTINGS.map(n => n.enabled));
  const [theme, setTheme] = useState(DISPLAY_THEMES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [sound, setSound] = useState(ALERT_SOUNDS[0]);
  const [textSize, setTextSize] = useState(14);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success('Settings saved!', { style: { background: '#1a1a1a', border: '1px solid #22c55e', color: '#fff' } });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col w-full text-white">
      <Toaster position="top-right" />

      <div className="mb-8">
        <AnimatedHeading text={"Settings."} className="text-3xl md:text-4xl lg:text-5xl font-normal mb-2 tracking-[-0.04em] leading-tight" />
        <FadeIn delay={400}>
          <p className="text-sm text-gray-400">Personalize your RAKSHA Nexus experience — notifications, display, and preferences.</p>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Notification Settings */}
        <FadeIn delay={400}>
          <div className="liquid-glass border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-semibold tracking-wider mb-6 flex items-center gap-2">
              <Bell size={14} className="text-amber-400" /> NOTIFICATIONS
            </h3>
            <div className="flex flex-col gap-4">
              {NOTIFICATION_SETTINGS.map((n, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">{n.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{n.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifs(prev => { const next = [...prev]; next[i] = !next[i]; return next; })}
                    className={`ml-4 shrink-0 w-10 h-5 rounded-full relative transition-colors ${notifs[i] ? 'bg-green-500/30 border border-green-500/50' : 'bg-white/10 border border-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${notifs[i] ? 'right-0.5 bg-green-400' : 'left-0.5 bg-gray-500'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Display & Preferences */}
        <FadeIn delay={500}>
          <div className="liquid-glass border border-white/10 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2">
              <Moon size={14} className="text-purple-400" /> DISPLAY & PREFERENCES
            </h3>

            {/* Theme */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2"><Eye size={12} /> Interface Theme</label>
              <div className="flex flex-wrap gap-2">
                {DISPLAY_THEMES.map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`px-4 py-2 rounded-lg text-sm border transition-all ${theme === t ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2"><Globe size={12} /> Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Alert Sound */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2"><Volume2 size={12} /> Alert Sound</label>
              <div className="flex flex-wrap gap-2">
                {ALERT_SOUNDS.map(s => (
                  <button key={s} onClick={() => setSound(s)} className={`px-4 py-2 rounded-lg text-sm border transition-all ${sound === s ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2"><Smartphone size={12} /> Interface Text Size: <span className="text-white font-mono">{textSize}px</span></label>
              <input type="range" min={12} max={20} value={textSize} onChange={e => setTextSize(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>Small</span><span>Large</span></div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Save */}
      <FadeIn delay={800}>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            {saved ? <CheckCircle size={16} className="text-green-600" /> : null}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </FadeIn>
    </div>
  );
};
