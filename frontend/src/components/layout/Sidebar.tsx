import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Layers,
  Clock,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Anchor,
  Activity,
  Server
} from 'lucide-react';
import { useStudyArea } from '../../context/StudyAreaContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Flood Map', icon: MapPin },
  { id: 'zones', label: 'Zone Analysis', icon: Layers },
  { id: 'timeline', label: 'Forecast', icon: Clock },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
  { id: 'emergency', label: 'Emergency Response', icon: ShieldAlert },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { config } = useStudyArea();
  return (
    <aside className="w-64 min-w-64 h-screen bg-[#0B1528] border-r border-[#172B5E] flex flex-col justify-between select-none z-30">
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-[#1E3A6E] bg-[#070E1C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-mono">
                CoastGuard-AI
              </div>
              <div className="text-[10px] font-medium text-slate-300 tracking-wider leading-tight">
                Coastal Flood Intelligence<br />& Emergency Response
              </div>
            </div>
          </div>
        </div>

        {/* Operational Scope */}
        <div className="px-4 py-2 bg-[#091122] border-b border-[#1E3A6E]/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-pulse"></span>
            AO: {config.name.toUpperCase()}
          </span>
          <span className="text-slate-400">{config.state.toUpperCase()}</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#142342]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status */}
      <div className="p-3.5 border-t border-[#1E3A6E] bg-[#070E1C]">
        <div className="px-1 py-1 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-400" />
            System Status
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Model Configured
          </span>
        </div>

        <div className="bg-[#0B1528] rounded border border-[#1E3A6E] p-2.5 space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>GIS baseline</span>
            <span className="text-blue-400 font-semibold text-[10px]">Static data</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Environment feeds</span>
            <span className="text-blue-400 font-semibold text-[10px]">API-backed</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Prediction</span>
            <span className="text-emerald-400 font-semibold text-[10px]">Configured</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Map layers</span>
            <span className="text-blue-400 font-semibold text-[10px]">Static GIS</span>
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
          Static GIS • {config.name.toUpperCase()}
        </div>
      </div>
    </aside>
  );
};
