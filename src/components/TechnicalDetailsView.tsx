import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Code2,
  Terminal,
  Fingerprint,
  Layers,
  FileCode,
  Network,
  Shield,
  Key,
  Globe,
} from 'lucide-react';
import { ThreatRecord } from '../types/threat';

interface TechnicalDetailsViewProps {
  threat: ThreatRecord;
  onBack: () => void;
}

export const TechnicalDetailsView: React.FC<TechnicalDetailsViewProps> = ({
  threat,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'FIELDS' | 'JSON'>('FIELDS');

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(threat, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 text-slate-100 animate-fadeIn pb-10">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Threat Overview</span>
        </button>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('FIELDS')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'FIELDS'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Structured
          </button>
          <button
            onClick={() => setActiveTab('JSON')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'JSON'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Technical Evidence &amp; Audit Record</h3>
        <p className="text-xs text-slate-400">
          Forensic telemetry metadata, cryptographic digests, and rule evaluations.
        </p>
      </div>

      {activeTab === 'FIELDS' ? (
        <div className="space-y-3.5">
          {/* Core Telemetry Metadata Grid (Specification Section 15) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-xs">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              DETECTION TELEMETRY ATTRIBUTES
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Threat ID</span>
                <span className="font-bold text-cyan-400 break-all">{threat.id}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Detection ID</span>
                <span className="font-bold text-slate-200">{threat.detectionId}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Threat Type</span>
                <span className="font-bold text-slate-200">{threat.type}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Severity</span>
                <span className="font-bold text-orange-400">{threat.severity}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Confidence</span>
                <span className="font-bold text-emerald-400">{threat.confidence}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Lifecycle Status</span>
                <span className="font-bold text-slate-200">{threat.status}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-2">
                <span className="text-[10px] text-slate-500 block">Detection Method</span>
                <span className="font-bold text-slate-200">{threat.detectionMethod}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-2">
                <span className="text-[10px] text-slate-500 block">Scanner Environment</span>
                <span className="font-bold text-slate-200">{threat.scannerVersion}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-2">
                <span className="text-[10px] text-slate-500 block">Detection Timestamp</span>
                <span className="text-slate-300 font-sans">{new Date(threat.detectedAt).toISOString()}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Hashes & Binary Package Identification */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              IDENTIFICATION &amp; HASHES
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block">Application / Package</span>
                <div className="text-slate-200 font-medium">
                  {threat.source.determined ? (
                    `${threat.source.applicationName || 'App'} (${threat.source.packageName || 'N/A'})`
                  ) : (
                    <span className="text-amber-400 italic">Source could not be determined</span>
                  )}
                </div>
              </div>

              {threat.source.fileName && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block">Container Binary File</span>
                  <div className="font-mono text-cyan-400 text-[11px]">{threat.source.fileName}</div>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block">SHA-256 Digest</span>
                <div className="font-mono text-[11px] text-cyan-300 break-all bg-slate-900/90 p-2 rounded border border-slate-800">
                  {threat.source.sha256 || '7c4a8d09ca3762af61e59520943dc2644265bb6d07e60d9d863f683bc430e321'}
                </div>
              </div>

              {threat.signatureId && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block">Matched Detection Signature</span>
                  <div className="font-mono text-amber-400 font-bold text-[11px]">{threat.signatureId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Permissions Audit */}
          {threat.permissions.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                SENSITIVE RUNTIME PERMISSIONS
              </h4>

              <div className="space-y-2">
                {threat.permissions.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 text-[11px]">
                        {p.permissionName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {p.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Network Indicators */}
          {threat.networkIndicators.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                NETWORK &amp; C2 INDICATORS
              </h4>

              <div className="space-y-2">
                {threat.networkIndicators.map((net) => (
                  <div
                    key={net.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-300 text-[11px]">
                        {net.domain || net.ipAddress}
                        {net.detectedPort ? `:${net.detectedPort}` : ''}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                        {net.reputation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{net.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Raw JSON Inspector */
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Threat Record JSON (Schema v1.0)
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-[480px] custom-scrollbar">
            {JSON.stringify(threat, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
