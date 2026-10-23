/**
 * Synthetic Data Generator for Digital Twin
 *
 * Generates anonymized synthetic patient data compliant with DPDP Act.
 * Two streams:
 *   - Static/Historical: Simulated EHR (demographics, labs, genetics)
 *   - Dynamic/Real-Time: Simulated wearable telemetry (CGM, HR, steps, sleep)
 *
 * Based on clinical distributions from ICMR-INDIAB, RSSDI, and ADA guidelines.
 */

export interface SyntheticEHR {
  // Demographics
  age: number;
  gender: "male" | "female" | "other";
  ethnicity: "south_indian" | "north_indian" | "other";
  bmi: number;
  waistCm: number;

  // Diabetes specifics
  diabetesDurationYears: number;
  hba1c: number;            // %
  fastingGlucose: number;   // mg/dL
  postprandialGlucose: number; // mg/dL
  fastingInsulin: number;   // μU/mL
  homaIR: number;           // insulin resistance index

  // Labs
  ldl: number;              // mg/dL
  hdl: number;              // mg/dL
  triglycerides: number;    // mg/dL
  creatinine: number;       // mg/dL
  egfr: number;             // mL/min/1.73m²
  urineAlbumin: number;     // mg/g

  // Genetic markers (Indian population allele frequencies)
  tcf7l2RiskAllele: boolean; // TCF7L2 rs7903146
  pnpla3RiskAllele: boolean; // PNPLA3 rs738409

  // Comorbidities
  hypertension: boolean;
  dyslipidemia: boolean;
  cardiovascularDisease: boolean;
  retinopathy: boolean;
  neuropathy: boolean;

  // Medications
  medications: {
    name: string;
    dose: string;
    frequency: string;
  }[];

  // Lifestyle
  smokingStatus: "never" | "former" | "current";
  alcoholUse: boolean;
  physicalActivityMinutesPerWeek: number;
  dietCarbPercentage: number;
}

export interface WearableReading {
  timestamp: string;        // ISO
  glucose: number;          // mg/dL (CGM)
  heartRate: number;        // bpm
  hrRmssd: number;          // ms (HRV)
  steps: number;            // count
  sleepStage: "awake" | "light" | "deep" | "rem";
  sleepHours: number;
  caloriesBurned: number;
  mealDetected: boolean;
  stressLevel: number;      // 0-100
}

export interface SyntheticPatient {
  ehr: SyntheticEHR;
  wearableData: WearableReading[]; // 24h of 5-min readings = 288 points
}

// ─────────────────────────────────────────────────────────────
// GENERATE SYNTHETIC PATIENT
// ─────────────────────────────────────────────────────────────
export function generateSyntheticPatient(
  severity: "well_controlled" | "moderate" | "poor" = "moderate"
): SyntheticPatient {
  const ehr = generateEHR(severity);
  const wearableData = generateWearableStream(ehr, severity);
  return { ehr, wearableData };
}

function generateEHR(severity: string): SyntheticEHR {
  const baseRanges: Record<string, { hba1c: [number, number]; fastingGlucose: [number, number] }> = {
    well_controlled: { hba1c: [6.0, 7.0], fastingGlucose: [80, 110] },
    moderate:        { hba1c: [7.0, 9.0], fastingGlucose: [110, 180] },
    poor:            { hba1c: [9.0, 13.0], fastingGlucose: [180, 320] },
  };

  const range = baseRanges[severity];
  const hba1c = rand(range.hba1c[0], range.hba1c[1]);
  const fastingGlucose = rand(range.fastingGlucose[0], range.fastingGlucose[1]);

  return {
    age: Math.floor(rand(35, 70)),
    gender: (["male", "female", "other"] as const)[Math.floor(Math.random() * 3)],
    ethnicity: (["south_indian", "north_indian", "other"] as const)[Math.floor(Math.random() * 3)],
    bmi: rand(22, 35),
    waistCm: rand(80, 115),
    diabetesDurationYears: Math.floor(rand(1, 20)),
    hba1c: parseFloat(hba1c.toFixed(1)),
    fastingGlucose: Math.round(fastingGlucose),
    postprandialGlucose: Math.round(fastingGlucose * rand(1.3, 1.8)),
    fastingInsulin: rand(5, 30),
    homaIR: parseFloat(rand(1.5, 12).toFixed(2)),
    ldl: rand(80, 180),
    hdl: rand(30, 60),
    triglycerides: rand(100, 300),
    creatinine: rand(0.6, 2.0),
    egfr: Math.round(rand(45, 120)),
    urineAlbumin: rand(10, 500),
    tcf7l2RiskAllele: Math.random() > 0.6,
    pnpla3RiskAllele: Math.random() > 0.7,
    hypertension: Math.random() > 0.4,
    dyslipidemia: Math.random() > 0.5,
    cardiovascularDisease: Math.random() > 0.8,
    retinopathy: Math.random() > 0.75,
    neuropathy: Math.random() > 0.8,
    medications: generateMedications(severity),
    smokingStatus: (["never", "former", "current"] as const)[Math.floor(Math.random() * 3)],
    alcoholUse: Math.random() > 0.6,
    physicalActivityMinutesPerWeek: Math.floor(rand(0, 180)),
    dietCarbPercentage: Math.floor(rand(45, 70)),
  };
}

