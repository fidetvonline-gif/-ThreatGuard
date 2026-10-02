import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileSearch,
  Key,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { ScanRecord, ThreatRecord } from '../types/threat';

interface ScanResultSummaryViewProps {
  scanRecord: ScanRecord;
  threats: ThreatRecord[];
  onViewThreats: () => void;
  onGoToDashboard: () => void;
  onRescan: () => void;
}

export const ScanResultSummaryView: React.FC<ScanResultSummaryViewProps> = ({
  scanRecord,
  threats,
  onViewThreats,
  onGoToDashboard,
  onRescan,
}) => {
  const currentScanThreats = threats.filter((t) => scanRecord.threatIds.includes(t.id));
  const hasThreats = currentScanThreats.length > 0;

  return (
    <div className="p-4 space-y-5 text-slate-100 animate-fadeIn">
      {/* Result Status Header */}
      <div
        className={`rounded-2xl border p-5 text-center space-y-3 ${
          hasThreats
            ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-900/40'
            : 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-900/40'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
            hasThreats
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
          }`}
        >
          {hasThreats ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            {scanRecord.scanType.replace('_', ' ')} SCAN COMPLETED
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {hasThreats
              ? `${currentScanThreats.length} ${
                  currentScanThreats.length === 1 ? 'Potential Threat' : 'Potential Threats'
                } Detected`
              : 'Device Security Verified Clean'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {hasThreats
              ? 'Specific suspicious indicators, permission sets, or file hashes require review and remediation.'
              : 'All scanned application packages, accessible files, and permissions match safe baseline parameters.'}
          </p>
        </div>
      </div>

      {/* Severity Breakdown Box (Specification Section 9 & 24 Screen 5) */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase px-1">
          Threat Classification By Severity
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center">
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-red-400 block truncate font-semibold">CRITICAL</span>
            <span className="text-base sm:text-lg font-bold text-red-400 tabular-nums">
              {scanRecord.criticalCount}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-orange-400 block truncate font-semibold">HIGH</span>
            <span className="text-base sm:text-lg font-bold text-orange-400 tabular-nums">
              {scanRecord.highCount}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-amber-400 block truncate font-semibold">MEDIUM</span>
            <span className="text-base sm:text-lg font-bold text-amber-400 tabular-nums">
              {scanRecord.mediumCount}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-blue-400 block truncate font-semibold">LOW</span>
            <span className="text-base sm:text-lg font-bold text-blue-400 tabular-nums">
              {scanRecord.lowCount}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-slate-400 block truncate font-semibold">INFORMATIONAL</span>
            <span className="text-base sm:text-lg font-bold text-slate-400 tabular-nums">
              {scanRecord.informationalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Items Scanned Detailed Breakdown */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-2.5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-200">Total Telemetry Items Inspected</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {scanRecord.itemsScanned.total}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Applications
            </span>
            <span className="font-mono text-slate-200 font-bold">
              {scanRecord.itemsScanned.applications}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Permissions
            </span>
            <span className="font-mono text-slate-200 font-bold">
              {scanRecord.itemsScanned.permissions}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-purple-400" /> Files &amp; Hashes
            </span>
            <span className="font-mono text-slate-200 font-bold">
              {scanRecord.itemsScanned.files}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Network / C2
            </span>
            <span className="font-mono text-slate-200 font-bold">
              {scanRecord.itemsScanned.networkIndicators}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        {hasThreats ? (
          <button
            onClick={onViewThreats}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>VIEW DETECTED THREATS ({currentScanThreats.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToDashboard}
            className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={onRescan}
            className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Scan Again
          </button>
        </div>
      </div>
    </div>
  );
};
