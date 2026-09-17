import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Scanner from './components/Scanner';
import VerdictView from './components/VerdictView';
import InspectorVault from './components/InspectorVault';
import AdminDashboard from './components/AdminDashboard';
import { ShieldCheck, Heart, Sparkles, Scale, AlertCircle } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('inspector'); // Default to Inspector for rich demo
  const [activeTab, setActiveTab] = useState('scanner');
  const [samples, setSamples] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      if (res.ok) {
        const data = await res.json();
        setSamples(data);
      }
    } catch (err) {
      console.error('Error loading sample labels:', err);
    }
  };

  const handleScanComplete = (scanRecord) => {
    setCurrentScan(scanRecord);
  };

  const handleViewScanFromVault = (scanRecord) => {
    setCurrentScan(scanRecord);
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        role={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Role Banner Indicator */}
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-slate-300">Active Role Mode:</span>
            <span className="font-extrabold text-cyan-300 uppercase tracking-wider">{role} View</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-semibold hidden sm:flex">
            <span>Problem Statement: SIH26034</span>
            <span>•</span>
            <span>Department of Legal Metrology</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'scanner' && (
          <div className="space-y-8">
            <Scanner
              samples={samples}
              onScanComplete={handleScanComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            {currentScan && (
              <div id="verdict-section" className="pt-4">
                <VerdictView
                  scanResult={currentScan}
                  onUpdateScan={setCurrentScan}
                  role={role}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'vault' && (
          <InspectorVault onViewScan={handleViewScanFromVault} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>ComplyScan — Legal Metrology Compliance Engine</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">Team KO_KRAKENS (SIH 2026)</span>
          </div>

          <p className="text-slate-500 text-center sm:text-right">
            Built under Legal Metrology (Packaged Commodities) Rules, 2011 & Legal Metrology Act, 2009.
          </p>
        </div>
      </footer>

    </div>
  );
}
