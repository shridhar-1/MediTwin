"use client";

import { useEffect, useState, useCallback, use } from "react";
import {
  Activity,
  Droplets,
  Heart,
  AlertTriangle,
  TrendingUp,
  Zap,
  Shield,
  Brain,
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

function getStateColor(state: string) {
  switch (state) {
    case "baseline":
      return "from-emerald-500 to-emerald-600";
    case "stable":
      return "from-green-500 to-green-600";
    case "monitoring":
      return "from-blue-500 to-blue-600";
    case "at_risk":
      return "from-amber-500 to-amber-600";
    case "critical":
      return "from-red-500 to-red-600";
    case "deteriorating":
      return "from-orange-500 to-orange-600";
    default:
      return "from-gray-500 to-gray-600";
  }
}

function getRiskGradient(level: string) {
  switch (level) {
    case "critical":
      return "from-red-500 to-red-600";
    case "high":
      return "from-orange-500 to-orange-600";
    case "moderate":
      return "from-amber-500 to-amber-600";
    default:
      return "from-emerald-500 to-emerald-600";
  }
}

function getScoreGradient(score: number) {
  if (score >= 80) return "from-emerald-400 to-emerald-600";
  if (score >= 60) return "from-blue-400 to-blue-600";
  if (score >= 40) return "from-amber-400 to-amber-600";
  return "from-red-400 to-red-600";
}

function HealthScoreGauge({ score }: { score: number }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const remaining = circumference - progress;

  return (
    <div className="relative">
      <svg width="240" height="240" className="-rotate-90">
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="16"
        />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="16"
          strokeDasharray={`${progress} ${remaining}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-6xl font-bold bg-gradient-to-r ${getScoreGradient(
            score
          )} bg-clip-text text-transparent`}
        >
          {score.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400 mt-1">Health Score</span>
      </div>
    </div>
  );
}

function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  normal,
  color,
}: {
  icon: any;
  label: string;
  value: string | number | null;
  unit: string;
  normal: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={color} size={20} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value ?? "—"}</div>
      <span className="text-xs text-gray-500">
        {unit} ({normal})
      </span>
    </div>
  );
}

