import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, Download, Edit3, Save, Scale, Check, X, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VerdictView({ scanResult, onUpdateScan, role }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  if (!scanResult) return null;

  const isPass = scanResult.compliant;
  const canEdit = role === 'inspector' || role === 'admin'; // Restrict editing to Inspector & Admin roles only

  React.useEffect(() => {
    if (isPass) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [scanResult]);

  const handleStartEdit = () => {
    const fields = {};
    Object.entries(scanResult.extracted_fields).forEach(([k, v]) => {
      fields[k] = v.value || '';
    });
    setEditedFields(fields);
    setIsEditing(true);
  };

  const handleSaveOverride = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/manual-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanResult.id,
          updated_fields: editedFields,
          is_imported: scanResult.is_imported
        })
      });
      if (!res.ok) throw new Error('Override failed');
      const updated = await res.json();
      setIsEditing(false);
      if (onUpdateScan) onUpdateScan(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to save manual field corrections.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/scans/${scanResult.id}/pdf`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Verdict Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 border ${
        isPass
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/40 glow-green'
          : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 border-rose-500/40 glow-rose'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${
              isPass
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-rose-500/30'
            }`}>
              {isPass ? <ShieldCheck className="w-10 h-10" /> : <AlertOctagon className="w-10 h-10" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  isPass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isPass ? 'LMPC RULES 2011 — PASSED' : 'STATUTORY LEGAL VIOLATION'}
                </span>
                <span className="text-xs font-bold text-slate-400">ID: {scanResult.id}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {scanResult.commodity_name}
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300">
                {isPass
                  ? 'All mandatory statutory declarations comply with Legal Metrology (Packaged Commodities) Rules, 2011.'
                  : `Detected ${scanResult.violations.length} statutory rule violation(s) under Legal Metrology Act, 2009.`}
              </p>
            </div>
          </div>

          {/* Score & Action Button */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center px-6 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div className="text-3xl font-black text-gradient-cyan">{scanResult.compliance_score}%</div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Compliance Index</div>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="px-6 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all glow-cyan"
            >
              <Download className="w-5 h-5 text-cyan-200" />
              <span>Export PDF Report</span>
            </button>
          </div>

        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Declaration Review & Role-Restricted Manual Editor */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Declaration Fields</h3>
                  <p className="text-xs text-slate-400">
                    {canEdit ? 'Inspector OCR field verification & manual override' : 'Statutory packaging declaration summary'}
                  </p>
                </div>
              </div>

              {canEdit && (
                !isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Inspector Override</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveOverride}
                      disabled={isSaving}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Corrections</span>
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Field Table */}
            <div className="space-y-3.5">
              {Object.entries(scanResult.extracted_fields).map(([key, field]) => {
                const labelMap = {
                  generic_name: 'Generic Commodity Name',
                  net_quantity: 'Net Quantity / Weight',
                  mrp: 'Maximum Retail Price (MRP)',
                  mfg_date: 'Month & Year of Mfg/Pkg',
                  manufacturer_details: 'Manufacturer / Packer Address',
                  country_of_origin: 'Country of Origin',
                  customer_care: 'Consumer Care Contact'
                };

                return (
                  <div key={key} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400">{labelMap[key] || key}</span>
                      <span className="font-extrabold text-cyan-400">
                        {Math.round((field.confidence || 1) * 100)}% Conf.
                      </span>
                    </div>

                    {isEditing && canEdit ? (
                      <input
                        type="text"
                        value={editedFields[key] || ''}
                        onChange={(e) => setEditedFields({ ...editedFields, [key]: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    ) : (
                      <p className={`text-sm font-bold truncate ${field.value ? 'text-white' : 'text-rose-400 italic'}`}>
                        {field.value || 'Not declared on packaging label'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: LMPC 2011 Clause-by-Clause Audit */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Statutory Clause Audit Breakdown</h3>
                <p className="text-xs text-slate-400">Legal Metrology (Packaged Commodities) Rules, 2011</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {scanResult.rule_evaluations && scanResult.rule_evaluations.map((ev, idx) => {
                const isPassed = ev.passed;
                const viol = ev.violation;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPassed
                        ? 'bg-slate-900/40 border-slate-800/80'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isPassed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>

                        <div>
                          <span className="text-xs font-black text-cyan-400 block">{ev.rule_id.replace(/_/g, ' ')}</span>
                          <h4 className="text-sm font-bold text-white">
                            {viol ? viol.title : ev.details}
                          </h4>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {isPassed ? 'COMPLIANT' : 'VIOLATION'}
                      </span>
                    </div>

                    {!isPassed && viol && (
                      <div className="mt-3.5 pt-3.5 border-t border-rose-900/50 space-y-2 text-xs">
                        <div className="text-rose-200 font-medium">
                          <strong className="text-rose-400">Finding:</strong> {viol.violation_details}
                        </div>
                        <div className="bg-rose-950/70 p-3 rounded-xl border border-rose-900/60 text-rose-200 leading-relaxed">
                          <strong className="text-rose-400 block mb-0.5">Statutory Penalty Citation:</strong>
                          {viol.penalty_clause}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
