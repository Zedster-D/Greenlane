import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, ModeBreakdown, RouteSummary, EmissionFactorItem } from '../api/client';
import { QualityBadge } from '../components/common/QualityBadge';
import {
  BarChart3,
  TrendingUp,
  FileCheck2,
  Table,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
} from 'recharts';

export const EmissionsPage: React.FC = () => {
  const { dataset } = useApp();
  const [activeTab, setActiveTab] = useState<'modes' | 'routes' | 'factors' | 'forecast'>('modes');
  const [modes, setModes] = useState<ModeBreakdown[]>([]);
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [factors, setFactors] = useState<EmissionFactorItem[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getModes(dataset),
      api.getRoutes(dataset),
      api.getFactors(),
      api.getForecast(dataset, 4),
    ]).then(([m, r, f, fc]) => {
      setModes(m);
      setRoutes(r);
      setFactors(f);
      setForecast(fc);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [dataset]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            <span>Scope 3 Transport Emissions Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade carbon accounting according to GLEC Framework & GHG Protocol Scope 3 Category 4.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-dark-850 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('modes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'modes' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            By Mode
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'routes' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            By Corridor
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'factors' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emission Factors Audit
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'forecast' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forecast
          </button>
        </div>
      </div>

      {/* TAB 1: Modes Breakdown */}
      {activeTab === 'modes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modes.map((m, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl border-t-4 border-t-brand-400 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base uppercase text-white tracking-wider font-mono">{m.mode}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono font-bold">
                  {m.percentage}% CO₂e
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-white">{m.co2e_kg.toLocaleString()} kg</div>
                <div className="text-xs text-slate-400">{m.co2e_tonnes} tonnes CO₂e</div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Factor Applied:</span>
                  <span className="font-mono text-slate-200 font-semibold">{m.factor_used} {m.factor_unit}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Source:</span>
                  <span className="text-cyan-400 font-medium">{m.factor_source}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Distance:</span>
                  <span className="font-mono text-slate-200">{m.distance_km.toLocaleString()} km</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Corridors & Routes */}
      {activeTab === 'routes' && (
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
          <div className="p-4 bg-dark-850 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Corridor Carbon League Table ({routes.length} Active Corridors)
            </h3>
            <span className="text-xs text-brand-400 font-mono">Sorted by Total Carbon Impact</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Origin ➔ Destination</th>
                  <th className="py-3 px-4">Primary Mode</th>
                  <th className="py-3 px-4">Shipments</th>
                  <th className="py-3 px-4">Freight Volume</th>
                  <th className="py-3 px-4">Total CO₂e (kg)</th>
                  <th className="py-3 px-4">Network Share</th>
                  <th className="py-3 px-4">Corridor Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {routes.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                      <span>{r.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{r.destination}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                        {r.primary_mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{r.shipment_count}</td>
                    <td className="py-3 px-4 font-mono">{r.total_weight_tonnes} t</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {r.co2e_kg.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{r.percentage}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${r.risk_score > 0.3 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {r.risk_score > 0.3 ? 'HIGH EXPOSURE' : 'LOW RISK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Emission Factors Audit Provenance */}
      {activeTab === 'factors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start space-x-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300">Factor Provenance Notice:</strong> The calculations in GreenLane AI use ADEME Base Carbone (Well-to-Wheel) canonical standards.
              Every emission coefficient includes verified methodology and publication versioning to satisfy CSRD & ISO 14083 audit demands.
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Vehicle Type</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Source Standard</th>
                  <th className="py-3 px-4">Methodology & Scope</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {factors.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold uppercase text-white font-mono">{f.mode}</td>
                    <td className="py-3 px-4 capitalize text-slate-300">{f.vehicle_type || 'Standard'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-400">
                      {f.value} {f.unit}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-medium">{f.source}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">{f.methodology}</td>
                    <td className="py-3 px-4">
                      {f.is_active ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                          ACTIVE CANONICAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                          ALTERNATIVE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Emissions Forecast */}
      {activeTab === 'forecast' && forecast && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">4-Month Carbon Extrapolation & Confidence Cone</h3>
                <p className="text-xs text-slate-400">Statistical linear trend forecasting with 95% confidence interval</p>
              </div>
              <div className="text-xs font-mono text-brand-400 px-2.5 py-1 rounded bg-brand-500/10 border border-brand-500/20">
                Trend: {forecast.trend?.direction.toUpperCase()} ({forecast.trend?.monthly_change_kg} kg/mo)
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[...forecast.historical, ...forecast.forecast]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111722', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="co2e_kg" stroke="#10b981" strokeWidth={2.5} name="Actual / Forecast (kg)" dot={{ r: 4 }} />
                  <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#06b6d4" fillOpacity={0.15} name="Upper 95% Band" />
                  <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#06b6d4" fillOpacity={0.15} name="Lower 95% Band" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