export default function TwinDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const twinId = resolvedParams.id;

  const [twin, setTwin] = useState<Twin | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [glucosePrediction, setGlucosePrediction] =
    useState<GlucosePrediction | null>(null);
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
  const currentGlucose = latestVital?.bloodGlucose
    ? parseFloat(latestVital.bloodGlucose)
    : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-light text-gray-300">
            Loading Digital Twin...
          </p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-2xl text-gray-300 mb-4">Twin not found.</p>
          <a
            href="/twin"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl"
          >
            ← Back to Twin List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Droplets className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                GlucoTwin Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Twin ID: {twin.id.slice(0, 8)}... | Patient:{" "}
                {twin.patientId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition ${
                liveMode
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  : "bg-slate-800/70 border border-slate-700 text-gray-300 hover:border-cyan-500"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  liveMode ? "bg-white animate-pulse" : "bg-gray-500"
                }`}
              />
              {liveMode ? `LIVE ${tick}s` : "Start Live Demo"}
            </button>
            <button
              onClick={fetchData}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Row 1: Health Score + Glucose Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Score Card */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-6">
              Composite Health Score
            </h2>
            <div className="flex items-center justify-center mb-6">
              <HealthScoreGauge score={healthScore} />
            </div>
            <div className="flex justify-center">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${getStateColor(
                  twin.twinState
                )} text-white`}
              >
                {twin.twinState.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Last Updated</span>
                <p className="text-white mt-1">
                  {new Date(twin.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Updated By</span>
                <p className="text-white mt-1 capitalize">
                  {twin.lastUpdatedBy || "system"}
                </p>
              </div>
            </div>
          </div>

          {/* Glucose Prediction Card */}
          {glucosePrediction && (
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Brain size={16} className="text-purple-400" />
                  Glucose Spike Prediction (60 min)
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getRiskGradient(
                    glucosePrediction.riskLevel
                  )} text-white`}
                >
                  {glucosePrediction.riskLevel.toUpperCase()} RISK
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">
                    {(glucosePrediction.probability * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Spike Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-1">
                    {glucosePrediction.predictedGlucoseIn60min}
                  </div>
                  <div className="text-xs text-gray-400">@ 60 min (mg/dL)</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-1">
                    {glucosePrediction.predictedGlucoseIn120min}
                  </div>
                  <div className="text-xs text-gray-400">@ 120 min (mg/dL)</div>
                </div>
              </div>

              {glucosePrediction.timeToSpike && (
                <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-3 text-amber-300">
                    <AlertTriangle size={20} />
                    <span className="font-semibold">
                      Predicted spike in ~{glucosePrediction.timeToSpike}{" "}
                      minutes
                    </span>
                  </div>
                </div>
              )}

              {glucosePrediction.contributingFactors.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-3">
                    Contributing Factors:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {glucosePrediction.contributingFactors.map((f, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-800/70 border border-slate-700 px-3 py-1.5 rounded-full text-gray-300"
                      >
                        {f.factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-gray-400">
                Model confidence:{" "}
                {(glucosePrediction.confidence * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Glucose Forecast Chart */}
        {glucoseForecast.length > 0 && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" />
              Glucose Forecast (Next 4 Hours)
            </h2>

            <div className="relative h-64 mb-6">
              <div className="absolute top-8 w-full border-t-2 border-red-500/50 border-dashed">
                <span className="absolute -top-5 right-0 text-xs text-red-400">
                  Hyperglycemia (180 mg/dL)
                </span>
              </div>
              <div className="absolute bottom-8 w-full border-t-2 border-blue-500/50 border-dashed">
                <span className="absolute -top-5 right-0 text-xs text-blue-400">
                  Hypoglycemia (70 mg/dL)
                </span>
              </div>

              <div className="absolute inset-0 flex items-end gap-2 pt-12 pb-12">
                {glucoseForecast.map((point, i) => {
                  const maxGlucose = 250;
                  const barHeight = Math.min(
                    100,
                    (point.predictedGlucose / maxGlucose) * 100
                  );
                  const isHighRisk = point.riskOfSpike > 0.5;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                    >
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isHighRisk
                            ? "bg-gradient-to-t from-red-500 to-red-400"
                            : point.predictedGlucose > 140
                            ? "bg-gradient-to-t from-amber-500 to-amber-400"
                            : "bg-gradient-to-t from-emerald-500 to-emerald-400"
                        }`}
                        style={{ height: `${barHeight}%` }}
                      />
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition bg-slate-800 px-2 py-1 rounded text-xs text-white">
                        {point.predictedGlucose} mg/dL
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              {glucoseForecast
                .filter((_, i) => i % 4 === 0)
                .map((point, i) => (
                  <span key={i}>{point.timepoint}</span>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
              <span className="text-gray-400">Current Glucose:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {currentGlucose} mg/dL
              </span>
            </div>
          </div>
        )}

        {/* Row 3: Vitals */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              Live Vitals Stream
            </h2>
            {liveMode && (
              <span className="text-xs text-red-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                STREAMING LIVE
              </span>
            )}
          </div>

          {latestVital ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <VitalCard
                icon={Heart}
                label="Heart Rate"
                value={latestVital.heartRate}
                unit="bpm"
                normal="60-100"
                color="text-red-400"
              />
              <VitalCard
                icon={Droplets}
                label="Blood Glucose"
                value={latestVital.bloodGlucose}
                unit="mg/dL"
                normal="70-140"
                color="text-blue-400"
              />
              <VitalCard
                icon={Activity}
                label="Blood Pressure"
                value={
                  latestVital.systolicBP && latestVital.diastolicBP
                    ? `${latestVital.systolicBP}/${latestVital.diastolicBP}`
                    : null
                }
                unit="mmHg"
                normal="120/80"
                color="text-purple-400"
              />
              <VitalCard
                icon={Zap}
                label="SpO2"
                value={latestVital.spo2}
                unit="%"
                normal="95-100"
                color="text-amber-400"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No vitals recorded yet.</p>
              <button
                onClick={() => setLiveMode(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl"
              >
                Start Live Demo
              </button>
            </div>
          )}
        </div>

        {/* Row 4: Twin Profile & Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" />
              Twin Profile
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Age</span>
                <span className="text-lg font-semibold text-white">
                  {twin.age} years
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gender</span>
                <span className="text-lg font-semibold text-white capitalize">
                  {twin.gender}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              Chronic Conditions
            </h3>
            {twin.chronicConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {twin.chronicConditions.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-full"
                  >
                    {c.replace("_", " ")}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">None recorded</p>
            )}
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Heart size={16} className="text-purple-400" />
              Medications
            </h3>
            {twin.currentMedications?.length > 0 ? (
              <div className="space-y-2">
                {twin.currentMedications.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2"
                  >
                    <span className="text-sm font-medium text-white">
                      {m.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {m.dose}, {m.frequency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">None recorded</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
