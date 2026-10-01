import React, { useState, useEffect } from 'react';
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
  Server,
  Code2,
  Copy,
  Check,
  Zap,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { DetectionSignature, TelemetryTargetApp } from '../types/threat';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  SUPABASE_SCHEMA_SQL,
  SupabaseConfig,
} from '../services/supabaseClient';
import { SupabaseService } from '../services/supabaseService';

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
  const [activeSubTab, setActiveSubTab] = useState<'SIGNATURES' | 'APPS' | 'SUPABASE' | 'DEVICE'>('SUPABASE');
  const [showAddAppModal, setShowAddAppModal] = useState(false);

  // Supabase connection state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(supabaseConfig.url);
  const [inputKey, setInputKey] = useState(supabaseConfig.anonKey);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // New simulated app form state
  const [newAppName, setNewAppName] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newCategory, setNewCategory] = useState('Utility & Tools');
  const [newPermissions, setNewPermissions] = useState<string[]>([
    'android.permission.INTERNET',
    'android.permission.READ_SMS',
  ]);

  useEffect(() => {
    // Auto test connection if config exists
    if (supabaseConfig.url && supabaseConfig.anonKey) {
      SupabaseService.testConnection().then((res) => {
        setTestResult(res);
        setSupabaseConfig(getStoredSupabaseConfig());
      });
    }
  }, []);

  const handleSaveAndTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: SupabaseConfig = {
      url: inputUrl.trim(),
      anonKey: inputKey.trim(),
      isConnected: false,
    };
    saveStoredSupabaseConfig(newConfig);
    setSupabaseConfig(newConfig);

    setTestingConnection(true);
    setTestResult(null);

    const res = await SupabaseService.testConnection();
    setTestResult(res);
    setSupabaseConfig(getStoredSupabaseConfig());
    setTestingConnection(false);
  };

  const handleSyncDataToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await SupabaseService.syncAllLocalToSupabase();
    setSyncResult(res.message);
    setSyncing(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

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
        <h3 className="text-base font-bold text-white tracking-tight">Security Intel &amp; Cloud Database</h3>
        <p className="text-xs text-slate-400">
          Supabase cloud persistence, detection signatures, and telemetry target management.
        </p>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('SUPABASE')}
          className={`px-3 py-1.5 rounded-lg text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeSubTab === 'SUPABASE'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Supabase Service</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SIGNATURES')}
          className={`px-3 py-1.5 rounded-lg text-center font-medium whitespace-nowrap transition-colors ${
            activeSubTab === 'SIGNATURES'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Signatures ({signatures.length})
        </button>

        <button
          onClick={() => setActiveSubTab('APPS')}
          className={`px-3 py-1.5 rounded-lg text-center font-medium whitespace-nowrap transition-colors ${
            activeSubTab === 'APPS'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Telemetry Apps ({telemetryApps.length})
        </button>

        <button
          onClick={() => setActiveSubTab('DEVICE')}
          className={`px-3 py-1.5 rounded-lg text-center font-medium whitespace-nowrap transition-colors ${
            activeSubTab === 'DEVICE'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Device Bounds
        </button>
      </div>

      {/* View: SUPABASE SERVICE CONFIGURATION */}
      {activeSubTab === 'SUPABASE' && (
        <div className="space-y-4">
          {/* Connection Status Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Supabase Cloud Provider</h4>
                  <p className="text-[11px] text-slate-400">PostgreSQL Cloud Database &amp; Realtime Sync</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                  supabaseConfig.isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    supabaseConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {supabaseConfig.isConnected ? 'CONNECTED' : 'STANDBY / LOCAL CACHE'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ThreatGuard uses the <strong>@supabase/supabase-js</strong> client to persist devices, scan records, threat classifications, forensic evidence digests, and false-positive reports.
            </p>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <form
            onSubmit={handleSaveAndTestSupabase}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                Connection Credentials
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Environment: .env.example
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium block text-[11px]">
                Supabase Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium block text-[11px]">
                Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={testingConnection}
                className="flex-1 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    <span>Save &amp; Test Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSyncDataToSupabase}
                disabled={syncing || !supabaseConfig.isConnected}
                className="px-4 h-10 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer disabled:opacity-40"
              >
                {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Sync Now</span>
              </button>
            </div>

            {syncResult && (
              <p className="text-[11px] text-emerald-400 font-mono pt-1">{syncResult}</p>
            )}
          </form>

          {/* Database Schema DDL (Section 18) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">PostgreSQL Schema DDL (Supabase SQL Editor)</h4>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL' : 'Copy DDL'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Copy this SQL schema into your Supabase project's SQL Editor to instantiate the 7 relational tables (<code className="text-cyan-300">devices</code>, <code className="text-cyan-300">scans</code>, <code className="text-cyan-300">threats</code>, <code className="text-cyan-300">threat_evidence</code>, <code className="text-cyan-300">indicators</code>, <code className="text-cyan-300">threat_actions</code>, <code className="text-cyan-300">telemetry_apps</code>).
            </p>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 custom-scrollbar">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>
      )}

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
                    className="text-slate-400 hover:text-white cursor-pointer"
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
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-[11px] font-bold text-white flex items-center gap-1 shadow cursor-pointer"
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
                      className="p-1 rounded-lg hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
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
                  className="flex-1 h-9 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
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
