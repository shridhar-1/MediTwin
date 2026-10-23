"use client";

import { useEffect, useState } from "react";
import { Activity, Plus, ArrowRight, AlertTriangle, Shield, Brain } from "lucide-react";

interface TwinSummary {
  id: string;
  patientId: string;
  twinState: string;
  healthScore: string;
  age: number;
  gender: string;
  chronicConditions: string[];
  updatedAt: string;
}

function getStateBadge(state: string) {
  const colors: Record<string, string> = {
    baseline: "bg-emerald-100 text-emerald-700",
    stable: "bg-green-100 text-green-700",
    monitoring: "bg-blue-100 text-blue-700",
    at_risk: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
    deteriorating: "bg-orange-100 text-orange-700",
  };
  return colors[state] ?? "bg-gray-100 text-gray-700";
}

export default function TwinListPage() {
  const [twins, setTwins] = useState<TwinSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: "",
    age: 45,
    gender: "male",
    conditions: "",
  });
  const [creating, setCreating] = useState(false);

  // Load twins from API (or show demo)
  useEffect(() => {
    loadTwins();
  }, []);

  async function loadTwins() {
    // Try loading from API
    try {
      // Try a known demo twin ID
      const demoIds = [
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002",
      ];
      const results: TwinSummary[] = [];
      for (const id of demoIds) {
        try {
          const res = await fetch(`/api/twin?twinId=${id}`);
          const data = await res.json();
          if (data.twin) results.push(data.twin);
        } catch {}
      }
      if (results.length > 0) {
        setTwins(results);
      } else {
        // Demo data for offline viewing
        setTwins(getDemoTwins());
      }
    } catch {
      setTwins(getDemoTwins());
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          patientId: createForm.patientId || crypto.randomUUID(),
          age: createForm.age,
          gender: createForm.gender,
          chronicConditions: createForm.conditions
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.twinId) {
        setCreateForm({ patientId: "", age: 45, gender: "male", conditions: "" });
        setShowCreate(false);
        // Navigate to twin dashboard
        window.location.href = `/twin/${data.twinId}`;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Activity className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Patient Digital Twins</h1>
              <p className="text-xs text-gray-500">AI-powered health state management</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} /> Create Twin
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Create Form */}
        {showCreate && (
          <div className="bg-white rounded-2xl border border-blue-200 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Create New Digital Twin</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Patient ID (optional)</label>
                <input
                  type="text"
                  value={createForm.patientId}
                  onChange={(e) => setCreateForm({ ...createForm, patientId: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Age</label>
                <input
                  type="number"
                  value={createForm.age}
                  onChange={(e) => setCreateForm({ ...createForm, age: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Gender</label>
                <select
                  value={createForm.gender}
                  onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Conditions (comma-sep)</label>
                <input
                  type="text"
                  value={createForm.conditions}
                  onChange={(e) => setCreateForm({ ...createForm, conditions: e.target.value })}
                  placeholder="diabetes, hypertension"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create & Open Twin"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Twins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {twins.map((twin) => (
            <a
              key={twin.id}
              href={`/twin/${twin.id}`}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Twin #{twin.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {twin.age} yrs · {twin.gender}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-gray-300 group-hover:text-blue-500 transition"
                />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-blue-700">
                  {parseFloat(twin.healthScore).toFixed(0)}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Health Score</div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStateBadge(
                      twin.twinState
                    )}`}
                  >
                    {twin.twinState.replace("_", " ")}
                  </span>
                </div>
              </div>

              {twin.chronicConditions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {twin.chronicConditions.slice(0, 4).map((c, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded"
                    >
                      {c.replace("_", " ")}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <Shield className="text-blue-600 mb-2" size={24} />
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Real-time Health Monitoring
            </h3>
            <p className="text-xs text-gray-500">
              Continuous vitals tracking with automatic health score computation and state machine transitions.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <Brain className="text-purple-600 mb-2" size={24} />
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              AI Predictive Engine
            </h3>
            <p className="text-xs text-gray-500">
              Disease progression forecasting, readmission risk, vitals prediction, and complication assessment.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <AlertTriangle className="text-amber-600 mb-2" size={24} />
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Treatment Simulation
            </h3>
            <p className="text-xs text-gray-500">
              What-if scenario modeling for medications, lifestyle changes, and procedures before real intervention.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Demo twins for offline display
function getDemoTwins(): TwinSummary[] {
  return [
    {
      id: "demo-twin-001",
      patientId: "demo-patient-001",
      twinState: "stable",
      healthScore: "82",
      age: 45,
      gender: "male",
      chronicConditions: ["hypertension"],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-twin-002",
      patientId: "demo-patient-002",
      twinState: "at_risk",
      healthScore: "55",
      age: 62,
      gender: "female",
      chronicConditions: ["diabetes", "hypertension", "cad"],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-twin-003",
      patientId: "demo-patient-003",
      twinState: "baseline",
      healthScore: "94",
      age: 28,
      gender: "female",
      chronicConditions: [],
      updatedAt: new Date().toISOString(),
    },
  ];
}
