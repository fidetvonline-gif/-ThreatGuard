import React from 'react';
import { LayoutDashboard, ScanLine, AlertTriangle, Database, History } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeThreatCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  activeThreatCount,
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Security',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scan-select',
      label: 'Scanner',
      icon: ScanLine,
      badge: null,
    },
    {
      id: 'threats',
      label: 'Threats',
      icon: AlertTriangle,
      badge: activeThreatCount > 0 ? activeThreatCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'intel',
      label: 'Intel & DB',
      icon: Database,
      badge: null,
    },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[58px] ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              {tab.badge !== null && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500 text-white shadow-sm ring-1 ring-slate-950">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
          </button>
        );
      })}
    </nav>
  );
};
