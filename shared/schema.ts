import { Database } from '../server/db';

// Monitoring Types
export interface SystemMetric {
  id?: string;
  timestamp: Date;
  metricType: string;
  value: number;
  tags?: Record<string, string>;
}

export interface SelfHealingAction {
  id?: string;
  timestamp: Date;
  actionType: string;
  status: string;
  details: Record<string, unknown>;
}

export interface AuditLog {
  id?: string;
  timestamp: Date;
  eventType: string;
  userId?: string;
  details: Record<string, unknown>;
}

export interface SecurityEvent {
  id?: string;
  timestamp: Date;
  severity: string;
  eventType: string;
  details: Record<string, unknown>;
}

export interface HealthCheckResult {
  id: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'error';
  component: string;
  details: Record<string, unknown>;
  responseTime: number;
}

export interface ErrorCorrection {
  id: string;
  timestamp: Date;
  errorType: string;
  correction: string;
  success: boolean;
  details: Record<string, unknown>;
}

// Service Configuration Types
export interface ServiceConfig {
  port: number;
  host: string;
  env: string;
  version: string;
  debug: boolean;
}

// Monitoring Configuration
export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
}

// Worker Types
export interface WorkerMessage {
  type: string;
  data: Record<string, unknown>;
}

export interface WorkerConfig {
  enabled: boolean;
  threadsCount: number;
  queueSize: number;
}

// Database Types
export interface StorageConfig {
  type: 'postgresql' | 'sqlite';
  url: string;
  poolSize: number;
  ssl: boolean;
}

// Insert Types
export type InsertSystemMetric = Omit<SystemMetric, 'id'>;
export type InsertSelfHealingAction = Omit<SelfHealingAction, 'id'>;
export type InsertAuditLog = Omit<AuditLog, 'id'>;
export type InsertSecurityEvent = Omit<SecurityEvent, 'id'>;
export type InsertHealthCheckResult = Omit<HealthCheckResult, 'id'>;
export type InsertErrorCorrection = Omit<ErrorCorrection, 'id'>;

// Declare module augmentation for better type support
declare module '../server/db' {
  interface Database {
    healthCheckResults: HealthCheckResult[];
    errorCorrections: ErrorCorrection[];
    systemMetrics: SystemMetric[];
    selfHealingActions: SelfHealingAction[];
    auditLogs: AuditLog[];
    securityEvents: SecurityEvent[];
  }
}

// Re-export Database type
export type { Database };