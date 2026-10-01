import React from 'react';
import {
  Shield,
  Smartphone,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Signal,
  RotateCcw,
  Info,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isMobileView: boolean;
  onToggleView: () => void;
  onOpenArchitectureInfo: () => void;
  onResetData: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isMobileView,
  onToggleView,
  onOpenArchitectureInfo,
  onResetData,
}) => {
  const currentTime = '12:15';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 select-none font-sans">
      {/* Top Universal Control Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">ThreatGuard</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Android MVP v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Mobile Threat Detection &amp; Security Analysis System
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenArchitectureInfo}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="View MVP Architecture & OS Isolation Pipeline"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">OS Telemetry Architecture</span>
          </button>

          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset to Sample Telemetry State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reset Data</span>
          </button>

          <button
            onClick={onToggleView}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
          >
            {isMobileView ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Console Mode</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Phone Mockup Frame or Wide Console */}
      <main className="w-full flex justify-center items-start pb-6">
        {isMobileView ? (
          // Mobile Phone Bezel
          <div className="relative w-full max-w-[412px] bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-cyan-950/40 border-4 border-slate-700/90 ring-1 ring-slate-800">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-3 z-50">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700/50" />
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Inner Screen Display */}
            <div className="relative w-full min-h-[740px] max-h-[820px] bg-slate-950 rounded-[34px] overflow-hidden flex flex-col border border-slate-800/80">
              {/* Android Status Bar */}
              <div className="h-9 px-6 pt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-40 bg-slate-950/90 backdrop-blur-md">
                <span className="font-semibold text-slate-300">{currentTime}</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">5G</span>
                  <Battery className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative custom-scrollbar">
                {children}
              </div>

              {/* Android Gesture Bar */}
              <div className="h-4 w-full bg-slate-950 flex items-center justify-center py-1">
                <div className="w-32 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          // Expanded Responsive Security Console
          <div className="w-full max-w-6xl bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-2xl p-4 sm:p-6 overflow-hidden">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
