import React from 'react';
import { ShieldCheck, UserCheck, Search, Sliders, Sparkles, Building2, ExternalLink } from 'lucide-react';

export default function Navbar({ role, setRole, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 glass-card-bright border-b border-cyan-500/20 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('scanner')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 glow-cyan transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white flex items-center">
                  Comply<span className="text-gradient-cyan">Scan</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase tracking-wide">
                  SIH26034
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-300">Legal Metrology Rules, 2011</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-bold">KO_KRAKENS</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Bar */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Scanner</span>
            </button>

            {role !== 'consumer' && (
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'vault'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 glow-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-4 h-4 text-cyan-300" />
                <span>Evidence Vault</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 glow-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-4 h-4 text-cyan-300" />
                <span>Rules & Analytics</span>
              </button>
            )}
          </nav>

          {/* Right Role Switcher Pills */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800/90 flex items-center shadow-lg">
              <button
                onClick={() => { setRole('consumer'); setActiveTab('scanner'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  role === 'consumer'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm glow-green'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consumer</span>
              </button>

              <button
                onClick={() => { setRole('inspector'); setActiveTab('scanner'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  role === 'inspector'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspector</span>
              </button>

              <button
                onClick={() => { setRole('admin'); setActiveTab('admin'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
