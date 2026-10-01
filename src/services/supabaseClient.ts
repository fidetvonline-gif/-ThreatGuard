/**
 * Supabase Client & Configuration
 * Provides Supabase instance and table types for ThreatGuard.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / runtime keys or env vars
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const CONFIG_STORAGE_KEY = 'threatguard_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastCheckedAt?: string;
  lastError?: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        url: parsed.url || DEFAULT_SUPABASE_URL,
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_ANON_KEY,
        isConnected: Boolean(parsed.isConnected),
        lastCheckedAt: parsed.lastCheckedAt,
        lastError: parsed.lastError,
      };
    }
  } catch (e) {
    console.error('Failed to load stored Supabase configuration', e);
  }

  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    isConnected: Boolean(DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY),
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  const url = config.url.trim();
  const key = config.anonKey.trim();

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  if (
    !supabaseInstance ||
    (supabaseInstance as any).supabaseUrl !== url ||
    (supabaseInstance as any).supabaseKey !== key
  ) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}

/**
 * SQL Schema DDL definition for Supabase SQL Editor setup (Section 18 of specification)
 */
export const SUPABASE_SCHEMA_SQL = `-- ThreatGuard PostgreSQL Database Schema for Supabase
-- Run this script in the Supabase SQL Editor to bootstrap all tables and indexes.

-- 1. Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Android',
    platform_version TEXT NOT NULL,
    app_version TEXT NOT NULL,
    security_patch_level TEXT,
    is_rooted BOOLEAN DEFAULT FALSE,
    play_protect_status TEXT DEFAULT 'Active',
    last_scan_at TIMESTAMPTZ,
    overall_status TEXT DEFAULT 'PROTECTED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scans Table
CREATE TABLE IF NOT EXISTS public.scans (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    scan_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    duration_ms INTEGER NOT NULL,
    items_scanned JSONB NOT NULL,
    threats_found INTEGER NOT NULL DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    informational_count INTEGER DEFAULT 0,
    threat_ids JSONB DEFAULT '[]'::jsonb,
    scanner_version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Threats Table
CREATE TABLE IF NOT EXISTS public.threats (
    id TEXT PRIMARY KEY,
    detection_id TEXT NOT NULL,
    scan_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    confidence DECIMAL NOT NULL,
    confidence_breakdown JSONB,
    source JSONB NOT NULL,
    detection_location TEXT NOT NULL,
    detection_method TEXT NOT NULL,
    scanner_version TEXT NOT NULL,
    explanation TEXT NOT NULL,
    potential_impact TEXT NOT NULL,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    remediation_steps JSONB DEFAULT '[]'::jsonb,
    available_actions JSONB DEFAULT '[]'::jsonb,
    signature_id TEXT,
    false_positive_reason TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Threat Evidence Table
CREATE TABLE IF NOT EXISTS public.threat_evidence (
    id TEXT PRIMARY KEY,
    threat_id TEXT NOT NULL REFERENCES public.threats(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    evidence_value TEXT NOT NULL,
    description TEXT,
    confidence DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Detection Indicators & Signatures Table
CREATE TABLE IF NOT EXISTS public.indicators (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    confidence_weight INTEGER DEFAULT 40,
    description TEXT,
    rule_criteria TEXT,
    known_malicious_hashes JSONB DEFAULT '[]'::jsonb,
    forbidden_permission_combos JSONB DEFAULT '[]'::jsonb,
    flagged_domains JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Threat Actions & Remediation Log
CREATE TABLE IF NOT EXISTS public.threat_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_id TEXT NOT NULL REFERENCES public.threats(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    result TEXT,
    error_message TEXT
);

-- 7. Telemetry Applications Target Store
CREATE TABLE IF NOT EXISTS public.telemetry_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    package_name TEXT NOT NULL UNIQUE,
    version TEXT NOT NULL,
    icon_bg TEXT DEFAULT 'bg-cyan-600',
    category TEXT NOT NULL,
    requested_permissions JSONB DEFAULT '[]'::jsonb,
    file_hash TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    network_endpoints JSONB DEFAULT '[]'::jsonb,
    behavior_flags JSONB DEFAULT '[]'::jsonb,
    is_system_app BOOLEAN DEFAULT FALSE,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_threats_status ON public.threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON public.threats(severity);
CREATE INDEX IF NOT EXISTS idx_scans_started_at ON public.scans(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_indicators_code ON public.indicators(code);
`;
