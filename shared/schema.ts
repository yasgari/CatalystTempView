import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const switches = pgTable("switches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  model: text("model").notNull(),
  location: text("location").notNull(),
  rack: text("rack"),
  site: text("site").notNull(),
  switchType: text("switch_type").notNull(), // access, distribution, core
  currentTemperature: real("current_temperature").notNull(),
  isOnline: boolean("is_online").default(true),
  lastUpdate: timestamp("last_update").defaultNow(),
});

export const temperatureReadings = pgTable("temperature_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  switchId: varchar("switch_id").references(() => switches.id).notNull(),
  temperature: real("temperature").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSwitchSchema = createInsertSchema(switches).omit({
  id: true,
  lastUpdate: true,
});

export const insertTemperatureReadingSchema = createInsertSchema(temperatureReadings).omit({
  id: true,
  timestamp: true,
});

export type InsertSwitch = z.infer<typeof insertSwitchSchema>;
export type Switch = typeof switches.$inferSelect;
export type InsertTemperatureReading = z.infer<typeof insertTemperatureReadingSchema>;
export type TemperatureReading = typeof temperatureReadings.$inferSelect;

export type TemperatureStatus = 'normal' | 'warning' | 'critical';

export interface DashboardStats {
  totalSwitches: number;
  onlineSwitches: number;
  alertCount: number;
  avgTemperature: number;
}

export interface TemperatureDistribution {
  normal: number;
  warning: number;
  critical: number;
}

export interface TrendDataPoint {
  timestamp: string;
  [switchName: string]: number | string;
}
