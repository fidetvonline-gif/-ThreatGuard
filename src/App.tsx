import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from './components/AppLayout';
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

const AUTO_SCAN_INTERVAL_SECONDS = 45;

export default function App() {
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
  >('scanning'); // Starts directly scanning on startup!

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

  // Auto-Scan State & Timer
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [autoScanCountdown, setAutoScanCountdown] = useState(AUTO_SCAN_INTERVAL_SECONDS);
  const isInitialScanDone = useRef(false);

  // Modals & Toast
  const [falsePositiveThreat, setFalsePositiveThreat] = useState<ThreatRecord | null>(null);
  const [showArchModal, setShowArchModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      await ThreatGuardStore.initializeDefaults();
      refreshStateFromStore();
    }
    init();
  }, []);

  // Periodic Auto-Scan Countdown Timer
  useEffect(() => {
    if (!autoScanEnabled || activeScreen === 'scanning') return;

    const timer = setInterval(() => {
      setAutoScanCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automatic periodic scan in background/live
          triggerAutomaticScan();
          return AUTO_SCAN_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoScanEnabled, activeScreen, telemetryApps, signatures]);

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

  // Trigger automatic scan (silent or live)
  const triggerAutomaticScan = async (showPipeline: boolean = false) => {
    const currentApps = ThreatGuardStore.getTelemetryApps();
    const currentSigs = ThreatGuardStore.getSignatures();

    if (showPipeline) {
      setActiveScanType('FULL_AVAILABLE');
      setActiveScreen('scanning');
      return;
    }

    try {
      const { scanRecord, detectedThreats } = await runSecurityScan(
        'FULL_AVAILABLE',
        currentApps,
        currentSigs
      );

      ThreatGuardStore.saveThreats(detectedThreats);

      const history = ThreatGuardStore.getScanHistory();
      ThreatGuardStore.saveScanHistory([scanRecord, ...history]);

      const dev = ThreatGuardStore.getDeviceInfo();
      const updatedDev = {
        ...dev,
        lastScanAt: scanRecord.completedAt,
      };
      ThreatGuardStore.saveDeviceInfo(updatedDev);
      ThreatGuardStore.refreshDeviceOverallStatus();

      setLatestScanRecord(scanRecord);
      refreshStateFromStore();
      showToast(`Auto-Scan updated: ${scanRecord.threatsFound} threats active`);
    } catch (err) {
      console.warn('Auto-scan error:', err);
    }
  };

  // Triggering Manual Scans
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

    // Save threats
    ThreatGuardStore.saveThreats(detectedThreats);

    // Save scan history
    const history = ThreatGuardStore.getScanHistory();
    ThreatGuardStore.saveScanHistory([scanRecord, ...history]);

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
    setAutoScanCountdown(AUTO_SCAN_INTERVAL_SECONDS);

    // If initial startup scan, transition cleanly to dashboard
    if (!isInitialScanDone.current) {
      isInitialScanDone.current = true;
      setActiveScreen('dashboard');
      setCurrentTab('dashboard');
      showToast(`Automatic startup scan completed: ${scanRecord.threatsFound} threats found`);
    } else {
      setActiveScreen('scan-results');
      showToast(`Scan complete: ${scanRecord.threatsFound} threats identified`);
    }
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
    // Auto-rescan immediately to verify remediation!
    triggerAutomaticScan(false);
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
    triggerAutomaticScan(false);
    showToast('Threat record updated: Marked as False Positive');
  };

  const handleResetData = async () => {
    await ThreatGuardStore.resetToSampleState();
    refreshStateFromStore();
    setActiveScreen('scanning'); // Auto-scans on reset!
    setCurrentTab('dashboard');
    showToast('Resetting telemetry and executing automatic scan...');
  };

  const handleToggleSignature = (sigId: string) => {
    const sigs = ThreatGuardStore.getSignatures();
    const updated = sigs.map((s) => (s.id === sigId ? { ...s, isActive: !s.isActive } : s));
    ThreatGuardStore.saveSignatures(updated);
    refreshStateFromStore();
    // Auto-rescan telemetry with updated signature rules!
    triggerAutomaticScan(false);
    showToast('Signature updated — Auto-scan refreshed');
  };

  const handleAddSimulatedApp = (app: TelemetryTargetApp) => {
    const apps = ThreatGuardStore.getTelemetryApps();
    ThreatGuardStore.saveTelemetryApps([app, ...apps]);
    refreshStateFromStore();
    // Auto-scan immediately upon package deployment!
    triggerAutomaticScan(false);
    showToast(`Deployed "${app.packageName}" — Auto-scanned target`);
  };

  const handleRemoveSimulatedApp = (appId: string) => {
    const apps = ThreatGuardStore.getTelemetryApps().filter((a) => a.id !== appId);
    ThreatGuardStore.saveTelemetryApps(apps);
    refreshStateFromStore();
    triggerAutomaticScan(false);
    showToast('Removed app — Auto-scanned device state');
  };

  const handleTabNavigation = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'dashboard') setActiveScreen('dashboard');
    else if (tab === 'scan-select') setActiveScreen('scan-select');
    else if (tab === 'threats') setActiveScreen('threats');
    else if (tab === 'history') setActiveScreen('history');
    else if (tab === 'intel') setActiveScreen('intel');
  };

  const activeThreatCount = threats.filter(
    (t) => t.status === 'ACTIVE' || t.status === 'INVESTIGATING' || t.status === 'ACTION_REQUIRED'
  ).length;

  return (
    <AppLayout
      deviceInfo={deviceInfo}
      currentTab={currentTab}
      onNavigateTab={handleTabNavigation}
      activeThreatCount={activeThreatCount}
      onOpenArchitectureInfo={() => setShowArchModal(false ? false : true)}
      onResetData={handleResetData}
    >
      {/* Main Active View Container */}
      <div className="flex-1 w-full">
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
            autoScanEnabled={autoScanEnabled}
            onToggleAutoScan={() => setAutoScanEnabled(!autoScanEnabled)}
            autoScanCountdown={autoScanCountdown}
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

      {/* Mobile Floating Bottom Navigation Bar */}
      {activeScreen !== 'scanning' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl">
          <BottomNavBar
            currentTab={currentTab}
            onSelectTab={handleTabNavigation}
            activeThreatCount={activeThreatCount}
          />
        </div>
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
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-fadeIn">
          {toastMessage}
        </div>
      )}
    </AppLayout>
  );
}
