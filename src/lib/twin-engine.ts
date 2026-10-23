/**
 * Patient Digital Twin — Core Engine
 *
 * The "brain" of the Digital Twin. Responsible for:
 *   1. Creating a twin from patient data
 *   2. Updating twin state from new clinical events
 *   3. Computing composite health score
 *   4. Determining twin state transitions (state machine)
 *   5. Taking snapshots for audit trail
 */

import { db } from "@/db";
import {
  digitalTwins,
  twinSnapshots,
  vitalEvents,
  riskScores,
} from "@/db/twin-schema";
import { patients, clinicalSummaries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nid as uuidv4 } from "./ids";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export type TwinState =
  | "baseline"
  | "stable"
  | "monitoring"
  | "at_risk"
  | "critical"
  | "deteriorating";

export interface TwinCreationInput {
  patientId: string;
  age: number;
  gender: string;
  chronicConditions?: string[];
  currentMedications?: { name: string; dose: string; frequency: string }[];
  allergies?: string[];
}

export interface VitalsInput {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  bloodGlucose?: number;
}

export interface TwinUpdate {
  twinId: string;
  newVitals?: VitalsInput;
  newDiagnosis?: string;
  newMedication?: { name: string; dose: string; frequency: string };
  clinicalSummaryId?: string;
}

// ─────────────────────────────────────────────────────────────
// 1. CREATE TWIN
// ─────────────────────────────────────────────────────────────
export async function createTwin(input: TwinCreationInput) {
  const twinId = uuidv4();

  await db.insert(digitalTwins).values({
    id: twinId,
    patientId: input.patientId,
    twinState: "baseline",
    healthScore: "100.00",
    age: input.age,
    gender: input.gender,
    chronicConditions: input.chronicConditions ?? [],
    currentMedications: input.currentMedications ?? [],
    allergies: input.allergies ?? [],
    lastUpdatedBy: "system",
  });

  // Initial snapshot
  await takeSnapshot(twinId, "twin_created", "Baseline twin created from patient data", "100.00");

  return twinId;
}

// ─────────────────────────────────────────────────────────────
// 2. UPDATE TWIN — main entry point for any state change
// ────────────────────────────────────────────────────────────
export async function updateTwin(input: TwinUpdate) {
  const { twinId, newVitals } = input;

  let scoreDelta = 0;
  const changes: string[] = [];

  // 2a. Process new vitals
  if (newVitals) {
    await recordVitals(twinId, newVitals);
    const scoreImpact = computeVitalsImpact(newVitals);
    scoreDelta += scoreImpact.delta;
    changes.push(...scoreImpact.reasons);
  }

  // 2b. Process new diagnosis
  if (input.newDiagnosis) {
    scoreDelta -= 5; // Diagnoses reduce health score
    changes.push(`New diagnosis: ${input.newDiagnosis}`);
  }

  // 2c. Fetch current twin state
  const [twin] = await db
    .select()
    .from(digitalTwins)
    .where(eq(digitalTwins.id, twinId));

  if (!twin) throw new Error(`Twin ${twinId} not found`);

  const currentScore = parseFloat(twin.healthScore);
  const newScore = Math.max(0, Math.min(100, currentScore + scoreDelta));
  const newState = determineTwinState(newScore, twin.twinState as TwinState);

  // 2d. Update twin record
  await db
    .update(digitalTwins)
    .set({
      healthScore: newScore.toFixed(2),
      twinState: newState,
      updatedAt: new Date(),
      lastUpdatedBy: "engine",
    })
    .where(eq(digitalTwins.id, twinId));

  // 2e. Take snapshot
  const deltaSummary = changes.length > 0 ? changes.join("; ") : "No significant changes";
  await takeSnapshot(
    twinId,
    "vitals_change",
    deltaSummary,
    newScore.toFixed(2)
  );

  // 2f. Re-evaluate risk scores
  await recomputeRisks(twinId);

  return {
    twinId,
    previousScore: currentScore,
    newScore,
    previousState: twin.twinState,
    newState,
    changes,
  };
}

