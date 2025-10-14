import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { db } from './db';
import * as bcrypt from 'bcryptjs';

// Import all tables and types
import {
  users,
  sessions,
  conversations,
  messages,
  documents,
  securityEvents,
  systemMetrics,
  healthCheckResults,
  errorCorrections,
  selfHealingActions,
  auditLogs,
  complianceEvents,
  userBehaviorProfiles,
  systemHealthSnapshots,
  securityIncidents,
  failoverEvents,
  performanceBaselines,
  alertRules,
  circuitBreakerStates,
  uptimeIncidents,
  autonomousOperations,
  maintenanceTasks,
  dhaApplicants,
  dhaDocuments,
  dhaDocumentVerifications,
  aiBotSessions,
  aiCommandInterfaces,
  fraudAlerts,
  securityMetrics,
  biometricProfiles,
  governmentComplianceAudits,
  type User,
  type Session,
  type Conversation,
  type Message,
  type Document,
  type SecurityEvent,
  type SystemMetric,
  type HealthCheckResult,
  type ErrorCorrection,
  type SelfHealingAction,
  type AuditLog,
  type ComplianceEvent,
  type UserBehaviorProfile,
  type SystemHealthSnapshot,
  type SecurityIncident,
  type FailoverEvent,
  type PerformanceBaseline,
  type AlertRule,
  type CircuitBreakerState,
  type UptimeIncident,
  type AutonomousOperation,
  type MaintenanceTask,
  type DhaApplicant,
  type DhaDocument,
  type DhaDocumentVerification,
  type AiBotSession,
  type AiCommandInterface,
  type FraudAlert,
  type SecurityMetric,
  type BiometricProfile,
  type GovernmentComplianceAudit
} from '../shared/schema/tables';

// Base types
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BaseInsertEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  username: string;
  isActive: boolean;
  role: string;
  failedAttempts: number;
  metadata?: Record<string, unknown>;
}

export type InsertUser = Omit<User, keyof BaseEntity> & BaseInsertEntity;

// Session types
export interface Session extends BaseEntity {
  userId: string;
  token: string;
  expiresAt: Date;
}

export type InsertSession = Omit<Session, keyof BaseEntity> & BaseInsertEntity;

// Monitoring types
export interface SystemMetric extends BaseEntity {
  metricType: string;
  value: number;
  tags?: Record<string, unknown>;
}

export interface HealthCheckResult extends BaseEntity {
  checkId: string;
  component: string;
  status: 'healthy' | 'warning' | 'error';
  details: Record<string, unknown>;
  responseTime: number;
}

export interface ErrorCorrection extends BaseEntity {
  errorType: string;
  correction: string;
  success: boolean;
  details: Record<string, unknown>;
  startTime: Date;
}

export interface SelfHealingAction extends BaseEntity {
  actionType: string;
  status: string;
  details?: Record<string, unknown>;
  startTime: Date;
}

// Compliance types
export interface AuditLog extends BaseEntity {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
}

export interface ComplianceEvent extends BaseEntity {
  eventType: string;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  details: Record<string, unknown>;
}

// System health types
export interface SystemHealthSnapshot extends BaseEntity {
  timestamp: Date;
  metrics: Record<string, number>;
  status: string;
  warnings: string[];
}

export interface SecurityIncident extends BaseEntity {
  type: string;
  severity: string;
  status: string;
  details: Record<string, unknown>;
}

// Ops management types
export interface FailoverEvent extends BaseEntity {
  serviceId: string;
  triggerTime: Date;
  completionTime?: Date;
  status: string;
  details: Record<string, unknown>;
}

export interface PerformanceBaseline extends BaseEntity {
  serviceName: string;
  metrics: Record<string, number>;
  lastUpdated: Date;
}

export interface AlertRule extends BaseEntity {
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}

export interface CircuitBreakerState extends BaseEntity {
  serviceName: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  lastStateChange: Date;
  failureCount: number;
}

