import React, { useState } from 'react';
import {
  Shield,
  RotateCcw,
  Info,
  Layers,
  ScanLine,
  AlertTriangle,
  History,
  Database,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { DeviceInfo } from '../types/threat';

interface AppLayoutProps {
  children: React.ReactNode;
  deviceInfo: DeviceInfo;
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  activeThreatCount: number;
  onOpenArchitectureInfo: () => void;
  onResetData: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  deviceInfo,
  currentTab,
  onNavigateTab,
  activeThreatCount,
  onOpenArchitectureInfo,
  onResetData,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Security Overview', shortLabel: 'Overview', icon: Shield },
    { id: 'scan-select', label: 'Scanner', shortLabel: 'Scanner', icon: ScanLine },
    {
      id: 'threats',
      label: 'Threat Inventory',
      shortLabel: 'Threats',
      icon: AlertTriangle,
      badge: activeThreatCount > 0 ? activeThreatCount : null,
    },
    { id: 'history', label: 'Scan Logs', shortLabel: 'Logs', icon: History },
    { id: 'intel', label: 'Intel & Supabase', shortLabel: 'Intel & DB', icon: Database },
  ];

  const getStatusBadge = () => {
    switch (deviceInfo.overallStatus) {
      case 'PROTECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Protected</span>
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/30 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Critical Risk</span>
          </span>
        );
      case 'ACTION_REQUIRED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Action Required</span>
          </span>
        );
    }
  };

  const handleTabClick = (tabId: string) => {
    onNavigateTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Primary Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Target Device Identifier */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  ThreatGuard
                </span>
                <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                  Security System
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <Smartphone className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">Android Platform ({deviceInfo.platformVersion})</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Large Screens) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500 text-white ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden sm:block">{getStatusBadge()}</div>

            <button
              onClick={onOpenArchitectureInfo}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="View Architecture Pipeline"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Architecture</span>
            </button>

            <button
              onClick={onResetData}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle All Menus"
            >
              {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Visible Horizontal Navigation Bar on Medium & Small Screens */}
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-900 overflow-x-auto custom-scrollbar flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500 text-white ml-0.5">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileDrawerOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2 animate-fadeIn z-30 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">All Navigation Menus</span>
            <div>{getStatusBadge()}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500 text-white">
                      {item.badge} Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-5 md:p-6 pb-24 md:pb-10 flex flex-col">
        {children}
      </main>
    </div>
  );
};
