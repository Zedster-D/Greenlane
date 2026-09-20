"""
GreenLane AI — Direct Test Runner
"""

from app.engines.carbon import calculate_co2e, calculate_carbon_cost
from app.engines.emission_factors import registry
from app.engines.optimizer import optimize
from app.engines.disruption import simulate_disruption
from app.engines.scenario import run_scenario
from app.core.database import SessionLocal
from app.models.tables import Shipment
from app.ai.agent import CopilotAgent


def run_all_tests():
    print("[TEST] Running GreenLane AI core engine & API tests...")

    # 1. Carbon Engine
    res = calculate_co2e(weight_kg=1000, distance_km=100, mode="road")
    assert round(res.co2e_kg, 2) == 9.60, f"Expected 9.60, got {res.co2e_kg}"
    assert res.factor.value == 0.096
    print("  [PASS] Canonical CO2 calculation (Road)")

    cost = calculate_carbon_cost(1000.0, 50.0)
    assert cost == 50.0
    print("  [PASS] Carbon shadow cost pricing")

    # 2. Database verification
    db = SessionLocal()
    orig_count = db.query(Shipment).filter(Shipment.dataset == "original").count()
    demo_count = db.query(Shipment).filter(Shipment.dataset == "demo").count()
    assert orig_count == 5208, f"Expected 5208 original shipments, got {orig_count}"
    assert demo_count == 850, f"Expected 850 demo shipments, got {demo_count}"
    print(f"  [PASS] Database integrity: {orig_count} original shipments, {demo_count} demo shipments")

    # 3. Scenario Engine
    shipments = db.query(Shipment).filter(Shipment.dataset == "demo").all()
    s_dicts = [{"route_id": f"{s.warehouse_code}->{s.customer_code}", "origin": s.origin_city, "destination": s.destination_city, "weight_kg": s.weight_kg, "distance_road": s.distance_road, "distance_rail": s.distance_rail, "distance_sea": s.distance_sea, "distance_air": s.distance_air} for s in shipments]
    sc_res = run_scenario(s_dicts, mode_overrides={"air": "sea"}, consolidation_factor=0.9)
    assert sc_res["scenario"]["co2e_kg"] < sc_res["baseline"]["co2e_kg"]
    print(f"  [PASS] Scenario mode shift: {sc_res['delta']['co2e_pct']}% CO2 reduction")

    # 4. Optimizer
    opt_res = CopilotAgent(db, dataset="demo").tool_optimize_plan(20.0)
    assert len(opt_res["pareto_options"]) > 0
    print(f"  [PASS] Pareto optimizer: {len(opt_res['pareto_options'])} non-dominated options found")

    # 5. Disruption
    dis_res = simulate_disruption("port_closure", "Rotterdam", shipments=s_dicts)
    assert dis_res["impact"]["affected_shipments"] > 0
    print(f"  [PASS] Disruption simulator: {dis_res['impact']['affected_shipments']} affected shipments analyzed")

    # 6. AI Copilot Agent
    agent = CopilotAgent(db, dataset="demo")
    reply, tools, suggested = agent.process_message("Why are emissions high?")
    assert len(tools) > 0
    assert "Air" in reply or "footprint" in reply.lower()
    print("  [PASS] AI Copilot tool calling & synthesis")

    db.close()
    print("\n[SUCCESS] All 6 test suites passed flawlessly!")


if __name__ == "__main__":
    run_all_tests()
