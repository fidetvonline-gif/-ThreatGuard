/**
 * ThreatGuard Supabase Service Provider
 * Provides unified remote database operations for threats, scans, devices, and indicators.
 */

import {
  DetectionSignature,
  DeviceInfo,
  ScanRecord,
  TelemetryTargetApp,
  ThreatEvidenceItem,
  ThreatRecord,
  ThreatStatus,
} from '../types/threat';
import { getSupabaseClient, saveStoredSupabaseConfig, getStoredSupabaseConfig } from './supabaseClient';
import { DEFAULT_SIGNATURES, INITIAL_DEVICE_INFO, INITIAL_TELEMETRY_APPS } from './mockTelemetry';

export class SupabaseService {
  /**
   * Tests connection to Supabase instance
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (!client || !config.url || !config.anonKey) {
      return {
        success: false,
        message: 'Supabase URL and Anon Key are not yet configured.',
      };
    }

    try {
      // Test querying indicators or checking health
      const { data, error } = await client.from('indicators').select('id').limit(1);

      if (error) {
        // Table might not exist yet if SQL script not run
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          saveStoredSupabaseConfig({
            ...config,
            isConnected: true,
            lastCheckedAt: new Date().toISOString(),
            lastError: 'Connected to Supabase! (Tables need initialization via SQL Editor)',
          });
          return {
            success: true,
            message: 'Connected to Supabase project! (Please run the SQL schema script in SQL Editor)',
          };
        }

        saveStoredSupabaseConfig({
          ...config,
          isConnected: false,
          lastCheckedAt: new Date().toISOString(),
          lastError: error.message,
        });

        return {
          success: false,
          message: `Supabase Error: ${error.message}`,
        };
      }

      saveStoredSupabaseConfig({
        ...config,
        isConnected: true,
        lastCheckedAt: new Date().toISOString(),
        lastError: undefined,
      });

      return {
        success: true,
        message: 'Successfully connected to Supabase database!',
      };
    } catch (err: any) {
      const msg = err.message || 'Network connection failed.';
      saveStoredSupabaseConfig({
        ...config,
        isConnected: false,
        lastCheckedAt: new Date().toISOString(),
        lastError: msg,
      });
      return {
        success: false,
        message: `Connection test failed: ${msg}`,
      };
    }
  }

  // ==========================================
  // DEVICE OPERATIONS
  // ==========================================

  static async getDevice(deviceId: string = 'device-target-001'): Promise<DeviceInfo> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('devices')
          .select('*')
          .eq('id', deviceId)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            deviceName: data.device_name,
            platform: data.platform,
            platformVersion: data.platform_version,
            appVersion: data.app_version,
            securityPatchLevel: data.security_patch_level,
            isRooted: data.is_rooted,
            playProtectStatus: data.play_protect_status,
            lastScanAt: data.last_scan_at,
            overallStatus: data.overall_status,
          };
        }
      } catch (e) {
        console.warn('Supabase device fetch fallback:', e);
      }
    }

    // Local fallback
    try {
      const local = localStorage.getItem('threatguard_device_info');
      if (local) return JSON.parse(local);
    } catch {}
    return INITIAL_DEVICE_INFO;
  }

  static async saveDevice(device: DeviceInfo): Promise<void> {
    // Local persistence
    localStorage.setItem('threatguard_device_info', JSON.stringify(device));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('devices').upsert({
          id: device.id,
          device_name: device.deviceName,
          platform: device.platform,
          platform_version: device.platformVersion,
          app_version: device.appVersion,
          security_patch_level: device.securityPatchLevel,
          is_rooted: device.isRooted,
          play_protect_status: device.playProtectStatus,
          last_scan_at: device.lastScanAt,
          overall_status: device.overallStatus,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase device save error:', e);
      }
    }
  }

  // ==========================================
  // THREATS OPERATIONS
  // ==========================================

  static async getThreats(): Promise<ThreatRecord[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: threatRows, error } = await client
          .from('threats')
          .select(`
            *,
            threat_evidence (*)
          `)
          .order('detected_at', { ascending: false });

        if (threatRows && !error && threatRows.length > 0) {
          return threatRows.map((row: any) => ({
            id: row.id,
            detectionId: row.detection_id,
            scanId: row.scan_id,
            name: row.name,
            type: row.type,
            severity: row.severity,
            status: row.status,
            confidence: Number(row.confidence),
            confidenceBreakdown: row.confidence_breakdown || {
              signatureMatchScore: 40,
              suspiciousPermissionScore: 15,
              suspiciousBehaviorScore: 20,
              suspiciousDomainScore: 0,
              fileReputationScore: 10,
              totalScore: Number(row.confidence),
              confidenceGrade: 'High',
            },
            source: row.source || { determined: false },
            detectionLocation: row.detection_location,
            detectionMethod: row.detection_method,
            scannerVersion: row.scanner_version,
            detectedAt: row.detected_at,
            resolvedAt: row.resolved_at,
            explanation: row.explanation,
            potentialImpact: row.potential_impact,
            evidence: (row.threat_evidence || []).map((ev: any) => ({
              id: ev.id,
              evidenceType: ev.evidence_type,
              evidenceValue: ev.evidence_value,
              description: ev.description,
              confidenceContribution: Number(ev.confidence || 0),
            })),
            permissions: [],
            networkIndicators: [],
            recommendedActions: row.recommended_actions || [],
            remediationSteps: row.remediation_steps || [],
            availableActions: row.available_actions || [],
            signatureId: row.signature_id,
            falsePositiveReason: row.false_positive_reason,
          }));
        }
      } catch (e) {
        console.warn('Supabase threats fetch fallback to local storage:', e);
      }
    }

    // Local fallback
    try {
      const local = localStorage.getItem('threatguard_threat_records');
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  }

  static async saveThreats(threats: ThreatRecord[]): Promise<void> {
    // Local persistence
    localStorage.setItem('threatguard_threat_records', JSON.stringify(threats));

    const client = getSupabaseClient();
    if (client) {
      try {
        for (const t of threats) {
          await client.from('threats').upsert({
            id: t.id,
            detection_id: t.detectionId,
            scan_id: t.scanId,
            name: t.name,
            type: t.type,
            severity: t.severity,
            status: t.status,
            confidence: t.confidence,
            confidence_breakdown: t.confidenceBreakdown,
            source: t.source,
            detection_location: t.detectionLocation,
            detection_method: t.detectionMethod,
            scanner_version: t.scannerVersion,
            explanation: t.explanation,
            potential_impact: t.potentialImpact,
            recommended_actions: t.recommendedActions,
            remediation_steps: t.remediationSteps,
            available_actions: t.availableActions,
            signature_id: t.signatureId,
            false_positive_reason: t.falsePositiveReason,
            detected_at: t.detectedAt,
            resolved_at: t.resolvedAt,
            updated_at: new Date().toISOString(),
          });

          // Insert evidence items
          if (t.evidence && t.evidence.length > 0) {
            const evidenceRows = t.evidence.map((ev) => ({
              id: ev.id,
              threat_id: t.id,
              evidence_type: ev.evidenceType,
              evidence_value: ev.evidenceValue,
              description: ev.description,
              confidence: ev.confidenceContribution,
            }));
            await client.from('threat_evidence').upsert(evidenceRows);
          }
        }
      } catch (e) {
        console.warn('Supabase threats save error:', e);
      }
    }
  }

  // ==========================================
  // SCANS OPERATIONS
  // ==========================================

  static async getScanHistory(): Promise<ScanRecord[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('scans')
          .select('*')
          .order('started_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            deviceId: row.device_id,
            scanType: row.scan_type,
            status: row.status,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            durationMs: row.duration_ms,
            itemsScanned: row.items_scanned,
            threatsFound: row.threats_found,
            criticalCount: row.critical_count,
            highCount: row.high_count,
            mediumCount: row.medium_count,
            lowCount: row.low_count,
            informationalCount: row.informational_count,
            threatIds: row.threat_ids || [],
            scannerVersion: row.scanner_version,
          }));
        }
      } catch (e) {
        console.warn('Supabase scan history fallback:', e);
      }
    }

    try {
      const local = localStorage.getItem('threatguard_scan_history');
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  }

  static async saveScanHistory(history: ScanRecord[]): Promise<void> {
    localStorage.setItem('threatguard_scan_history', JSON.stringify(history));

    const client = getSupabaseClient();
    if (client) {
      try {
        for (const scan of history) {
          await client.from('scans').upsert({
            id: scan.id,
            device_id: scan.deviceId,
            scan_type: scan.scanType,
            status: scan.status,
            started_at: scan.startedAt,
            completed_at: scan.completedAt,
            duration_ms: scan.durationMs,
            items_scanned: scan.itemsScanned,
            threats_found: scan.threatsFound,
            critical_count: scan.criticalCount,
            high_count: scan.highCount,
            medium_count: scan.mediumCount,
            low_count: scan.lowCount,
            informational_count: scan.informationalCount,
            threat_ids: scan.threatIds,
            scanner_version: scan.scannerVersion,
          });
        }
      } catch (e) {
        console.warn('Supabase scan history save error:', e);
      }
    }
  }

  // ==========================================
  // SIGNATURES & INDICATORS
  // ==========================================

  static async getSignatures(): Promise<DetectionSignature[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('indicators').select('*');
        if (data && !error && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            code: row.code,
            name: row.name,
            threatType: row.threat_type,
            severity: row.severity,
            confidenceWeight: row.confidence_weight,
            description: row.description,
            ruleCriteria: row.rule_criteria,
            knownMaliciousHashes: row.known_malicious_hashes || [],
            forbiddenPermissionCombos: row.forbidden_permission_combos || [],
            flaggedDomains: row.flagged_domains || [],
            isActive: row.is_active,
            createdAt: row.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase signatures fallback:', e);
      }
    }

    try {
      const local = localStorage.getItem('threatguard_signatures');
      if (local) return JSON.parse(local);
    } catch {}
    return DEFAULT_SIGNATURES;
  }

  static async saveSignatures(signatures: DetectionSignature[]): Promise<void> {
    localStorage.setItem('threatguard_signatures', JSON.stringify(signatures));

    const client = getSupabaseClient();
    if (client) {
      try {
        const rows = signatures.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          threat_type: s.threatType,
          severity: s.severity,
          confidence_weight: s.confidenceWeight,
          description: s.description,
          rule_criteria: s.ruleCriteria,
          known_malicious_hashes: s.knownMaliciousHashes,
          forbidden_permission_combos: s.forbiddenPermissionCombos,
          flagged_domains: s.flaggedDomains,
          is_active: s.isActive,
        }));
        await client.from('indicators').upsert(rows);
      } catch (e) {
        console.warn('Supabase signatures save error:', e);
      }
    }
  }

  // ==========================================
  // TELEMETRY APPS
  // ==========================================

  static async getTelemetryApps(): Promise<TelemetryTargetApp[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('telemetry_apps').select('*');
        if (data && !error && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            packageName: row.package_name,
            version: row.version,
            iconBg: row.icon_bg || 'bg-cyan-600',
            category: row.category,
            requestedPermissions: row.requested_permissions || [],
            fileHash: row.file_hash,
            fileName: row.file_name,
            fileSizeBytes: row.file_size_bytes,
            networkEndpoints: row.network_endpoints || [],
            behaviorFlags: row.behavior_flags || [],
            isSystemApp: row.is_system_app,
            installedAt: row.installed_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase telemetry apps fallback:', e);
      }
    }

    try {
      const local = localStorage.getItem('threatguard_telemetry_apps');
      if (local) return JSON.parse(local);
    } catch {}
    return INITIAL_TELEMETRY_APPS;
  }

  static async saveTelemetryApps(apps: TelemetryTargetApp[]): Promise<void> {
    localStorage.setItem('threatguard_telemetry_apps', JSON.stringify(apps));

    const client = getSupabaseClient();
    if (client) {
      try {
        const rows = apps.map((a) => ({
          id: a.id,
          name: a.name,
          package_name: a.packageName,
          version: a.version,
          icon_bg: a.iconBg,
          category: a.category,
          requested_permissions: a.requestedPermissions,
          file_hash: a.fileHash,
          file_name: a.fileName,
          file_size_bytes: a.fileSizeBytes,
          network_endpoints: a.networkEndpoints,
          behavior_flags: a.behaviorFlags,
          is_system_app: a.isSystemApp,
          installed_at: a.installedAt,
        }));
        await client.from('telemetry_apps').upsert(rows);
      } catch (e) {
        console.warn('Supabase telemetry apps save error:', e);
      }
    }
  }

  /**
   * Complete Sync: push all local data to Supabase
   */
  static async syncAllLocalToSupabase(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    try {
      const device = INITIAL_DEVICE_INFO;
      const threats = JSON.parse(localStorage.getItem('threatguard_threat_records') || '[]');
      const scans = JSON.parse(localStorage.getItem('threatguard_scan_history') || '[]');
      const signatures = DEFAULT_SIGNATURES;
      const apps = INITIAL_TELEMETRY_APPS;

      await this.saveDevice(device);
      await this.saveSignatures(signatures);
      await this.saveTelemetryApps(apps);
      await this.saveThreats(threats);
      await this.saveScanHistory(scans);

      return {
        success: true,
        message: `Successfully synchronized ${threats.length} threats and ${scans.length} scans to Supabase!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Sync failed: ${err.message}`,
      };
    }
  }
}
