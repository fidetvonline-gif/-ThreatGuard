import React from 'react';
import { ArrowLeft, ShieldAlert, Cpu, History, RefreshCw } from 'lucide-react';
import { DeviceInfo } from '../types/threat';

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  deviceInfo: DeviceInfo;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  deviceInfo,
  activeTab,
  onNavigateTab,
}) => {
  const getStatusBadge = () => {
    switch (deviceInfo.overallStatus) {
      case 'PROTECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Protected
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Critical Risk
          </span>
        );
      case 'ACTION_REQUIRED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Action Required
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white truncate tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {getStatusBadge()}
      </div>
    </header>
  );
};
