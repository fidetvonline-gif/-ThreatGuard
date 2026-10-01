/**
 * ThreatGuard Types & Models
 * Conforming to Mobile Threat Detection & Security Analysis System specification
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type ThreatType =
  | 'Malware'
  | 'Spyware'
  | 'Trojan'
  | 'Adware'
  | 'Phishing'
  | 'Suspicious Permission Usage'
  | 'Malicious File'
  | 'Unauthorized Configuration'
  | 'Potentially Unwanted Application'
  | 'Suspicious Behavior'
  | 'Unknown';

export type ThreatStatus =
  | 'DETECTED'
  | 'INVESTIGATING'
  | 'ACTION_REQUIRED'
  | 'REMEDIATION'
  | 'RESOLVED'
  | 'FALSE_POSITIVE'
  | 'MARKED_SAFE'
  | 'QUARANTINED'
  | 'ACTIVE';

export type ScanType = 'QUICK' | 'APPLICATION' | 'FILE' | 'FULL_AVAILABLE';

export type ScanStatus = 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface DeviceInfo {
  id: string;
  deviceName: string;
  platform: string;
  platformVersion: string;
  appVersion: string;
  securityPatchLevel: string;
  isRooted: boolean;
  playProtectStatus: 'Active' | 'Inactive' | 'Unknown';
  lastScanAt: string | null;
  overallStatus: 'PROTECTED' | 'ACTION_REQUIRED' | 'AT_RISK' | 'UNPROTECTED';
}

export interface PermissionDetail {
  id: string;
  permissionName: string;
  riskLevel: SeverityLevel;
  category: string;
  description: string;
  isDangerous: boolean;
  isGranted: boolean;
  reason: string;
}

export interface NetworkIndicatorItem {
  id: string;
  domain?: string;
  ipAddress?: string;
  url?: string;
  indicatorType: 'C2_COMMUNICATION' | 'SUSPICIOUS_DOMAIN' | 'UNENCRYPTED_LEAK' | 'MALICIOUS_IP';
  reputation: 'MALICIOUS' | 'SUSPICIOUS' | 'NEUTRAL';
  detectedPort?: number;
  protocol?: string;
  description: string;
}

export interface ThreatEvidenceItem {
  id: string;
  evidenceType:
    | 'Application Package'
    | 'File Name'
    | 'SHA-256'
    | 'Detection Signature'
    | 'Suspicious Permission'
    | 'Behavior Indicator'
    | 'Domain Indicator'
    | 'Detection Method'
    | 'Scanner'
    | 'Detection Time'
    | 'Confidence';
  evidenceValue: string;
  description: string;
  confidenceContribution: number;
}

export interface ConfidenceBreakdown {
  signatureMatchScore: number;
  suspiciousPermissionScore: number;
  suspiciousBehaviorScore: number;
  suspiciousDomainScore: number;
  fileReputationScore: number;
  totalScore: number;
  confidenceGrade: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export interface ThreatSource {
  determined: boolean;
  applicationName?: string;
  packageName?: string;
  versionName?: string;
  installerSource?: string;
  fileName?: string;
  filePath?: string;
  sha256?: string;
}

export interface PermittedAction {
  id: string;
  actionType:
    | 'VIEW_DETAILS'
    | 'SCAN_AGAIN'
    | 'REVOKE_PERMISSIONS'
    | 'DISABLE_APP'
    | 'UNINSTALL_APP'
    | 'QUARANTINE_FILE'
    | 'DELETE_FILE'
    | 'MARK_AS_SAFE'
    | 'REPORT_FALSE_POSITIVE';
  label: string;
  isAvailableInOS: boolean;
  requiresSystemSettingsHandoff: boolean;
  handoffInstructions?: string;
  description: string;
}

export interface RemediationStep {
  id: string;
  order: number;
  action: string;
  explanation: string;
  isCompleted: boolean;
  isExecutableInApp: boolean;
  systemSettingsPath?: string;
}

export interface ThreatRecord {
  id: string;
  detectionId: string;
  scanId: string;
  name: string;
  type: ThreatType;
  severity: SeverityLevel;
  status: ThreatStatus;
  confidence: number;
  confidenceBreakdown: ConfidenceBreakdown;
  source: ThreatSource;
  detectionLocation: 'Installed Application' | 'Downloaded File' | 'Device Configuration' | 'Network Telemetry' | 'Accessible Storage';
  detectionMethod: 'Heuristic Analysis' | 'Signature Matching' | 'Static Permission Analysis' | 'Hash Reputation Lookup' | 'Behavioral Telemetry Rule';
  scannerVersion: string;
  detectedAt: string;
  resolvedAt?: string;
  explanation: string;
  potentialImpact: string;
  evidence: ThreatEvidenceItem[];
  permissions: PermissionDetail[];
  networkIndicators: NetworkIndicatorItem[];
  recommendedActions: string[];
  remediationSteps: RemediationStep[];
  availableActions: PermittedAction[];
  falsePositiveReason?: string;
  signatureId?: string;
}

export interface ScanRecord {
  id: string;
  deviceId: string;
  scanType: ScanType;
  status: ScanStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  itemsScanned: {
    applications: number;
    permissions: number;
    files: number;
    signaturesChecked: number;
    networkIndicators: number;
    total: number;
  };
  threatsFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  informationalCount: number;
  threatIds: string[];
  scannerVersion: string;
}

export interface DetectionSignature {
  id: string;
  code: string;
  name: string;
  threatType: ThreatType;
  severity: SeverityLevel;
  confidenceWeight: number;
  description: string;
  ruleCriteria: string;
  knownMaliciousHashes?: string[];
  flaggedPackages?: string[];
  forbiddenPermissionCombos?: string[][];
  flaggedDomains?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface TelemetryTargetApp {
  id: string;
  name: string;
  packageName: string;
  version: string;
  iconBg: string;
  category: string;
  requestedPermissions: string[];
  signatureMatch?: string;
  fileHash?: string;
  fileName?: string;
  fileSizeBytes?: number;
  networkEndpoints?: string[];
  behaviorFlags?: string[];
  isSystemApp: boolean;
  installedAt: string;
}
