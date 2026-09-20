import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sparkles, Database, ShieldCheck, Bell, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { dataset, setDataset, currency, setCurrency, setIsCopilotOpen, toastMessage } = useApp();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/overview': return 'Executive Control Tower';
      case '/network': return 'Global Supply Chain Network Map';
      case '/emissions': return 'Emissions Analytics & Audit Engine';
      case '/scenarios': return 'What-If Simulation Laboratory';
      case '/optimizer': return 'Multi-Objective Pareto Optimizer';
      case '/copilot': return 'AI Sustainability Copilot';
      case '/suppliers': return 'Supplier 360 ESG Scorecard';
      case '/risk': return 'Disruption & Risk Center';
      case '/esg': return 'ESG Reporting & Evidence Layer';
      case '/reports': return 'Sustainability Audit Report Generator';
      case '/settings': return 'System Settings & Factor Configuration';
      default: return 'Supply Chain Decarbonization';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-dark-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Path */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold text-white tracking-tight">{getPageTitle()}</h1>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-3 h-3 mr-1 animate-pulse" /> LIVE ENGINE
        </span>
      </div>

      {/* Actions & Dataset Switcher */}
      <div className="flex items-center space-x-3">
        {/* Dataset Toggle */}
        <div className="flex items-center bg-dark-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setDataset('demo')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              dataset === 'demo'
                ? 'bg-brand-500 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            VastraGlobal (Demo)
          </button>
          <button
            onClick={() => setDataset('original')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              dataset === 'original'
                ? 'bg-cyan-500 text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original CSV (5.2k Lines)
          </button>
        </div>

        {/* Currency selector */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-dark-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-brand-500 font-mono"
        >
          <option value="EUR">€ EUR</option>
          <option value="INR">₹ INR</option>
          <option value="USD">$ USD</option>
          <option value="GBP">£ GBP</option>
        </select>

        {/* AI Copilot Quick Button */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-medium shadow-glow-emerald hover:opacity-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Copilot</span>
        </button>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark-850 border border-brand-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></div>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
