import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Cpu,
  Layers,
  FileSearch,
  Fingerprint,
  FileCheck2,
  ShieldAlert,
  Shield,
  Radio,
} from 'lucide-react';
import { ScanType } from '../types/threat';

interface ScanProgressViewProps {
  scanType: ScanType;
  onScanComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  category: string;
}

const PIPELINE_STEPS: StepItem[] = [
  { id: 1, label: 'Initialize Scanner Environment', category: 'Core' },
  { id: 2, label: 'Collect Permitted OS Telemetry', category: 'Telemetry' },
  { id: 3, label: 'Analyze Installed Application Packages', category: 'Apps' },
  { id: 4, label: 'Inspect Sensitive Runtime Permissions', category: 'Permissions' },
  { id: 5, label: 'Analyze Accessible Storage & Calculate Hashes', category: 'Files' },
  { id: 6, label: 'Match Cryptographic Detection Signatures', category: 'Signatures' },
  { id: 7, label: 'Evaluate Heuristic Permission Rules', category: 'Heuristics' },
  { id: 8, label: 'Evaluate Network & Domain Indicators', category: 'Indicators' },
  { id: 9, label: 'Determine Source Attribution (Strict Hierarchy)', category: 'Attribution' },
  { id: 10, label: 'Classify Threat Category & Potential Impact', category: 'Classification' },
  { id: 11, label: 'Compute Severity & Confidence Scores', category: 'Scoring' },
  { id: 12, label: 'Generate Audit Evidence & Remediation Plan', category: 'Output' },
];

export const ScanProgressView: React.FC<ScanProgressViewProps> = ({
  scanType,
  onScanComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(5);
  const [itemsCount, setItemsCount] = useState(12);

  useEffect(() => {
    const totalDuration = scanType === 'QUICK' ? 2200 : scanType === 'APPLICATION' ? 3600 : scanType === 'FILE' ? 3000 : 4800;
    const intervalTime = totalDuration / PIPELINE_STEPS.length;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= PIPELINE_STEPS.length) {
          clearInterval(interval);
          setTimeout(() => {
            onScanComplete();
          }, 400);
          return PIPELINE_STEPS.length - 1;
        }
        return next;
      });

      setProgressPercent((prev) => Math.min(98, prev + Math.floor(100 / PIPELINE_STEPS.length)));
      setItemsCount((prev) => prev + Math.floor(15 + Math.random() * 25));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [scanType, onScanComplete]);

  return (
    <div className="p-4 space-y-5 text-slate-100 animate-fadeIn">
      {/* Scanning Radar Visual */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 text-center space-y-4 relative overflow-hidden">
        {/* Animated Sonar Rings */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white z-10">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-bold text-white font-mono tracking-tight">
              Scanning Device Telemetry
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {progressPercent}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Executing 12-stage security analysis pipeline...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live Counters */}
        <div className="flex items-center justify-around pt-2 text-xs font-mono text-slate-400 border-t border-slate-800/60">
          <div>
            <span className="text-[10px] text-slate-500 block">Stage</span>
            <span className="text-slate-200 font-bold">{currentStepIndex + 1} / 12</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Telemetry Items</span>
            <span className="text-cyan-400 font-bold tabular-nums">{itemsCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Mode</span>
            <span className="text-emerald-400 font-bold">{scanType.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Live Pipeline Step Stream */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase px-1">
          Pipeline Execution Stream
        </h4>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto custom-scrollbar">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`py-2.5 px-2 flex items-center justify-between text-xs transition-colors ${
                  isCurrent
                    ? 'bg-cyan-950/20 text-cyan-300 font-medium'
                    : isCompleted
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className="truncate">{step.label}</span>
                </div>

                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0 ml-2">
                  {step.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
