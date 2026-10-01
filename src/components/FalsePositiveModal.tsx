import React, { useState } from 'react';
import { Flag, X, Check, ShieldCheck, AlertCircle, Send } from 'lucide-react';
import { ThreatRecord } from '../types/threat';

interface FalsePositiveModalProps {
  threat: ThreatRecord;
  onClose: () => void;
  onConfirmMarkSafe: (threatId: string, reason: string) => void;
}

export const FalsePositiveModal: React.FC<FalsePositiveModalProps> = ({
  threat,
  onClose,
  onConfirmMarkSafe,
}) => {
  const [reason, setReason] = useState('Verified internal utility from trusted organization.');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmMarkSafe(threat.id, reason);
    setReportSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Report &amp; Mark as False Positive
              </h3>
              <p className="text-[11px] text-slate-400">Section 26 &amp; 27 ThreatGuard Workflow</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {reportSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Detection Marked as Safe</h4>
            <p className="text-xs text-slate-300">
              Threat status updated to FALSE_POSITIVE and report submitted to local database.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Threat ID:</span>
                <span className="text-slate-200 font-bold">{threat.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Source:</span>
                <span className="text-cyan-400 truncate max-w-[200px]">
                  {threat.source.determined
                    ? threat.source.applicationName || threat.source.packageName
                    : 'Source could not be determined'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Detection:</span>
                <span className="text-slate-200">{threat.name}</span>
              </div>
              {threat.signatureId && (
                <div className="flex justify-between text-slate-400">
                  <span>Signature:</span>
                  <span className="text-amber-400">{threat.signatureId}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Reason for Reporting False Positive:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="Explain why this detection is considered a trusted false positive..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2 text-[11px] text-amber-300/90">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                This will transition the threat status to <strong>FALSE POSITIVE</strong> and exclude it from active risk scoring until next signature revision.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950/40 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit &amp; Mark Safe</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
