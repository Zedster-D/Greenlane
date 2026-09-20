import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Sliders,
  Sparkles,
  Bot,
  Users,
  AlertTriangle,
  FileCheck2,
  FileText,
  Settings,
  Leaf,
  Globe2,
} from 'lucide-react';

const navigationItems = [
  { name: 'Control Tower', path: '/overview', icon: LayoutDashboard },
  { name: 'Network Map', path: '/network', icon: Map },
  { name: 'Emissions Analytics', path: '/emissions', icon: BarChart3 },
  { name: 'What-If Scenarios', path: '/scenarios', icon: Sliders },
  { name: 'Pareto Optimizer', path: '/optimizer', icon: Sparkles },
  { name: 'AI Copilot', path: '/copilot', icon: Bot },
  { name: 'Supplier 360', path: '/suppliers', icon: Users },
  { name: 'Disruption Center', path: '/risk', icon: AlertTriangle },
  { name: 'ESG & Evidence', path: '/esg', icon: FileCheck2 },
  { name: 'Audit Reports', path: '/reports', icon: FileText },
  { name: 'Configuration', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <Link to="/" className="h-16 flex items-center px-6 space-x-3 border-b border-slate-800/80 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-dark-950 font-bold shadow-glow-emerald">
            <Leaf className="w-5 h-5 text-dark-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center">
              GreenLane <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">CARBON CONTROL TOWER</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 m-3 rounded-xl bg-dark-850/60 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-medium mb-1">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>GLEC / ADEME Standard</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Zero-guesswork Scope 3 emissions engine with full audit provenance.
        </p>
      </div>
    </aside>
  );
};
