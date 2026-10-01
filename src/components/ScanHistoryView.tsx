import React, { useState } from 'react';
import {
  History,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronRight,
  RotateCcw,
  Zap,
  Layers,
  FileSearch,
} from 'lucide-react';
import { ScanRecord, ThreatRecord } from '../types/threat';

interface ScanHistoryViewProps {
  scanHistory: ScanRecord[];
  allThreats: ThreatRecord[];
  onSelectThreat: (threat: ThreatRecord) => void;
  onStartNewScan: () => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  scanHistory,
  allThreats,
  onSelectThreat,
  onStartNewScan,
}) => {
  const [selectedScanId, setSelectedScanId] = useState<string | null>(
    scanHistory[0]?.id || null
  );

  const selectedScan = scanHistory.find((s) => s.id === selectedScanId);
  const scanThreats = selectedScan
    ? allThreats.filter((t) => selectedScan.threatIds.includes(t.id))
    : [];

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'QUICK':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'APPLICATION':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'FILE':
        return <FileSearch className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="p-4 space-y-4 text-slate-100 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Scan History &amp; Logs</h3>
          <p className="text-xs text-slate-400">
            Historical audit log of security scan telemetry and outcomes.
          </p>
        </div>
        <button
          onClick={onStartNewScan}
          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-1 shadow transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Scan</span>
        </button>
      </div>

      {scanHistory.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-2">
          <History className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No Scan History Available</p>
          <p className="text-xs text-slate-500">Run a scan to generate your first audit log.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {scanHistory.map((scan) => {
            const isSelected = selectedScanId === scan.id;
            const formattedDate = new Date(scan.completedAt || scan.startedAt).toLocaleString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={scan.id}
                onClick={() => setSelectedScanId(scan.id)}
                className={`rounded-2xl border p-3.5 space-y-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getScanIcon(scan.scanType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold font-mono text-white">
                          {scan.scanType.replace('_', ' ')} SCAN
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({scan.durationMs}ms)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        scan.threatsFound > 0
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {scan.threatsFound} {scan.threatsFound === 1 ? 'threat' : 'threats'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                  <span className="font-mono">
                    Scanned: <b className="text-slate-200">{scan.itemsScanned.total}</b> items
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    Scanner v1.0.4
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Scan Detail Drawer / Card */}
      {selectedScan && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            Scan Audit Details: {selectedScan.id}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Apps</span>
              <span className="text-slate-200 font-bold">{selectedScan.itemsScanned.applications}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Permissions</span>
              <span className="text-slate-200 font-bold">{selectedScan.itemsScanned.permissions}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Files &amp; Hashes</span>
              <span className="text-slate-200 font-bold">{selectedScan.itemsScanned.files}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Signatures</span>
              <span className="text-slate-200 font-bold">{selectedScan.itemsScanned.signaturesChecked}</span>
            </div>
          </div>

          {scanThreats.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Threats Identified In This Scan:
              </span>
              <div className="space-y-1.5">
                {scanThreats.map((threat) => (
                  <div
                    key={threat.id}
                    onClick={() => onSelectThreat(threat)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">{threat.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {threat.source.determined
                          ? threat.source.packageName || threat.source.fileName
                          : 'Source could not be determined'}
                      </span>
                    </div>
                    <span className="text-cyan-400 text-xs flex items-center gap-1">
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
