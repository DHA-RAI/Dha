import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  jsonb, 
  varchar
} from "drizzle-orm/pg-core";

// Core Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  metadata: jsonb("metadata")
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

// Monitoring Tables
export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  metricType: text("metric_type").notNull(),
  value: integer("value").notNull(),
  tags: jsonb("tags")
});

export const healthCheckResults = pgTable("health_check_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  component: text("component").notNull(),
  status: text("status").notNull(),
  details: jsonb("details").notNull(),
  responseTime: integer("response_time").notNull()
});

export const errorCorrections = pgTable("error_corrections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  errorType: text("error_type").notNull(),
  correction: text("correction").notNull(),
  success: boolean("success").notNull(),
  details: jsonb("details").notNull()
});

export const selfHealingActions = pgTable("self_healing_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  actionType: text("action_type").notNull(),
  status: text("status").notNull(),
  details: jsonb("details")
});