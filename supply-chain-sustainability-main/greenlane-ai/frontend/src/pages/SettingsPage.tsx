import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, EmissionFactorItem } from '../api/client';
import { Settings, Save, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { dataset, setDataset, currency, setCurrency, carbonPrice, setCarbonPrice, showToast, refreshKPIs } = useApp();
  const [factors, setFactors] = useState<EmissionFactorItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getFactors().then(setFactors).catch(console.error);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Settings saved and recalculated successfully!');
      refreshKPIs();
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl">
        <h2 className="text-base font-semibold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-brand-400" />
          <span>System Configuration & Decarbonization Parameters</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune corporate carbon tax shadow pricing, preferred accounting currencies, and emission coefficient sets.
        </p>
      </div>

      {/* Global Config Card */}
      <div className="glass-panel p-5 rounded-xl space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Scenario & Engine Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Dataset */}
          <div>
            <label className="text-xs text-slate-300 font-medium">Active Logistics Dataset</label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full mt-1 bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-mono"
            >
              <option value="demo">VastraGlobal Exports (Demo Dataset &bull; Multi-Modal)</option>
              <option value="original">Original French Dataset (5,208 Order Lines)</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="text-xs text-slate-300 font-medium">Reporting Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full mt-1 bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-mono"
            >
              <option value="EUR">Euros (€ EUR)</option>
              <option value="INR">Indian Rupees (₹ INR)</option>
              <option value="USD">US Dollars ($ USD)</option>
              <option value="GBP">British Pounds (£ GBP)</option>
            </select>
          </div>
        </div>

        {/* Shadow Carbon Price */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Shadow Carbon Tax Rate:</span>
            <span className="font-mono text-emerald-400 font-bold">€{carbonPrice} / Tonne CO₂e</span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            step="10"
            value={carbonPrice}
            onChange={(e) => setCarbonPrice(Number(e.target.value))}
            className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-glow-emerald transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Active Factor Set */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Registered Emission Factor Coefficients</h3>
          <span className="text-[11px] font-mono text-emerald-400">Canonical: ADEME Base Carbone</span>
        </div>

        <div className="space-y-2">
          {factors.map((f) => (
            <div key={f.id} className="p-3 rounded-lg bg-dark-850 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white uppercase font-mono">{f.mode}</span>
                <span className="text-slate-400 ml-2">({f.source})</span>
                <div className="text-[11px] text-slate-500 mt-0.5">{f.methodology}</div>
              </div>
              <div className="font-mono font-bold text-brand-400 text-sm">
                {f.value} <span className="text-[10px] text-slate-400 font-sans">{f.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
