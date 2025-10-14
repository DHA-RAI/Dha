export * from "./tables";

// Audit and Compliance enums
export const AuditActionEnum = {
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_VIEWED: 'document_viewed',
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_MODIFIED: 'document_modified',
  DOCUMENT_VERIFIED: 'document_verified',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  API_CALL: 'api_call',
  DHA_API_CALL: 'dha_api_call',
  SAPS_API_CALL: 'saps_api_call',
  ICAO_API_CALL: 'icao_api_call',
} as const;

export type AuditAction = typeof AuditActionEnum[keyof typeof AuditActionEnum];
export const AuditAction = AuditActionEnum;

export const ComplianceEventTypeEnum = {
  DATA_ACCESSED: 'data_accessed',
  DATA_MODIFIED: 'data_modified',
  DATA_DELETED: 'data_deleted',
  CONSENT_GIVEN: 'consent_given',
  CONSENT_WITHDRAWN: 'consent_withdrawn',
} as const;

export type ComplianceEventType = typeof ComplianceEventTypeEnum[keyof typeof ComplianceEventTypeEnum];
export const ComplianceEventType = ComplianceEventTypeEnum;

// Error Handling Tables
export const errorCorrections = pgTable("error_corrections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  errorType: text("error_type").notNull(),
  correction: text("correction").notNull(),
  success: boolean("success").notNull(),
  details: jsonb("details").notNull()
});

export const healthCheckResults = pgTable("health_check_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  component: text("component").notNull(),
  status: text("status").notNull(),
  details: jsonb("details").notNull(),
  responseTime: integer("response_time").notNull()
});

export const apiAccess = pgTable("api_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: text("api_key_id").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  hourlyQuota: integer("hourly_quota").notNull().default(1000),
  currentHourlyUsage: integer("current_hourly_usage").notNull().default(0),
  lastResetAt: timestamp("last_reset_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  metadata: jsonb("metadata")
});

export const verificationHistory = pgTable("verification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").notNull().references(() => dhaDocumentVerifications.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  location: jsonb("location"),
  userAgent: text("user_agent"),
  verificationMethod: text("verification_method").notNull(),
  isSuccessful: boolean("is_successful").notNull(),
  metadata: jsonb("metadata")
});

// Type exports
export type DhaDocumentVerification = typeof dhaDocumentVerifications.$inferSelect;
export type InsertDhaDocumentVerification = typeof dhaDocumentVerifications.$inferInsert;

export type VerificationSession = typeof verificationSessions.$inferSelect;
export type InsertVerificationSession = typeof verificationSessions.$inferInsert;

export type ApiAccess = typeof apiAccess.$inferSelect;
export type InsertApiAccess = typeof apiAccess.$inferInsert;

export type VerificationHistory = typeof verificationHistory.$inferSelect;
export type InsertVerificationHistory = typeof verificationHistory.$inferInsert;