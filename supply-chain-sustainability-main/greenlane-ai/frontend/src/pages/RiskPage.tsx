import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, DisruptionResponse } from '../api/client';
import {
  AlertTriangle,
  Play,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Anchor,
  Flame,
  CloudRain,
  Truck,
} from 'lucide-react';

export const RiskPage: React.FC = () => {
  const { dataset } = useApp();
  const [disruptionType, setDisruptionType] = useState('port_closure');
  const [location, setLocation] = useState('Rotterdam');
  const [severity, setSeverity] = useState(1.0);
  const [fallbackMode, setFallbackMode] = useState('road');
  const [result, setResult] = useState<DisruptionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runDisruption({
        disruption_type: disruptionType,
        affected_location: location,
        severity,
        fallback_mode: fallbackMode,
        dataset,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const disruptions = [
    { id: 'port_closure', label: 'Port Closure / Congestion', icon: Anchor, defaultLoc: 'Rotterdam' },
    { id: 'severe_weather', label: 'Severe Monsoon / Weather', icon: CloudRain, defaultLoc: 'Mumbai' },
    { id: 'fuel_price_spike', label: 'Fuel Price Spike (+35%)', icon: Flame, defaultLoc: 'Global' },
    { id: 'road_closure', label: 'Critical Route Blockage', icon: Truck, defaultLoc: 'Tirupur' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Supply Chain Disruption & Resilience Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stress-test your network against geopolitical bottlenecks, port shutdowns, extreme weather, and transit detours.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-glow-rose transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Simulating Impact...' : 'Simulate Disruption'}</span>
        </button>
      </div>

      {/* Disruption Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {disruptions.map((d) => {
          const Icon = d.icon;
          const isSelected = disruptionType === d.id;
          return (
            <div
              key={d.id}
              onClick={() => {
                setDisruptionType(d.id);
                setLocation(d.defaultLoc);
              }}
              className={`glass-panel p-4 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'border-rose-500 bg-dark-850 shadow-glow-rose'
                  : 'glass-panel-hover'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">{d.label}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Location: {d.defaultLoc}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Parameters + Impact Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Disruption Parameters</h3>

          <div>
            <label className="text-xs text-slate-300">Target Location / Hub</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Rotterdam, Mumbai, London"
              className="w-full mt-1 bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Severity Factor</label>
            <div className="flex justify-between text-xs text-rose-400 font-mono font-bold mt-1">
              <span>Low</span>
              <span>{(severity * 100).toFixed(0)}%</span>
              <span>Severe</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Fallback Detour Mode</label>
            <select
              value={fallbackMode}
              onChange={(e) => setFallbackMode(e.target.value)}
              className="w-full mt-1 bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-rose-500 capitalize font-mono"
            >
              <option value="road">Road Freight Detour</option>
              <option value="rail">Rail Corridor</option>
              <option value="air">Air Freight Rush Backup</option>
            </select>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-glow-rose transition-all"
          >
            Calculate Risk Exposure
          </button>
        </div>

        {/* Impact Output */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border-l-4 border-l-rose-400">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Affected Shipments</span>
                  <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                    {result.impact.affected_shipments} ({result.impact.affected_pct}%)
                  </div>
                  <span className="text-xs text-slate-400">Volume at risk</span>
                </div>

                <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-400">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Carbon Surge</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    +{result.impact.additional_co2e_kg.toLocaleString()} kg
                  </div>
                  <span className="text-xs text-slate-400">Detour emissions</span>
                </div>

                <div className="glass-panel p-4 rounded-xl border-l-4 border-l-cyan-400">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Average Transit Delay</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    +{result.impact.delay_days} days
                  </div>
                  <span className="text-xs text-slate-400">+{result.impact.additional_time_hours} hrs total</span>
                </div>
              </div>

              {/* Recommended Mitigations */}
              <div className="glass-panel p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Automated Mitigation Playbook</span>
                </h4>
                <div className="space-y-2">
                  {result.suggestions.map((sug, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-dark-850 border border-slate-800 flex items-center space-x-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono">
              Select a disruption type and click 'Simulate Disruption' to model detour costs, transit delays, and additional Scope 3 carbon surges.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
