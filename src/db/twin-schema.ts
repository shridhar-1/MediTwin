/**
 * Patient Digital Twin — Extended Schema
 *
 * Adds Digital Twin tables on top of the base MediKiosk schema.
 * Each patient gets a living "twin" that tracks:
 *   - Current health state (Twin State Machine)
 *   - Real-time / simulated vitals stream
 *   - Point-in-time snapshots (audit trail)
 *   - AI-computed risk scores
 *   - Disease trajectory predictions
 *   - Treatment what-if simulations
 */

import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────
// 1. DIGITAL TWIN — one per patient, the living model
// ─────────────────────────────────────────────────────────────
export const digitalTwins = pgTable("digital_twins", {
  id: uuid("id").primaryKey(),
  patientId: uuid("patient_id").notNull(), // FK to patients.id (soft ref)
  twinState: text("twin_state").notNull().default("baseline"),
  // States: baseline | stable | monitoring | at_risk | critical | deteriorating
  healthScore: decimal("health_score", { precision: 5, scale: 2 })
    .notNull()
    .default("100"),
  // 0–100 composite health score
  age: integer("age"),
  gender: text("gender"),
  chronicConditions: jsonb("chronic_conditions").$type<string[]>(),
  currentMedications: jsonb("current_medications").$type<
    { name: string; dose: string; frequency: string }[]
  >(),
  allergies: jsonb("allergies").$type<string[]>(),
  lastUpdatedBy: text("last_updated_by"), // "ai" | "physician" | "device"
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

// ─────────────────────────────────────────────────────────────
// 2. VITAL EVENTS — real-time / simulated vitals stream
// ─────────────────────────────────────────────────────────────
export const vitalEvents = pgTable("vital_events", {
  id: uuid("id").primaryKey(),
  twinId: uuid("twin_id").notNull(), // FK to digitalTwins.id
  source: text("source").notNull().default("simulated"),
  // simulated | iot_device | manual | wearable
  heartRate: integer("heart_rate"),       // bpm
  systolicBP: integer("systolic_bp"),     // mmHg
  diastolicBP: integer("diastolic_bp"),   // mmHg
  spo2: integer("spo2"),                  // %
  temperature: decimal("temperature", { precision: 4, scale: 1 }), // °C
  respiratoryRate: integer("respiratory_rate"), // /min
  bloodGlucose: decimal("blood_glucose", { precision: 5, scale: 1 }), // mg/dL
  recordedAt: timestamp("recorded_at", { mode: "date" }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 3. TWIN SNAPSHOTS — point-in-time full state (audit trail)
// ─────────────────────────────────────────────────────────────
export const twinSnapshots = pgTable("twin_snapshots", {
  id: uuid("id").primaryKey(),
  twinId: uuid("twin_id").notNull(),
  snapshotVersion: integer("snapshot_version").notNull(),
  trigger: text("trigger").notNull(),
  // new_visit | vitals_change | physician_review | prediction_update | scheduled
  fullState: jsonb("full_state").$type<Record<string, unknown>>(),
  // Complete twin state at this moment
  healthScore: decimal("health_score", { precision: 5, scale: 2 }),
  deltaSummary: text("delta_summary"),
  // Human-readable diff from previous snapshot
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 4. RISK SCORES — AI / rule-based computed risks
// ─────────────────────────────────────────────────────────────
export const riskScores = pgTable("risk_scores", {
  id: uuid("id").primaryKey(),
  twinId: uuid("twin_id").notNull(),
  riskType: text("risk_type").notNull(),
  // readmission_30d | sepsis | cardiovascular | diabetes_control
  // medication_adverse | deterioration | fall_risk
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  // 0–100
  level: text("level").notNull(), // low | medium | high | critical
  contributingFactors: jsonb("contributing_factors").$type<
    { factor: string; weight: number }[]
  >(),
  aiModel: text("ai_model"),
  // "rule_engine" | "groq:gpt-oss-120b" | "gemini"
  computedAt: timestamp("computed_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
});

// ─────────────────────────────────────────────────────────────
// 5. PREDICTIONS — AI-generated future trajectory
// ─────────────────────────────────────────────────────────────
export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey(),
  twinId: uuid("twin_id").notNull(),
  predictionType: text("prediction_type").notNull(),
  // disease_progression | readmission | vitals_forecast | complication
  horizon: text("horizon").notNull(),
  // 24h | 7d | 30d | 90d
  summary: text("summary").notNull(),
  probability: decimal("probability", { precision: 5, scale: 2 }),
  trajectory: jsonb("trajectory").$type<
    {
      timepoint: string;
      healthScore: number;
      risk: string;
      keyChanges: string[];
    }[]
  >(),
  // AI-generated trajectory points
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  aiModel: text("ai_model"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────
// 6. SIMULATIONS — treatment what-if scenarios
// ─────────────────────────────────────────────────────────────
export const simulations = pgTable("simulations", {
  id: uuid("id").primaryKey(),
  twinId: uuid("twin_id").notNull(),
  scenarioName: text("scenario_name").notNull(),
  intervention: jsonb("intervention").$type<{
    type: string; // medication_change | lifestyle | procedure | diet
    details: string;
  }>(),
  outcomeSummary: text("outcome_summary"),
  outcomeTrajectory: jsonb("outcome_trajectory").$type<
    {
      timepoint: string;
      healthScore: number;
      risks: string[];
    }[]
  >(),
  comparator: text("comparator"),
  // "current_plan" | "no_intervention"
  status: text("status").notNull().default("pending"),
  // pending | running | completed
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

// ─────────────────────────────────────────────────────────────
// 7. DEVICE INTEGRATIONS — IoT / wearable connections
// ─────────────────────────────────────────────────────────────
export const deviceIntegrations = pgTable("device_integrations", {
  id: uuid("id").primaryKey(),
  twinId: uuid("twin_id").notNull(),
  deviceType: text("device_type").notNull(),
  // pulse_oximeter | bp_monitor | glucometer | smartwatch | ecg
  deviceId: text("device_id"),
  connectionStatus: text("connection_status").notNull().default("disconnected"),
  // connected | disconnected | error
  lastReadingAt: timestamp("last_reading_at", { mode: "date" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// TypeScript types
// ─────────────────────────────────────────────────────────────
export type DigitalTwin = typeof digitalTwins.$inferSelect;
export type VitalEvent = typeof vitalEvents.$inferSelect;
export type TwinSnapshot = typeof twinSnapshots.$inferSelect;
export type RiskScore = typeof riskScores.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type Simulation = typeof simulations.$inferSelect;
export type DeviceIntegration = typeof deviceIntegrations.$inferSelect;
