import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, KPISummary, MonthlyEmission, ModeBreakdown, RouteSummary, ScenarioResult } from '../api/client';
import { formatCurrency, formatCarbonPrice } from '../utils/currency';
import { MetricCard } from '../components/common/MetricCard';
import { QualityBadge } from '../components/common/QualityBadge';
import {
  Cloud,
  Truck,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Plane,
  Ship,
  Train,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { dataset, currency, setIsCopilotOpen } = useApp();
  const [kpis, setKPIs] = useState<KPISummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyEmission[]>([]);
  const [modes, setModes] = useState<ModeBreakdown[]>([]);
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick what-if simulation state
  const [airToSeaFactor, setAirToSeaFactor] = useState(50);
  const [quickSimResult, setQuickSimResult] = useState<ScenarioResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getKPIs(dataset),
      api.getMonthly(dataset),
      api.getModes(dataset),
      api.getRoutes(dataset),
    ]).then(([kpiData, monthData, modeData, routeData]) => {
      setKPIs(kpiData);
      setMonthly(monthData);
      setModes(modeData);
      setRoutes(routeData.slice(0, 5));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [dataset]);

  const handleQuickSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await api.runScenario({
        name: `Air Shift (${airToSeaFactor}%)`,
        mode_overrides: { air: 'sea' },
        consolidation_factor: 1.0 - (airToSeaFactor / 200),
        carbon_price: 50.0,
        dataset,
      });
      setQuickSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  const MODE_COLORS: Record<string, string> = {
    road: '#f59e0b',  // amber
    rail: '#10b981',  // emerald
    sea: '#06b6d4',   // cyan
    air: '#f43f5e',   // rose
  };

  if (loading || !kpis) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-brand-400 font-mono text-sm">
          <div className="w-3 h-3 rounded-full bg-brand-400 animate-ping"></div>
          <span>Computing carbon ledger and scope 3 aggregations...</span>
        </div>
      </div>
    );
  }

  const pieData = modes.map(m => ({
    name: m.mode.toUpperCase(),
    value: m.co2e_kg,
    percentage: m.percentage,
    color: MODE_COLORS[m.mode.toLowerCase()] || '#94a3b8',
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Air Freight Anomaly Alert Banner (when air > 25% or demo mode) */}
      {kpis.air_freight_emissions_share > 20 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-dark-900 border border-rose-500/30 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-200">
                Carbon Anomaly Detected: Air Freight Disproportionate Impact
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Air shipments account for ~10% of freight movements but drive{' '}
                <strong className="text-rose-400">{kpis.air_freight_emissions_share}% of total CO₂e emissions</strong>{' '}
                due to high emission intensity (2.10 kg CO₂e/t·km).
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>AI Solution</span>
          </button>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Scope 3 Emissions"
          value={`${kpis.total_co2e_tonnes.toLocaleString()}`}
          unit="t CO₂e"
          subtitle={`${kpis.total_co2e_kg.toLocaleString()} kg CO₂e`}
          icon={Cloud}
          accentColor="emerald"
          quality="ADEME Base Carbone"
        />
        <MetricCard
          title="Total Freight Volume"
          value={`${kpis.total_weight_tonnes.toLocaleString()}`}
          unit="Tonnes"
          subtitle={`${kpis.total_shipments.toLocaleString()} shipments tracked`}
          icon={Scale}
          accentColor="cyan"
          quality="Direct Measurement"
        />
        <MetricCard
          title={`Shadow Carbon Cost (@ ${formatCarbonPrice(50, currency)})`}
          value={formatCurrency(kpis.shadow_carbon_cost, currency)}
          subtitle="Corporate ETS shadow price liability"
          icon={DollarSign}
          accentColor="amber"
        />
        <MetricCard
          title="Top Emitter Mode"
          value={kpis.top_emitter_mode.toUpperCase()}
          unit={`${kpis.top_emitter_mode_pct}% CO₂e`}
          subtitle="Primary reduction opportunity"
          icon={Truck}
          accentColor="rose"
        />
      </div>

      {/* Main Visuals Grid: Monthly Trend + Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Emissions Trend */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Emissions Profile by Mode</h3>
              <p className="text-xs text-slate-400">Chronological Scope 3 carbon footprint across 2021–2024</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="flex items-center text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span> Road</span>
              <span className="flex items-center text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400 mr-1"></span> Air</span>
              <span className="flex items-center text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400 mr-1"></span> Sea</span>
              <span className="flex items-center text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-1"></span> Rail</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month_year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111722', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="road_co2" stackId="1" stroke="#f59e0b" fill="url(#colorRoad)" name="Road CO₂ (kg)" />
                <Area type="monotone" dataKey="sea_co2" stackId="1" stroke="#06b6d4" fill="url(#colorSea)" name="Sea CO₂ (kg)" />
                <Area type="monotone" dataKey="air_co2" stackId="1" stroke="#f43f5e" fill="url(#colorAir)" name="Air CO₂ (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mode Distribution Donut */}
        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-1">Emissions by Transport Mode</h3>
          <p className="text-xs text-slate-400 mb-3">Share of overall logistics carbon footprint</p>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111722', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {modes.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MODE_COLORS[m.mode] }}></span>
                  <span className="font-medium text-slate-200 capitalize">{m.mode}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({m.factor_used} kg/t·km)</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-semibold text-white">{m.percentage}%</span>
                  <span className="text-slate-400 text-[11px]">({m.co2e_tonnes} t)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Emitter Routes + Quick What-If Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Top Emitter Corridors</h3>
              <p className="text-xs text-slate-400">Routes generating the largest absolute emissions</p>
            </div>
            <span className="text-xs text-brand-400 font-mono">Top 5 by CO₂e</span>
          </div>

          <div className="space-y-3">
            {routes.map((r, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-dark-850 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                    <span>{r.origin}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span>{r.destination}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                    <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                      {r.primary_mode}
                    </span>
                    <span>{r.shipment_count} shipments</span>
                    <span>•</span>
                    <span>{r.total_weight_tonnes} tonnes</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-white">{r.co2e_kg.toLocaleString()} kg</div>
                  <span className="text-[10px] text-brand-400">{r.percentage}% of network</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick What-If Simulation Sandbox */}
        <div className="glass-panel p-5 rounded-xl border border-brand-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Live What-If Simulator</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Interactive
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            Test shifting rush air freight to fast ocean steaming with load consolidation:
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Air Freight to Ocean Mode Shift:</span>
                <span className="font-mono text-brand-400 font-bold">{airToSeaFactor}% Shifted</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={airToSeaFactor}
                onChange={(e) => setAirToSeaFactor(Number(e.target.value))}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            <button
              onClick={handleQuickSimulate}
              disabled={simLoading}
              className="w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-glow-emerald transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{simLoading ? 'Recalculating Carbon & Cost...' : 'Execute Mode Shift Simulation'}</span>
            </button>

            {quickSimResult && (
              <div className="p-3.5 rounded-lg bg-dark-900 border border-brand-500/30 space-y-2 animate-fadeIn">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">CO₂ Reduction:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {quickSimResult.delta.co2e_pct}% ({quickSimResult.delta.co2e_kg.toLocaleString()} kg)
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Logistics Cost Savings:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {quickSimResult.delta.cost_pct}% ({formatCurrency(Math.abs(quickSimResult.delta.cost), currency)})
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Shadow Carbon Cost Savings:</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(Math.abs(quickSimResult.delta.co2e_kg) * 0.05, currency, { decimals: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
