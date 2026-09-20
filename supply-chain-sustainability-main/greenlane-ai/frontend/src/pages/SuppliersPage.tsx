import React, { useState, useEffect } from 'react';
import { api, SupplierItem } from '../api/client';
import { QualityBadge } from '../components/common/QualityBadge';
import { Users, Search, Award, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSuppliers().then(data => {
      setSuppliers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filtered = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || s.tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const getESGColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'A': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'B': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-400" />
            <span>Supplier 360 ESG Scorecard & Risk Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit supply base reliability, lead-time volatility, carbon intensity, and data verification tiers.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier or city..."
              className="bg-dark-850 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-dark-850 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Tiers</option>
            <option value="tier 1">Tier 1</option>
            <option value="tier 2">Tier 2</option>
          </select>
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div key={s.id} className="glass-panel p-5 rounded-xl glass-panel-hover space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{s.code} &bull; {s.tier}</span>
                <h3 className="text-sm font-semibold text-white mt-0.5">{s.name}</h3>
                <span className="text-xs text-slate-400">{s.city}, {s.country}</span>
              </div>

              <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${getESGColor(s.esg_grade)}`}>
                ESG {s.esg_grade}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-800">
              <div className="p-2 rounded bg-dark-850 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-sans">Reliability Score</span>
                <span className="font-bold text-emerald-400">{(s.reliability_score * 100).toFixed(0)}%</span>
              </div>
              <div className="p-2 rounded bg-dark-850 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-sans">Avg Lead Time</span>
                <span className="font-bold text-slate-200">{s.lead_time_days} days</span>
              </div>
              <div className="p-2 rounded bg-dark-850 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-sans">CO₂ Intensity</span>
                <span className="font-bold text-cyan-400">{s.co2_intensity} kg/unit</span>
              </div>
              <div className="p-2 rounded bg-dark-850 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-sans">Monthly Capacity</span>
                <span className="font-bold text-slate-200">{s.capacity.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Audit Status:</span>
              <QualityBadge quality={s.data_quality} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
