import React, { useState, useEffect, useRef } from 'react';
import { Shield, X, Send, AlertTriangle, MessageSquare } from 'lucide-react';
import { FadeIn } from './FadeIn';

const QA_PAIRS: Record<string, string> = {
  "fire": "To report a fire, activate SOS immediately or use the Public Tools > Anonymous Report. Move to a safe location.",
  "flood": "Move to higher ground immediately. Do not walk or drive through flood waters. Await rescue instructions.",
  "sos": "You can activate SOS from the main Dashboard, the floating chat quick-actions, or your Wearable Panic Band.",
  "hospital": "Use the 'Public Tools > Nearby Finder' to locate the closest open medical facility with directions.",
  "stampede": "Keep your hands up by your chest to protect your ribs. Move diagonally with the crowd, never against it.",
  "cpr": "1. Call for help. 2. Push hard and fast in the center of the chest (100-120 beats/min). 3. Wait for medical professionals.",
  "evacuat": "Follow green exit signs. Do not use elevators. Assist the elderly and children. Proceed to the designated assembly point.",
  "location": "Activate SOS or use the Offline Mesh SMS fallback to broadcast your exact GPS coordinates to guardians.",
  "guardian": "Guardians are notified instantly when your Wearable detects stress or when you trigger an SOS.",
  "mesh": "The Offline Mesh automatically activates when cellular data fails, using Bluetooth/Wi-Fi Direct to route messages peer-to-peer.",
  "report emergency": "You can report an emergency anonymously via the Public Tools tab or by triggering the SOS protocol.",
  "find hospital": "Check the Nearby Finder in Public Tools. The closest hospital is typically Manipal Hospital based on your default location.",
  "activate sos": "SOS Activated! (Simulated). Your guardians and nearby responders have been notified.",
  "safe route": "Calculating safe route. Please check the AI Intelligence Smart Route Optimizer for detailed navigation.",
  "contact guardian": "Guardian notified via SMS and App Push Notification."
};

const QUICK_REPLIES = [
  "Report emergency", "Find hospital", "Activate SOS", "Safe route", "Contact guardian"
];

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isAlert?: boolean;
}

export const AIEmergencyChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'RAKSHA AI initialized. How can I assist you during this emergency?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Proactive alert simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'New fire alert in Zone 4 — tap to see evacuation routes.',
        isAlert: true
      }]);
      // If closed, maybe we pop it open or just show a badge
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate Bot Thinking & Reply
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = "I'm sorry, I didn't understand that. You can ask about CPR, evacuation, hospital locations, or SOS procedures.";
      
      for (const [key, val] of Object.entries(QA_PAIRS)) {
        if (lowerText.includes(key)) {
          response = val;
          break;
        }
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: response }]);
    }, 600);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
        
        {/* Chat Panel */}
        {isOpen && (
          <FadeIn>
            <div className="w-[350px] h-[500px] liquid-glass border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl">
              
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-green-400 font-mono">
                  <Shield size={16} /> RAKSHA AI
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' ? (
                       <div className={`max-w-[85%] p-3 rounded-lg text-sm font-mono leading-relaxed ${msg.isAlert ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-black/60 border border-green-500/20 text-green-400'}`}>
                         {msg.isAlert && <AlertTriangle size={14} className="mb-1" />}
                         {msg.text}
                         {msg.isAlert && (
                           <button className="block mt-2 bg-amber-500/20 px-2 py-1 rounded text-xs hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                             View Evacuation Route
                           </button>
                         )}
                       </div>
                    ) : (
                       <div className="max-w-[85%] bg-white/10 border border-white/10 p-3 rounded-lg text-sm text-white">
                         {msg.text}
                       </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-3 pb-2 flex gap-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                {QUICK_REPLIES.map(qr => (
                  <button 
                    key={qr} 
                    onClick={() => handleSend(qr)}
                    className="shrink-0 liquid-glass border border-white/10 hover:bg-white/10 transition-colors rounded-lg px-3 py-1.5 text-xs text-gray-300"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t border-white/10 bg-black/40 shrink-0">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                    placeholder="Describe your emergency..."
                    className="liquid-glass border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm w-full text-white focus:outline-none focus:border-green-500/50"
                  />
                  <button 
                    onClick={() => handleSend(input)}
                    className="absolute right-2 p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Floating Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full liquid-glass border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform group relative"
        >
          {isOpen ? <X size={24} className="text-white" /> : <MessageSquare size={24} className="text-white group-hover:text-green-400 transition-colors" />}
          
          {/* Notification Dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-black"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
};
