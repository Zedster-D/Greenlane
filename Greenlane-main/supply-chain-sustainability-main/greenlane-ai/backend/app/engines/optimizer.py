"""
GreenLane AI — Optimization Engine

Multi-objective optimizer using PuLP (or fallback scipy).
Finds Pareto-optimal solutions balancing CO₂, cost, and delivery time.
"""

from __future__ import annotations
from typing import List, Dict, Optional
import itertools
from .carbon import calculate_co2e, calculate_carbon_cost


# Cost rates per tonne·km by mode
DEFAULT_COST_RATES = {"road": 1.2, "rail": 0.6, "sea": 0.15, "air": 4.5}
# Hours per km by mode
DEFAULT_TIME_RATES = {"road": 0.02, "rail": 0.03, "sea": 0.06, "air": 0.002}
MODES = ["road", "rail", "sea", "air"]


def _evaluate_plan(
    routes: List[dict],
    mode_assignments: Dict[str, str],
    cost_rates: Dict[str, float],
    time_rates: Dict[str, float],
    carbon_price: float,
) -> dict:
    """Evaluate a single plan (set of mode assignments) across all routes."""
    total_co2 = 0.0
    total_cost = 0.0
    total_time = 0.0

    for route in routes:
        rid = route["route_id"]
        mode = mode_assignments.get(rid, route.get("primary_mode", "road"))
        weight_kg = route.get("total_weight_kg", 0)
        distance = route.get("total_distance_km", 0)

        if distance > 0 and weight_kg > 0:
            result = calculate_co2e(weight_kg, distance, mode)
            total_co2 += result.co2e_kg
            total_cost += distance * cost_rates.get(mode, 1.0) * (weight_kg / 1000)
            total_time += distance * time_rates.get(mode, 0.02)

    carbon_cost = calculate_carbon_cost(total_co2, carbon_price)

    return {
        "co2e_kg": round(total_co2, 2),
        "cost": round(total_cost, 2),
        "total_cost_with_carbon": round(total_cost + carbon_cost, 2),
        "carbon_cost": round(carbon_cost, 2),
        "time_hours": round(total_time, 2),
        "mode_assignments": mode_assignments,
    }


def _is_dominated(a: dict, b: dict) -> bool:
    """Returns True if plan b dominates plan a (lower is better on all axes)."""
    return (
        b["co2e_kg"] <= a["co2e_kg"]
        and b["cost"] <= a["cost"]
        and b["time_hours"] <= a["time_hours"]
        and (b["co2e_kg"] < a["co2e_kg"] or b["cost"] < a["cost"] or b["time_hours"] < a["time_hours"])
    )


def optimize(
    routes: List[dict],
    co2_reduction_target_pct: float = 20.0,
    max_cost_increase_pct: float = 5.0,
    max_time_increase_pct: float = 50.0,
    carbon_price: float = 50.0,
    available_modes: Optional[List[str]] = None,
    cost_rates: Optional[Dict[str, float]] = None,
    time_rates: Optional[Dict[str, float]] = None,
) -> dict:
    """
    Find Pareto-optimal transport plans.

    Uses enumeration for small route sets (≤10 routes) and
    greedy heuristic for larger ones.  Returns up to 5 feasible
    options sorted by CO₂ reduction.

    Args:
        routes: List of route dicts with route_id, total_weight_kg,
                total_distance_km, primary_mode
        co2_reduction_target_pct: Desired CO₂ reduction percentage
        max_cost_increase_pct: Maximum acceptable cost increase percentage
        max_time_increase_pct: Maximum acceptable time increase percentage
        carbon_price: Carbon price per tonne CO₂e
        available_modes: Which modes are available for switching
        cost_rates: Cost per tonne·km by mode
        time_rates: Hours per km by mode

    Returns:
        Dict with baseline, feasible_options, pareto_front, and infeasible count
    """
    if available_modes is None:
        available_modes = MODES
    if cost_rates is None:
        cost_rates = DEFAULT_COST_RATES
    if time_rates is None:
        time_rates = DEFAULT_TIME_RATES

    # Calculate baseline
    baseline_assignments = {r["route_id"]: r.get("primary_mode", "road") for r in routes}
    baseline = _evaluate_plan(routes, baseline_assignments, cost_rates, time_rates, carbon_price)

    # Generate candidate plans
    candidates = []

    if len(routes) <= 8:
        # Enumerate all combinations for small sets
        route_ids = [r["route_id"] for r in routes]
        for combo in itertools.product(available_modes, repeat=len(routes)):
            assignments = dict(zip(route_ids, combo))
            plan = _evaluate_plan(routes, assignments, cost_rates, time_rates, carbon_price)
            candidates.append(plan)
    else:
        # Greedy: try switching each route to each mode
        for route in routes:
            for mode in available_modes:
                assignments = dict(baseline_assignments)
                assignments[route["route_id"]] = mode
                plan = _evaluate_plan(routes, assignments, cost_rates, time_rates, carbon_price)
                candidates.append(plan)

        # Also try switching top emitters (by baseline CO₂)
        sorted_routes = sorted(routes, key=lambda r: r.get("total_weight_kg", 0) * r.get("total_distance_km", 0), reverse=True)
        top_routes = sorted_routes[:5]
        for combo in itertools.product(available_modes, repeat=len(top_routes)):
            assignments = dict(baseline_assignments)
            for r, mode in zip(top_routes, combo):
                assignments[r["route_id"]] = mode
            plan = _evaluate_plan(routes, assignments, cost_rates, time_rates, carbon_price)
            candidates.append(plan)

    # Filter feasible
    feasible = []
    for plan in candidates:
        co2_reduction = (baseline["co2e_kg"] - plan["co2e_kg"]) / baseline["co2e_kg"] * 100 if baseline["co2e_kg"] > 0 else 0
        cost_increase = (plan["cost"] - baseline["cost"]) / baseline["cost"] * 100 if baseline["cost"] > 0 else 0
        time_increase = (plan["time_hours"] - baseline["time_hours"]) / baseline["time_hours"] * 100 if baseline["time_hours"] > 0 else 0

        if (co2_reduction >= co2_reduction_target_pct
                and cost_increase <= max_cost_increase_pct
                and time_increase <= max_time_increase_pct):
            plan["co2_reduction_pct"] = round(co2_reduction, 1)
            plan["cost_increase_pct"] = round(cost_increase, 1)
            plan["time_increase_pct"] = round(time_increase, 1)
            feasible.append(plan)

    # Pareto front: remove dominated solutions
    pareto = []
    for plan in feasible:
        if not any(_is_dominated(plan, other) for other in feasible if other is not plan):
            pareto.append(plan)

    # Sort by CO₂ reduction (best first), take top 5
    pareto.sort(key=lambda p: p.get("co2_reduction_pct", 0), reverse=True)
    top_options = pareto[:5]

    # Label options
    for i, opt in enumerate(top_options):
        opt["label"] = f"Option {chr(65 + i)}"

    return {
        "baseline": baseline,
        "feasible_count": len(feasible),
        "infeasible_count": len(candidates) - len(feasible),
        "pareto_options": top_options,
        "constraints": {
            "co2_reduction_target_pct": co2_reduction_target_pct,
            "max_cost_increase_pct": max_cost_increase_pct,
            "max_time_increase_pct": max_time_increase_pct,
        },
        "carbon_price": carbon_price,
        "note": "These are decision-grade estimates. Actual results depend on carrier availability, scheduling, and real-time conditions.",
    }
