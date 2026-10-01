import React from 'react';
import { Shield, X, CheckCircle2, AlertTriangle, Lock, Cpu, Server, Terminal } from 'lucide-react';

interface ArchitectureInfoModalProps {
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<ArchitectureInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                ThreatGuard System Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Android Sandbox &amp; Verifiable Telemetry Security Model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 33: Critical MVP Design Rule */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-cyan-500/30 space-y-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-bold block">
            Critical Design Law: Verifiable Evidence Chain
          </span>
          <div className="flex items-center justify-around text-center py-2 font-mono text-xs text-slate-200">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 block font-bold">1. CLAIM</span>
              <span className="text-[10px] text-slate-400">Classified Threat</span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 block font-bold">2. EVIDENCE</span>
              <span className="text-[10px] text-slate-400">Hashes / Perms</span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 block font-bold">3. METHOD</span>
              <span className="text-[10px] text-slate-400">Heuristics / Sig</span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-purple-400 block font-bold">4. CONFIDENCE</span>
              <span className="text-[10px] text-slate-400">Transparent %</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The application guarantees that every security alert is backed by concrete evidence rather than vague "Threat Detected" alerts or fabricated attribution.
          </p>
        </div>

        {/* Pipeline Architecture Diagram (Section 6 & 9) */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-mono text-slate-400 uppercase text-[11px] font-bold">
            10-Stage Telemetry Engine Pipeline
          </h4>

          <div className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
            [Android Device] → [Telemetry Collection Layer] → [Normalization Layer] → [Detection
            Engine (Signatures + Hash + Permissions)] → [Attribution Engine] → [Threat Classifier] →
            [Risk &amp; Confidence Engine] → [Evidence Collector] → [Grounded Explanation] → [Action
            Capability Layer (OS Permitted)]
          </div>
        </div>

        {/* Source Attribution Rule (Section 12) */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-mono text-amber-400 uppercase text-[11px] font-bold">
            Strict Source Attribution Hierarchy (Section 12)
          </h4>
          <p className="text-slate-300 leading-relaxed">
            If anomalous telemetry (such as background C2 socket connections) is detected without package correlation, ThreatGuard renders{' '}
            <strong className="text-amber-300">"Source could not be determined"</strong> instead of inventing an application name.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer"
          >
            Close Architecture Guide
          </button>
        </div>
      </div>
    </div>
  );
};
