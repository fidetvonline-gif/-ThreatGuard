import React, { useEffect, useState } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { ScanSelectView } from './components/ScanSelectView';
import { ScanProgressView } from './components/ScanProgressView';
import { ScanResultSummaryView } from './components/ScanResultSummaryView';
import { ThreatListView } from './components/ThreatListView';
import { ThreatDetailView } from './components/ThreatDetailView';
import { TechnicalDetailsView } from './components/TechnicalDetailsView';
import { RemediationView } from './components/RemediationView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { ThreatIntelDatabaseView } from './components/ThreatIntelDatabaseView';
import { FalsePositiveModal } from './components/FalsePositiveModal';
import { ArchitectureInfoModal } from './components/ArchitectureInfoModal';

import {
  DetectionSignature,
  DeviceInfo,
  ScanRecord,
  ScanType,
  TelemetryTargetApp,
  ThreatRecord,
} from './types/threat';
import { ThreatGuardStore } from './services/threatStore';
import { runSecurityScan } from './services/detectionEngine';

export default function App() {
  const [isMobileView, setIsMobileView] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeScreen, setActiveScreen] = useState<
    | 'dashboard'
    | 'scan-select'
    | 'scanning'
    | 'scan-results'
    | 'threats'
    | 'threat-detail'
    | 'technical-detail'
    | 'remediation'
    | 'history'
    | 'intel'
  >('dashboard');

  // Loaded State
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(ThreatGuardStore.getDeviceInfo());
  const [threats, setThreats] = useState<ThreatRecord[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [signatures, setSignatures] = useState<DetectionSignature[]>([]);
  const [telemetryApps, setTelemetryApps] = useState<TelemetryTargetApp[]>([]);

  // Active Contexts
  const [selectedThreat, setSelectedThreat] = useState<ThreatRecord | null>(null);
  const [activeScanType, setActiveScanType] = useState<ScanType>('FULL_AVAILABLE');
  const [latestScanRecord, setLatestScanRecord] = useState<ScanRecord | null>(null);
  const [customScanFiles, setCustomScanFiles] = useState<
    { name: string; size: number; content: ArrayBuffer | string }[] | undefined
  >(undefined);

  // Modals
  const [falsePositiveThreat, setFalsePositiveThreat] = useState<ThreatRecord | null>(null);
  const [showArchModal, setShowArchModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and load data on mount
  useEffect(() => {
    async function init() {
      await ThreatGuardStore.initializeDefaults();
      refreshStateFromStore();
    }
    init();
  }, []);

  const refreshStateFromStore = () => {
    const dev = ThreatGuardStore.getDeviceInfo();
    const thr = ThreatGuardStore.getThreats();
    const scn = ThreatGuardStore.getScanHistory();
    const sig = ThreatGuardStore.getSignatures();
    const app = ThreatGuardStore.getTelemetryApps();

    setDeviceInfo(dev);
    setThreats(thr);
    setScanHistory(scn);
    setSignatures(sig);
    setTelemetryApps(app);

    if (selectedThreat) {
      const refreshedThreat = thr.find((t) => t.id === selectedThreat.id);
      if (refreshedThreat) setSelectedThreat(refreshedThreat);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Triggering Scans
  const handleStartScanSelect = () => {
    setActiveScreen('scan-select');
    setCurrentTab('scan-select');
  };

  const handleExecuteScan = (
    type: ScanType,
    files?: { name: string; size: number; content: ArrayBuffer | string }[]
  ) => {
    setActiveScanType(type);
    setCustomScanFiles(files);
    setActiveScreen('scanning');
  };

  const handleScanCompleted = async () => {
    const { scanRecord, detectedThreats } = await runSecurityScan(
      activeScanType,
      telemetryApps,
      signatures,
      customScanFiles
    );

    // Merge threats (prevent duplicates)
    const existing = ThreatGuardStore.getThreats();
    const existingIds = new Set(existing.map((t) => t.id));
    const mergedThreats = [...existing];

    for (const newT of detectedThreats) {
      if (!existingIds.has(newT.id)) {
        mergedThreats.unshift(newT);
      }
    }

    ThreatGuardStore.saveThreats(mergedThreats);

    // Save scan history
    const history = ThreatGuardStore.getScanHistory();
    const updatedHistory = [scanRecord, ...history];
    ThreatGuardStore.saveScanHistory(updatedHistory);

    // Update device timestamp
    const dev = ThreatGuardStore.getDeviceInfo();
    const updatedDev = {
      ...dev,
      lastScanAt: scanRecord.completedAt,
    };
    ThreatGuardStore.saveDeviceInfo(updatedDev);
    ThreatGuardStore.refreshDeviceOverallStatus();

    setLatestScanRecord(scanRecord);
    refreshStateFromStore();
    setActiveScreen('scan-results');
    showToast(`Scan complete: ${scanRecord.threatsFound} threats identified`);
  };

  // Navigation handlers
  const handleSelectThreat = (threat: ThreatRecord) => {
    setSelectedThreat(threat);
    setActiveScreen('threat-detail');
  };

  const handleOpenTechnicalDetails = (threat: ThreatRecord) => {
    setSelectedThreat(threat);
    setActiveScreen('technical-detail');
  };

  const handleOpenRemediation = (threat: ThreatRecord) => {
    setSelectedThreat(threat);
    setActiveScreen('remediation');
  };

  const handleToggleRemediationStep = (threatId: string, stepId: string) => {
    ThreatGuardStore.toggleRemediationStep(threatId, stepId);
    refreshStateFromStore();
    showToast('Remediation step updated');
  };

  const handleUninstallOrDelete = (threat: ThreatRecord) => {
    if (threat.source.packageName) {
      ThreatGuardStore.uninstallApp(threat.source.packageName);
      showToast(`Uninstalled application "${threat.source.applicationName || threat.source.packageName}"`);
    } else if (threat.source.fileName) {
      ThreatGuardStore.deleteFile(threat.source.fileName);
      showToast(`Deleted suspicious file "${threat.source.fileName}"`);
    } else {
      ThreatGuardStore.updateThreatStatus(threat.id, 'RESOLVED');
      showToast('Threat marked as resolved');
    }
    refreshStateFromStore();
    setActiveScreen('threats');
  };

  const handleRescanTarget = async (threat: ThreatRecord) => {
    showToast(`Rescanning telemetry for "${threat.name}"...`);
    setActiveScanType(threat.detectionLocation === 'Downloaded File' ? 'FILE' : 'APPLICATION');
    setActiveScreen('scanning');
  };

  const handleConfirmMarkSafe = (threatId: string, reason: string) => {
    ThreatGuardStore.updateThreatStatus(threatId, 'FALSE_POSITIVE', reason);
    refreshStateFromStore();
    showToast('Threat record updated: Marked as False Positive');
  };

  const handleResetData = async () => {
    await ThreatGuardStore.resetToSampleState();
    refreshStateFromStore();
    setActiveScreen('dashboard');
    setCurrentTab('dashboard');
    showToast('Reset to initial sample telemetry state');
  };

  const handleToggleSignature = (sigId: string) => {
    const sigs = ThreatGuardStore.getSignatures();
    const updated = sigs.map((s) => (s.id === sigId ? { ...s, isActive: !s.isActive } : s));
    ThreatGuardStore.saveSignatures(updated);
    refreshStateFromStore();
    showToast('Signature state updated');
  };

  const handleAddSimulatedApp = (app: TelemetryTargetApp) => {
    const apps = ThreatGuardStore.getTelemetryApps();
    ThreatGuardStore.saveTelemetryApps([app, ...apps]);
    refreshStateFromStore();
    showToast(`Deployed target package "${app.packageName}"`);
  };

  const handleRemoveSimulatedApp = (appId: string) => {
    const apps = ThreatGuardStore.getTelemetryApps().filter((a) => a.id !== appId);
    ThreatGuardStore.saveTelemetryApps(apps);
    refreshStateFromStore();
    showToast('Removed simulated target app');
  };

  const handleTabNavigation = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'dashboard') setActiveScreen('dashboard');
    else if (tab === 'scan-select') setActiveScreen('scan-select');
    else if (tab === 'threats') setActiveScreen('threats');
    else if (tab === 'history') setActiveScreen('history');
    else if (tab === 'intel') setActiveScreen('intel');
  };

  const getTopBarTitle = () => {
    switch (activeScreen) {
      case 'dashboard':
        return 'Device Security';
      case 'scan-select':
        return 'Security Scanner';
      case 'scanning':
        return 'Scanning Telemetry';
      case 'scan-results':
        return 'Scan Summary';
      case 'threats':
        return 'Threat Inventory';
      case 'threat-detail':
        return 'Threat Details';
      case 'technical-detail':
        return 'Technical Evidence';
      case 'remediation':
        return 'Remediation Workflow';
      case 'history':
        return 'Scan Logs';
      case 'intel':
        return 'Intel & Signatures';
      default:
        return 'ThreatGuard';
    }
  };

  const activeThreatCount = threats.filter(
    (t) => t.status === 'ACTIVE' || t.status === 'INVESTIGATING' || t.status === 'ACTION_REQUIRED'
  ).length;

  return (
    <AndroidFrame
      isMobileView={isMobileView}
      onToggleView={() => setIsMobileView(!isMobileView)}
      onOpenArchitectureInfo={() => setShowArchModal(true)}
      onResetData={handleResetData}
    >
      {/* Top Application Bar */}
      <TopAppBar
        title={getTopBarTitle()}
        subtitle={
          activeScreen === 'threat-detail' && selectedThreat?.source.determined
            ? selectedThreat.source.applicationName || selectedThreat.source.packageName
            : deviceInfo.deviceName
        }
        showBack={
          activeScreen === 'threat-detail' ||
          activeScreen === 'technical-detail' ||
          activeScreen === 'remediation' ||
          activeScreen === 'scan-results'
        }
        onBack={() => {
          if (activeScreen === 'technical-detail' || activeScreen === 'remediation') {
            setActiveScreen('threat-detail');
          } else if (activeScreen === 'threat-detail' || activeScreen === 'scan-results') {
            setActiveScreen('threats');
          } else {
            setActiveScreen('dashboard');
          }
        }}
        deviceInfo={deviceInfo}
        activeTab={currentTab}
        onNavigateTab={handleTabNavigation}
      />

      {/* Main Active View Renderer */}
      <div className="flex-1 overflow-y-auto">
        {activeScreen === 'dashboard' && (
          <DashboardView
            deviceInfo={deviceInfo}
            threats={threats}
            onStartScan={handleStartScanSelect}
            onSelectThreat={handleSelectThreat}
            onViewAllThreats={() => {
              setCurrentTab('threats');
              setActiveScreen('threats');
            }}
          />
        )}

        {activeScreen === 'scan-select' && (
          <ScanSelectView onExecuteScan={handleExecuteScan} />
        )}

        {activeScreen === 'scanning' && (
          <ScanProgressView
            scanType={activeScanType}
            onScanComplete={handleScanCompleted}
          />
        )}

        {activeScreen === 'scan-results' && latestScanRecord && (
          <ScanResultSummaryView
            scanRecord={latestScanRecord}
            threats={threats}
            onViewThreats={() => {
              setCurrentTab('threats');
              setActiveScreen('threats');
            }}
            onGoToDashboard={() => {
              setCurrentTab('dashboard');
              setActiveScreen('dashboard');
            }}
            onRescan={handleStartScanSelect}
          />
        )}

        {activeScreen === 'threats' && (
          <ThreatListView
            threats={threats}
            onSelectThreat={handleSelectThreat}
            onStartNewScan={handleStartScanSelect}
          />
        )}

        {activeScreen === 'threat-detail' && selectedThreat && (
          <ThreatDetailView
            threat={selectedThreat}
            onBack={() => {
              setCurrentTab('threats');
              setActiveScreen('threats');
            }}
            onOpenTechnicalDetails={handleOpenTechnicalDetails}
            onOpenRemediation={handleOpenRemediation}
            onOpenFalsePositiveModal={(threat) => setFalsePositiveThreat(threat)}
            onUninstallOrDelete={handleUninstallOrDelete}
            onRescanItem={handleRescanTarget}
          />
        )}

        {activeScreen === 'technical-detail' && selectedThreat && (
          <TechnicalDetailsView
            threat={selectedThreat}
            onBack={() => setActiveScreen('threat-detail')}
          />
        )}

        {activeScreen === 'remediation' && selectedThreat && (
          <RemediationView
            threat={selectedThreat}
            onBack={() => setActiveScreen('threat-detail')}
            onToggleStep={handleToggleRemediationStep}
            onUninstallOrDelete={handleUninstallOrDelete}
            onRescan={handleRescanTarget}
            onOpenFalsePositiveModal={(threat) => setFalsePositiveThreat(threat)}
          />
        )}

        {activeScreen === 'history' && (
          <ScanHistoryView
            scanHistory={scanHistory}
            allThreats={threats}
            onSelectThreat={handleSelectThreat}
            onStartNewScan={handleStartScanSelect}
          />
        )}

        {activeScreen === 'intel' && (
          <ThreatIntelDatabaseView
            signatures={signatures}
            onToggleSignature={handleToggleSignature}
            telemetryApps={telemetryApps}
            onAddSimulatedApp={handleAddSimulatedApp}
            onRemoveSimulatedApp={handleRemoveSimulatedApp}
          />
        )}
      </div>

      {/* Android Bottom Navigation Bar */}
      {activeScreen !== 'scanning' && (
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={handleTabNavigation}
          activeThreatCount={activeThreatCount}
        />
      )}

      {/* Modals */}
      {falsePositiveThreat && (
        <FalsePositiveModal
          threat={falsePositiveThreat}
          onClose={() => setFalsePositiveThreat(null)}
          onConfirmMarkSafe={handleConfirmMarkSafe}
        />
      )}

      {showArchModal && (
        <ArchitectureInfoModal onClose={() => setShowArchModal(false)} />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </AndroidFrame>
  );
}
