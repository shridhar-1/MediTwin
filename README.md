#  Patient Digital Twin — AI-Powered Living Health Model

**A real-time, predictive Digital Twin platform for patients — built on the MediKiosk foundation.**

The patient's clinical data, vitals, and medical history are synthesized into a **living digital replica** that continuously evolves, predicts health trajectories, and simulates treatment outcomes — enabling proactive, personalized care.

 **Live demo:** [https://medi-kiosk-tau.vercel.app](https://medi-kiosk-tau.vercel.app/)
🧬 **Twin Dashboard:** `/twin` | `/twin/[id]`

* * *

##  Problem Statement (SIH 2026 — Digital Twin Track)

In Indian healthcare, patient data is fragmented across visits, departments, and facilities. Doctors lack a **holistic, real-time view** of a patient's health trajectory. There is no system that:
- Maintains a **living model** of a patient's health state
- **Predicts** deterioration before it happens
- **Simulates** treatment outcomes before applying them
- Integrates real-time **vitals, clinical history, and AI insights** into one unified view

**Patient Digital Twin solves this** by creating an AI-driven virtual replica of each patient that evolves with every clinical interaction.

* * *

## 🧠 What is a Patient Digital Twin?

A **Digital Twin** is a virtual model that mirrors a real-world entity in real-time. Our **Patient Digital Twin** mirrors a patient's complete health state:

```
┌─────────────────────────────────────────────────────────────┐
│                    PATIENT DIGITAL TWIN                       │
─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ──────────────┐  ┌──────────────────────┐  │
│  │ Twin     │  │ Vitals       │  │ AI Predictive        │  │
│  │ State    │  │ Stream       │  │ Engine               │  │
│  │ Machine  │  │ (real-time)  │  │ (trajectory, risk)   │  │
│  └──────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Risk     │  │ Treatment    │  │ Health Score         │  │
│  │ Scores   │  │ Simulation   │  │ (composite 0-100)    │  │
│  │          │  │ (What-If)    │  │                      │  │
│  └──────────┘  └──────────────┘  └──────────────────────┘  │
│                                                             │
│  Data Sources: Kiosk Intake · Vitals · FHIR · IoT · AI      │
└─────────────────────────────────────────────────────────────┘
```

* * *

## ✨ Core Digital Twin Features

### 🫀 1. Twin State Machine
Each patient's twin exists in one of 6 states, automatically transitioning based on health score:
- **Baseline** → **Stable** → **Monitoring** → **At Risk** → **Deteriorating** → **Critical**

The state machine evaluates: vitals, chronic conditions, AI clinical summaries, and risk scores.

###  2. Composite Health Score (0-100)
A continuously updated score computed from:
- Real-time vitals (HR, BP, SpO2, temperature, glucose, respiratory rate)
- Chronic condition burden
- Medication adherence
- Clinical summary flags
- Historical trajectory

###  3. Real-Time Vitals Stream
Simulated and IoT-ready vitals pipeline:
- Heart rate, blood pressure, SpO2, temperature, respiratory rate, blood glucose
- Automatic anomaly detection and alerting
- Historical trend analysis

### 🧠 4. AI Predictive Engine
Four prediction models running on each twin:
- **Readmission Risk** — 30-day readmission probability with contributing factors
- **Disease Progression** — 12-month health trajectory forecast
- **Vitals Forecast** — Next 24-hour vitals prediction
- **Complication Risk** — Multi-condition complication probability assessment

### 🎮 5. Treatment Simulation (What-If Engine)
Physicians can test interventions **before** applying them:
- **Medication changes** — predicted health score impact over 12 weeks
- **Lifestyle interventions** — diet, exercise, weight management outcomes
- **Procedure simulation** — surgical risk vs benefit modeling
- **Comparative simulation** — A/B test multiple treatment plans

### 🚨 6. Risk Assessment Dashboard
Automated risk scoring for:
- 30-day readmission risk
- Cardiovascular events
- Disease deterioration
- Medication adverse effects
- Sepsis / AKI / DKA / MI / Stroke

### 📱 7. Twin Dashboard
Real-time visualization of the patient's digital twin:
- Health score gauge with state indicator
- Live vitals stream (with demo mode)
- Risk assessment bars with contributing factors
- AI prediction timelines with trajectory charts
- Treatment simulation results

* * *

## 🔁 How It Works — Digital Twin Lifecycle

```
┌────────────┐     ┌────────────┐     ┌──────────────┐
│ Patient    │     │ MediKiosk  │     │ Digital Twin │
│ walks in   │────▶│ Kiosk      │────▶│ Engine       │
│            │     │ (intake)   │     │              │
└────────────┘     └────────────┘     └──────┬───────┘
                                             │
                                    ┌────────▼────────┐
                                    │ Twin State      │
                                    │ Machine Update  │
                                    └────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
            ┌───────────────┐       ┌──────────────┐        ┌─────────────┐
            │ Vitals Stream │       │ Risk Scores  │        │ Predictions │
            │ (real-time)   │       │ (auto-computed)│       │ (AI engine) │
            └───────┬───────┘       └──────────────┘        └──────┬──────┘
                    │                                               │
                    ▼                                               ▼
            ┌──────────────┐                               ┌──────────────┐
            │ Twin Snapshot│                               │ Simulation   │
            │ (audit trail)│                               │ (What-If)    │
            └──────────────┘                               └──────────────┘
                    │                                               │
                    └──────────────────────────────────────────────┘
                                     ▼
                            ┌────────────────┐
                            │ Twin Dashboard │
                            │ (physician     │
                            │  visualization)│
                            └────────────────┘
```

* * *

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router) + **React 19** + TypeScript |
| Styling | Tailwind CSS 4 |
| Database | **PostgreSQL** + **Drizzle ORM** (type-safe schema & queries) |
| Auth | **Firebase** phone OTP (patient) + server session cookies |
| AI | **Groq** (`openai/gpt-oss-120b`), fallbacks: Gemini, Ollama, rule engine |
| Twin Engine | Custom state machine + rule-based risk calculator |
| Predictions | AI-powered trajectory modeling + vital trend analysis |
| Simulation | What-if treatment scenario engine |
| Alerts | **Nodemailer** (SMTP email), **Twilio** (WhatsApp + SMS) |
| Standards | FHIR bundle output, ABHA id storage, DPDP consent |
| Hosting | **Vercel** (auto-deploy from GitHub) |

