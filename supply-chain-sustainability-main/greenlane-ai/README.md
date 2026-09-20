# 🌿 GreenLane AI
> **"See the carbon. Understand the risk. Simulate the future. Make better logistics decisions."**

GreenLane AI is an enterprise-grade Scope 3 transportation carbon accounting, scenario simulation, and multi-objective optimization platform. It transforms raw logistics transaction datasets into decision-grade sustainability intelligence with zero guesswork.

---

## 🌟 Key Capabilities

1. **Canonical Carbon Engine (ADEME / GLEC compliant)**:
   - Single canonical calculation formula: `Weight (t) × Distance (km) × Factor (kg CO₂e/t·km)`
   - Full versioned provenance metadata for every emission factor (ADEME Base Carbone v2023).
   - Zero hallucination — calculations are performed deterministically in Python.

2. **Multi-Modal Logistics Control Tower**:
   - High-throughput analytics across Road, Rail, Ocean, and Air freight.
   - Disproportionate air freight anomaly detection (~10% shipments generating ~45% carbon).
   - Real-time GIS interactive network map with route risk indicators and carrier flow volumes.

3. **What-If Simulation Laboratory**:
   - Modal switching simulator (Air ➔ Ocean, Road ➔ Rail).
   - Load consolidation multiplier (LCL to FCL container bundling).
   - Internal shadow carbon tax liability calculator (€0 to €200/t).

4. **Pareto Multi-Objective Optimizer**:
   - Fast combinatorial and heuristic optimization.
   - Non-dominated trade-off frontier between carbon reduction, logistics budget, and transit lead time.

5. **Supply Chain Disruption & Resilience Center**:
   - Dynamic simulation of port closures, weather disruptions, and fuel spikes.
   - Automated alternative rerouting with detour carbon and delay calculations.

6. **AI Sustainability Copilot**:
   - Conversational assistant with tool execution.
   - Direct database querying, on-demand scenario runs, and actionable executive insights.

7. **Dual-Dataset Support**:
   - **VastraGlobal Exports (Demo)**: Indian global apparel exporter with multimodal air/sea/rail/road distribution.
   - **Original Logistics Data**: The 5,208 order lines and 19 warehouse routes preserved with 100% calculation parity.

---

## 🚀 Quick Start Guide

### 1. Backend (FastAPI + Python 3.10+)
```bash
cd greenlane-ai/backend

# Install dependencies
pip install -r requirements.txt

# Run database seeder (initializes SQLite DB with original + demo datasets)
python -m app.data.seed

# Start backend server (runs at http://localhost:8000)
python run.py
```

### 2. Frontend (React + Vite + TypeScript + Tailwind CSS)
```bash
cd greenlane-ai/frontend

# Install dependencies
npm install

# Start Vite development server (runs at http://localhost:5173)
npm run dev
```

Visit **http://localhost:5173** to access GreenLane AI!

---

## 🧪 Testing

```bash
# Run backend engine and integration tests
cd greenlane-ai/backend
python -m tests.run_tests
```
