/**
 * Patient Digital Twin — Simulation Engine
 *
 * "What-if" treatment scenario simulator.
 * Allows physicians to model different interventions and see predicted outcomes
 * on the patient's Digital Twin BEFORE applying them in real life.
 *
 * Scenario types:
 *   - Medication change (add/remove/adjust dose)
 *   - Lifestyle intervention (diet, exercise, weight management)
 *   - Procedure/surgery
 *   - Treatment protocol change
 */

import { db } from "@/db";
import { simulations, digitalTwins } from "@/db/twin-schema";
import { eq, desc } from "drizzle-orm";
import { nid as uuidv4 } from "./ids";
import { getTwinById } from "./twin-engine";

export interface SimulationRequest {
  twinId: string;
  scenarioName: string;
  intervention: {
    type: "medication_change" | "lifestyle" | "procedure" | "diet";
    details: string;
  };
  comparator?: string;
  createdBy?: string;
}

export interface SimulationOutcome {
  id: string;
  scenarioName: string;
  outcomeSummary: string;
  outcomeTrajectory: {
    timepoint: string;
    healthScore: number;
    risks: string[];
  }[];
  status: "completed";
}

// ────────────────────────────────────────────────────────────
// 1. CREATE & RUN SIMULATION
// ────────────────────────────────────────────────────────────
export async function createSimulation(
  request: SimulationRequest
): Promise<SimulationOutcome> {
  const twin = await getTwinById(request.twinId);
  if (!twin) throw new Error(`Twin ${request.twinId} not found`);

  const baseScore = parseFloat(twin.healthScore);
  const conditions = (twin.chronicConditions as string[]) ?? [];
  const simId = uuidv4();

  // Insert initial record
  await db.insert(simulations).values({
    id: simId,
    twinId: request.twinId,
    scenarioName: request.scenarioName,
    intervention: request.intervention as any,
    outcomeSummary: null,
    outcomeTrajectory: null,
    comparator: request.comparator ?? "current_plan",
    status: "running",
    createdBy: request.createdBy,
  });

  // Run the simulation logic
  const outcome = runSimulationLogic(baseScore, conditions, request.intervention);

  // Update the record with results
  await db
    .update(simulations)
    .set({
      outcomeSummary: outcome.outcomeSummary,
      outcomeTrajectory: outcome.outcomeTrajectory as any,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(simulations.id, simId));

  return { ...outcome, id: simId, status: "completed" };
}

// ────────────────────────────────────────────────────────────
// 2. SIMULATION LOGIC (rule-based predictive model)
// ────────────────────────────────────────────────────────────
function runSimulationLogic(
  baseScore: number,
  conditions: string[],
  intervention: { type: string; details: string }
): Omit<SimulationOutcome, "id" | "status"> {
  let scoreImprovement = 0;
  const improvementReasons: string[] = [];
  const newRisks: string[] = [];

  switch (intervention.type) {
    case "medication_change": {
      // Medication changes: +15-30 over 3 months if appropriate
      scoreImprovement = 20;
      improvementReasons.push("Medication optimization initiated");

      if (conditions.includes("hypertension")) {
        improvementReasons.push("BP control expected within 4-6 weeks");
        scoreImprovement += 5;
      }
      if (conditions.includes("diabetes")) {
        improvementReasons.push("HbA1c reduction expected in 8-12 weeks");
        scoreImprovement += 5;
      }
      // Side effect risk
      newRisks.push("Monitor for adverse drug reactions (Week 1-2)");
      break;
    }

    case "lifestyle": {
      // Lifestyle: slower but sustainable +10-20 over 6 months
      scoreImprovement = 15;
      improvementReasons.push("Lifestyle modification program started");
      improvementReasons.push("Expected benefits in 8-12 weeks");
      newRisks.push("Adherence monitoring required");
      if (baseScore < 50) {
        newRisks.push("Supervised exercise recommended initially");
      }
      break;
    }

    case "procedure": {
      // Procedure: immediate +25-40 but with short-term risk
      scoreImprovement = 30;
      improvementReasons.push("Procedure expected to address primary concern");
      newRisks.push("Post-procedure recovery period (1-2 weeks)");
      newRisks.push("Infection risk monitoring required");
      if (baseScore < 40) {
        newRisks.push("High surgical risk — ICU monitoring recommended");
        scoreImprovement -= 10;
      }
      break;
    }

    case "diet": {
      // Diet: gradual +10-15 over 3 months
      scoreImprovement = 12;
      improvementReasons.push("Dietary intervention initiated");
      if (conditions.includes("diabetes")) {
        improvementReasons.push("Carbohydrate management for glucose control");
        scoreImprovement += 3;
      }
      if (conditions.includes("hypertension")) {
        improvementReasons.push("DASH diet for BP management");
        scoreImprovement += 3;
      }
      newRisks.push("Nutritional monitoring recommended");
      break;
    }

    default: {
      scoreImprovement = 5;
      improvementReasons.push("General intervention applied");
    }
  }

  scoreImprovement = Math.min(40, Math.max(-10, scoreImprovement));

  const trajectory = [
    {
      timepoint: "Week 1",
      healthScore: Math.min(100, baseScore + scoreImprovement * 0.1),
      risks: newRisks.slice(0, 2),
    },
    {
      timepoint: "Week 2",
      healthScore: Math.min(100, baseScore + scoreImprovement * 0.2),
      risks: newRisks.slice(0, 1),
    },
    {
      timepoint: "Week 4",
      healthScore: Math.min(100, baseScore + scoreImprovement * 0.4),
      risks: newRisks.length > 0 ? [newRisks[0]] : [],
    },
    {
      timepoint: "Week 8",
      healthScore: Math.min(100, baseScore + scoreImprovement * 0.7),
      risks: [],
    },
    {
      timepoint: "Week 12",
      healthScore: Math.min(100, baseScore + scoreImprovement),
      risks: [],
    },
  ];

  const projectedImprovement = trajectory[trajectory.length - 1].healthScore - baseScore;

  return {
    scenarioName: "", // filled in by caller
    outcomeSummary: `Projected health score improvement: +${projectedImprovement.toFixed(
      1
    )} points over 12 weeks (from ${baseScore.toFixed(
      1
    )} to ${trajectory[trajectory.length - 1].healthScore.toFixed(1)}). ${
      improvementReasons.length > 0
        ? "Key benefits: " + improvementReasons.join("; ") + ". "
        : ""
    }${
      newRisks.length > 0
        ? "Risks to monitor: " + newRisks.join("; ") + "."
        : "Minimal risks identified."
    }`,
    outcomeTrajectory: trajectory,
  };
}

// ────────────────────────────────────────────────────────────
// 3. GET SIMULATIONS FOR TWIN
// ───────────────────────────────────────────────────────────
export async function getSimulationsForTwin(twinId: string) {
  return db
    .select()
    .from(simulations)
    .where(eq(simulations.twinId, twinId))
    .orderBy(desc(simulations.createdAt));
}

// ───────────────────────────────────────────────────────────
// 4. RUN COMPARATIVE SIMULATION (A/B scenarios)
// ────────────────────────────────────────────────────────────
export async function runComparativeSimulation(
  twinId: string,
  scenarios: { name: string; intervention: SimulationRequest["intervention"] }[]
) {
  const results: SimulationOutcome[] = [];

  for (const scenario of scenarios) {
    const result = await createSimulation({
      twinId,
      scenarioName: scenario.name,
      intervention: scenario.intervention,
      comparator: "comparative",
    });
    results.push(result);
  }

  return results;
}
