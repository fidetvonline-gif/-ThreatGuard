import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  Globe,
  Smartphone,
} from 'lucide-react';
import { SeverityLevel, ThreatRecord, ThreatStatus } from '../types/threat';

interface ThreatListViewProps {
  threats: ThreatRecord[];
  onSelectThreat: (threat: ThreatRecord) => void;
  onStartNewScan: () => void;
}

export const ThreatListView: React.FC<ThreatListViewProps> = ({
  threats,
  onSelectThreat,
  onStartNewScan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE_ALL');

  const filteredThreats = threats.filter((threat) => {
    // Search filter
    const matchesSearch =
      threat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (threat.source.packageName &&
        threat.source.packageName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (threat.source.fileName &&
        threat.source.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (threat.signatureId && threat.signatureId.toLowerCase().includes(searchQuery.toLowerCase()));

    // Severity filter
    const matchesSeverity = severityFilter === 'ALL' || threat.severity === severityFilter;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE_ALL') {
      matchesStatus = threat.status === 'ACTIVE' || threat.status === 'INVESTIGATING' || threat.status === 'ACTION_REQUIRED';
    } else if (statusFilter === 'RESOLVED') {
      matchesStatus = threat.status === 'RESOLVED';
    } else if (statusFilter === 'FALSE_POSITIVE') {
      matchesStatus = threat.status === 'FALSE_POSITIVE' || threat.status === 'MARKED_SAFE';
    } else if (statusFilter === 'ALL') {
      matchesStatus = true;
    }

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800/60';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-800/60';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'LOW':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/60';
      case 'INFORMATIONAL':
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status: ThreatStatus) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="text-[10px] font-mono text-emerald-400">RESOLVED</span>;
      case 'FALSE_POSITIVE':
      case 'MARKED_SAFE':
        return <span className="text-[10px] font-mono text-blue-400">MARKED SAFE</span>;
      case 'INVESTIGATING':
        return <span className="text-[10px] font-mono text-amber-400">INVESTIGATING</span>;
      case 'ACTIVE':
      default:
        return <span className="text-[10px] font-mono text-red-400">ACTIVE</span>;
    }
  };

  return (
    <div className="p-4 space-y-3.5 text-slate-100 animate-fadeIn">
      {/* Title & Count Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Threat Inventory</h3>
          <p className="text-xs text-slate-400">
            Investigate identified security indicators and technical evidence.
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
          {filteredThreats.length} {filteredThreats.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search package, hash, or signature..."
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Filter Tabs: Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
        <button
          onClick={() => setStatusFilter('ACTIVE_ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'ACTIVE_ALL'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Threats
        </button>
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'RESOLVED'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Resolved
        </button>
        <button
          onClick={() => setStatusFilter('FALSE_POSITIVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'FALSE_POSITIVE'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          False Positives
        </button>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
      </div>

      {/* Filter Buttons: Severity */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[11px] font-mono">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              severityFilter === sev
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Threat Cards List */}
      {filteredThreats.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-200">No Matching Threat Records</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {searchQuery || severityFilter !== 'ALL' || statusFilter !== 'ACTIVE_ALL'
              ? 'Try adjusting your search query or filter settings.'
              : 'No threats detected in the local database. Run a new scan to inspect current telemetry.'}
          </p>
          <button
            onClick={onStartNewScan}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow transition-colors"
          >
            Start Scan
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredThreats.map((threat) => {
            const isSourceDetermined = threat.source.determined;
            const sourceText = isSourceDetermined
              ? threat.source.applicationName || threat.source.fileName || threat.source.packageName
              : 'Source could not be determined';

            return (
              <div
                key={threat.id}
                onClick={() => onSelectThreat(threat)}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 space-y-2.5 transition-all cursor-pointer hover:bg-slate-850 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
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
                      <h4 className="text-xs font-bold text-white truncate">{threat.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {isSourceDetermined ? (
                          <span className="font-mono text-cyan-400 font-medium">{sourceText}</span>
                        ) : (
                          <span className="text-amber-400/90 italic font-sans">
                            Source could not be determined
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold shrink-0 ${getSeverityBadge(
                      threat.severity
                    )}`}
                  >
                    {threat.severity}
                  </span>
                </div>

                {/* Evidence & Confidence Metrics */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">Confidence: <b className="text-slate-200">{threat.confidence}%</b></span>
                    <span className="text-slate-600">|</span>
                    {getStatusBadge(threat.status)}
                  </div>

                  <div className="flex items-center gap-1 text-cyan-400 font-medium">
                    <span>Investigate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
