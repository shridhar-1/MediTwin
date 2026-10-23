# SIH 2026 — Submission Guide
## Patient Digital Twin (Happiest Health Track)

---

## ✅ Submission Checklist

### 1. GitHub Repository
- [x] Repository is **public**: `https://github.com/shridhar-1/PatientDigitalTwin`
- [x] `README.md` documents the Digital Twin architecture, features, and how to run
- [x] Code is well-structured with clear module separation
- [x] Last commit: recent and meaningful

### 2. Required Documentation
- [x] **README.md** — Project overview, features, tech stack, setup instructions
- [x] **SIH_SUBMISSION_GUIDE.md** — This file (submission details)
- [ ] **Architecture Diagram** — See README for ASCII diagram; add a visual diagram if possible
- [ ] **API Documentation** — Document all `/api/twin`, `/api/simulate` endpoints
- [ ] **Demo Video** — Record a 3-5 min walkthrough (highly recommended)
- [ ] **Deployment Guide** — How to deploy on Vercel/Railway

### 3. Live Demo
- [ ] Deploy on **Vercel** or **Railway**
- [ ] Demo URL: `https://medi-kiosk-tau.vercel.app`
- [ ] Twin Dashboard accessible at: `/twin`
- [ ] Ensure database is connected (use Supabase/Neon free tier)

### 4. Working Features (Demo-Ready)
- [x] Twin creation from patient data
- [x] Health score computation (0-100 composite)
- [x] Twin state machine (6 states with auto-transition)
- [x] Real-time vitals stream (simulated)
- [x] Live mode demo (auto-generating vitals)
- [x] Risk score computation (4 risk types)
- [x] AI predictions (4 prediction models)
- [x] Treatment simulation (what-if scenarios)
- [x] Twin snapshot audit trail
- [x] Twin dashboard visualization

---

## 🎯 Key Differentiators for Judges

### What makes this a TRUE Digital Twin (not just a health app)?

1. **Living Model** — The twin is not a static record; it continuously evolves with each vitals reading, clinical event, and AI insight.

2. **State Machine** — The twin has 6 distinct states (baseline → stable → monitoring → at_risk → deteriorating → critical) with automatic transitions based on health score.

3. **Predictive, Not Just Reactive** — The system predicts readmission risk, disease progression, vitals trends, and complication probability BEFORE they happen.

4. **Simulation Engine** — Physicians can test treatments on the digital twin BEFORE applying them to the real patient — the hallmark of a true digital twin.

5. **Composite Health Score** — A single 0-100 number synthesizing all clinical data into an actionable metric.

6. **Audit Trail** — Every state change creates a snapshot, making the twin fully auditable.

---

## 📽️ Recommended Demo Flow (for judges)

### Step 1: Show the Problem (1 min)
> "Indian hospitals have no real-time view of patient health trajectory. Data is fragmented across visits."

### Step 2: Create a Twin (1 min)
> Go to `/twin` → Create Twin with: Age 62, Female, Conditions: diabetes, hypertension, CAD
> Show the twin dashboard loading with baseline score.

### Step 3: Live Vitals Demo (1 min)
> Click "Start Live Demo" → Watch vitals stream in real-time → Health score updates automatically.

### Step 4: Show Risk Assessment (30 sec)
> Point to the 4 risk bars: Readmission, Cardiovascular, Deterioration.
> Explain contributing factors.

### Step 5: Show AI Predictions (1 min)
> Show the 4 prediction timelines: Readmission, Disease Progression, Vitals Forecast, Complication.
> Explain the trajectory charts.

### Step 6: Run a Simulation (1 min)
> Call `/api/simulate` with a medication change scenario.
> Show the predicted outcome: "Health score improves from 55 to 72 over 12 weeks."

### Step 7: Summary (30 sec)
> "This is a true Patient Digital Twin — living, predictive, and simulative. Not just a record, but a virtual patient."

---

## 📝 Submission Form Details

| Field | Value |
|-------|-------|
| **Project Title** | Patient Digital Twin — AI-Powered Living Health Model |
| **Problem Statement** | Digital Twin for Healthcare (Happiest Health) |
| **Repository URL** | https://github.com/shridhar-1/PatientDigitalTwin |
| **Live Demo URL** | https://medi-kiosk-tau.vercel.app/twin |
| **Tech Stack** | Next.js 16, React 19, TypeScript, PostgreSQL, Drizzle ORM, Groq AI, Firebase |
| **Key Innovation** | Real-time twin state machine + predictive engine + treatment simulation |
| **Team Members** | [Add your team] |

---

##  Setup Instructions (for evaluators)

```bash
# Clone
git clone https://github.com/shridhar-1/PatientDigitalTwin.git
cd PatientDigitalTwin

# Install
npm install

# Environment
cp .env.example .env.local
# Fill DATABASE_URL and AI keys

# Database (use Supabase/Neon free tier)
npx drizzle-kit push

# Run
npm run dev

# Open
# Homepage: http://localhost:3000
# Twin Dashboard: http://localhost:3000/twin
```

---

## 📧 Contact

- **GitHub**: https://github.com/shridhar-1
- **Email**: [your email]

---

*Good luck with SIH 2026! 🚀*
