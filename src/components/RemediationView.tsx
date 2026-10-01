import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Sliders,
  ExternalLink,
  Lock,
  Flag,
} from 'lucide-react';
import { ThreatRecord } from '../types/threat';

interface RemediationViewProps {
  threat: ThreatRecord;
  onBack: () => void;
  onToggleStep: (threatId: string, stepId: string) => void;
  onUninstallOrDelete: (threat: ThreatRecord) => void;
  onRescan: (threat: ThreatRecord) => void;
  onOpenFalsePositiveModal: (threat: ThreatRecord) => void;
}

export const RemediationView: React.FC<RemediationViewProps> = ({
  threat,
  onBack,
  onToggleStep,
  onUninstallOrDelete,
  onRescan,
  onOpenFalsePositiveModal,
}) => {
  const completedStepsCount = threat.remediationSteps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round(
    (completedStepsCount / Math.max(1, threat.remediationSteps.length)) * 100
  );
  const isAllResolved = threat.status === 'RESOLVED' || threat.status === 'MARKED_SAFE';

  return (
    <div className="p-4 space-y-4 text-slate-100 animate-fadeIn pb-10">
      {/* Navigation Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Threat Details</span>
      </button>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Remediation Workflow</h3>
        <p className="text-xs text-slate-400">
          Track and execute permitted OS security remediation steps for {threat.name}.
        </p>
      </div>

      {/* Progress Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Remediation Progress
            </span>
            <span className="text-sm font-bold text-white">
              {completedStepsCount} of {threat.remediationSteps.length} Steps Completed
            </span>
          </div>
          <span
            className={`text-sm font-mono font-bold px-2.5 py-1 rounded-lg border ${
              isAllResolved
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}
          >
            {isAllResolved ? 'RESOLVED' : `${progressPercent}%`}
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAllResolved ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
            }`}
            style={{ width: `${isAllResolved ? 100 : progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step-by-Step Interactive Checklist */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase px-1">
          Action Checklist
        </h4>

        <div className="space-y-2">
          {threat.remediationSteps.map((step) => {
            return (
              <div
                key={step.id}
                onClick={() => onToggleStep(threat.id, step.id)}
                className={`rounded-2xl border p-3.5 space-y-2 transition-all cursor-pointer ${
                  step.isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5
                        className={`text-xs font-bold ${
                          step.isCompleted ? 'text-slate-200 line-through' : 'text-white'
                        }`}
                      >
                        {step.order}. {step.action}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {step.explanation}
                    </p>

                    {step.systemSettingsPath && !step.isCompleted && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                        <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{step.systemSettingsPath}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          {threat.source.determined && threat.detectionLocation === 'Installed Application' && (
            <button
              onClick={() => onUninstallOrDelete(threat)}
              className="h-11 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Uninstall App</span>
            </button>
          )}

          {threat.detectionLocation === 'Downloaded File' && (
            <button
              onClick={() => onUninstallOrDelete(threat)}
              className="h-11 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete File</span>
            </button>
          )}

          <button
            onClick={() => onRescan(threat)}
            className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Rescan Target</span>
          </button>
        </div>

        <button
          onClick={() => onOpenFalsePositiveModal(threat)}
          className="w-full h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Mark as False Positive / Safe</span>
        </button>
      </div>
    </div>
  );
};
