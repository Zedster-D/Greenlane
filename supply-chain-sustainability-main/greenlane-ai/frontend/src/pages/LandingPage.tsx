import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Activity,
  Sparkles,
  Sliders,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Globe,
  BarChart3,
  Cpu,
  CheckCircle2,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-dark-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-dark-950 font-bold shadow-glow-emerald">
              <Leaf className="w-4 h-4 text-dark-950 stroke-[2.5]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">GreenLane AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/overview"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-glow-emerald transition-all flex items-center space-x-1.5"
            >
              <span>Launch Control Tower</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 px-6 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Supply Chain Decarbonization Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              See the carbon. Understand the risk.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Simulate the future.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Transform raw logistics shipments into decision-grade Scope 3 emissions intelligence.
              Simulate modal shifts, solve Pareto multi-objective plans, and stress-test disruptions in real time.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/overview"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-semibold text-sm shadow-glow-emerald hover:opacity-95 transition-all flex items-center space-x-2"
              >
                <span>Open Control Tower</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/scenarios"
                className="px-6 py-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center space-x-2"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Simulate What-If</span>
              </Link>
            </div>

            {/* Metrics Banner */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="glass-panel p-4 rounded-xl text-left border-l-2 border-l-brand-400">
                <span className="text-xs text-slate-400 uppercase font-mono">Real Logistics Data</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">5,208</div>
                <span className="text-[11px] text-brand-400 font-medium">Order lines joined</span>
              </div>
              <div className="glass-panel p-4 rounded-xl text-left border-l-2 border-l-cyan-400">
                <span className="text-xs text-slate-400 uppercase font-mono">Emission Factors</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">ADEME / GLEC</div>
                <span className="text-[11px] text-cyan-400 font-medium">Full audit provenance</span>
              </div>
              <div className="glass-panel p-4 rounded-xl text-left border-l-2 border-l-amber-400">
                <span className="text-xs text-slate-400 uppercase font-mono">Pareto Optimizer</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">&le; 0.2s</div>
                <span className="text-[11px] text-amber-400 font-medium">Multi-objective solve</span>
              </div>
              <div className="glass-panel p-4 rounded-xl text-left border-l-2 border-l-rose-400">
                <span className="text-xs text-slate-400 uppercase font-mono">Disruption Simulator</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">Real-time</div>
                <span className="text-[11px] text-rose-400 font-medium">Suez, Weather & Ports</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Full-Stack Decarbonization Intelligence</h2>
            <p className="text-slate-400 text-sm mt-2">Built upon the foundation of canonical transport carbon accounting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Interactive Network Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualize global origins, transit ports, distribution hubs, and customer delivery legs with live flow metrics and risk heat.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">What-If Simulation Lab</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test modal shifts (Air➔Sea, Road➔Rail), load consolidation multipliers, and shadow carbon pricing with live delta recalculations.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">AI Sustainability Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversational assistant that autonomously executes carbon queries, Pareto optimizations, and risk evaluations without hallucinations.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>GreenLane AI — Supply Chain Sustainability Control Tower &copy; 2026. GLEC & ADEME Compliant.</p>
      </footer>
    </div>
  );
};
