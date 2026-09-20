# 🌿 GreenLane AI
> **"See your logistics carbon. Simulate smart fixes. Find the sweet spot between sustainability, budget, and speed."**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

---

## 💡 What is GreenLane AI? (In Plain English)

Ever wonder how much pollution is caused when packages, apparel, and raw materials travel across the globe on cargo planes, giant container ships, freight trains, and diesel trucks?

That's called **Scope 3 Transportation Emissions**, and for most global businesses, it makes up **up to 80% of their total carbon footprint**.

Today, companies manage this with clunky, backward-looking spreadsheets that only tell them what they emitted *last year*. They have no easy way to answer real-time questions like:
* *"What happens to our budget and delivery times if we switch 30% of our rush air freight to fast ocean shipping?"*
* *"If the Suez Canal or a major port gets blocked, how much extra carbon and delay will our detours cause?"*
* *"How can we cut 20% carbon without blowing our logistics budget?"*

**GreenLane AI solves this.** It's an intelligent, real-time logistics control tower and simulation laboratory that turns messy transport data into crystal-clear decisions.

---

## ✨ Standout Superpowers

### 1. 🔍 The "Air Freight Anomaly" Hunter
In almost every supply chain, a tiny fraction of rush shipments (~10%) generates nearly half (~45%) of total carbon emissions. GreenLane AI automatically flags these hotspots and calculates the exact ROI of shifting them to greener modes.

### 2. 🗺️ Live Interactive GIS Supply Chain Map
A sleek, dark-mode geospatial map showing your entire logistics network: supplier origins, transit ports, distribution warehouses, and multimodal transport corridors—all running without third-party API key limits.

### 3. 🧪 What-If Simulation Laboratory
Slide real-world decarbonization levers on the fly:
* **Modal Shifting:** Move freight from Air $\rightarrow$ Ocean or Road $\rightarrow$ Rail.
* **Load Consolidation (LCL to FCL):** Pack containers smarter to eliminate wasted empty trips.
* **Shadow Carbon Pricing:** Apply an internal carbon tax (€0 to €200 / tonne) to see future financial risks before regulations hit.

### 4. ⚡ Pareto Multi-Objective Optimizer
Real supply chains are all about trade-offs. You can't just cut carbon if it triples costs or doubles delivery times. Our algorithm explores hundreds of permutations to find the **Pareto Optimal Frontier**—giving decision-makers a menu of mathematically optimal plans (e.g. *Option B: -25% CO₂ for only a +3.2% budget increase*).

### 5. 🛡️ Disruption & Supply Chain Resilience Center
Simulate real-world crises like port congestion in Rotterdam, severe monsoon weather in Mumbai, or fuel price spikes. GreenLane AI instantly models alternate routes, extra transit days, and detour carbon surges.

### 6. 🤖 Conversational AI Copilot
Ask questions in everyday English:
> *"What are our top 3 dirtiest shipping lanes and how can we cut emissions by 15% with minimal delay?"*
The Copilot queries the live database, runs optimization tools under the hood, and hands you an executive summary.

### 7. 💱 Multi-Currency Live Support
Switch effortlessly between **₹ INR (Indian Rupees)**, **€ EUR (Euros)**, **$ USD (US Dollars)**, and **£ GBP (British Pounds)** with real-time conversion across all metrics, sliders, and audit reports.

---

## 🏗️ How It Works Under the Hood

```
   Raw Logistics Data (CSV / API)
                │
                ▼
  ┌─────────────────────────────────────────┐
  │   Deterministic Carbon Accounting Engine │  <-- ADEME Base Carbone v2023 & GLEC
  │   Formula: Weight × Distance × Factor   │  <-- Zero AI math hallucinations
  └──────────────────┬──────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
What-If Simulator  Pareto Engine  Disruption Center
     │               │               │
     └───────────────┼───────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │         AI Copilot & Control Tower      │
  │     (Interactive Map + React Dashboard) │
  └─────────────────────────────────────────┘
```

* **Calculation Standard:** Conforms strictly to **GLEC Framework v2.0** and **ADEME Base Carbone v2023** emission factors. All calculations are 100% deterministic in Python.
* **Dual-Dataset Included:**
  * **VastraGlobal Exports:** Global multimodal apparel supply chain (India $\rightarrow$ Europe/USA).
  * **Original Logistics Data:** 5,208 shipment lines across 19 distribution routes.

---

## 🚀 Quick Start (Run Locally in 2 Minutes)

### 1️⃣ Prerequisites
* **Python 3.10+** installed
* **Node.js 18+** installed

---

### 2️⃣ Start the Backend
Open a terminal and run:
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed the database (creates greenlane.db with sample & historical datasets)
python -m app.data.seed

# Launch FastAPI server (runs at http://localhost:8000)
python run.py
```
> 📚 *Interactive API Swagger docs available at [http://localhost:8000/docs](http://localhost:8000/docs)*

---

### 3️⃣ Start the Frontend
Open a second terminal and run:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs at http://localhost:5173)
npm run dev
```

---

### 4️⃣ Open GreenLane AI
Visit **[http://localhost:5173](http://localhost:5173)** in your browser and enjoy exploring!

---

## 🧪 Running Automated Tests

We believe in bulletproof code. You can verify the entire engine with one command:
```bash
cd backend
python -m tests.run_tests
```
**Test Coverage Includes:**
* ✅ Canonical CO₂ emission calculations
* ✅ Shadow carbon tax pricing models
* ✅ Multi-dataset integrity checks
* ✅ Scenario modal shifting math
* ✅ Pareto multi-objective optimization solver
* ✅ Disruption detour calculations
* ✅ AI Copilot tool-calling execution

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend API** | FastAPI, Python 3.10+, SQLAlchemy, Pydantic, Uvicorn |
| **Data Engine** | SQLite, Pandas, NumPy, Combinatorial Optimization Heuristics |
| **Frontend UI** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Data Viz & GIS** | Leaflet / React-Leaflet, Esri Dark Matter Tiles, Recharts |
| **AI Integration** | Tool-calling Copilot with SQLite query execution & scenario synthesis |

---

## 📜 License
Distributed under the **MIT License**. Feel free to use, modify, and build upon this project.

---

<p align="center">
  <b>Built with 🌿 for a more sustainable, resilient global supply chain.</b>
</p>
