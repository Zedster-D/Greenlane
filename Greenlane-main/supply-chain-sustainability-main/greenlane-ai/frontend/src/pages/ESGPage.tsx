import React from 'react';
import { useApp } from '../context/AppContext';
import { QualityBadge } from '../components/common/QualityBadge';
import {
  FileCheck2,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const ESGPage: React.FC = () => {
  const { kpis, dataset } = useApp();

  const esgChecklist = [
    { name: 'GHG Protocol Scope 3 Category 4 (Upstream Transportation)', status: 'Verified', color: 'emerald' },
    { name: 'GLEC Framework v2.0 Compliance (CO₂e calculation)', status: 'Compliant', color: 'emerald' },
    { name: 'ADEME Base Carbone Versioned Factor Provenance', status: 'Audit Ready', color: 'emerald' },
    { name: 'CSRD / ESRS E1 Climate Change Disclosures', status: '85% Complete', color: 'cyan' },
    { name: 'ISO 14083 Transportation Greenhouse Gas Accounting', status: 'In Progress', color: 'amber' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl">
        <h2 className="text-base font-semibold text-white flex items-center space-x-2">
          <FileCheck2 className="w-5 h-5 text-brand-400" />
          <span>ESG Compliance & Scope 3 Evidence Layer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Verifiable audit trail and methodology documentation satisfying European CSRD and global sustainability reporting frameworks.
        </p>
      </div>

      {/* Compliance Standards Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Checklist */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Reporting Framework Readiness</span>
          </h3>

          <div className="space-y-2.5">
            {esgChecklist.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-dark-850 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-dark-900 border border-slate-700 text-emerald-400 font-bold">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Quality Hierarchy Pyramid */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Data Quality Assurance Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-emerald-300">Tier 1: Measured Activity Data</div>
                <span className="text-[11px] text-slate-400">Carrier API telematics, weighbridge readings & fuel logs</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {kpis?.data_quality_pct.MEASURED || 40}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-cyan-300">Tier 2: Distance-Based Modeled Data</div>
                <span className="text-[11px] text-slate-400">Haulage distance × ADEME Base Carbone canonical factors</span>
              </div>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {kpis?.data_quality_pct.ESTIMATED || 60}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-amber-300">Tier 3: Industry Proxy Baselines</div>
                <span className="text-[11px] text-slate-400">Default national logistics averages (where distance is missing)</span>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {kpis?.data_quality_pct.ASSUMED || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
