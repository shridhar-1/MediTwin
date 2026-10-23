"use client";

import { useEffect, useState, use } from "react";
import { Activity, Plus, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

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
    baseline: "from-emerald-500 to-emerald-600 text-white",
    stable: "from-green-500 to-green-600 text-white",
    monitoring: "from-blue-500 to-blue-600 text-white",
    at_risk: "from-amber-500 to-amber-600 text-white",
    critical: "from-red-500 to-red-600 text-white",
    deteriorating: "from-orange-500 to-orange-600 text-white",
  };
  return colors[state] ?? "from-gray-500 to-gray-600 text-white";
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

export default function TwinListPage() {
  const [twins, setTwins] = useState<TwinSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: "",
    age: 55,
    gender: "male",
    severity: "moderate" as "well_controlled" | "moderate" | "poor",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTwins();
  }, []);

  async function loadTwins() {
    try {
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
      if (results.length > 0) setTwins(results);
      else setTwins(getDemoTwins());
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
          chronicConditions: ["diabetes", "hypertension"],
          severity: createForm.severity,
        }),
      });
      const data = await res.json();
      if (data.twinId) {
        setCreateForm({
          patientId: "",
          age: 55,
          gender: "male",
          severity: "moderate",
        });
        setShowCreate(false);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-light text-gray-300">Loading GlucoTwin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                GlucoTwin
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                AI-Powered Diabetes Digital Twin
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={20} /> New Twin
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Create Form */}
        {showCreate && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Create New Digital Twin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Patient ID (optional)
                </label>
                <input
                  type="text"
                  value={createForm.patientId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, patientId: e.target.value })
                  }
                  placeholder="Auto-generated if empty"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Age</label>
                <input
                  type="number"
                  value={createForm.age}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      age: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Gender
                </label>
                <select
                  value={createForm.gender}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Diabetes Severity
                </label>
                <select
                  value={createForm.severity}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      severity: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition"
                >
                  <option value="well_controlled">Well Controlled</option>
                  <option value="moderate">Moderate</option>
                  <option value="poor">Poor Control</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create & Open Twin"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-6 py-3 bg-slate-800 border border-slate-700 text-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Twins</p>
                <p className="text-3xl font-bold text-white">{twins.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">ML Model</p>
                <p className="text-3xl font-bold text-white">GlucoPredict</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Prediction Accuracy</p>
                <p className="text-3xl font-bold text-white">82% AUROC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Twin Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Digital Twins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {twins.map((twin) => (
              <a
                key={twin.id}
                href={`/twin/${twin.id}`}
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Twin #{twin.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {twin.age} yrs · {twin.gender}
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-500 group-hover:text-cyan-400 transition"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(
                        parseFloat(twin.healthScore)
                      )}`}
                    >
                      {parseFloat(twin.healthScore).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-400">Health Score</span>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStateBadge(
                      twin.twinState
                    )}`}
                  >
                    {twin.twinState.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {twin.chronicConditions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700">
                    {twin.chronicConditions.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-800 text-gray-300 px-3 py-1 rounded-full border border-slate-700"
                      >
                        {c.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <Shield className="text-cyan-400 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">
              Two-Stream Data Fusion
            </h3>
            <p className="text-sm text-gray-400">
              Combines static EHR (HbA1c, BMI, genetics) with real-time
              wearables (CGM, HRV, sleep) for comprehensive patient modeling.
            </p>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <Zap className="text-purple-400 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">
              60-Minute Prediction
            </h3>
            <p className="text-sm text-gray-400">
              GlucoPredict ML model forecasts glucose spikes 60 minutes in
              advance, enabling proactive intervention.
            </p>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <TrendingUp className="text-emerald-400 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">
              4-Hour Forecast
            </h3>
            <p className="text-sm text-gray-400">
              Real-time glucose trajectory with confidence intervals, showing
              predicted values every 15 minutes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function getDemoTwins(): TwinSummary[] {
  return [
    {
      id: "demo-twin-001",
      patientId: "demo-patient-001",
      twinState: "stable",
      healthScore: "82",
      age: 55,
      gender: "male",
      chronicConditions: ["diabetes", "hypertension"],
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
  ];
}
