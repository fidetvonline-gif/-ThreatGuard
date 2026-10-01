/**
 * ThreatGuard Store & Persistence Service
 * Manages local database state for threats, scans, devices, signatures, and false-positives.
 */

import {
  DetectionSignature,
  DeviceInfo,
  ScanRecord,
  TelemetryTargetApp,
  ThreatRecord,
  ThreatStatus,
} from '../types/threat';
import { runSecurityScan } from './detectionEngine';
import { DEFAULT_SIGNATURES, INITIAL_DEVICE_INFO, INITIAL_TELEMETRY_APPS } from './mockTelemetry';

const STORAGE_KEYS = {
  DEVICE: 'threatguard_device_info',
  THREATS: 'threatguard_threat_records',
  SCANS: 'threatguard_scan_history',
  SIGNATURES: 'threatguard_signatures',
  TELEMETRY_APPS: 'threatguard_telemetry_apps',
  CUSTOM_FILES: 'threatguard_custom_files',
};

export interface CustomFileItem {
  id: string;
  name: string;
  size: number;
  sha256: string;
  uploadedAt: string;
  content: string; // Base64 or text representation
}

export class ThreatGuardStore {
  // Load or initialize device info
  static getDeviceInfo(): DeviceInfo {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVICE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load device info', e);
    }
    return INITIAL_DEVICE_INFO;
  }

  static saveDeviceInfo(info: DeviceInfo): void {
    localStorage.setItem(STORAGE_KEYS.DEVICE, JSON.stringify(info));
  }

  // Signatures
  static getSignatures(): DetectionSignature[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SIGNATURES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load signatures', e);
    }
    return DEFAULT_SIGNATURES;
  }

  static saveSignatures(signatures: DetectionSignature[]): void {
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(signatures));
  }

  // Telemetry Apps
  static getTelemetryApps(): TelemetryTargetApp[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TELEMETRY_APPS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load telemetry apps', e);
    }
    return INITIAL_TELEMETRY_APPS;
  }

  static saveTelemetryApps(apps: TelemetryTargetApp[]): void {
    localStorage.setItem(STORAGE_KEYS.TELEMETRY_APPS, JSON.stringify(apps));
  }

  // Scans History
  static getScanHistory(): ScanRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCANS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load scan history', e);
    }
    return [];
  }

  static saveScanHistory(history: ScanRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(history));
  }

  // Threats
  static getThreats(): ThreatRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THREATS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load threats', e);
    }
    return [];
  }

  static saveThreats(threats: ThreatRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.THREATS, JSON.stringify(threats));
  }

  // Custom Sideloaded / Uploaded Files
  static getCustomFiles(): CustomFileItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_FILES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load custom files', e);
    }
    return [];
  }

  static saveCustomFiles(files: CustomFileItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FILES, JSON.stringify(files));
  }

  // Update threat status (e.g. RESOLVED, FALSE_POSITIVE, MARKED_SAFE, ACTIVE)
  static updateThreatStatus(threatId: string, status: ThreatStatus, reason?: string): ThreatRecord | null {
    const threats = this.getThreats();
    const index = threats.findIndex((t) => t.id === threatId);
    if (index === -1) return null;

    const updatedThreat: ThreatRecord = {
      ...threats[index],
      status,
      resolvedAt: status === 'RESOLVED' || status === 'MARKED_SAFE' || status === 'FALSE_POSITIVE' ? new Date().toISOString() : undefined,
      falsePositiveReason: reason,
    };

    threats[index] = updatedThreat;
    this.saveThreats(threats);
    this.refreshDeviceOverallStatus();
    return updatedThreat;
  }

  // Toggle remediation step completion
  static toggleRemediationStep(threatId: string, stepId: string): ThreatRecord | null {
    const threats = this.getThreats();
    const index = threats.findIndex((t) => t.id === threatId);
    if (index === -1) return null;

    const threat = threats[index];
    const updatedSteps = threat.remediationSteps.map((step) =>
      step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
    );

    const allCompleted = updatedSteps.every((s) => s.isCompleted);

    const updatedThreat: ThreatRecord = {
      ...threat,
      remediationSteps: updatedSteps,
      status: allCompleted ? 'RESOLVED' : threat.status === 'RESOLVED' ? 'ACTIVE' : threat.status,
      resolvedAt: allCompleted ? new Date().toISOString() : undefined,
    };

    threats[index] = updatedThreat;
    this.saveThreats(threats);
    this.refreshDeviceOverallStatus();
    return updatedThreat;
  }

  // Uninstall / remove app
  static uninstallApp(packageName: string): void {
    const apps = this.getTelemetryApps();
    const filteredApps = apps.filter((a) => a.packageName !== packageName);
    this.saveTelemetryApps(filteredApps);

    // Resolve associated threats
    const threats = this.getThreats();
    const updatedThreats = threats.map((t) => {
      if (t.source.packageName === packageName) {
        return {
          ...t,
          status: 'RESOLVED' as ThreatStatus,
          resolvedAt: new Date().toISOString(),
          remediationSteps: t.remediationSteps.map((s) => ({ ...s, isCompleted: true })),
        };
      }
      return t;
    });
    this.saveThreats(updatedThreats);
    this.refreshDeviceOverallStatus();
  }

  // Delete file
  static deleteFile(fileName: string): void {
    const customFiles = this.getCustomFiles().filter((f) => f.name !== fileName);
    this.saveCustomFiles(customFiles);

    const threats = this.getThreats();
    const updatedThreats = threats.map((t) => {
      if (t.source.fileName === fileName) {
        return {
          ...t,
          status: 'RESOLVED' as ThreatStatus,
          resolvedAt: new Date().toISOString(),
          remediationSteps: t.remediationSteps.map((s) => ({ ...s, isCompleted: true })),
        };
      }
      return t;
    });
    this.saveThreats(updatedThreats);
    this.refreshDeviceOverallStatus();
  }

  // Recalculate device overall protection status
  static refreshDeviceOverallStatus(): DeviceInfo {
    const device = this.getDeviceInfo();
    const threats = this.getThreats();
    const activeThreats = threats.filter((t) => t.status === 'ACTIVE' || t.status === 'INVESTIGATING' || t.status === 'ACTION_REQUIRED');

    const hasCritical = activeThreats.some((t) => t.severity === 'CRITICAL');
    const hasHigh = activeThreats.some((t) => t.severity === 'HIGH');
    const hasMedium = activeThreats.some((t) => t.severity === 'MEDIUM');

    let overallStatus: DeviceInfo['overallStatus'] = 'PROTECTED';
    if (hasCritical) overallStatus = 'AT_RISK';
    else if (hasHigh || hasMedium) overallStatus = 'ACTION_REQUIRED';
    else if (activeThreats.length > 0) overallStatus = 'ACTION_REQUIRED';

    const updatedDevice: DeviceInfo = {
      ...device,
      overallStatus,
    };

    this.saveDeviceInfo(updatedDevice);
    return updatedDevice;
  }

  // Initialize bootstrap data on first run
  static async initializeDefaults(): Promise<void> {
    if (!localStorage.getItem(STORAGE_KEYS.THREATS)) {
      const defaultApps = INITIAL_TELEMETRY_APPS;
      const defaultSignatures = DEFAULT_SIGNATURES;
      this.saveTelemetryApps(defaultApps);
      this.saveSignatures(defaultSignatures);
      this.saveDeviceInfo(INITIAL_DEVICE_INFO);

      // Run initial full scan to populate initial active threats and scan record
      const { scanRecord, detectedThreats } = await runSecurityScan('FULL_AVAILABLE', defaultApps, defaultSignatures);
      this.saveThreats(detectedThreats);
      this.saveScanHistory([
        scanRecord,
        {
          id: 'scan-prev-001',
          deviceId: 'dev-pixel9-001',
          scanType: 'QUICK',
          status: 'COMPLETED',
          startedAt: '2026-09-30T10:14:00Z',
          completedAt: '2026-09-30T10:14:03Z',
          durationMs: 3100,
          itemsScanned: {
            applications: 6,
            permissions: 28,
            files: 182,
            signaturesChecked: 5,
            networkIndicators: 4,
            total: 225,
          },
          threatsFound: 1,
          criticalCount: 0,
          highCount: 1,
          mediumCount: 0,
          lowCount: 0,
          informationalCount: 0,
          threatIds: [detectedThreats[0]?.id || 'THR-20260930-00001'],
          scannerVersion: 'ThreatGuard Scanner v1.0.4',
        },
      ]);
      this.refreshDeviceOverallStatus();
    }
  }

  // Reset all to clean demo state
  static async resetToSampleState(): Promise<void> {
    localStorage.clear();
    await this.initializeDefaults();
  }
}
