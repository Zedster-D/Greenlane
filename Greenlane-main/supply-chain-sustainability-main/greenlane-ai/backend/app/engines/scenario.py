"""
GreenLane AI — Scenario Engine

What-if analysis: change transport mode, consolidate loads,
adjust routes, apply carbon pricing.
"""

from __future__ import annotations
from typing import List, Dict, Optional
from .carbon import calculate_co2e, calculate_carbon_cost


def run_scenario(
    shipments: List[dict],
    mode_overrides: Optional[Dict[str, str]] = None,
    consolidation_factor: float = 1.0,
    carbon_price: float = 50.0,
    cost_per_km: Optional[Dict[str, float]] = None,
    time_per_km: Optional[Dict[str, float]] = None,
) -> dict:
    """
    Run a what-if scenario on a list of shipments.

    Args:
        shipments: List of shipment dicts with weight_kg, distances, mode, etc.
        mode_overrides: Dict mapping route_id -> new_mode
        consolidation_factor: Multiplier for load consolidation (0.5 = half trips)
        carbon_price: Carbon price per tonne CO₂e
        cost_per_km: Cost rates by mode (defaults provided)
        time_per_km: Transit time rates by mode in hours/km

    Returns:
        Scenario results with baseline vs scenario comparison
    """
    if cost_per_km is None:
        cost_per_km = {"road": 1.2, "rail": 0.6, "sea": 0.15, "air": 4.5}
    if time_per_km is None:
        time_per_km = {"road": 0.02, "rail": 0.03, "sea": 0.06, "air": 0.002}

    baseline_co2 = 0.0
    baseline_cost = 0.0
    baseline_time = 0.0
    scenario_co2 = 0.0
    scenario_cost = 0.0
    scenario_time = 0.0
    details = []

    for s in shipments:
        weight_kg = s.get("weight_kg", 0)
        route_id = s.get("route_id", "")

        # Baseline: use original modes
        for mode in ["road", "rail", "sea", "air"]:
            dist = s.get(f"distance_{mode}", 0)
            if dist > 0:
                result = calculate_co2e(weight_kg, dist, mode)
                baseline_co2 += result.co2e_kg
                baseline_cost += dist * cost_per_km.get(mode, 1.0) * (weight_kg / 1000)
                baseline_time += dist * time_per_km.get(mode, 0.02)

        # Scenario: apply overrides
        new_mode = mode_overrides.get(route_id) if mode_overrides else None
        total_distance = sum(s.get(f"distance_{m}", 0) for m in ["road", "rail", "sea", "air"])

        if new_mode and total_distance > 0:
            result = calculate_co2e(weight_kg * consolidation_factor, total_distance, new_mode)
            scenario_co2 += result.co2e_kg
            scenario_cost += total_distance * cost_per_km.get(new_mode, 1.0) * (weight_kg * consolidation_factor / 1000)
            scenario_time += total_distance * time_per_km.get(new_mode, 0.02)
            details.append({
                "route_id": route_id,
                "original_co2": baseline_co2,
                "new_co2": result.co2e_kg,
                "new_mode": new_mode,
                "distance": total_distance,
            })
        else:
            # No override: same as baseline for this shipment
            for mode in ["road", "rail", "sea", "air"]:
                dist = s.get(f"distance_{mode}", 0)
                if dist > 0:
                    result = calculate_co2e(weight_kg * consolidation_factor, dist, mode)
                    scenario_co2 += result.co2e_kg
                    scenario_cost += dist * cost_per_km.get(mode, 1.0) * (weight_kg * consolidation_factor / 1000)
                    scenario_time += dist * time_per_km.get(mode, 0.02)

    co2_change = scenario_co2 - baseline_co2
    cost_change = scenario_cost - baseline_cost
    time_change = scenario_time - baseline_time

    return {
        "baseline": {
            "co2e_kg": round(baseline_co2, 2),
            "cost": round(baseline_cost, 2),
            "time_hours": round(baseline_time, 2),
            "carbon_cost": round(calculate_carbon_cost(baseline_co2, carbon_price), 2),
        },
        "scenario": {
            "co2e_kg": round(scenario_co2, 2),
            "cost": round(scenario_cost, 2),
            "time_hours": round(scenario_time, 2),
            "carbon_cost": round(calculate_carbon_cost(scenario_co2, carbon_price), 2),
        },
        "delta": {
            "co2e_kg": round(co2_change, 2),
            "co2e_pct": round((co2_change / baseline_co2 * 100) if baseline_co2 else 0, 1),
            "cost": round(cost_change, 2),
            "cost_pct": round((cost_change / baseline_cost * 100) if baseline_cost else 0, 1),
            "time_hours": round(time_change, 2),
            "time_pct": round((time_change / baseline_time * 100) if baseline_time else 0, 1),
        },
        "consolidation_factor": consolidation_factor,
        "carbon_price": carbon_price,
    }