function generateMedications(severity: string): SyntheticEHR["medications"] {
  const meds: SyntheticEHR["medications"] = [];
  if (severity !== "well_controlled") {
    meds.push({ name: "Metformin", dose: "500mg", frequency: "twice daily" });
  }
  if (severity === "poor" && Math.random() > 0.5) {
    meds.push({ name: "Glimepiride", dose: "2mg", frequency: "once daily" });
  }
  if (Math.random() > 0.7) {
    meds.push({ name: "Empagliflozin", dose: "10mg", frequency: "once daily" });
  }
  if (Math.random() > 0.6) {
    meds.push({ name: "Atorvastatin", dose: "10mg", frequency: "once daily" });
  }
  return meds;
}

// ─────────────────────────────────────────────────────────────
// GENERATE 24H WEARABLE STREAM (5-min intervals = 288 readings)
// ─────────────────────────────────────────────────────────────
export function generateWearableStream(
  ehr: SyntheticEHR,
  severity: string,
  hours: number = 24
): WearableReading[] {
  const readings: WearableReading[] = [];
  const intervals = (hours * 60) / 5; // 5-min intervals

  let glucose = ehr.fastingGlucose;
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start from midnight

  // Simulate meals at 8am, 1pm, 8pm
  const mealTimes = [48, 156, 288]; // in 5-min intervals

  for (let i = 0; i < intervals; i++) {
    const hour = (i * 5) / 60;
    let mealEffect = 0;

    // Meal glucose spikes
    for (const mealTime of mealTimes) {
      const distFromMeal = Math.abs(i - mealTime);
      if (distFromMeal < 24) {
        // 2-hour post-meal spike
        const spikeFactor = 1 - distFromMeal / 24;
        mealEffect += spikeFactor * rand(30, 80);
      }
    }

    // Severity-based baseline glucose variation
    const baselineVar = severity === "poor" ? rand(-20, 30) : severity === "moderate" ? rand(-10, 15) : rand(-5, 5);

    // Circadian pattern
    const circadian = hour >= 2 && hour <= 6 ? -10 : 0;

    // Physical activity effect (more steps → lower glucose)
    const activityEffect = hour >= 7 && hour <= 20 ? -rand(2, 8) : 0;

    // Stress effect
    const stressEffect = Math.random() > 0.9 ? rand(10, 30) : 0;

    glucose = Math.max(40, glucose + baselineVar + mealEffect + circadian + activityEffect + stressEffect);
    // Slow return to baseline
    glucose = glucose * 0.97 + ehr.fastingGlucose * 0.03;

    const hrBaseline = 70 + (severity === "poor" ? 10 : 0);
    const hrVar = hour >= 22 || hour <= 6 ? rand(-10, 0) : rand(-5, 15);
    const heartRate = Math.round(hrBaseline + hrVar + mealEffect * 0.3);

    const stepsPerInterval = hour >= 7 && hour <= 22 ? Math.floor(rand(0, 30)) : 0;

    const sleepStage: WearableReading["sleepStage"] =
      hour >= 23 || hour <= 6 ? (hour >= 1 && hour <= 4 ? "deep" : "light") : "awake";

    const timestamp = new Date(now.getTime() + i * 5 * 60 * 1000).toISOString();

    readings.push({
      timestamp,
      glucose: Math.round(glucose * 10) / 10,
      heartRate: Math.max(50, Math.min(140, heartRate)),
      hrRmssd: Math.round(rand(15, 60)),
      steps: stepsPerInterval,
      sleepStage,
      sleepHours: parseFloat(rand(5, 8).toFixed(1)),
      caloriesBurned: Math.round(rand(1, 4)),
      mealDetected: mealEffect > 30,
      stressLevel: Math.round(rand(10, 80)),
    });
  }

  return readings;
}

// ─────────────────────────────────────────────────────────────
// DETECT ADVERSE EVENTS (for labeling training data)
// ─────────────────────────────────────────────────────────────
export function detectAdverseEvents(readings: WearableReading[]): {
  hyperglycemia: { index: number; glucose: number; timestamp: string }[];
  hypoglycemia: { index: number; glucose: number; timestamp: string }[];
  highHeartRate: { index: number; hr: number; timestamp: string }[];
} {
  const hyperglycemia: { index: number; glucose: number; timestamp: string }[] = [];
  const hypoglycemia: { index: number; glucose: number; timestamp: string }[] = [];
  const highHeartRate: { index: number; hr: number; timestamp: string }[] = [];

  readings.forEach((r, i) => {
    if (r.glucose > 180) hyperglycemia.push({ index: i, glucose: r.glucose, timestamp: r.timestamp });
    if (r.glucose < 70) hypoglycemia.push({ index: i, glucose: r.glucose, timestamp: r.timestamp });
    if (r.heartRate > 120) highHeartRate.push({ index: i, hr: r.heartRate, timestamp: r.timestamp });
  });

  return { hyperglycemia, hypoglycemia, highHeartRate };
}

// ─────────────────────────────────────────────────────────────
// COHORT GENERATOR (for training/validation datasets)
// ─────────────────────────────────────────────────────────────
export function generateSyntheticCohort(
  size: number = 100,
  severityDistribution = { well_controlled: 0.3, moderate: 0.5, poor: 0.2 }
): SyntheticPatient[] {
  const cohort: SyntheticPatient[] = [];
  const keys = Object.keys(severityDistribution) as Array<keyof typeof severityDistribution>;

  for (let i = 0; i < size; i++) {
    const r = Math.random();
    let cumulative = 0;
    let severity: "well_controlled" | "moderate" | "poor" = "moderate";

    for (const key of keys) {
      cumulative += severityDistribution[key];
      if (r <= cumulative) {
        severity = key;
        break;
      }
    }

    cohort.push(generateSyntheticPatient(severity));
  }

  return cohort;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