// ─────────────────────────────────────────────────────────────
// 3. RECORD VITALS
// ─────────────────────────────────────────────────────────────
export async function recordVitals(twinId: string, vitals: VitalsInput) {
  await db.insert(vitalEvents).values({
    id: uuidv4(),
    twinId,
    source: "simulated",
    heartRate: vitals.heartRate ?? null,
    systolicBP: vitals.systolicBP ?? null,
    diastolicBP: vitals.diastolicBP ?? null,
    spo2: vitals.spo2 ?? null,
    temperature: vitals.temperature ? vitals.temperature.toFixed(1) : null,
    respiratoryRate: vitals.respiratoryRate ?? null,
    bloodGlucose: vitals.bloodGlucose ? vitals.bloodGlucose.toFixed(1) : null,
  });
}

// ────────────────────────────────────────────────────────────
// 4. COMPUTE VITALS IMPACT ON HEALTH SCORE
// ─────────────────────────────────────────────────────────────
export function computeVitalsImpact(vitals: VitalsInput): {
  delta: number;
  reasons: string[];
} {
  let delta = 0;
  const reasons: string[] = [];

  // Heart rate: normal 60-100
  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate < 50 || vitals.heartRate > 120) {
      delta -= 10;
      reasons.push(`HR ${vitals.heartRate} bpm — abnormal`);
    } else if (vitals.heartRate < 60 || vitals.heartRate > 100) {
      delta -= 3;
      reasons.push(`HR ${vitals.heartRate} bpm — borderline`);
    }
  }

  // Blood pressure: normal ~120/80
  if (vitals.systolicBP !== undefined) {
    if (vitals.systolicBP > 180 || vitals.systolicBP < 90) {
      delta -= 15;
      reasons.push(`SBP ${vitals.systolicBP} — critical`);
    } else if (vitals.systolicBP > 140 || vitals.systolicBP < 90) {
      delta -= 5;
      reasons.push(`SBP ${vitals.systolicBP} — elevated`);
    }
  }

  // SpO2: normal 95-100%
  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 90) {
      delta -= 20;
      reasons.push(`SpO2 ${vitals.spo2}% — critical hypoxia`);
    } else if (vitals.spo2 < 95) {
      delta -= 8;
      reasons.push(`SpO2 ${vitals.spo2}% — low`);
    }
  }

  // Temperature: normal 36.1-37.2
  if (vitals.temperature !== undefined) {
    const temp = parseFloat(String(vitals.temperature));
    if (temp > 39.5 || temp < 35) {
      delta -= 15;
      reasons.push(`Temp ${temp}°C — critical`);
    } else if (temp > 38 || temp < 36) {
      delta -= 5;
      reasons.push(`Temp ${temp}°C — fever/hypothermia`);
    }
  }

  // Blood glucose: normal 70-140 mg/dL
  if (vitals.bloodGlucose !== undefined) {
    const bg = parseFloat(String(vitals.bloodGlucose));
    if (bg > 300 || bg < 50) {
      delta -= 18;
      reasons.push(`Glucose ${bg} mg/dL — critical`);
    } else if (bg > 200 || bg < 70) {
      delta -= 8;
      reasons.push(`Glucose ${bg} mg/dL — abnormal`);
    }
  }

  return { delta, reasons };
}

// ─────────────────────────────────────────────────────────────
// 5. DETERMINE TWIN STATE (State Machine)
// ─────────────────────────────────────────────────────────────
export function determineTwinState(
  healthScore: number,
  currentState: TwinState
): TwinState {
  if (healthScore < 20) return "critical";
  if (healthScore < 40) return "deteriorating";
  if (healthScore < 60) return "at_risk";
  if (healthScore < 75) return "monitoring";
  if (healthScore < 90) return "stable";
  return "baseline";
}

// ─────────────────────────────────────────────────────────────
// 6. TAKE SNAPSHOT
// ─────────────────────────────────────────────────────────────
async function takeSnapshot(
  twinId: string,
  trigger: string,
  deltaSummary: string,
  healthScore: string
) {
  const [twin] = await db
    .select()
    .from(digitalTwins)
    .where(eq(digitalTwins.id, twinId));

  // Count existing snapshots for versioning
  const existing = await db
    .select({ count: twinSnapshots.id })
    .from(twinSnapshots)
    .where(eq(twinSnapshots.twinId, twinId));

  const version = existing.length + 1;

  await db.insert(twinSnapshots).values({
    id: uuidv4(),
    twinId,
    snapshotVersion: version,
    trigger,
    fullState: {
      twinState: twin?.twinState,
      healthScore: twin?.healthScore,
      age: twin?.age,
      gender: twin?.gender,
      chronicConditions: twin?.chronicConditions,
      currentMedications: twin?.currentMedications,
      allergies: twin?.allergies,
    },
    healthScore,
    deltaSummary,
  });
}

