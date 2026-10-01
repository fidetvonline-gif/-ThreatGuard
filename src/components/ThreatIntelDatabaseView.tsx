import React, { useState } from 'react';
import {
  Database,
  ShieldAlert,
  Plus,
  Layers,
  Key,
  Globe,
  Fingerprint,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  PlusCircle,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { DetectionSignature, TelemetryTargetApp } from '../types/threat';

interface ThreatIntelDatabaseViewProps {
  signatures: DetectionSignature[];
  onToggleSignature: (sigId: string) => void;
  telemetryApps: TelemetryTargetApp[];
  onAddSimulatedApp: (app: TelemetryTargetApp) => void;
  onRemoveSimulatedApp: (appId: string) => void;
}

export const ThreatIntelDatabaseView: React.FC<ThreatIntelDatabaseViewProps> = ({
  signatures,
  onToggleSignature,
  telemetryApps,
  onAddSimulatedApp,
  onRemoveSimulatedApp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'SIGNATURES' | 'APPS' | 'DEVICE'>('SIGNATURES');
  const [showAddAppModal, setShowAddAppModal] = useState(false);

  // New simulated app form state
  const [newAppName, setNewAppName] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newCategory, setNewCategory] = useState('Utility & Tools');
  const [newPermissions, setNewPermissions] = useState<string[]>([
    'android.permission.INTERNET',
    'android.permission.READ_SMS',
  ]);

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newPackageName) return;

    const newApp: TelemetryTargetApp = {
      id: `app-custom-${Date.now()}`,
      name: newAppName,
      packageName: newPackageName,
      version: '1.0.0',
      iconBg: 'bg-purple-600',
      category: newCategory,
      requestedPermissions: newPermissions,
      isSystemApp: false,
      installedAt: new Date().toISOString(),
      behaviorFlags: ['Simulated custom telemetry deployment'],
    };

    onAddSimulatedApp(newApp);
    setShowAddAppModal(false);
    setNewAppName('');
    setNewPackageName('');
  };

  return (
    <div className="p-4 space-y-4 text-slate-100 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Security Intel &amp; Telemetry DB</h3>
        <p className="text-xs text-slate-400">
          Detection signatures, heuristic rules, and simulated installed telemetry targets.
        </p>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('SIGNATURES')}
          className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors ${
            activeSubTab === 'SIGNATURES'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Signatures ({signatures.length})
        </button>
        <button
          onClick={() => setActiveSubTab('APPS')}
          className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors ${
            activeSubTab === 'APPS'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Telemetry Apps ({telemetryApps.length})
        </button>
        <button
          onClick={() => setActiveSubTab('DEVICE')}
          className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors ${
            activeSubTab === 'DEVICE'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Device Bounds
        </button>
      </div>

      {/* View: SIGNATURES */}
      {activeSubTab === 'SIGNATURES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              Active Heuristic &amp; Hash Rules
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {signatures.filter((s) => s.isActive).length} Enabled
            </span>
          </div>

          <div className="space-y-2.5">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className={`rounded-2xl border p-3.5 space-y-2 transition-all ${
                  sig.isActive
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {sig.code}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {sig.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{sig.name}</h4>
                  </div>

                  <button
                    onClick={() => onToggleSignature(sig.id)}
                    className="text-slate-400 hover:text-white"
                    title={sig.isActive ? 'Disable rule' : 'Enable rule'}
                  >
                    {sig.isActive ? (
                      <ToggleRight className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{sig.description}</p>

                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-cyan-300/90 break-all">
                  Rule Criteria: {sig.ruleCriteria}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: TELEMETRY APPS */}
      {activeSubTab === 'APPS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              Installed Packages on Device
            </span>
            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-[11px] font-bold text-white flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Target App</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {telemetryApps.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${app.iconBg}`}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                      <p className="text-[11px] font-mono text-cyan-400 truncate">{app.packageName}</p>
                    </div>
                  </div>

                  {!app.isSystemApp && (
                    <button
                      onClick={() => onRemoveSimulatedApp(app.id)}
                      className="p-1 rounded-lg hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                      title="Uninstall from simulated telemetry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="text-slate-200">{app.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requested Privileges:</span>
                    <span className="font-mono text-slate-300">
                      {app.requestedPermissions.length} permissions
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {app.requestedPermissions.map((p) => (
                    <span
                      key={p}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {p.replace('android.permission.', '')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: DEVICE & OS ISOLATION BOUNDARIES */}
      {activeSubTab === 'DEVICE' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Smartphone className="w-4 h-4" />
            <span>Android MVP Technical Scope &amp; Constraints</span>
          </div>

          <p className="text-slate-300">
            ThreatGuard operates within legal and permitted Android platform limits.
          </p>

          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
            <h5 className="font-bold text-emerald-400 uppercase text-[10px] font-mono">
              ✓ Supported Non-Root Telemetry:
            </h5>
            <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
              <li>Package manager installed applications list</li>
              <li>Requested and granted runtime permissions analysis</li>
              <li>Heuristic dangerous permission combination matching</li>
              <li>Accessible storage binary file inspection and SHA-256 calculation</li>
              <li>Package installer intent invocation for uninstallation handoff</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
            <h5 className="font-bold text-amber-400 uppercase text-[10px] font-mono">
              ✕ Explicitly Out of Scope (Section 5):
            </h5>
            <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px]">
              <li>Reading private sandbox data of other applications</li>
              <li>Kernel-level packet inspection or encrypted intercept</li>
              <li>Silent background deletion without user prompt</li>
              <li>Fabricating application attribution when telemetry is uncorrelated</li>
            </ul>
          </div>
        </div>
      )}

      {/* Add Simulated App Modal */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Add Simulated Target Application</h3>

            <form onSubmit={handleCreateApp} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stealth Vault Pro"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. com.stealth.vault"
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option>Utility &amp; Tools</option>
                  <option>Finance / Security</option>
                  <option>Communication</option>
                  <option>Entertainment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Requested Permissions</label>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {[
                    'android.permission.READ_SMS',
                    'android.permission.RECORD_AUDIO',
                    'android.permission.BIND_ACCESSIBILITY_SERVICE',
                    'android.permission.SYSTEM_ALERT_WINDOW',
                    'android.permission.REQUEST_INSTALL_PACKAGES',
                    'android.permission.ACCESS_FINE_LOCATION',
                    'android.permission.INTERNET',
                  ].map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) setNewPermissions([...newPermissions, perm]);
                          else setNewPermissions(newPermissions.filter((p) => p !== perm));
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span className="font-mono text-[10px]">{perm.replace('android.permission.', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="flex-1 h-9 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Deploy Target App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
