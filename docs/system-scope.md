# System Scope — Sentient Command Centre

## 1. Primary Boundary

The **Sentient Command Centre** represents the operational fraud surveillance, monitoring, and triage tier of the fraud platform. It provides fraud analysts, team leads, and compliance officers with high-density operational views to monitor real-time activity, prioritize urgent risks, and conduct drill-down audits.

---

## 2. What Belongs to This System

| Component / Layer | Retained Features & Capabilities |
| :--- | :--- |
| **Frontend UI** | • Command Centre Executive Dashboard (`CommandCentrePage.tsx`)<br>• Alerts Triage Queue (`AlertsPage.tsx`)<br>• Synthetic Transaction Ledger (`TransactionsPage.tsx`)<br>• Customer Surveillance Console (`CustomersPage.tsx`)<br>• Slide-over Forensic Entity Drawer (`EntityDrawer.tsx`)<br>• 3-Tier Evidence Dossier (`EvidenceDossier.tsx`)<br>• Interactive Relationship Tree Graph (`RelationshipTree.tsx`)<br>• Global Entity Search Modal (`GlobalSearchModal.tsx`) |
| **Backend APIs** | • `/api/overview`: KPI metrics, scenario breakdown, mule watchlist<br>• `/api/alerts`: Alert triage and severity filters<br>• `/api/transactions`: Transaction audit ledger with currency & channel filters<br>• `/api/customers`: Customer surveillance with KYC, segment & city filters<br>• `/api/devices`: Device risk surveillance<br>• `/api/beneficiaries`: High-risk beneficiary registry<br>• `/api/entities`: Entity graph and profile retrieval<br>• `/api/signals`: Signal telemetry<br>• `/api/evaluate`: Deterministic rule evaluation engine<br>• `/api/evidence`: 3-Tier forensic dossier generation<br>• `/api/search`: Global multi-entity search |
| **Data & Engine** | • Complete SQLite database (`database/synthetic_bank.db`, 2,500 records)<br>• 11 deterministic fraud rules (`rules/`)<br>• Mathematical risk scoring engine<br>• Rawbank Phase A design tokens (`frontend/src/styles/index.css`) |

---

## 3. What Belongs to the Sibling System (Fraud Investigation Copilot)

The following capabilities are **explicitly excluded** from the Command Centre and belong exclusively to the **Sentient Fraud Investigation Copilot**:
* Conversational natural-language chat interface
* Groq LLM integration and deterministic mock LLM adapter
* Retrieval-Augmented Generation (RAG) context synthesis and prompt builders
* Narrative hypothesis generation and counter-evidence analysis
* Automated case escalation narrative generator
* Copilot session and turn management
