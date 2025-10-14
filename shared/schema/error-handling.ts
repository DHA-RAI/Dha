import { pgTable, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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