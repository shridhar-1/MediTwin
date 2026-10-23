"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Activity, Droplets, Heart, Thermometer, AlertTriangle, Shield, Brain, TrendingUp, TrendingDown, Minus, Zap, Eye, Stethoscope } from "lucide-react";

interface Twin {
  id: string;
  patientId: string;
  twinState: string;
  healthScore: string;
  age: number;
  gender: string;
  chronicConditions: string[];
  currentMedications: { name: string; dose: string; frequency: string }[];
  allergies: string[];
  lastUpdatedBy: string;
  updatedAt: string;
}

interface Vital {
  heartRate: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  spo2: number | null;
  temperature: string | null;
  respiratoryRate: number | null;
  bloodGlucose: string | null;
  recordedAt: string;
}

interface GlucosePrediction {
  probability: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  predictedGlucoseIn60min: number;
  predictedGlucoseIn120min: number;
  contributingFactors: { factor: string; impact: number }[];
  confidence: number;
  timeToSpike: number | null;
}

interface GlucoseForecast {
  timepoint: string;
  predictedGlucose: number;
  lowerBound: number;
  upperBound: number;
  riskOfSpike: number;
}

function getRiskColor(level: string) {
  switch (level) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "moderate": return "bg-amber-400";
    default: return "bg-green-400";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function HealthScoreGauge({ score, state }: { score: number; state: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const remaining = circumference - progress;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444"}
          strokeWidth="12"
          strokeDasharray={`${progress} ${remaining}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
        <span className="text-sm text-gray-500">Health Score</span>
        <span className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
          {state.replace("_", " ").toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function GlucosePredictionCard({ prediction }: { prediction: GlucosePrediction }) {
  const isHighRisk = prediction.riskLevel === "high" || prediction.riskLevel === "critical";

  return (
    <div className={`rounded-2xl border p-6 ${isHighRisk ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Brain size={16} className={isHighRisk ? "text-red-600" : "text-purple-600"} />
          Glucose Spike Prediction (60 min ahead)
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          prediction.riskLevel === "critical" ? "bg-red-100 text-red-700" :
          prediction.riskLevel === "high" ? "bg-orange-100 text-orange-700" :
          prediction.riskLevel === "moderate" ? "bg-amber-100 text-amber-700" :
          "bg-green-100 text-green-700"
        }`}>
          {prediction.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{(prediction.probability * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-500">Spike Probability</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-700">{prediction.predictedGlucoseIn60min}</div>
          <div className="text-xs text-gray-500">Predicted @ 60min (mg/dL)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-700">{prediction.predictedGlucoseIn120min}</div>
          <div className="text-xs text-gray-500">Predicted @ 120min (mg/dL)</div>
        </div>
      </div>

      {prediction.timeToSpike && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle size={16} />
            Predicted spike in ~{prediction.timeToSpike} minutes
          </div>
        </div>
      )}

      {prediction.contributingFactors.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">Contributing Factors:</div>
          <div className="flex flex-wrap gap-1">
            {prediction.contributingFactors.map((f, i) => (
              <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded">
                {f.factor}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">
        Model confidence: {(prediction.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}

function GlucoseChart({ forecast, currentGlucose }: { forecast: GlucoseForecast[]; currentGlucose: number }) {
  const maxGlucose = Math.max(...forecast.map((f) => f.upperBound), 250);
  const minGlucose = Math.min(...forecast.map((f) => f.lowerBound), 40);
  const range = maxGlucose - minGlucose;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-blue-600" />
        Glucose Forecast (Next 4 Hours)
      </h3>

      <div className="relative h-48 mb-4">
        {/* Threshold line at 180 */}
        <div
          className="absolute w-full border-t-2 border-red-300 border-dashed"
          style={{ bottom: `${((180 - minGlucose) / range) * 100}%` }}
        >
          <span className="absolute -top-4 right-0 text-xs text-red-500">Hyperglycemia threshold (180 mg/dL)</span>
        </div>

        {/* Threshold line at 70 */}
        <div
          className="absolute w-full border-t-2 border-blue-300 border-dashed"
          style={{ bottom: `${((70 - minGlucose) / range) * 100}%` }}
        >
          <span className="absolute -top-4 right-0 text-xs text-blue-500">Hypoglycemia threshold (70 mg/dL)</span>
        </div>

        {/* Forecast bars */}
        <div className="absolute inset-0 flex items-end gap-1">
          {forecast.map((point, i) => {
            const barHeight = ((point.predictedGlucose - minGlucose) / range) * 100;
            const isHighRisk = point.riskOfSpike > 0.5;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t transition-all ${
                    isHighRisk ? "bg-red-400" : point.predictedGlucose > 140 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        {forecast.filter((_, i) => i % 4 === 0).map((point, i) => (
          <span key={i}>{point.timepoint}</span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Current Glucose:</span>
          <span className="font-bold text-gray-900">{currentGlucose} mg/dL</span>
        </div>
      </div>
    </div>
  );
}

export default function TwinDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const twinId = resolvedParams.id;

  const [twin, setTwin] = useState<Twin | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [glucosePrediction, setGlucosePrediction] = useState<GlucosePrediction | null>(null);
  const [glucoseForecast, setGlucoseForecast] = useState<GlucoseForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [tick, setTick] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/twin?twinId=${twinId}`);
      const data = await res.json();
      if (data.twin) {
        setTwin(data.twin);
        setVitals(data.vitals || []);
        setGlucosePrediction(data.glucosePrediction || null);
        setGlucoseForecast(data.glucoseForecast || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [twinId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          twinId,
          newVitals: {
            heartRate: 70 + Math.floor(Math.random() * 20),
            systolicBP: 115 + Math.floor(Math.random() * 15),
            diastolicBP: 75 + Math.floor(Math.random() * 10),
            spo2: 95 + Math.floor(Math.random() * 5),
            temperature: 36.2 + Math.random() * 0.8,
            respiratoryRate: 14 + Math.floor(Math.random() * 6),
            bloodGlucose: 90 + Math.floor(Math.random() * 80),
          },
        }),
      }).then(() => fetchData());
    }, 5000);
    return () => clearInterval(interval);
  }, [liveMode, twinId, fetchData]);

  const healthScore = twin ? parseFloat(twin.healthScore) : 0;
  const latestVital = vitals[0];
  const currentGlucose = latestVital?.bloodGlucose ? parseFloat(latestVital.bloodGlucose) : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Loading Digital Twin...</p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Twin not found.</p>
          <a href="/twin" className="text-blue-600 hover:underline">← Back to Twin List</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GlucoTwin — Diabetes Digital Twin</h1>
              <p className="text-xs text-gray-500">
                Twin ID: {twin.id.slice(0, 8)}... | Patient: {twin.patientId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                liveMode ? "bg-red-100 text-red-700 border border-red-200" : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveMode ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
              {liveMode ? `Live (${tick}s)` : "Start Live Demo"}
            </button>
            <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Row 1: Health Score + Glucose Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Composite Health Score</h2>
            <HealthScoreGauge score={healthScore} state={twin.twinState} />
            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">State</span>
                <span className="font-medium px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                  {twin.twinState.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-700">{new Date(twin.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {glucosePrediction && <GlucosePredictionCard prediction={glucosePrediction} />}
        </div>

        {/* Row 2: Glucose Forecast Chart */}
        {glucoseForecast.length > 0 && (
          <GlucoseChart forecast={glucoseForecast} currentGlucose={currentGlucose} />
        )}

        {/* Row 3: Vitals */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Activity size={16} /> Latest Vitals
            </h2>
            {liveMode && <span className="text-xs text-red-600 font-medium animate-pulse">STREAMING LIVE</span>}
          </div>
          {latestVital ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={18} className="text-red-500" />
                  <span className="text-xs text-gray-500">Heart Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{latestVital.heartRate ?? "—"}</div>
                <span className="text-xs text-gray-400">bpm (normal: 60-100)</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={18} className="text-blue-500" />
                  <span className="text-xs text-gray-500">Blood Glucose</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{latestVital.bloodGlucose ?? "—"}</div>
                <span className="text-xs text-gray-400">mg/dL (normal: 70-140)</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} className="text-purple-500" />
                  <span className="text-xs text-gray-500">Blood Pressure</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{latestVital.systolicBP}/{latestVital.diastolicBP}</div>
                <span className="text-xs text-gray-400">mmHg (normal: 120/80)</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={18} className="text-orange-500" />
                  <span className="text-xs text-gray-500">SpO2</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{latestVital.spo2 ?? "—"}</div>
                <span className="text-xs text-gray-400">% (normal: 95-100)</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No vitals recorded yet. Click "Start Live Demo" to begin streaming.</p>
          )}
        </div>

        {/* Row 4: Twin Profile & Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Eye size={16} /> Twin Profile
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="font-medium">{twin.age} years</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="font-medium capitalize">{twin.gender}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Shield size={16} /> Chronic Conditions
            </h2>
            {twin.chronicConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {twin.chronicConditions.map((c, i) => (
                  <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">
                    {c.replace("_", " ")}
                  </span>
                ))}
              </div>
            ) : (<p className="text-sm text-gray-400">None recorded</p>)}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Stethoscope size={16} /> Medications
            </h2>
            {twin.currentMedications?.length > 0 ? (
              <div className="space-y-2">
                {twin.currentMedications.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-gray-800">{m.name}</span>
                    <span className="text-gray-500"> — {m.dose}, {m.frequency}</span>
                  </div>
                ))}
              </div>
            ) : (<p className="text-sm text-gray-400">None recorded</p>)}
          </div>
        </div>
      </main>
    </div>
  );
}
