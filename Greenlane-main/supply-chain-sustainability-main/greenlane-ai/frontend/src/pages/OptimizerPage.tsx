import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, OptimizerResponse, ParetoOption } from '../api/client';
import {
  Sparkles,
  Target,
  Sliders,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const OptimizerPage: React.FC = () => {
  const { dataset, showToast } = useApp();
  const [targetCO2, setTargetCO2] = useState<number>(20.0);
  const [maxCostInc, setMaxCostInc] = useState<number>(15.0);
  const [maxTimeInc, setMaxTimeInc] = useState<number>(60.0);
  const [carbonPrice, setCarbonPrice] = useState<number>(50.0);
  
  const [optimizerData, setOptimizerData] = useState<OptimizerResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<ParetoOption | null>(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const res = await api.runOptimizer({
        co2_reduction_target_pct: targetCO2,
        max_cost_increase_pct: maxCostInc,
        max_time_increase_pct: maxTimeInc,
        carbon_price: carbonPrice,
        dataset,
      });
      setOptimizerData(res);
      if (res.pareto_options.length > 0) {
        setSelectedOption(res.pareto_options[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [dataset]);

  const scatterData = optimizerData?.pareto_options.map(opt => ({
    x: opt.cost_increase_pct,
    y: opt.co2_reduction_pct,
    z: opt.time_increase_pct,
    label: opt.label,
    co2e_kg: opt.co2e_kg,
    cost: opt.cost,
  })) || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>Multi-Objective Pareto Optimization Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Discovers mathematically non-dominated transport plans balancing Carbon Reduction, Cost Budget, and SLA Lead Times.
          </p>
        </div>

        <button
          onClick={runOptimization}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-glow-emerald transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Solving Frontier...' : 'Solve Optimization'}</span>
        </button>
      </div>

      {/* Controls & Constraint Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 glass-panel p-5 rounded-xl">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center">
              <Target className="w-3.5 h-3.5 mr-1 text-brand-400" /> CO₂ Reduction Target:
            </span>
            <span className="font-mono text-brand-400 font-bold">&ge; {targetCO2}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={targetCO2}
            onChange={(e) => setTargetCO2(Number(e.target.value))}
            className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Max Cost Increase Budget:</span>
            <span className="font-mono text-cyan-400 font-bold">&le; +{maxCostInc}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={maxCostInc}
            onChange={(e) => setMaxCostInc(Number(e.target.value))}
            className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Max Lead Time Tolerance:</span>
            <span className="font-mono text-amber-400 font-bold">&le; +{maxTimeInc}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={maxTimeInc}
            onChange={(e) => setMaxTimeInc(Number(e.target.value))}
            className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Main Grid: Pareto Trade-off Chart + Options */}
      {optimizerData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pareto Trade-Off Scatter Chart */}
          <div className="glass-panel p-5 rounded-xl lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Pareto Optimal Frontier (Trade-Off Curve)</h3>
                <p className="text-xs text-slate-400">Y-Axis: CO₂ Reduction (%) vs X-Axis: Cost Increase (%)</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                {optimizerData.feasible_count} Feasible Plans Found
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="x" name="Cost Increase (%)" unit="%" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="CO₂ Reduction (%)" unit="%" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#111722', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Scatter name="Pareto Plans" data={scatterData} fill="#10b981">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedOption?.label === entry.label ? '#22d3ee' : '#10b981'}
                        r={8}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 italic mt-2">
              * Non-dominated points represent optimal tradeoffs where CO₂ cannot be reduced further without spending more or increasing transit delay.
            </p>
          </div>

          {/* Plan Options Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Pareto Plan Options</h3>

            {optimizerData.pareto_options.map((opt) => (
              <div
                key={opt.label}
                onClick={() => setSelectedOption(opt)}
                className={`glass-panel p-4 rounded-xl cursor-pointer transition-all ${
                  selectedOption?.label === opt.label
                    ? 'border-brand-500 bg-dark-850 shadow-glow-emerald'
                    : 'glass-panel-hover'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-white text-xs flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-mono text-[10px]">
                      {opt.label.split(' ')[1]}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {opt.co2_reduction_pct}% CO₂
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 mt-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cost Delta</span>
                    <span className={opt.cost_increase_pct > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {opt.cost_increase_pct > 0 ? `+${opt.cost_increase_pct}%` : `${opt.cost_increase_pct}%`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lead Time</span>
                    <span className="text-slate-200">
                      +{opt.time_increase_pct}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Carbon: {opt.co2e_kg.toLocaleString()} kg</span>
                  <span className="text-cyan-400 font-medium">Select Plan ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Option Execution Detail */}
      {selectedOption && (
        <div className="glass-panel p-5 rounded-xl border border-brand-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Recommended Execution Plan: {selectedOption.label}</span>
            </h4>
            <p className="text-xs text-slate-300">
              Satisfies <strong>{selectedOption.co2_reduction_pct}% carbon reduction</strong> with only{' '}
              <strong>{selectedOption.cost_increase_pct}% budget impact</strong>.
            </p>
          </div>

          <button
            onClick={() => showToast(`Applied ${selectedOption.label} mode assignments to active logistics network!`)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-xs shadow-glow-emerald hover:opacity-95 transition-all"
          >
            Deploy This Plan to Logistics
          </button>
        </div>
      )}
    </div>
  );
};
