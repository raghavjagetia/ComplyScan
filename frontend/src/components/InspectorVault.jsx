import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, AlertOctagon, Download, Eye, RefreshCw, X, FileText, Scale, Check } from 'lucide-react';

export default function InspectorVault({ onViewScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeModalScan, setActiveModalScan] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/scans');
      if (!res.ok) throw new Error('Failed to connect to ComplyScan API server');
      const data = await res.json();
      setScans(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to ComplyScan API server. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleOpenScan = (scanRecord) => {
    setActiveModalScan(scanRecord);
    if (onViewScan) {
      onViewScan(scanRecord);
    }
  };

  const filteredScans = scans.filter((s) => {
    const matchesSearch = s.commodity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' ||
                          (filterStatus === 'PASS' && s.compliant) ||
                          (filterStatus === 'FAIL' && !s.compliant);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            <span>Inspector Evidence Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Searchable repository of all Legal Metrology inspection logs & reports</p>
        </div>

        <button
          onClick={fetchScans}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 flex items-center gap-2 transition-all shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={fetchScans} className="px-3 py-1 bg-rose-500 text-white rounded-lg font-bold">Retry Connection</button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by commodity name, ID, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ALL' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Scans ({scans.length})
          </button>
          <button
            onClick={() => setFilterStatus('PASS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'PASS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Passed ({scans.filter(s => s.compliant).length})
          </button>
          <button
            onClick={() => setFilterStatus('FAIL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'FAIL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Violations ({scans.filter(s => !s.compliant).length})
          </button>
        </div>
      </div>

      {/* Scans Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Inspection ID</th>
                <th className="py-4 px-6">Commodity Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Scan Date</th>
                <th className="py-4 px-6">Verdict</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredScans.length > 0 ? (
                filteredScans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-cyan-400">{s.id}</td>
                    <td className="py-4 px-6 font-bold text-white">{s.commodity_name}</td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-300">{s.category}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                        s.compliant
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {s.compliant ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{s.compliant ? 'PASS' : 'VIOLATION'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-white">{s.compliance_score}%</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenScan(s)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                          title="View Inspection Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        
                        <a
                          href={`/api/scans/${s.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
                          title="Download PDF Certificate"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No inspection logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View for Inspection Log */}
      {activeModalScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card-bright max-w-3xl w-full max-h-[90vh] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModalScan(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                activeModalScan.compliant ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {activeModalScan.compliant ? 'PASS' : 'VIOLATION'}
              </span>
              <span className="text-xs font-bold text-slate-400">ID: {activeModalScan.id}</span>
            </div>

            <h3 className="text-2xl font-black text-white">{activeModalScan.commodity_name}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {Object.entries(activeModalScan.extracted_fields || {}).map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">{k.replace('_', ' ')}</span>
                  <p className="font-semibold text-white truncate">{v.value || 'Missing'}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Compliance Index: <strong className="text-cyan-400 font-bold">{activeModalScan.compliance_score}%</strong></span>
              
              <a
                href={`/api/scans/${activeModalScan.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Evidence Certificate</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