export interface UptimeIncident extends BaseEntity {
  serviceId: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  impact: string;
}

// Insert types
export type InsertSystemMetric = Omit<SystemMetric, keyof BaseEntity> & BaseInsertEntity;
export type InsertHealthCheckResult = Omit<HealthCheckResult, keyof BaseEntity> & BaseInsertEntity;
export type InsertErrorCorrection = Omit<ErrorCorrection, keyof BaseEntity> & BaseInsertEntity;
export type InsertSelfHealingAction = Omit<SelfHealingAction, keyof BaseEntity> & BaseInsertEntity;
export type InsertAuditLog = Omit<AuditLog, keyof BaseEntity> & BaseInsertEntity;
export type InsertComplianceEvent = Omit<ComplianceEvent, keyof BaseEntity> & BaseInsertEntity;
export type InsertSystemHealthSnapshot = Omit<SystemHealthSnapshot, keyof BaseEntity> & BaseInsertEntity;
export type InsertSecurityIncident = Omit<SecurityIncident, keyof BaseEntity> & BaseInsertEntity;
export type InsertFailoverEvent = Omit<FailoverEvent, keyof BaseEntity> & BaseInsertEntity;
export type InsertPerformanceBaseline = Omit<PerformanceBaseline, keyof BaseEntity> & BaseInsertEntity;
export type InsertAlertRule = Omit<AlertRule, keyof BaseEntity> & BaseInsertEntity;
export type InsertCircuitBreakerState = Omit<CircuitBreakerState, keyof BaseEntity> & BaseInsertEntity;
export type InsertUptimeIncident = Omit<UptimeIncident, keyof BaseEntity> & BaseInsertEntity;

