import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Eye, RefreshCw, FileText, Layers, Crosshair } from 'lucide-react';

export default function Scanner({ samples, onScanComplete, isLoading, setIsLoading }) {
  const [selectedSample, setSelectedSample] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isImported, setIsImported] = useState(false);
  const [category, setCategory] = useState('Packaged Commodities');
  const [scanResult, setScanResult] = useState(null);
  const [activeBox, setActiveBox] = useState(null);

  useEffect(() => {
    if (samples && samples.length > 0 && !previewUrl) {
      handleSelectSample(samples[0]);
    }
  }, [samples]);

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setUploadedFile(null);
    setPreviewUrl(sample.image_url);
    setScanResult(null);
    setActiveBox(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setSelectedSample(null);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setActiveBox(null);
    }
  };

  const handleRunScan = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (selectedSample) {
        formData.append('sample_filename', selectedSample.filename);
      } else if (uploadedFile) {
        formData.append('file', uploadedFile);
      } else {
        alert('Please select a sample packaging label or upload an image.');
        setIsLoading(false);
        return;
      }
      formData.append('is_imported', isImported);
      formData.append('category', category);

      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanResult(data);
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to ComplyScan API server. Make sure server is running on localhost:8000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl glass-card-bright p-8 md:p-10 border border-cyan-500/20">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 glow-cyan">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI Computer Vision + LMPC Rules 2011 Engine</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Compliance Inspection <br />
            <span className="text-gradient-cyan">Packaging Scanner</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Scan products and mandatory packaging declarations (MRP, Net Qty, Dates, Manufacturer details, Customer Care). Automatically audit against Legal Metrology (Packaged Commodities) Rules, 2011 with exact clause citations.
          </p>
        </div>

        {/* 1-Click Sample Gallery */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>1-Click Test Packaging Gallery (Compliant & Violation Cases)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Select any label to test instant audit</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {samples && samples.map((s) => {
              const isSelected = selectedSample?.id === s.id;
              const isPass = s.expected_verdict === 'PASS';
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`group relative p-3 rounded-2xl transition-all text-left flex flex-col justify-between border glass-card-hover ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/40 glow-cyan scale-[1.02]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2.5 bg-slate-950 border border-slate-800 relative">
                    <img src={s.image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-md ${
                      isPass ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}>
                      {isPass ? 'COMPLIANT' : 'VIOLATION'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{s.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{s.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Visualizer & Extraction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Canvas Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Label Canvas Visualizer</h3>
                  <p className="text-xs text-slate-400">Interactive OCR field bounding box overlay</p>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-300 cursor-pointer bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={isImported}
                  onChange={(e) => setIsImported(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500"
                />
                <span>Imported Goods (Rule 6(1)(f))</span>
              </label>
            </div>

            {/* Canvas Image Container - Tight Inline Wrapper for Pixel-Perfect Overlay */}
            <div className="w-full rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center justify-center p-3 shadow-2xl overflow-hidden min-h-[380px]">
              {previewUrl ? (
                <div className="relative inline-block max-w-full">
                  <img
                    src={previewUrl}
                    alt="Packaging label"
                    className="max-w-full max-h-[500px] rounded-lg object-contain block shadow-lg"
                  />

                  {/* OCR Bounding Boxes Layer */}
                  {scanResult && scanResult.extracted_fields && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Object.entries(scanResult.extracted_fields).map(([key, field]) => {
                        if (!field.bbox || field.bbox[2] === 0) return null;
                        const [x, y, w, h] = field.bbox;
                        const isSelected = activeBox === key;
                        const isMissing = !field.value;
                        
                        return (
                          <div
                            key={key}
                            style={{
                              left: `${(x / 800) * 100}%`,
                              top: `${(y / 600) * 100}%`,
                              width: `${(w / 800) * 100}%`,
                              height: `${(h / 600) * 100}%`
                            }}
                            className={`absolute border-2 rounded transition-all pointer-events-auto cursor-pointer ${
                              isMissing
                                ? 'border-rose-500 bg-rose-500/20'
                                : isSelected
                                ? 'border-cyan-400 bg-cyan-400/30 ring-2 ring-cyan-500/40 z-20 glow-cyan'
                                : 'border-cyan-400/90 bg-cyan-400/10 hover:border-cyan-300 hover:bg-cyan-400/20'
                            }`}
                            onClick={() => setActiveBox(key)}
                          >
                            <span className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight whitespace-nowrap shadow-md pointer-events-none ${
                              isMissing ? 'bg-rose-950 text-rose-300 border border-rose-500' : 'bg-slate-950/90 text-cyan-300 border border-cyan-400'
                            }`}>
                              {key.replace('_', ' ')} ({Math.round((field.confidence || 0) * 100)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Upload className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No label loaded</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <label className="flex-1 w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500 text-slate-300 text-xs font-bold cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Label Image (JPG / PNG)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleRunScan}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 glow-cyan"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Auditing LMPC Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-cyan-200" />
                    <span>Run Legal Metrology Audit</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Extracted Mandatory Declarations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Extracted Declarations</h3>
                  <p className="text-xs text-slate-400">Rule 6(1) Statutory Declarations</p>
                </div>
              </div>
            </div>

            {scanResult ? (
              <div className="space-y-3">
                {Object.entries(scanResult.extracted_fields).map(([key, field]) => {
                  const isSelected = activeBox === key;
                  const isMissing = !field.value;
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
                    <div
                      key={key}
                      onClick={() => setActiveBox(key)}
                      className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/30 glow-cyan scale-[1.01]'
                          : isMissing
                          ? 'bg-rose-950/20 border-rose-900/60 hover:bg-rose-900/30'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-400">{labelMap[key] || key}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isMissing ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {isMissing ? 'NOT DECLARED' : `${Math.round((field.confidence || 1) * 100)}% Conf.`}
                        </span>
                      </div>
                      <p className={`text-sm font-bold truncate ${isMissing ? 'text-rose-400 italic' : 'text-slate-100'}`}>
                        {field.value || 'Missing from packaging label'}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-14 px-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 glow-cyan">
                  <Crosshair className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Ready to Scan</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Click <strong>"Run Legal Metrology Audit"</strong> to extract fields and evaluate LMPC Rules 2011.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
