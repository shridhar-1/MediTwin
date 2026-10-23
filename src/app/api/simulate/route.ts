/**
 * API: Treatment Simulation (What-If Scenarios)
 *
 * POST /api/simulate — Run a what-if treatment simulation
 */

import { NextRequest, NextResponse } from "next/server";
import { createSimulation, getSimulationsForTwin } from "@/lib/simulation-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "run") {
      const result = await createSimulation({
        twinId: body.twinId,
        scenarioName: body.scenarioName,
        intervention: body.intervention,
        comparator: body.comparator,
        createdBy: body.createdBy,
      });
      return NextResponse.json({ success: true, simulation: result });
    }

    if (body.action === "compare") {
      const { createSimulation } = require("@/lib/simulation-engine");
      const results = [];
      for (const scenario of body.scenarios) {
        const r = await createSimulation({
          twinId: body.twinId,
          ...scenario,
        });
        results.push(r);
      }
      return NextResponse.json({ success: true, simulations: results });
    }

    if (body.action === "list") {
      const results = await getSimulationsForTwin(body.twinId);
      return NextResponse.json({ success: true, simulations: results });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
