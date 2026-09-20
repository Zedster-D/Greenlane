"""
GreenLane AI — Comprehensive Backend & Engine Test Suite
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engines.carbon import calculate_co2e, calculate_carbon_cost
from app.engines.emission_factors import registry
from app.engines.optimizer import optimize
from app.engines.disruption import simulate_disruption
from app.engines.scenario import run_scenario

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_carbon_engine_canonical():
    # Road test: 1000 kg (1 tonne), 100 km, road factor 0.096 -> 9.6 kg CO2e
    res = calculate_co2e(weight_kg=1000, distance_km=100, mode="road")
    assert round(res.co2e_kg, 2) == 9.60
    assert res.factor.value == 0.096

    # Shadow cost at €50/tonne
    cost = calculate_carbon_cost(1000.0, 50.0) # 1 tonne CO2 -> €50
    assert cost == 50.0


def test_dashboard_kpis():
    response = client.get("/api/dashboard/kpis?dataset=demo")
    assert response.status_code == 200
    data = response.json()
    assert data["total_shipments"] > 0
    assert data["total_co2e_kg"] > 0
    assert "top_emitter_mode" in data


def test_dashboard_monthly():
    response = client.get("/api/dashboard/monthly?dataset=demo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "co2e_kg" in data[0]


def test_network_graph():
    response = client.get("/api/network?dataset=demo")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) > 0
    assert len(data["edges"]) > 0


def test_shipments_ledger():
    response = client.get("/api/shipments?dataset=demo&page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["shipments"]) == 10


def test_scenario_run():
    payload = {
        "name": "Test Air to Sea",
        "mode_overrides": {"air": "sea"},
        "consolidation_factor": 0.9,
        "carbon_price": 50.0,
        "dataset": "demo"
    }
    response = client.post("/api/scenarios/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "scenario" in data
    assert "delta" in data
    assert data["scenario"]["co2e_kg"] < data["baseline"]["co2e_kg"]


def test_optimizer_run():
    payload = {
        "co2_reduction_target_pct": 20.0,
        "max_cost_increase_pct": 20.0,
        "max_time_increase_pct": 100.0,
        "carbon_price": 50.0,
        "dataset": "demo"
    }
    response = client.post("/api/optimizer/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "pareto_options" in data
    assert len(data["pareto_options"]) > 0


def test_disruption_simulation():
    payload = {
        "disruption_type": "port_closure",
        "affected_location": "Rotterdam",
        "severity": 1.0,
        "dataset": "demo"
    }
    response = client.post("/api/disruptions/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "impact" in data
    assert "rerouted" in data


def test_ai_copilot():
    payload = {
        "message": "Why are our emissions so high?",
        "dataset": "demo"
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["reply"]) > 0
    assert len(data["tool_calls"]) > 0
    assert len(data["suggested_prompts"]) > 0


def test_suppliers_360():
    response = client.get("/api/suppliers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "esg_grade" in data[0]