* * *

## 📁 Project Structure (Digital Twin Layer)

```
PatientDigitalTwin/
├── src/
│   ├── db/
│   │   ├── schema.ts              # Base MediKiosk schema
│   │   └── twin-schema.ts         # ⭐ Digital Twin tables
│   ├── lib/
│   │   ├── twin-engine.ts         # ⭐ Core twin state machine
│   │   ├── vitals-simulator.ts    # ⭐ Real-time vitals generator
│   │   ├── prediction-engine.ts   # ⭐ AI prediction models
│   │   └── simulation-engine.ts   # ⭐ What-if treatment simulator
│   ├── app/
│   │   ├── twin/
│   │   │   ├── page.tsx           # ⭐ Twin listing & creation
│   │   │   └── [id]/page.tsx      # ⭐ Twin dashboard (live)
│   │   └── api/
│   │       ├── twin/route.ts      # ⭐ Twin CRUD API
│   │       └── simulate/route.ts  # ⭐ Simulation API
│   └── components/                # Existing MediKiosk UI
├── package.json
├── drizzle.config.ts
└── README.md
```

* * *

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/shridhar-1/PatientDigitalTwin.git
cd PatientDigitalTwin

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in your DATABASE_URL, Firebase, Groq keys, etc.

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```

Visit [http://localhost:3000/twin](http://localhost:3000/twin) for the Digital Twin dashboard.

* * *

##  Demo Walkthrough

1. **Create a Twin** — Go to `/twin` and click "Create Twin" with patient data
2. **View the Dashboard** — See health score, vitals, risks, predictions
3. **Enable Live Mode** — Click "Start Live Demo" to stream simulated vitals
4. **Run a Simulation** — Test treatment scenarios via the API
5. **Watch the Twin Evolve** — Health score and state update in real-time

* * *

## 📊 Digital Twin Data Model

### Core Tables (PostgreSQL via Drizzle)

| Table | Purpose |
| --- | --- |
| `digital_twins` | Living twin model per patient (state, health score, conditions) |
| `vital_events` | Real-time vitals stream (HR, BP, SpO2, temp, glucose, RR) |
| `twin_snapshots` | Point-in-time state snapshots (audit trail) |
| `risk_scores` | AI/rule-computed risk assessments |
| `predictions` | AI-generated future trajectory forecasts |
| `simulations` | Treatment what-if scenario results |
| `device_integrations` | IoT/wearable device connections |

* * *

## 🏆 SIH 2026 Submission Details

- **Problem Statement:** Digital Twin for Healthcare (Happiest Health Track)
- **Team:** [Your Team Name]
- **Repository:** [github.com/shridhar-1/PatientDigitalTwin](https://github.com/shridhar-1/PatientDigitalTwin)
- **Live Demo:** [https://medi-kiosk-tau.vercel.app](https://medi-kiosk-tau.vercel.app/)

* * *

## 📄 License

MIT — Built for SIH 2026
