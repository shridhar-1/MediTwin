import Link from "next/link";
import { Activity, Droplets, Stethoscope, Zap, Shield, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl mb-6">
            <Droplets className="text-white" size={40} />
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            GlucoTwin
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            AI-Powered Digital Twin for Type 2 Diabetes
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Predict glucose spikes 60 minutes before they happen. Fuse EHR history with real-time wearables. Enable proactive intervention.
          </p>
        </div>
      </section>

      {/* Quick Actions - 3 Cards */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <Link href="/twin" className="block">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 transition-all hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Activity className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Digital Twin Dashboard
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                View your patient's living digital twin with real-time predictions, risk scores, and glucose forecasts.
              </p>
              <span className="text-cyan-400 font-semibold">
                Open Dashboard →
              </span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/twin" className="block">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-purple-500 transition-all hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Create New Twin
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Generate a synthetic patient twin with EHR data and start the ML prediction engine instantly.
              </p>
              <span className="text-purple-400 font-semibold">
                Create Twin →
              </span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/login/patient" className="block">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-emerald-500 transition-all hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Stethoscope className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                MediKiosk Platform
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Access the full hospital platform with patient kiosk, doctor console, and FHIR integration.
              </p>
              <span className="text-emerald-400 font-semibold">
                Open Platform →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              60 min
            </div>
            <div className="text-gray-400">Advance Prediction</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              82%
            </div>
            <div className="text-gray-400">Model AUROC</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
              12
            </div>
            <div className="text-gray-400">Clinical Features</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-gray-400">Live Monitoring</div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Why GlucoTwin is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Activity className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Two-Stream Data Fusion
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Combines static EHR (HbA1c, BMI, genetics, labs) with dynamic wearables (CGM, HRV, sleep, stress) for comprehensive patient modeling.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Proactive Prediction
              </h3>
              <p className="text-gray-400 leading-relaxed">
                GlucoPredict ML model forecasts glucose spikes 60 minutes in advance, enabling intervention BEFORE adverse events occur.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                4-Hour Forecast
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Real-time glucose trajectory with confidence intervals, showing predicted values every 15 minutes for the next 4 hours.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Hospital-Ready Platform
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Built on MediKiosk with FHIR R4, ABHA integration, DPDP consent, and 8+ language support. Deploy-ready for Indian hospitals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-slate-800 border border-slate-700 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Ready to See It in Action?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Experience the future of diabetes management with AI-powered predictions.
          </p>
          <Link
            href="/twin"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
          >
            Launch Digital Twin →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            GlucoTwin — Happiest Health Digital Twin Challenge 2026
          </p>
          <p className="text-xs text-gray-600">
            Research prototype. Not a medical device. All data is synthetic.
          </p>
        </div>
      </footer>
    </div>
  );
}
