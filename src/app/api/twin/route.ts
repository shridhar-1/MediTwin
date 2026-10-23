/**
 * API: Digital Twin Management
 *
 * POST   /api/twin          — Create a new twin for a patient
 * GET    /api/twin?patientId= — Get twin by patient ID
 * PUT    /api/twin          — Update twin (vitals, state)
 */

import { NextRequest, NextResponse } from "next/server";
import { createTwin, getTwinByPatient, getTwinById, updateTwin, recomputeRisks } from "@/lib/twin-engine";
import { generatePredictions } from "@/lib/prediction-engine";
import { getPredictionsForTwin } from "@/lib/prediction-engine";
import { getSimulationsForTwin } from "@/lib/simulation-engine";
import { getRecentVitals, getRisksForTwin } from "@/lib/twin-engine";

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

      // Auto-generate predictions after creation
      await generatePredictions(twinId);

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

    if (body.action === "predict") {
      const results = await generatePredictions(body.twinId);
      return NextResponse.json({ success: true, predictions: results });
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

      return NextResponse.json({
        twin,
        vitals,
        risks,
        predictions,
        simulations,
      });
    }

    if (patientId) {
      const twin = await getTwinByPatient(patientId);
      return NextResponse.json({ twin });
    }

    return NextResponse.json({ error: "Provide twinId or patientId" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
