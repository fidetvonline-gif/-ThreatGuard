import React, { useState } from 'react';
import {
  Zap,
  Layers,
  FileSearch,
  ShieldCheck,
  Upload,
  FileCode,
  CheckCircle,
  AlertCircle,
  Hash,
  FileCheck2,
  Play,
} from 'lucide-react';
import { ScanType } from '../types/threat';
import { computeSha256 } from '../services/detectionEngine';

interface ScanSelectViewProps {
  onExecuteScan: (
    scanType: ScanType,
    customFiles?: { name: string; size: number; content: ArrayBuffer | string }[]
  ) => void;
}

export const ScanSelectView: React.FC<ScanSelectViewProps> = ({ onExecuteScan }) => {
  const [selectedScanType, setSelectedScanType] = useState<ScanType>('FULL_AVAILABLE');
  const [customFile, setCustomFile] = useState<{
    name: string;
    size: number;
    sha256: string;
    content: ArrayBuffer;
  } | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const scanOptions = [
    {
      id: 'QUICK' as ScanType,
      title: 'QUICK SCAN',
      description: 'Checks high-value accessible telemetry, top active permissions, and recent package drops.',
      durationEst: '~2 seconds',
      icon: Zap,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      id: 'APPLICATION' as ScanType,
      title: 'APPLICATION SCAN',
      description: 'Analyzes all accessible installed package metadata, manifest declarations, and permission combos.',
      durationEst: '~4 seconds',
      icon: Layers,
      accent: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'FILE' as ScanType,
      title: 'FILE SCAN',
      description: 'Calculates authentic SHA-256 hashes and matches against known threat intelligence indicators.',
      durationEst: '~3 seconds',
      icon: FileSearch,
      accent: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'FULL_AVAILABLE' as ScanType,
      title: 'FULL AVAILABLE SCAN',
      description: 'Exhaustive inspection of all OS-permitted telemetry: applications, storage, permissions, and network indicators.',
      durationEst: '~6 seconds',
      icon: ShieldCheck,
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHashing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeSha256(arrayBuffer);
      setCustomFile({
        name: file.name,
        size: file.size,
        sha256: hash,
        content: arrayBuffer,
      });
      setSelectedScanType('FILE');
    } catch (err) {
      console.error('Failed to hash file', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleLoadSampleMaliciousApk = async () => {
    setIsHashing(true);
    const sampleContent = 'MALICIOUS_SPYWARE_SAMPLE_SIGNATURE_SIG-ANDROID-00284_BANKING_OVERLAY';
    const hash = await computeSha256(sampleContent);
    setCustomFile({
      name: 'suspicious-banking-update.apk',
      size: 4200000,
      sha256: hash,
      content: new TextEncoder().encode(sampleContent).buffer,
    });
    setSelectedScanType('FILE');
    setIsHashing(false);
  };

  const handleStartScan = () => {
    if (selectedScanType === 'FILE' && customFile) {
      onExecuteScan('FILE', [customFile]);
    } else {
      onExecuteScan(selectedScanType);
    }
  };

  return (
    <div className="p-4 space-y-4 text-slate-100 animate-fadeIn">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Choose Scan Type</h3>
        <p className="text-xs text-slate-400">
          Select a permitted inspection routine according to Android OS sandbox capabilities.
        </p>
      </div>

      {/* Scan Type Selector Cards */}
      <div className="space-y-2.5">
        {scanOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedScanType === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => setSelectedScanType(opt.id)}
              className={`rounded-2xl border p-3.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${opt.accent} text-white shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-mono tracking-wide text-white">
                      {opt.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{opt.durationEst}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Hashing & Sideload APK Scanner Box */}
      {(selectedScanType === 'FILE' || customFile) && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200">Inspect Custom File / Downloaded APK</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">WebCrypto SHA-256</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Upload any file from your device to compute its authentic SHA-256 hash and evaluate against threat signatures.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex-1 h-10 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer px-3">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">Select Local File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleLoadSampleMaliciousApk}
              className="px-3 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 border border-amber-500/20 whitespace-nowrap transition-colors"
            >
              Load Sample APK
            </button>
          </div>

          {isHashing && (
            <p className="text-xs text-cyan-400 animate-pulse flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 animate-spin" /> Computing SHA-256 cryptographic digest...
            </p>
          )}

          {customFile && !isHashing && (
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-semibold truncate">{customFile.name}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {(customFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="font-mono text-[10px] text-cyan-400/90 break-all bg-slate-900 p-1.5 rounded border border-slate-800">
                SHA-256: {customFile.sha256}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Start Button */}
      <button
        onClick={handleStartScan}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/40 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>START {selectedScanType.replace('_', ' ')}</span>
      </button>
    </div>
  );
};