// ────────────────────────────────────────────────────────────
// 7. RECOMPUTE RISK SCORES
// ────────────────────────────────────────────────────────────
export async function recomputeRisks(twinId: string) {
  const [twin] = await db
    .select()
    .from(digitalTwins)
    .where(eq(digitalTwins.id, twinId));

  if (!twin) return;

  const score = parseFloat(twin.healthScore);
  const conditions = (twin.chronicConditions as string[]) ?? [];
  const risks: {
    type: string;
    score: number;
    level: string;
    factors: { factor: string; weight: number }[];
  }[] = [];

  // Readmission risk
  let readmissionScore = 30;
  const readmissionFactors: { factor: string; weight: number }[] = [];
  if (score < 60) {
    readmissionScore += 30;
    readmissionFactors.push({ factor: "Low health score", weight: 30 });
  }
  if (conditions.length >= 3) {
    readmissionScore += 20;
    readmissionFactors.push({ factor: "Multiple chronic conditions", weight: 20 });
  }
  if (score < 40) {
    readmissionScore += 20;
    readmissionFactors.push({ factor: "Critical health state", weight: 20 });
  }
  readmissionScore = Math.min(100, readmissionScore);
  risks.push({
    type: "readmission_30d",
    score: readmissionScore,
    level: getRiskLevel(readmissionScore),
    factors: readmissionFactors,
  });

  // Cardiovascular risk
  let cvScore = 20;
  const cvFactors: { factor: string; weight: number }[] = [];
  if (conditions.includes("hypertension") || conditions.includes("diabetes")) {
    cvScore += 30;
    cvFactors.push({ factor: "Hypertension/Diabetes history", weight: 30 });
  }
  if (twin.age && twin.age > 60) {
    cvScore += 15;
    cvFactors.push({ factor: "Age > 60", weight: 15 });
  }
  if (score < 50) {
    cvScore += 25;
    cvFactors.push({ factor: "Low health score", weight: 25 });
  }
  cvScore = Math.min(100, cvScore);
  risks.push({
    type: "cardiovascular",
    score: cvScore,
    level: getRiskLevel(cvScore),
    factors: cvFactors,
  });

  // Deterioration risk
  const deteriorateScore = score < 50 ? 70 : score < 70 ? 40 : 15;
  risks.push({
    type: "deterioration",
    score: deteriorateScore,
    level: getRiskLevel(deteriorateScore),
    factors: [{ factor: `Health score: ${score}`, weight: deteriorateScore }],
  });

  // Delete old risks and insert new ones
  await db.delete(riskScores).where(eq(riskScores.twinId, twinId));

  for (const risk of risks) {
    await db.insert(riskScores).values({
      id: uuidv4(),
      twinId,
      riskType: risk.type,
      score: risk.score.toFixed(2),
      level: risk.level,
      contributingFactors: risk.factors,
      aiModel: "rule_engine",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }
}

function getRiskLevel(score: number): string {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

// ────────────────────────────────────────────────────────────
// 8. GET TWIN BY PATIENT
// ────────────────────────────────────────────────────────────
export async function getTwinByPatient(patientId: string) {
  const results = await db
    .select()
    .from(digitalTwins)
    .where(eq(digitalTwins.patientId, patientId))
    .orderBy(desc(digitalTwins.createdAt))
    .limit(1);
  return results[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// 9. GET TWIN BY ID
// ─────────────────────────────────────────────────────────────
export async function getTwinById(twinId: string) {
  const results = await db
    .select()
    .from(digitalTwins)
    .where(eq(digitalTwins.id, twinId))
    .limit(1);
  return results[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// 10. GET RECENT VITALS
// ─────────────────────────────────────────────────────────────
export async function getRecentVitals(twinId: string, limit = 50) {
  return db
    .select()
    .from(vitalEvents)
    .where(eq(vitalEvents.twinId, twinId))
    .orderBy(desc(vitalEvents.recordedAt))
    .limit(limit);
}

// ─────────────────────────────────────────────────────────────
// 11. GET RISK SCORES
// ─────────────────────────────────────────────────────────────
export async function getRisksForTwin(twinId: string) {
  return db
    .select()
    .from(riskScores)
    .where(eq(riskScores.twinId, twinId))
    .orderBy(desc(riskScores.computedAt));
}
