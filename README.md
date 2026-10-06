# Rawbank Sentient Command Centre

**Operational Fraud Intelligence & Surveillance Platform**  
*System 1 of the Rawbank Sentient Fraud Intelligence Platform*

---

## 1. System Overview & Purpose

The **Sentient Command Centre** is a dedicated operational fraud intelligence system designed for real-time transaction surveillance, rapid alert triage, risk scoring, and customer surveillance within the Democratic Republic of the Congo (DRC) banking sector.

It fulfills the operational requirements of fraud operations centers:
* **Continuous Monitoring**: High-volume transaction ledger ingestion and risk monitoring.
* **Deterministic Risk Scoring**: 11 mathematical fraud detection rules executing across velocity, behavioral deviations, geographic anomalies, device hygiene, structuring, and mule network patterns.
* **Alert Triage & Prioritization**: Multi-tier alert queue with strict severity categorization (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
* **Forensic Drill-Down**: 3-tier grounded evidence dossiers and graph relationship visualization.

---

## 2. Assignment Use Case & Primary Workflow

* **Primary Use Case**: Operational Fraud Surveillance, Alert Triage & Transaction Auditing
* **Operational Workflow**:
  ```
  Monitor  ──►  Prioritise  ──►  Analyse  ──►  Drill Down
     │                │              │             │
  Dashboard        Critical        Rules         Forensic
  & KPIs         Alert Queue     Execution       Dossier
  ```

---

## 3. Technology Stack

* **Frontend**: React 19, TypeScript, Vite, TailwindCSS (Phase A Rawbank Design System), Lucide Icons
* **Backend**: FastAPI, Python 3.14, Uvicorn, SQLite
* **Intelligence Engine**: 11 deterministic rules with composite mathematical scoring [0-100]
* **Database**: Local SQLite relational database (`synthetic_bank.db`) containing 2,500 synthetic records
* **Design System**: Official Rawbank Brand Identity (`#FCB900` Selective Yellow, `#0E131B` Obsidian, typography, and leopard emblem)

---

## 4. Retained Functional Scope

* **Command Centre Dashboard**: Executive and operational KPI monitoring (Total Alerts, High-Risk Accounts, 24h Monitored Volume, Average Composite Score, Alert Scenarios, Mule Watchlist).
* **Alerts Triage**: Severity filters, scenario distribution, forensic drawer drill-down.
* **Synthetic Transaction Ledger**: Multi-channel audit (Mobile App, POS, ATM, Online Banking, Agency Banking, Swift), currency filtering (USD / CDF), flag filters.
* **Customer Risk Surveillance**: KYC status filters (Tier 1 Basic, Tier 2 Standard, Tier 3 Full), business segment filters (Retail, SME, Corporate, VIP, Agency Banking), behavioral baseline comparisons.
* **Forensic Entity Drawer**: 3-tier evidence dossiers (Tier 1 Exact Data, Tier 2 Calculated Metrics, Tier 3 Retrieved Evidence).
* **Relationship Intelligence**: Interactive multi-hop entity graphs (Accounts, Beneficiaries, Shared Devices).
* **Mule Funnel Watchlist**: Proactive flagging of multi-inflow rapid dispersion patterns.

---

## 5. Synthetic Data Disclaimer

> **ANALYTICAL SAFETY BOUNDARY**:  
> This platform operates exclusively on a **100% synthetic research database** generated for demonstration, testing, and evaluation purposes. **No real Rawbank customer data, account numbers, or real transaction records are contained or accessed by this system.** All names, account identifiers, phone numbers, and device fingerprints are procedurally generated mathematical constructs.

---

## 6. How to Run

### Backend API Server
```bash
# From repository root
py -3.14 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
* **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Frontend Web Application
```bash
# Navigate to frontend directory
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
* **Web UI**: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 7. Testing & Verification

### Run Backend Unit Tests (58 tests)
```bash
py -3.14 -m unittest discover -s tests -p "test_*.py"
```

### Run Frontend Vitest Suite (21 tests)
```bash
cd frontend
npm run test
```

### Run Production Frontend Build
```bash
cd frontend
npm run build
```

---

## 8. Important Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `development` | Deployment environment mode |
| `HOST` | `127.0.0.1` | API bind address |
| `PORT` | `8000` | API bind port |
| `DB_PATH` | `database/synthetic_bank.db` | Local SQLite database file path |
| `CORS_ORIGINS` | `["http://localhost:5173", "http://127.0.0.1:5173"]` | Allowed web origins |
