import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, ScenarioResult } from '../api/client';
import { formatCurrency, formatCarbonPrice, getCurrencySymbol } from '../utils/currency';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Cloud,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const { dataset, currency } = useApp();
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('air_to_sea');
  
  // Custom Controls
  const [modeFrom, setModeFrom] = useState<string>('air');
  const [modeTo, setModeTo] = useState<string>('sea');
  const [consolidation, setConsolidation] = useState<number>(0.90);
  const [carbonPrice, setCarbonPrice] = useState<number>(50.0);
  
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getScenarios().then(data => setSavedScenarios(data)).catch(console.error);
    // Run initial simulation
    handleRunSimulation();
  }, [dataset]);

  const handleRunSimulation = async (customOverrides?: Record<string, string>, customConsolidation?: number) => {
    setLoading(true);
    try {
      const overrides = customOverrides || { [modeFrom]: modeTo };
      const factor = customConsolidation !== undefined ? customConsolidation : consolidation;

      const res = await api.runScenario({
        name: `Simulation: ${modeFrom.toUpperCase()} ➔ ${modeTo.toUpperCase()}`,
        mode_overrides: overrides,
        consolidation_factor: factor,
        carbon_price: carbonPrice,
        dataset,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: any) => {
    try {
      const overrides = JSON.parse(preset.mode_overrides);
      const keys = Object.keys(overrides);
      if (keys.length > 0) {
        setModeFrom(keys[0]);
        setModeTo(overrides[keys[0]]);
      }
      setConsolidation(preset.consolidation_factor);
      setCarbonPrice(preset.carbon_price);
      handleRunSimulation(overrides, preset.consolidation_factor);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <span>Supply Chain What-If Scenario Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test decarbonization levers: modal transitions, load consolidation, and internal carbon shadow pricing.
          </p>
        </div>

        <button
          onClick={() => handleRunSimulation()}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-glow-emerald transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Simulating...' : 'Recalculate Scenario'}</span>
        </button>
      </div>

      {/* Preset Cards Row */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pre-Configured Decarbonization Levers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savedScenarios.map((sc) => (
            <div
              key={sc.id}
              onClick={() => applyPreset(sc)}
              className="glass-panel p-4 rounded-xl glass-panel-hover cursor-pointer border-l-4 border-l-brand-400 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">{sc.name}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {sc.co2_change_pct}% CO₂
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sc.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls + Live Comparison Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Simulator Controls */}
        <div className="glass-panel p-5 rounded-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Custom Lever Adjustments</h3>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Modal Rerouting</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">From Mode:</span>
                <select
                  value={modeFrom}
                  onChange={(e) => setModeFrom(e.target.value)}
                  className="w-full mt-1 bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-500 capitalize font-mono"
                >
                  <option value="air">Air Freight</option>
                  <option value="road">Road Trucking</option>
                  <option value="sea">Ocean Freight</option>
                  <option value="rail">Rail Freight</option>
                </select>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">To Mode:</span>
                <select
                  value={modeTo}
                  onChange={(e) => setModeTo(e.target.value)}
                  className="w-full mt-1 bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-500 capitalize font-mono"
                >
                  <option value="sea">Ocean (Slow/Fast)</option>
                  <option value="rail">Rail Corridor</option>
                  <option value="road">Road Trucking</option>
                  <option value="air">Air Express</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consolidation Factor */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Load Consolidation:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {(consolidation * 100).toFixed(0)}% (Factor {consolidation})
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={consolidation}
              onChange={(e) => setConsolidation(parseFloat(e.target.value))}
              className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500 block">
              0.80 = 20% fewer trips through FCL container packing & bundling
            </span>
          </div>

          {/* Carbon Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Shadow Carbon Price:</span>
              <span className="font-mono text-amber-400 font-bold">{formatCarbonPrice(carbonPrice, currency)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={carbonPrice}
              onChange={(e) => setCarbonPrice(parseFloat(e.target.value))}
              className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            onClick={() => handleRunSimulation()}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-glow-emerald transition-all"
          >
            Apply Levers & Recalculate
          </button>
        </div>

        {/* Live Comparative Delta Output */}
        {result && (
          <div className="lg:col-span-2 space-y-4">
            {/* Top Delta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl border-l-4 border-l-emerald-400">
                <span className="text-[10px] uppercase font-mono text-slate-400">CO₂e Delta</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {result.delta.co2e_pct}%
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  {result.delta.co2e_kg > 0 ? '+' : ''}{result.delta.co2e_kg.toLocaleString()} kg
                </span>
              </div>

              <div className="glass-panel p-4 rounded-xl border-l-4 border-l-cyan-400">
                <span className="text-[10px] uppercase font-mono text-slate-400">Logistics Cost Delta</span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  {result.delta.cost_pct}%
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  {formatCurrency(result.delta.cost, currency, { showSign: true })}
                </span>
              </div>

              <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-400">
                <span className="text-[10px] uppercase font-mono text-slate-400">Transit Time Delta</span>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {result.delta.time_pct}%
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  {result.delta.time_hours > 0 ? '+' : ''}{result.delta.time_hours.toFixed(1)} hrs
                </span>
              </div>
            </div>

            {/* Side-by-Side Detailed Breakdown */}
            <div className="glass-panel p-5 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Baseline vs. Scenario Comparison Table
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-900/60 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3">Current Baseline</th>
                      <th className="py-2.5 px-3">Simulated Scenario</th>
                      <th className="py-2.5 px-3">Net Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-slate-200">Carbon Footprint (kg CO₂e)</td>
                      <td className="py-3 px-3 text-slate-400">{result.baseline.co2e_kg.toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{result.scenario.co2e_kg.toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{result.delta.co2e_pct}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-slate-200">Freight Transport Spend ({getCurrencySymbol(currency)})</td>
                      <td className="py-3 px-3 text-slate-400">{formatCurrency(result.baseline.cost, currency)}</td>
                      <td className="py-3 px-3 text-cyan-400 font-bold">{formatCurrency(result.scenario.cost, currency)}</td>
                      <td className="py-3 px-3 text-cyan-400 font-bold">{result.delta.cost_pct}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-slate-200">Shadow Carbon Tax Liability (@ {formatCarbonPrice(carbonPrice, currency)})</td>
                      <td className="py-3 px-3 text-slate-400">{formatCurrency(result.baseline.carbon_cost, currency)}</td>
                      <td className="py-3 px-3 text-white font-bold">{formatCurrency(result.scenario.carbon_cost, currency)}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{result.delta.co2e_pct}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-slate-200">Total Landed Transit Lead Time</td>
                      <td className="py-3 px-3 text-slate-400">{result.baseline.time_hours.toFixed(1)} hrs</td>
                      <td className="py-3 px-3 text-slate-200">{result.scenario.time_hours.toFixed(1)} hrs</td>
                      <td className="py-3 px-3 text-amber-400 font-bold">{result.delta.time_pct > 0 ? `+${result.delta.time_pct}%` : `${result.delta.time_pct}%`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
