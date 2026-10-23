"use client";

import { useEffect, useState, useCallback, use } from "react";
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Shield,
  Brain,
  Play,
  Stethoscope,
  Zap,
  Eye,
} from "lucide-react";

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

interface Risk {
  riskType: string;
  score: string;
  level: string;
  contributingFactors: { factor: string; weight: number }[];
  computedAt: string;
}

interface Prediction {
  predictionType: string;
  summary: string;
  probability: string;
  horizon: string;
  trajectory: {
    timepoint: string;
    healthScore: number;
    risk: string;
    keyChanges: string[];
  }[];
  confidence: string;
}

interface Simulation {
  scenarioName: string;
  intervention: { type: string; details: string };
  outcomeSummary: string | null;
  outcomeTrajectory: {
    timepoint: string;
    healthScore: number;
    risks: string[];
  }[] | null;
  status: string;
  createdAt: string;
}

function getStateColor(state: string) {
  switch (state) {
    case "baseline": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "stable": return "text-green-600 bg-green-50 border-green-200";
    case "monitoring": return "text-blue-600 bg-blue-50 border-blue-200";
    case "at_risk": return "text-amber-600 bg-amber-50 border-amber-200";
    case "critical": return "text-red-600 bg-red-50 border-red-200";
    case "deteriorating": return "text-orange-600 bg-orange-50 border-orange-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

function getRiskColor(level: string) {
  switch (level) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-amber-400";
    default: return "bg-green-400";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function formatRiskType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">Health Score</span>
        <span className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full border ${getStateColor(state)}`}>
          {state.replace("_", " ").toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit, normal, alert }: {
  icon: any; label: string; value: string | number | null; unit: string; normal: string; alert?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${alert ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className={alert ? "text-red-500" : "text-gray-400"} />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${alert ? "text-red-600" : "text-gray-900"}`}>
          {value ?? "—"}
        </span>
        {value && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      <span className="text-xs text-gray-400">Normal: {normal}</span>
    </div>
  );
}

function RiskBar({ risk }: { risk: Risk }) {
  const score = parseFloat(risk.score);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{formatRiskType(risk.riskType)}</span>
        <span className="text-sm font-bold text-gray-900">{score.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${getRiskColor(risk.level)}`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex flex-wrap gap-1">
        {risk.contributingFactors?.slice(0, 3).map((f, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{f.factor}</span>
        ))}
      </div>
    </div>
  );
}

function PredictionTimeline({ prediction }: { prediction: Prediction }) {
  if (!prediction.trajectory?.length) return null;
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{formatRiskType(prediction.predictionType)}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{prediction.horizon}</span>
          <span className="text-xs text-gray-500">{parseFloat(prediction.confidence).toFixed(0)}% confidence</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3">{prediction.summary}</p>
      <div className="space-y-2">
        {prediction.trajectory.map((point, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 text-xs font-medium text-gray-500">{point.timepoint}</div>
            <div className="flex-1 h-6 bg-gray-50 rounded-full relative overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                point.healthScore >= 70 ? "bg-emerald-200" : point.healthScore >= 50 ? "bg-amber-200" : "bg-red-200"
              }`} style={{ width: `${point.healthScore}%` }} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{point.healthScore.toFixed(1)}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              point.risk === "high" ? "bg-red-100 text-red-700" :
              point.risk === "moderate" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            }`}>{point.risk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE — FIXED for Next.js 16 params
// ─────────────────────────────────────────────────────────────
export default function TwinDashboard({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the Promise using React.use()
  const resolvedParams = use(params);
  const twinId = resolvedParams.id;

  const [twin, setTwin] = useState<Twin | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
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
        setRisks(data.risks || []);
        setPredictions(data.predictions || []);
        setSimulations(data.simulations || []);
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
            bloodGlucose: 90 + Math.floor(Math.random() * 30),
          },
        }),
      }).then(() => fetchData());
    }, 3000);
    return () => clearInterval(interval);
  }, [liveMode, twinId, fetchData]);

  const healthScore = twin ? parseFloat(twin.healthScore) : 0;
  const latestVital = vitals[0];

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
          <p className="text-sm text-gray-400 mb-4">Twin ID: {twinId}</p>
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
              <Activity className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Patient Digital Twin</h1>
              <p className="text-xs text-gray-500">Twin ID: {twin.id.slice(0, 8)}... | Patient: {twin.patientId.slice(0, 8)}...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Composite Health Score</h2>
            <HealthScoreGauge score={healthScore} state={twin.twinState} />
            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">State</span>
                <span className={`font-medium px-2 py-0.5 rounded-full border ${getStateColor(twin.twinState)}`}>
                  {twin.twinState.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-700">{new Date(twin.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Updated By</span>
                <span className="text-gray-700">{twin.lastUpdatedBy || "system"}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Activity size={16} /> Latest Vitals
              </h2>
              {liveMode && <span className="text-xs text-red-600 font-medium animate-pulse">STREAMING LIVE</span>}
            </div>
            {latestVital ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <VitalCard icon={Heart} label="Heart Rate" value={latestVital.heartRate} unit="bpm" normal="60-100"
                  alert={(latestVital.heartRate ?? 0) > 120 || (latestVital.heartRate ?? 100) < 50} />
                <VitalCard icon={Activity} label="Blood Pressure" value={`${latestVital.systolicBP}/${latestVital.diastolicBP}`} unit="mmHg" normal="120/80"
                  alert={(latestVital.systolicBP ?? 0) > 140} />
                <VitalCard icon={Droplets} label="SpO2" value={latestVital.spo2} unit="%" normal="95-100"
                  alert={(latestVital.spo2 ?? 100) < 90} />
                <VitalCard icon={Thermometer} label="Temperature" value={latestVital.temperature} unit="°C" normal="36.1-37.2"
                  alert={parseFloat(latestVital.temperature ?? "37") > 38} />
                <VitalCard icon={Wind} label="Resp. Rate" value={latestVital.respiratoryRate} unit="/min" normal="12-20"
                  alert={(latestVital.respiratoryRate ?? 0) > 24} />
                <VitalCard icon={Zap} label="Blood Glucose" value={latestVital.bloodGlucose} unit="mg/dL" normal="70-140"
                  alert={parseFloat(latestVital.bloodGlucose ?? "100") > 200} />
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No vitals recorded yet. Click "Start Live Demo" to begin streaming.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Eye size={16} /> Twin Profile</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="font-medium">{twin.age} years</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="font-medium capitalize">{twin.gender}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Shield size={16} /> Chronic Conditions</h2>
            {twin.chronicConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {twin.chronicConditions.map((c, i) => (
                  <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">{c.replace("_", " ")}</span>
                ))}
              </div>
            ) : (<p className="text-sm text-gray-400">None recorded</p>)}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Stethoscope size={16} /> Medications</h2>
            {twin.currentMedications?.length > 0 ? (
              <div className="space-y-2">
                {twin.currentMedications.map((m, i) => (
                  <div key={i} className="text-sm"><span className="font-medium text-gray-800">{m.name}</span><span className="text-gray-500"> — {m.dose}, {m.frequency}</span></div>
                ))}
              </div>
            ) : (<p className="text-sm text-gray-400">None recorded</p>)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Risk Assessment
          </h2>
          {risks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {risks.map((risk, i) => (<RiskBar key={i} risk={risk} />))}
            </div>
          ) : (<p className="text-sm text-gray-400">No risk assessments computed yet.</p>)}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-500" /> AI Predictions & Trajectory
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictions.length > 0 ? predictions.map((p, i) => (<PredictionTimeline key={i} prediction={p} />)) : (
              <p className="text-sm text-gray-400 col-span-2">No predictions generated yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Play size={16} className="text-blue-500" /> Treatment Simulations (What-If)
          </h2>
          {simulations.length > 0 ? (
            <div className="space-y-4">
              {simulations.map((sim, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800">{sim.scenarioName}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sim.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{sim.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Intervention: {sim.intervention?.type} — {sim.intervention?.details}</p>
                  {sim.outcomeSummary && (<p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">{sim.outcomeSummary}</p>)}
                  {sim.outcomeTrajectory?.length && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {sim.outcomeTrajectory.map((t, j) => (
                        <div key={j} className="text-xs bg-gray-50 px-3 py-1.5 rounded-lg text-center">
                          <div className="font-medium text-gray-600">{t.timepoint}</div>
                          <div className="font-bold text-blue-700">{t.healthScore.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (<p className="text-sm text-gray-400">No simulations run yet. Use the Simulation API to test treatment scenarios.</p>)}
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Patient Digital Twin v1.0 — MediTwin | SIH 2026</p>
        </div>
      </main>
    </div>
  );
}
