# System Architecture — Sentient Command Centre

```
+-----------------------------------------------------------------------------------+
|                        SENTIENT COMMAND CENTRE FRONTEND                           |
|             (React 19 + TypeScript + Vite + Rawbank Design System)                |
|                                                                                   |
|  [Command Centre]      [Alerts Triage]     [Transactions]     [Customers]         |
|  - Real-time KPIs      - Severity Queues   - Multi-channel    - KYC Filters       |
|  - Scenario Dist.      - Forensic Filter   - Dual-Currency    - Risk Baselines    |
|                                                                                   |
|            +---------------------------------------------------------+            |
|            |   Forensic Entity Drawer + 3-Tier Evidence Dossier       |            |
|            |   Interactive Graph Relationship Intelligence            |            |
|            +---------------------------------------------------------+            |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP / JSON REST
                                          v
+-----------------------------------------------------------------------------------+
|                           COMMAND CENTRE FASTAPI BACKEND                          |
|                                                                                   |
|  Routers:                                                                         |
|  - /api/overview       - /api/alerts          - /api/transactions                 |
|  - /api/customers      - /api/devices         - /api/beneficiaries                |
|  - /api/entities       - /api/signals         - /api/evaluate                     |
|  - /api/evidence       - /api/search          - /api/health                       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         DETERMINISTIC INTELLIGENCE ENGINE                         |
|                                                                                   |
|  11 Registered Forensic Rules (rules/):                                           |
|  - High Velocity Surge          - High Value Spike        - Baseline Deviation    |
|  - Structuring Pattern (Smurf)  - New Beneficiary Velocity- Dormant Activation    |
|  - Mule Account Funnel          - Geolocation Anomaly     - Device Fingerprint    |
|  - Device Sharing Mule          - Off-Hours High Risk                             |
|                                                                                   |
|  Mathematical Composite Risk Scoring: [0 - 100]                                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           SYNTHETIC BANKING DATABASE                              |
|                       (Local SQLite: synthetic_bank.db)                           |
|                                                                                   |
|  - 120 Customers        - 240 Accounts          - 150 Devices                     |
|  - 180 Beneficiaries    - 900 Transactions      - 450 Auth Activities             |
|  - 120 Baselines        - 140 Alerts            - 200 Fraud Signals               |
+-----------------------------------------------------------------------------------+
```
