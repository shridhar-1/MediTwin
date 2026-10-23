/**
 * API: Digital Twin Management — GlucoTwin Edition
 *
 * POST   /api/twin          — Create/update twin
 * GET    /api/twin?twinId=  — Get twin with glucose predictions
 */

import { NextRequest, NextResponse } from "next/server";
import { createTwin, getTwinByPatient, getTwinById, updateTwin, recomputeRisks, getRecentVitals, getRisksForTwin } from "@/lib/twin-engine";
import { getPredictionsForTwin } from "@/lib/prediction-engine";
import { getSimulationsForTwin } from "@/lib/simulation-engine";
import { generateSyntheticPatient } from "@/lib/synthetic-data";
import { predictGlucoseSpike, generateGlucoseForecast } from "@/lib/glucose-model";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "create") {
      const twinId = await createTwin({
        patientId: body.patientId,
        age: body.age,
        gender: body.gender,
        chronicConditions: body.chronicConditions,
        currentMedications: body.currentMedications,
        allergies: body.allergies,
      });

      // Compute initial risk scores
      await recomputeRisks(twinId);

      const twin = await getTwinById(twinId);
      return NextResponse.json({ success: true, twinId, twin });
    }

    if (body.action === "update") {
      const result = await updateTwin({
        twinId: body.twinId,
        newVitals: body.newVitals,
        newDiagnosis: body.newDiagnosis,
        newMedication: body.newMedication,
      });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const twinId = searchParams.get("twinId");
    const patientId = searchParams.get("patientId");

    if (twinId) {
      const [twin, vitals, risks, predictions, simulations] = await Promise.all([
        getTwinById(twinId),
        getRecentVitals(twinId, 100),
        getRisksForTwin(twinId),
        getPredictionsForTwin(twinId),
        getSimulationsForTwin(twinId),
      ]);

      if (!twin) {
        return NextResponse.json({ error: "Twin not found" }, { status: 404 });
      }

      // Generate synthetic EHR for this twin (based on conditions)
      const score = parseFloat(twin.healthScore);
      const severity =
        score > 75 ? "well_controlled" : score > 50 ? "moderate" : "poor";

      const syntheticPatient = generateSyntheticPatient(
        severity as "well_controlled" | "moderate" | "poor"
      );

      // If we have real vitals, use them; otherwise use synthetic wearable data
      let wearableStream = syntheticPatient.wearableData;
      if (vitals.length > 0) {
        // Convert DB vitals to wearable format for model input
        wearableStream = vitals.map((v) => ({
          timestamp:
            v.recordedAt instanceof Date
              ? v.recordedAt.toISOString()
              : String(v.recordedAt),
          glucose: v.bloodGlucose
            ? parseFloat(String(v.bloodGlucose))
            : 100,
          heartRate: v.heartRate ?? 72,
          hrRmssd: Math.floor(20 + Math.random() * 30),
          steps: Math.floor(Math.random() * 20),
          sleepStage: "awake" as const,
          sleepHours: 7,
          caloriesBurned: 2,
          mealDetected: Math.random() > 0.7,
          stressLevel: Math.floor(20 + Math.random() * 40),
        }));
      }

      // Run glucose spike prediction (60 min ahead)
      const recentWindow = wearableStream.slice(-12); // last hour
      const glucosePrediction = predictGlucoseSpike(
        recentWindow,
        syntheticPatient.ehr,
        60
      );

      // Generate 4-hour glucose forecast
      const glucoseForecast = generateGlucoseForecast(
        recentWindow,
        syntheticPatient.ehr,
        4
      );

      return NextResponse.json({
        twin,
        vitals,
        risks,
        predictions,
        simulations,
        glucosePrediction,
        glucoseForecast,
        syntheticEHR: syntheticPatient.ehr,
      });
    }

    if (patientId) {
      const twin = await getTwinByPatient(patientId);
      return NextResponse.json({ twin });
    }

    return NextResponse.json(
      { error: "Provide twinId or patientId" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
