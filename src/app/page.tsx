import Link from "next/link";
import { Activity, Droplets, Stethoscope, Zap, Shield, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen animated-gradient">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16 slide-up">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center glow">
              <Droplets className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-6">
            GlucoTwin
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            AI-Powered Digital Twin for Type 2 Diabetes
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Predict glucose spikes 60 minutes before they happen. Fuse EHR history with real-time wearables. Enable proactive intervention.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 slide-up">
          <Link
            href="/twin"
            className="glass-card p-8 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Activity className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Digital Twin Dashboard</h3>
            <p className="text-sm text-gray-400 mb-4">
              View your patient's living digital twin with real-time predictions, risk scores, and glucose forecasts.
            </p>
            <span className="text-cyan-400 text-sm font-semibold group-hover:underline">
              Open Dashboard →
            </span>
          </Link>

          <Link
            href="/twin"
            className="glass-card p-8 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Zap className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Create New Twin</h3>
            <p className="text-sm text-gray-400 mb-4">
              Generate a synthetic patient twin with EHR data and start the ML prediction engine instantly.
            </p>
            <span className="text-purple-400 text-sm font-semibold group-hover:underline">
              Create Twin →
            </span>
          </Link>

          <Link
            href="/login/patient"
            className="glass-card p-8 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Stethoscope className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">MediKiosk Platform</h3>
            <p className="text-sm text-gray-400 mb-4">
              Access the full hospital platform with patient kiosk, doctor console, and FHIR integration.
            </p>
            <span className="text-emerald-400 text-sm font-semibold group-hover:underline">
              Open Platform →
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20 slide-up">
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">60 min</div>
            <div className="text-sm text-gray-400">Advance Prediction</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">82%</div>
            <div className="text-sm text-gray-400">Model AUROC</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">12</div>
            <div className="text-sm text-gray-400">Clinical Features</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-sm text-gray-400">Live Monitoring</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12 slide-up">
            Why GlucoTwin is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 slide-up">
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Two-Stream Data Fusion</h3>
                  <p className="text-sm text-gray-400">
                    Combines static EHR (HbA1c, BMI, genetics, labs) with dynamic wearables (CGM, HRV, sleep, stress) for comprehensive patient modeling.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Proactive Prediction</h3>
                  <p className="text-sm text-gray-400">
                    GlucoPredict ML model forecasts glucose spikes 60 minutes in advance, enabling intervention BEFORE adverse events occur.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">4-Hour Forecast</h3>
                  <p className="text-sm text-gray-400">
                    Real-time glucose trajectory with confidence intervals, showing predicted values every 15 minutes for the next 4 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Hospital-Ready Platform</h3>
                  <p className="text-sm text-gray-400">
                    Built on MediKiosk with FHIR R4, ABHA integration, DPDP consent, and 8+ language support. Deploy-ready for Indian hospitals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center slide-up">
          <div className="glass-card p-12 inline-block">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Ready to See It in Action?
            </h2>
            <p className="text-gray-400 mb-8">
              Experience the future of diabetes management with AI-powered predictions.
            </p>
            <Link href="/twin" className="btn-primary text-lg px-8 py-4">
              Launch Digital Twin →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            GlucoTwin — Happiest Health Digital Twin Challenge 2026
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Research prototype. Not a medical device. All data is synthetic.
          </p>
        </div>
      </footer>
    </main>
  );
}
