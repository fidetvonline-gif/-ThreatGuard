import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  Clock,
  ChevronRight,
  Shield,
  Smartphone,
  Lock,
  Search,
  CheckCircle2,
  FileCheck2,
  Activity,
  Zap,
  Radio,
  RefreshCw,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import { DeviceInfo, ThreatRecord } from '../types/threat';

interface DashboardViewProps {
  deviceInfo: DeviceInfo;
  threats: ThreatRecord[];
  onStartScan: () => void;
  onSelectThreat: (threat: ThreatRecord) => void;
  onViewAllThreats: () => void;
  autoScanEnabled: boolean;
  onToggleAutoScan: () => void;
  autoScanCountdown: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  deviceInfo,
  threats,
  onStartScan,
  onSelectThreat,
  onViewAllThreats,
  autoScanEnabled,
  onToggleAutoScan,
  autoScanCountdown,
}) => {
  const activeThreats = threats.filter(
    (t) => t.status === 'ACTIVE' || t.status === 'INVESTIGATING' || t.status === 'ACTION_REQUIRED'
  );

  const criticalCount = activeThreats.filter((t) => t.severity === 'CRITICAL').length;
  const highCount = activeThreats.filter((t) => t.severity === 'HIGH').length;
  const mediumCount = activeThreats.filter((t) => t.severity === 'MEDIUM').length;
  const lowCount = activeThreats.filter((t) => t.severity === 'LOW').length;

  const formattedLastScan = deviceInfo.lastScanAt
    ? new Date(deviceInfo.lastScanAt).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Scanning Now...';

  return (
    <div className="space-y-4 sm:space-y-5 text-slate-100 animate-fadeIn">
      {/* Live Auto-Scan Protection Engine Status Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Continuous Telemetry Auto-Scan
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span>Next automatic inspection in</span>
              <span className="font-mono text-cyan-400 font-bold">{autoScanCountdown}s</span>
              <span className="text-slate-600">•</span>
              <span>Monitors permissions &amp; storage</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onToggleAutoScan}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {autoScanEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-400" />
                <span>Auto-Scan ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-500" />
                <span>Auto-Scan OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Device Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 p-4 sm:p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              Live Security Telemetry State
            </span>
            <div className="flex items-center gap-2">
              {activeThreats.length === 0 ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Protected</h3>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-bold text-amber-300 tracking-tight">
                    {criticalCount > 0
                      ? 'Critical Risks Active'
                      : highCount > 0
                      ? 'Security Action Required'
                      : 'Suspicious Indicators Found'}
                  </h3>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Scan: {formattedLastScan}</span>
            </div>
          </div>

          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${
              activeThreats.length === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : criticalCount > 0
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {activeThreats.length === 0 ? (
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </div>
        </div>

        {/* Primary Manual Rescan Trigger CTA */}
        <button
          onClick={onStartScan}
          className="mt-4 w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>RUN IMMEDIATE SCAN NOW</span>
        </button>
      </div>

      {/* Security Summary Counters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Security Summary
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeThreats.length} Active {activeThreats.length === 1 ? 'Threat' : 'Threats'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">Total Threats</span>
            <span className="text-lg sm:text-xl font-bold text-white tabular-nums">{activeThreats.length}</span>
          </div>
          <div className="rounded-xl bg-red-950/20 border border-red-900/40 p-2.5 sm:p-3 text-center">
            <span className="text-[10px] uppercase font-mono text-red-400 block truncate">Critical</span>
            <span className="text-lg sm:text-xl font-bold text-red-400 tabular-nums">{criticalCount}</span>
          </div>
          <div className="rounded-xl bg-orange-950/20 border border-orange-900/40 p-2.5 sm:p-3 text-center">
            <span className="text-[10px] uppercase font-mono text-orange-400 block truncate">High Risk</span>
            <span className="text-lg sm:text-xl font-bold text-orange-400 tabular-nums">{highCount}</span>
          </div>
          <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 p-2.5 sm:p-3 text-center">
            <span className="text-[10px] uppercase font-mono text-amber-400 block truncate">Medium Risk</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400 tabular-nums">{mediumCount}</span>
          </div>
        </div>
      </div>

      {/* Recent Threats Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Recent Detections
          </h4>
          <button
            onClick={onViewAllThreats}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All ({threats.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeThreats.length === 0 ? (
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-200">No Active Threats Detected</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Continuous automatic inspection verifies that all accessible application packages and permissions match safe security baselines.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeThreats.slice(0, 3).map((threat) => {
              const isSourceDetermined = threat.source.determined;
              const sourceLabel = isSourceDetermined
                ? threat.source.applicationName || threat.source.fileName || threat.source.packageName
                : 'Source could not be determined';

              return (
                <div
                  key={threat.id}
                  onClick={() => onSelectThreat(threat)}
                  className="rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-3.5 space-y-2 transition-all cursor-pointer hover:bg-slate-850"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          threat.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : threat.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{threat.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {isSourceDetermined ? (
                            <span className="font-mono text-cyan-400">{sourceLabel}</span>
                          ) : (
                            <span className="text-amber-400/90 italic">
                              Source could not be determined
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                          threat.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-400 border border-red-800/50'
                            : threat.severity === 'HIGH'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800/50'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}
                      >
                        {threat.severity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="font-mono">Confidence: {threat.confidence}%</span>
                    <span className="text-cyan-400 flex items-center gap-0.5 font-medium">
                      Investigate <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Device Telemetry Snapshot */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-2">
        <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
          Telemetry &amp; Sandbox Baseline
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/40">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">Platform Environment</span>
              <span className="font-medium text-slate-200 truncate block">
                {deviceInfo.platformVersion}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/40">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">Sandbox Enforcement</span>
              <span className="font-medium text-slate-200 truncate block">
                {deviceInfo.isRooted ? 'Rooted (Unsafe)' : 'Non-Root Isolation Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
