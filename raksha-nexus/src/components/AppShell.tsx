import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Flame, Heart, Monitor, Brain, Users, Wifi, Zap, Settings, Home, LogOut } from 'lucide-react';
import { AIEmergencyChatbot } from './AIEmergencyChatbot';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Flame, label: 'Crisis Response', path: '/crisis' },
  { icon: Heart, label: 'Women Safety', path: '/women-safety' },
  { icon: Monitor, label: 'Admin Panel', path: '/admin' },
  { icon: Brain, label: 'AI Intelligence', path: '/ai-intelligence' },
  { icon: Users, label: 'Public Tools', path: '/public-tools' },
  { icon: Wifi, label: 'Offline & Mesh', path: '/offline' },
  { icon: Zap, label: 'Advanced', path: '/advanced' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const AppShell: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const isDemoMode = false;
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden font-sans relative">

      {/* SHARED VIDEO BACKGROUND */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      {/* Stronger dark overlay for inner pages so content is legible */}
      <div className="fixed inset-0 bg-black/70 z-[1]" />
      
      {/* LEFT SIDEBAR */}
      <nav className="!fixed top-0 left-0 h-screen w-16 hover:w-56 transition-all duration-300 liquid-glass border-r border-white/10 flex flex-col z-50 group overflow-hidden">
        <div className="flex-1 flex flex-col gap-2 mt-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-all ${
                  isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="shrink-0 px-1">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* TOP STATUS BAR */}
      <header className="!fixed top-0 left-16 right-0 h-12 liquid-glass border-b border-white/10 flex items-center justify-between px-6 z-40 transition-all duration-300">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <span className="text-sm font-medium tracking-widest text-white group-hover:text-teal-400 transition-colors">RAKSHA NEXUS</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </NavLink>
        
        <div className="text-sm text-gray-400 font-mono hidden sm:block">
          {time.toLocaleTimeString()}
        </div>

        <div className="flex items-center gap-4">
          <NavLink to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2" title="Return to Home">
            <Home size={16} />
            <span className="text-xs hidden sm:block">Home</span>
          </NavLink>
          
          {/* Divider */}
          <div className="w-px h-5 bg-white/10" />

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-7 h-7 rounded-full border border-white/20 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-300 hidden md:block max-w-[120px] truncate">
                {user.displayName || user.email}
              </span>
              <button 
                onClick={signOut}
                className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/5"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT — sits above the video overlay (z-[2]) */}
      <main className="relative z-[2] ml-16 pt-12 flex-1 h-screen overflow-y-auto">
        <div className="px-6 md:px-10 lg:px-16 py-8 min-h-full">
          <Outlet context={{ isDemoMode }} />
        </div>
      </main>
      <AIEmergencyChatbot />
    </div>
  );
};
