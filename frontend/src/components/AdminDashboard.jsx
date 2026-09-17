import React, { useState, useEffect } from 'react';
import { Sliders, BarChart3, PieChart as PieChartIcon, ShieldCheck, AlertOctagon, Scale, Check, X, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAnal, resRules] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/rules')
      ]);

      if (resAnal.ok) setAnalytics(await resAnal.json());
      if (resRules.ok) setRules(await resRules.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRule = async (ruleId, currentStatus) => {
    try {
      const res = await fetch(`/api/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fb7185', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-7 h-7 text-cyan-400" />
            <span>Admin Rules & Compliance Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">Configure LMPC 2011 Rules Engine & View Platform Violation Metrics</p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scans Conducted</span>
            <div className="text-3xl font-extrabold text-white">{analytics.total_scans}</div>
            <p className="text-[10px] text-cyan-400 font-medium">Across all product categories</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Passed Compliant Scans</span>
            <div className="text-3xl font-extrabold text-emerald-300">{analytics.passed_scans}</div>
            <p className="text-[10px] text-emerald-400 font-medium">Zero LMPC rule violations</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-rose-950/10 space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Violations Intercepted</span>
            <div className="text-3xl font-extrabold text-rose-300">{analytics.failed_scans}</div>
            <p className="text-[10px] text-rose-400 font-medium">Flagged for legal penalty</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-cyan-500/20 bg-cyan-950/10 space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">National Pass Rate</span>
            <div className="text-3xl font-extrabold text-cyan-300">{analytics.pass_rate}%</div>
            <p className="text-[10px] text-cyan-400 font-medium">Platform compliance score</p>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Bar Chart */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Top Violated Legal Clauses (LMPC 2011)</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_violations}>
                  <XAxis dataKey="clause" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-cyan-400" />
              <span>Inspections by Product Category</span>
            </h3>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.category_stats).map(([k, v]) => ({ name: k, value: v.total }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.keys(analytics.category_stats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Rules Engine Configurator */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <span>Active LMPC 2011 Rules-as-Code Configuration</span>
          </h3>
          <p className="text-xs text-slate-400">Enable or disable legal metrology checks and view statutory penalty clauses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-2xl border transition-all ${
                r.enabled ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold text-cyan-400 block">{r.clause}</span>
                  <h4 className="text-sm font-bold text-white">{r.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                </div>

                <button
                  onClick={() => handleToggleRule(r.id, r.enabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                    r.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {r.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <strong className="text-rose-400">Penalty Reference:</strong> {r.penalty}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
