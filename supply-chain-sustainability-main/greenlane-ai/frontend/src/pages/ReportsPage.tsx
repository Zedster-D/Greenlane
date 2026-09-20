import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { formatCurrency } from '../utils/currency';
import { FileText, Printer, Download, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { dataset, currency } = useApp();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getReportSummary(dataset)
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [dataset]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-xs font-mono text-slate-400">
        Generating official sustainability disclosure document...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between no-print">
        <div>
          <h2 className="text-sm font-semibold text-white">Sustainability Disclosure Report</h2>
          <span className="text-xs text-slate-400 font-mono">Report ID: {report.report_id}</span>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-glow-emerald transition-all flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl p-8 space-y-6 shadow-2xl text-slate-200 printable-document">
        {/* Document Header */}
        <div className="border-b border-slate-700/80 pb-6 flex items-start justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              GREENLANE AI &bull; SCOPE 3 CARBON DISCLOSURE
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">{report.company}</h1>
            <p className="text-xs text-slate-400 mt-1">{report.standard}</p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>Date: {new Date(report.generated_at).toLocaleDateString()}</div>
            <div>Dataset: {report.dataset}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-dark-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Total CO₂e</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {report.executive_summary.total_co2e_tonnes} t
              </div>
            </div>
            <div className="p-3 rounded-lg bg-dark-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Shipments</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {report.executive_summary.total_shipments}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-dark-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Freight Weight</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {report.executive_summary.total_freight_weight_tonnes} t
              </div>
            </div>
            <div className="p-3 rounded-lg bg-dark-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Shadow Tax Liability</span>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                {formatCurrency(report.executive_summary.shadow_carbon_cost_eur, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Mode Distribution Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Emissions Breakdown by Transport Mode</h3>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-850 font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Total CO₂e (kg)</th>
                  <th className="py-2.5 px-3">Share (%)</th>
                  <th className="py-2.5 px-3">Audit Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {Object.entries(report.mode_breakdown).map(([mode, data]: [string, any]) => (
                  <tr key={mode}>
                    <td className="py-2.5 px-3 font-sans font-semibold capitalize text-white">{mode}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{data.co2e_kg.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{data.pct}%</td>
                    <td className="py-2.5 px-3 text-cyan-400">ADEME Base Carbone v2023</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Sign-off */}
        <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Trail & Accounting Certification</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            This report represents verified calculations based on shipment weight logs and GIS distance routing. 
            All emission coefficients conform to ISO 14083 and European CSRD disclosures.
          </p>
        </div>
      </div>
    </div>
  );
};
