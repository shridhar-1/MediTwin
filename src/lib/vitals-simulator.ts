/**
 * Patient Digital Twin — Vitals Simulator
 *
 * Generates realistic vitals streams for demo/testing.
 * Simulates both normal and deteriorating patient patterns.
 */

import type { VitalsInput } from "./twin-engine";

export type PatientPattern = "stable" | "improving" | "deteriorating" | "critical";

export interface SimulatedVital {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
  bloodGlucose: number;
}

// Normal ranges
const NORMAL: SimulatedVital = {
  heartRate: 72,
  systolicBP: 120,
  diastolicBP: 80,
  spo2: 98,
  temperature: 36.6,
  respiratoryRate: 16,
  bloodGlucose: 100,
};

// Deteriorating ranges
const DETERIORATING: SimulatedVital = {
  heartRate: 95,
  systolicBP: 145,
  diastolicBP: 95,
  spo2: 93,
  temperature: 38.2,
  respiratoryRate: 22,
  bloodGlucose: 180,
};

// Critical ranges
const CRITICAL: SimulatedVital = {
  heartRate: 120,
  systolicBP: 170,
  diastolicBP: 100,
  spo2: 88,
  temperature: 39.5,
  respiratoryRate: 28,
  bloodGlucose: 280,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function addNoise(base: number, percent: number): number {
  const noise = (Math.random() - 0.5) * 2 * (percent / 100) * base;
  return Math.round((base + noise) * 10) / 10;
}

export function generateVital(pattern: PatientPattern, tick: number = 0): VitalsInput {
  let target: SimulatedVital;

  switch (pattern) {
    case "stable":
      target = NORMAL;
      break;
    case "improving":
      target = {
        ...DETERIORATING,
        heartRate: lerp(DETERIORATING.heartRate, NORMAL.heartRate, tick * 0.05),
        spo2: lerp(DETERIORATING.spo2, NORMAL.spo2, tick * 0.05),
        temperature: lerp(DETERIORATING.temperature, NORMAL.temperature, tick * 0.05),
      };
      break;
    case "deteriorating":
      target = {
        ...NORMAL,
        heartRate: lerp(NORMAL.heartRate, DETERIORATING.heartRate, tick * 0.03),
        spo2: lerp(NORMAL.spo2, DETERIORATING.spo2, tick * 0.03),
        systolicBP: lerp(NORMAL.systolicBP, DETERIORATING.systolicBP, tick * 0.03),
      };
      break;
    case "critical":
      target = CRITICAL;
      break;
  }

  return {
    heartRate: Math.round(addNoise(target.heartRate, 5)),
    systolicBP: Math.round(addNoise(target.systolicBP, 4)),
    diastolicBP: Math.round(addNoise(target.diastolicBP, 6)),
    spo2: Math.min(100, Math.round(addNoise(target.spo2, 2))),
    temperature: parseFloat(addNoise(target.temperature, 1).toFixed(1)),
    respiratoryRate: Math.round(addNoise(target.respiratoryRate, 8)),
    bloodGlucose: Math.round(addNoise(target.bloodGlucose, 10)),
  };
}

/**
 * Generate a batch of historical vitals (for seeding a twin's timeline)
 */
export function generateHistoricalVitals(
  pattern: PatientPattern,
  count: number = 50,
  intervalMinutes: number = 30
): VitalsInput[] {
  const vitals: VitalsInput[] = [];
  for (let i = 0; i < count; i++) {
    vitals.push(generateVital(pattern, i));
  }
  return vitals;
}
