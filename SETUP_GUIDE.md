# Setup Guide — Adding Digital Twin Tables to Existing MediKiosk

## Quick Setup (Supabase Free Tier — Recommended)

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Copy the **Connection String** (Settings → Database)
- Set `DATABASE_URL` in `.env.local`

### 2. Push the Schema
```bash
npm install
npx drizzle-kit push
```

This creates ALL tables (both MediKiosk + Digital Twin) in one shot.

### 3. Verify
```bash
# Check tables exist
npx drizzle-kit studio
```

You should see:
- `patients`, `staff`, `sessions`, `clinical_summaries` (existing MediKiosk)
- `digital_twins`, `vital_events`, `twin_snapshots`, `risk_scores`, `predictions`, `simulations`, `device_integrations` (new Digital Twin)

---

## Manual SQL (if drizzle-kit push fails)

Run this in your PostgreSQL console:

```sql
-- Digital Twins table
CREATE TABLE IF NOT EXISTS digital_twins (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  twin_state TEXT NOT NULL DEFAULT 'baseline',
  health_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  age INTEGER,
  gender TEXT,
  chronic_conditions JSONB,
  current_medications JSONB,
  allergies JSONB,
  last_updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Vital Events table
CREATE TABLE IF NOT EXISTS vital_events (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL,
  source TEXT NOT NULL DEFAULT 'simulated',
  heart_rate INTEGER,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  spo2 INTEGER,
  temperature DECIMAL(4,1),
  respiratory_rate INTEGER,
  blood_glucose DECIMAL(5,1),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Twin Snapshots table
CREATE TABLE IF NOT EXISTS twin_snapshots (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL,
  snapshot_version INTEGER NOT NULL,
  trigger TEXT NOT NULL,
  full_state JSONB,
  health_score DECIMAL(5,2),
  delta_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Risk Scores table
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL,
  risk_type TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  level TEXT NOT NULL,
  contributing_factors JSONB,
  ai_model TEXT,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL,
  prediction_type TEXT NOT NULL,
  horizon TEXT NOT NULL,
  summary TEXT NOT NULL,
  probability DECIMAL(5,2),
  trajectory JSONB,
  confidence DECIMAL(5,2),
  ai_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL,
  scenario_name TEXT NOT NULL,
  intervention JSONB,
  outcome_summary TEXT,
  outcome_trajectory JSONB,
  comparator TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Device Integrations table
CREATE TABLE IF NOT EXISTS device_integrations (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL,
  device_type TEXT NOT NULL,
  device_id TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected',
  last_reading_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vital_events_twin_id ON vital_events(twin_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_twin_id ON risk_scores(twin_id);
CREATE INDEX IF NOT EXISTS idx_predictions_twin_id ON predictions(twin_id);
CREATE INDEX IF NOT EXISTS idx_simulations_twin_id ON simulations(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_snapshots_twin_id ON twin_snapshots(twin_id);
```

---

## Testing the Twin API

### Create a Twin
```bash
curl -X POST http://localhost:3000/api/twin \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "patientId": "test-patient-001",
    "age": 55,
    "gender": "male",
    "chronicConditions": ["diabetes", "hypertension"],
    "currentMedications": [
      {"name": "Metformin", "dose": "500mg", "frequency": "twice daily"}
    ]
  }'
```

### Get Twin Dashboard Data
```bash
curl "http://localhost:3000/api/twin?twinId=<TWIN_ID>"
```

### Update Twin with New Vitals
```bash
curl -X POST http://localhost:3000/api/twin \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "twinId": "<TWIN_ID>",
    "newVitals": {
      "heartRate": 88,
      "systolicBP": 145,
      "diastolicBP": 92,
      "spo2": 94,
      "temperature": 37.8,
      "respiratoryRate": 20,
      "bloodGlucose": 165
    }
  }'
```

### Generate Predictions
```bash
curl -X POST http://localhost:3000/api/twin \
  -H "Content-Type: application/json" \
  -d '{
    "action": "predict",
    "twinId": "<TWIN_ID>"
  }'
```

### Run a Treatment Simulation
```bash
curl -X POST http://localhost:3000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "run",
    "twinId": "<TWIN_ID>",
    "scenarioName": "Add ACE Inhibitor for BP Control",
    "intervention": {
      "type": "medication_change",
      "details": "Add Lisinopril 10mg daily"
    }
  }'
```