// Base interface for all database operations
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;

  // Session management
  createSession(session: Partial<Session>): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  invalidateSession(token: string): Promise<void>;

  // System monitoring
  createMetric(metric: Partial<SystemMetric>): Promise<SystemMetric>;
  getMetrics(options?: {
    metricType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SystemMetric[]>;

  // Health checks
  createHealthCheckResult(result: Partial<HealthCheckResult>): Promise<HealthCheckResult>;
  getHealthCheckResults(checkId?: string): Promise<HealthCheckResult[]>;

  // Error handling
  createErrorCorrection(correction: Partial<ErrorCorrection>): Promise<ErrorCorrection>;
  getErrorCorrections(filters?: any): Promise<ErrorCorrection[]>;
  updateErrorCorrection(id: string, updates: Partial<ErrorCorrection>): Promise<ErrorCorrection | undefined>;

  // Self healing
  createSelfHealingAction(action: Partial<SelfHealingAction>): Promise<SelfHealingAction>;
  getSelfHealingActions(filters?: any): Promise<SelfHealingAction[]>;
  updateSelfHealingAction(id: string, updates: Partial<SelfHealingAction>): Promise<SelfHealingAction | undefined>;

  // Audit and compliance
  createAuditLog(log: Partial<AuditLog>): Promise<AuditLog>;
  getAuditLogs(filters?: any): Promise<AuditLog[]>;
  createComplianceEvent(event: Partial<ComplianceEvent>): Promise<ComplianceEvent>;
  getComplianceEvents(eventType?: string): Promise<ComplianceEvent[]>;

  // System health
  createSystemHealthSnapshot(snapshot: Partial<SystemHealthSnapshot>): Promise<SystemHealthSnapshot>;
  getSystemHealthSnapshots(limit?: number): Promise<SystemHealthSnapshot[]>;
  getLatestSystemHealthSnapshot(): Promise<SystemHealthSnapshot | undefined>;

  // Security management
  createSecurityIncident(incident: Partial<SecurityIncident>): Promise<SecurityIncident>;
  getSecurityIncidents(filters?: any): Promise<SecurityIncident[]>;
  updateSecurityIncident(id: string, updates: Partial<SecurityIncident>): Promise<SecurityIncident | undefined>;
  createSecurityEvent(event: Partial<SecurityEvent>): Promise<SecurityEvent>;
  getSecurityEvents(userId?: string): Promise<SecurityEvent[]>;
  getAllSecurityEvents(): Promise<SecurityEvent[]>;

  // Performance monitoring
  createPerformanceBaseline(baseline: Partial<PerformanceBaseline>): Promise<PerformanceBaseline>;
  getPerformanceBaselines(serviceName?: string): Promise<PerformanceBaseline[]>;
  updatePerformanceBaseline(id: string, updates: Partial<PerformanceBaseline>): Promise<PerformanceBaseline | undefined>;

  // Alert management
  createAlertRule(rule: Partial<AlertRule>): Promise<AlertRule>;
  getAlertRules(): Promise<AlertRule[]>;
  updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | undefined>;

  // Circuit breaker management
  createCircuitBreakerState(state: Partial<CircuitBreakerState>): Promise<CircuitBreakerState>;
  getCircuitBreakerState(serviceName: string): Promise<CircuitBreakerState | undefined>;
  updateCircuitBreakerState(serviceName: string, updates: Partial<CircuitBreakerState>): Promise<CircuitBreakerState | undefined>;
  getAllCircuitBreakerStates(): Promise<CircuitBreakerState[]>;

  // Uptime monitoring
  createUptimeIncident(incident: Partial<UptimeIncident>): Promise<UptimeIncident>;
  getUptimeIncidents(serviceId?: string): Promise<UptimeIncident[]>;
  updateUptimeIncident(id: string, updates: Partial<UptimeIncident>): Promise<UptimeIncident | undefined>;

  // Document management
  getDocument(id: string): Promise<Document | undefined>;
  getUserDocuments(userId: string): Promise<Document[]>;
  createDocument(document: Partial<Document>): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;

  // DHA document management
  getDhaApplicant(id: string): Promise<DhaApplicant | undefined>;
  getDhaApplicantByIdNumber(idNumber: string): Promise<DhaApplicant | undefined>;
  getDhaApplicantByPassport(passportNumber: string): Promise<DhaApplicant | undefined>;
  createDhaApplicant(applicant: Partial<DhaApplicant>): Promise<DhaApplicant>;
  updateDhaApplicant(id: string, updates: Partial<DhaApplicant>): Promise<DhaApplicant | undefined>;
  getDhaApplicants(): Promise<DhaApplicant[]>;
  getDhaDocument(id: string): Promise<DhaDocument | undefined>;
  getDhaDocumentByNumber(documentNumber: string): Promise<DhaDocument | undefined>;
  getApplicantDhaDocuments(applicantId: string): Promise<DhaDocument[]>;
  createDhaDocument(document: Partial<DhaDocument>): Promise<DhaDocument>;
  updateDhaDocument(id: string, updates: Partial<DhaDocument>): Promise<DhaDocument | undefined>;
  getDhaDocuments(): Promise<DhaDocument[]>;
  getDhaDocumentVerification(id: string): Promise<DhaDocumentVerification | undefined>;
  getDhaDocumentVerificationByCode(verificationCode: string): Promise<DhaDocumentVerification | undefined>;
  createDhaDocumentVerification(verification: Partial<DhaDocumentVerification>): Promise<DhaDocumentVerification>;
  updateDhaDocumentVerification(id: string, updates: Partial<DhaDocumentVerification>): Promise<DhaDocumentVerification | undefined>;

  // AI bot management
  getAiBotSession(id: string): Promise<AiBotSession | undefined>;
  getUserAiBotSessions(userId: string): Promise<AiBotSession[]>;
  createAiBotSession(session: Partial<AiBotSession>): Promise<AiBotSession>;
  updateAiBotSession(id: string, updates: Partial<AiBotSession>): Promise<AiBotSession | undefined>;
  deactivateAiBotSession(id: string): Promise<AiBotSession | undefined>;

  // AI command management
  getAiCommandInterface(id: string): Promise<AiCommandInterface | undefined>;
  getSessionAiCommands(sessionId: string): Promise<AiCommandInterface[]>;
  createAiCommandInterface(command: Partial<AiCommandInterface>): Promise<AiCommandInterface>;
  updateAiCommandInterface(id: string, updates: Partial<AiCommandInterface>): Promise<AiCommandInterface | undefined>;
  getAiCommandsByStatus(status: string): Promise<AiCommandInterface[]>;

  // Additional methods
  getFraudAlerts(userId?: string, resolved?: boolean): Promise<FraudAlert[]>;
  createSecurityMetric(metric: Partial<SecurityMetric>): Promise<SecurityMetric>;
  getSecurityMetrics(filters?: any): Promise<SecurityMetric[]>;
  createBiometricProfile(profile: Partial<BiometricProfile>): Promise<BiometricProfile>;
  getBiometricProfile(userId: string): Promise<BiometricProfile | undefined>;
  updateBiometricProfile(userId: string, updates: Partial<BiometricProfile>): Promise<BiometricProfile | undefined>;

  // Government compliance
  createGovernmentComplianceAudit(audit: Partial<GovernmentComplianceAudit>): Promise<GovernmentComplianceAudit>;
  getGovernmentComplianceAudits(auditType?: string): Promise<GovernmentComplianceAudit[]>;
  updateGovernmentComplianceAudit(id: string, updates: Partial<GovernmentComplianceAudit>): Promise<GovernmentComplianceAudit | undefined>;

  // Statistics
  getStats(): Promise<{
    users: number;
    conversations: number;
    messages: number;
    documents: number;
    securityEvents: number;
    systemMetrics: number;
    auditLogs: number;
    complianceEvents: number;
    userBehaviorProfiles: number;
  }>;
}

/**
 * PostgreSQL Storage Implementation
 * Implements the IStorage interface using Drizzle ORM for database operations
 */
export class PostgreSQLStorage implements IStorage {
  private readonly dbInstance = db;

  // User management
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user by email');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw new Error('Failed to get user by username');
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash password if provided
      let userToCreate = { ...user };
      if ('password' in userToCreate) {
        const hashedPassword = await bcrypt.hash(userToCreate.password as string, 10);
        userToCreate = { ...userToCreate, password: hashedPassword };
      }

      const result = await this.db.insert(users).values({
        ...userToCreate,
        isActive: userToCreate.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      // Hash password if it's being updated
      let updatesToApply = { ...updates };
      if ('password' in updatesToApply) {
        const hashedPassword = await bcrypt.hash(updatesToApply.password as string, 10);
        updatesToApply = { ...updatesToApply, password: hashedPassword };
      }

      const result = await this.db.update(users)
        .set({
          ...updatesToApply,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await this.db.select().from(users);
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  // Session management
  async createSession(session: InsertSession): Promise<Session> {
    try {
      const result = await this.db.insert(sessions).values({
        ...session,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  async getSession(token: string): Promise<Session | undefined> {
    try {
      const result = await this.db.select()
        .from(sessions)
        .where(and(
          eq(sessions.token, token),
          gte(sessions.expiresAt, new Date())
        ))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get session');
    }
  }

  async invalidateSession(token: string): Promise<void> {
    try {
      await this.db.delete(sessions).where(eq(sessions.token, token));
    } catch (error) {
      console.error('Error invalidating session:', error);
      throw new Error('Failed to invalidate session');
    }
  }

  // System monitoring
  async createMetric(metric: {
    metricType: string;
    value: number;
    tags?: Record<string, unknown>;
  }): Promise<void> {
    await this.db.insert(systemMetrics).values({
      metricType: metric.metricType,
      value: metric.value,
      tags: metric.tags
    });
  }

  // Health checks
  async logHealthCheck(result: {
    component: string;
    status: 'healthy' | 'warning' | 'error';
    details: Record<string, unknown>;
    responseTime: number;
  }): Promise<void> {
    await this.db.insert(healthCheckResults).values({
      component: result.component,
      status: result.status,
      details: result.details,
      responseTime: result.responseTime
    });
  }

  // Error handling
  async logErrorCorrection(correction: {
    errorType: string;
    correction: string;
    success: boolean;
    details: Record<string, unknown>;
  }): Promise<void> {
    await this.db.insert(errorCorrections).values({
      errorType: correction.errorType,
      correction: correction.correction,
      success: correction.success,
      details: correction.details
    });
  }

  // Self healing
  async logSelfHealingAction(action: {
    actionType: string;
    status: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await this.db.insert(selfHealingActions).values({
      actionType: action.actionType,
      status: action.status,
      details: action.details
    });
  }
  getPerformanceBaselines(serviceName?: string): Promise<PerformanceBaseline[]>;
  updatePerformanceBaseline(id: string, updates: Partial<PerformanceBaseline>): Promise<PerformanceBaseline | undefined>;
  
  createAlertRule(rule: InsertAlertRule): Promise<AlertRule>;
  getAlertRules(): Promise<AlertRule[]>;
  updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | undefined>;
  
  createCircuitBreakerState(state: InsertCircuitBreakerState): Promise<CircuitBreakerState>;
  getCircuitBreakerState(serviceName: string): Promise<CircuitBreakerState | undefined>;
  updateCircuitBreakerState(serviceName: string, updates: Partial<CircuitBreakerState>): Promise<CircuitBreakerState | undefined>;
  
  createUptimeIncident(incident: InsertUptimeIncident): Promise<UptimeIncident>;
  getUptimeIncidents(serviceId?: string): Promise<UptimeIncident[]>;
  updateUptimeIncident(id: string, updates: Partial<UptimeIncident>): Promise<UptimeIncident | undefined>;
  
  createAutonomousOperation(operation: InsertAutonomousOperation): Promise<AutonomousOperation>;
  getAutonomousOperations(filters?: any): Promise<AutonomousOperation[]>;
  updateAutonomousOperation(id: string, updates: Partial<AutonomousOperation>): Promise<AutonomousOperation | undefined>;
  
  createMaintenanceTask(task: InsertMaintenanceTask): Promise<MaintenanceTask>;
  getMaintenanceTasks(filters?: any): Promise<MaintenanceTask[]>;
  updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask | undefined>;
  
  createGovernmentComplianceAudit(audit: InsertGovernmentComplianceAudit): Promise<GovernmentComplianceAudit>;
  getGovernmentComplianceAudits(auditType?: string): Promise<GovernmentComplianceAudit[]>;
  updateGovernmentComplianceAudit(id: string, updates: Partial<GovernmentComplianceAudit>): Promise<GovernmentComplianceAudit | undefined>;
  
  // Additional methods for specific functionality
  getFraudAlerts(userId?: string, resolved?: boolean): Promise<FraudAlert[]>;
  createSecurityMetric(metric: InsertSecurityMetric): Promise<SecurityMetric>;
  getSecurityMetrics(filters?: any): Promise<SecurityMetric[]>;
  createBiometricProfile(profile: InsertBiometricProfile): Promise<BiometricProfile>;
  getBiometricProfile(userId: string): Promise<BiometricProfile | undefined>;
  updateBiometricProfile(userId: string, updates: Partial<BiometricProfile>): Promise<BiometricProfile | undefined>;

  // Statistics
  getStats(): Promise<{ users: number; conversations: number; messages: number; documents: number; securityEvents: number; systemMetrics: number; auditLogs: number; complianceEvents: number; userBehaviorProfiles: number; }>;
}