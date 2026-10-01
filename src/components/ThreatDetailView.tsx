import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Shield,
  Layers,
  FileSearch,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Info,
  Sliders,
  Trash2,
  RotateCcw,
  Check,
  Flag,
} from 'lucide-react';
import { ThreatRecord } from '../types/threat';

interface ThreatDetailViewProps {
  threat: ThreatRecord;
  onBack: () => void;
  onOpenTechnicalDetails: (threat: ThreatRecord) => void;
  onOpenRemediation: (threat: ThreatRecord) => void;
  onOpenFalsePositiveModal: (threat: ThreatRecord) => void;
  onUninstallOrDelete: (threat: ThreatRecord) => void;
  onRescanItem: (threat: ThreatRecord) => void;
}

export const ThreatDetailView: React.FC<ThreatDetailViewProps> = ({
  threat,
  onBack,
  onOpenTechnicalDetails,
  onOpenRemediation,
  onOpenFalsePositiveModal,
  onUninstallOrDelete,
  onRescanItem,
}) => {
  const [showConfidenceBreakdown, setShowConfidenceBreakdown] = useState(false);
  const [showHandoffGuidance, setShowHandoffGuidance] = useState<string | null>(null);

  const isSourceDetermined = threat.source.determined;
  const isResolved = threat.status === 'RESOLVED' || threat.status === 'MARKED_SAFE' || threat.status === 'FALSE_POSITIVE';

  const formattedDetectedAt = new Date(threat.detectedAt).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getSeverityStyle = () => {
    switch (threat.severity) {
      case 'CRITICAL':
        return {
          banner: 'bg-red-950/80 border-red-800 text-red-300',
          badge: 'bg-red-500 text-white',
          iconColor: 'text-red-400',
        };
      case 'HIGH':
        return {
          banner: 'bg-orange-950/80 border-orange-800 text-orange-300',
          badge: 'bg-orange-500 text-white',
          iconColor: 'text-orange-400',
        };
      case 'MEDIUM':
        return {
          banner: 'bg-amber-950/80 border-amber-800 text-amber-300',
          badge: 'bg-amber-500 text-slate-950',
          iconColor: 'text-amber-400',
        };
      default:
        return {
          banner: 'bg-slate-900 border-slate-700 text-slate-300',
          badge: 'bg-blue-500 text-white',
          iconColor: 'text-blue-400',
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div className="p-4 space-y-4 text-slate-100 animate-fadeIn pb-10">
      {/* Back Button and Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Threat Inventory</span>
      </button>

      {/* Severity Banner */}
      <div className={`rounded-2xl border p-4 flex items-center justify-between ${style.banner} shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/60 border border-current flex items-center justify-center">
            <AlertTriangle className={`w-6 h-6 ${style.iconColor}`} />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold block">
              {threat.severity} RISK LEVEL
            </span>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {threat.name}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700">
            {threat.status}
          </span>
        </div>
      </div>

      {/* Section: AFFECTED APPLICATION / SOURCE ATTRIBUTION (Specification Section 12) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          AFFECTED APPLICATION / SOURCE
        </h4>

        {isSourceDetermined ? (
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800/80 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-bold text-white">
                  {threat.source.applicationName || threat.source.fileName || 'Inspected Package'}
                </h5>
                {threat.source.packageName && (
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">
                    {threat.source.packageName}
                  </p>
                )}
                {threat.source.fileName && (
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    File: {threat.source.fileName}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                {threat.source.versionName || 'Target App'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 block">Status</span>
                <span className="text-slate-200 font-medium">{threat.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Detected</span>
                <span className="text-slate-200 font-medium">{formattedDetectedAt}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Specification Section 12 mandatory fallback */
          <div className="rounded-xl bg-amber-950/20 border border-amber-700/40 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <h5 className="text-xs font-bold uppercase tracking-wide">
                Source could not be determined
              </h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard non-rooted Android sandbox isolation boundaries do not permit deterministic attribution of this telemetry activity to a single application process. ThreatGuard adheres strictly to verifiable technical evidence and avoids fabricating attribution claims.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Detected Location: <span className="text-slate-200">{threat.detectionLocation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section: DETECTION LOCATION & THREAT TYPE */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Detection Location</span>
          <span className="text-xs font-bold text-slate-200 mt-0.5 block">{threat.detectionLocation}</span>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Threat Type</span>
          <span className="text-xs font-bold text-cyan-400 mt-0.5 block">{threat.type}</span>
        </div>
      </div>

      {/* Section: WHY THIS WAS DETECTED (Specification Section 14) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
        <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
          WHY THIS WAS DETECTED
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {threat.explanation}
        </p>

        {/* Bulleted Evidence Indicators */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
            Key Identified Indicators:
          </span>
          <ul className="space-y-1 text-xs text-slate-300">
            {threat.evidence.map((ev) => (
              <li key={ev.id} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <strong className="text-slate-100 font-medium">{ev.evidenceType}:</strong>{' '}
                  <span className="font-mono text-cyan-300">{ev.evidenceValue}</span> — {ev.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section: CONFIDENCE & POTENTIAL IMPACT */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              DETECTION CONFIDENCE
            </h4>
            <button
              onClick={() => setShowConfidenceBreakdown(!showConfidenceBreakdown)}
              className="text-cyan-400 hover:text-cyan-300 text-[10px] underline"
            >
              {showConfidenceBreakdown ? 'Hide Math' : 'View Breakdown'}
            </button>
          </div>
          <span className="text-base font-bold font-mono text-white tabular-nums">
            {threat.confidence}%
          </span>
        </div>

        {/* Confidence Math Score Breakdown (Specification Section 21) */}
        {showConfidenceBreakdown && (
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2 text-xs font-mono text-slate-300 animate-fadeIn">
            <div className="flex justify-between">
              <span>Known Signature Match:</span>
              <span className="text-cyan-400">+{threat.confidenceBreakdown.signatureMatchScore} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Suspicious Permissions:</span>
              <span className="text-cyan-400">+{threat.confidenceBreakdown.suspiciousPermissionScore} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Behavioral Telemetry:</span>
              <span className="text-cyan-400">+{threat.confidenceBreakdown.suspiciousBehaviorScore} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Suspicious Network Indicator:</span>
              <span className="text-cyan-400">+{threat.confidenceBreakdown.suspiciousDomainScore} pts</span>
            </div>
            <div className="flex justify-between">
              <span>File Cryptographic Reputation:</span>
              <span className="text-cyan-400">+{threat.confidenceBreakdown.fileReputationScore} pts</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
              <span>Total Confidence Score:</span>
              <span className="text-emerald-400">{threat.confidenceBreakdown.totalScore} / 100 ({threat.confidenceBreakdown.confidenceGrade})</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 space-y-1">
          <h5 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            POTENTIAL IMPACT
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed">{threat.potentialImpact}</p>
        </div>
      </div>

      {/* Section: RECOMMENDED ACTIONS PREVIEW */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            RECOMMENDED ACTIONS
          </h4>
          <button
            onClick={() => onOpenRemediation(threat)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
          >
            <span>Interactive Checklist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ol className="space-y-1.5 text-xs text-slate-300">
          {threat.recommendedActions.map((act, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span>{act}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* System Settings Handoff Notice Popup */}
      {showHandoffGuidance && (
        <div className="rounded-2xl bg-cyan-950/40 border border-cyan-700/60 p-4 space-y-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Lock className="w-4 h-4" />
            <span>Android OS Security Hand-Off</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            {showHandoffGuidance}
          </p>
          <div className="pt-1 flex justify-end">
            <button
              onClick={() => setShowHandoffGuidance(null)}
              className="px-3 py-1 rounded-lg bg-cyan-600 text-white font-semibold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Action Capability Layer (Specification Section 16) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Action Capability Layer (OS Permitted)
          </span>
        </div>

        {/* Primary Action Buttons */}
        {isSourceDetermined && threat.detectionLocation === 'Installed Application' && !isResolved && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setShowHandoffGuidance(
                  `To revoke permissions safely: Open Android Settings > Apps > "${
                    threat.source.applicationName || threat.source.packageName
                  }" > Permissions, and disable SMS, Microphone, or Accessibility privileges.`
                )
              }
              className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>REVOKE PERMS</span>
            </button>

            <button
              onClick={() => onUninstallOrDelete(threat)}
              className="h-11 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>UNINSTALL APP</span>
            </button>
          </div>
        )}

        {threat.detectionLocation === 'Downloaded File' && !isResolved && (
          <button
            onClick={() => onUninstallOrDelete(threat)}
            className="w-full h-11 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>DELETE MALICIOUS FILE</span>
          </button>
        )}

        {/* Technical Details & Scan Again */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenTechnicalDetails(threat)}
            className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            <span>TECHNICAL DETAILS</span>
          </button>

          <button
            onClick={() => onRescanItem(threat)}
            className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>SCAN AGAIN</span>
          </button>
        </div>

        {/* Mark as Safe / False Positive Workflow (Section 26 & 27) */}
        {!isResolved && (
          <button
            onClick={() => onOpenFalsePositiveModal(threat)}
            className="w-full h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <span>Mark as Safe / Suspected False Positive</span>
          </button>
        )}
      </div>
    </div>
  );
};
