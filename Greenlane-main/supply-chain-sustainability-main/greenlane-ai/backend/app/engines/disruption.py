"""
GreenLane AI — Disruption Simulator

Simulates supply-chain disruptions: port closures, route blockages,
supplier failures, capacity reductions, demand spikes.
"""

from __future__ import annotations
from typing import List, Dict, Optional
from .carbon import calculate_co2e


DISRUPTION_TYPES = {
    "port_closure": {
        "label": "Port Closure",
        "description": "A port is closed, blocking all sea freight through it",
        "affects": ["sea"],
        "default_fallback": "road",
    },
    "road_closure": {
        "label": "Road Closure",
        "description": "A road route is blocked due to weather, accident, or infrastructure",
        "affects": ["road"],
        "default_fallback": "rail",
    },
    "supplier_failure": {
        "label": "Supplier Failure",
        "description": "A supplier cannot fulfil orders",
        "affects": ["all"],
        "default_fallback": None,
    },
    "capacity_reduction": {
        "label": "Capacity Reduction",
        "description": "Transport capacity reduced by a percentage",
        "affects": ["all"],
        "default_fallback": None,
    },
    "fuel_price_spike": {
        "label": "Fuel Price Spike",
        "description": "Fuel costs increase significantly",
        "affects": ["road", "air"],
        "default_fallback": None,
    },
    "severe_weather": {
        "label": "Severe Weather",
        "description": "Weather event disrupts multiple transport modes",
        "affects": ["road", "sea", "air"],
        "default_fallback": "rail",
    },
    "demand_spike": {
        "label": "Demand Spike",
        "description": "Unexpected demand increase requiring rush shipments",
        "affects": ["all"],
        "default_fallback": "air",
    },
}

COST_RATES = {"road": 1.2, "rail": 0.6, "sea": 0.15, "air": 4.5}
TIME_RATES = {"road": 0.02, "rail": 0.03, "sea": 0.06, "air": 0.002}


def simulate_disruption(
    disruption_type: str,
    affected_location: Optional[str] = None,
    affected_routes: Optional[List[str]] = None,
    shipments: Optional[List[dict]] = None,
    severity: float = 1.0,
    fallback_mode: Optional[str] = None,
) -> dict:
    """
    Simulate a disruption and calculate impact.

    Args:
        disruption_type: One of DISRUPTION_TYPES keys
        affected_location: Location affected (city/port name)
        affected_routes: List of route_ids directly affected
        shipments: All shipments to evaluate
        severity: 0.0–1.0 severity factor
        fallback_mode: Override fallback transport mode

    Returns:
        Impact analysis with affected shipments, cost/CO₂/time deltas,
        and suggested alternatives
    """
    if shipments is None:
        shipments = []

    disruption_info = DISRUPTION_TYPES.get(disruption_type, DISRUPTION_TYPES["road_closure"])
    fb_mode = fallback_mode or disruption_info["default_fallback"] or "road"
    affected_modes = disruption_info["affects"]

    affected_shipments = []
    unaffected_shipments = []

    for s in shipments:
        is_affected = False

        # Check if route is in affected list
        if affected_routes and s.get("route_id") in affected_routes:
            is_affected = True

        # Check if location matches
        if affected_location:
            origin = str(s.get("origin", "")).lower()
            destination = str(s.get("destination", "")).lower()
            loc_lower = affected_location.lower()
            if loc_lower in origin or loc_lower in destination:
                is_affected = True

        # Check if shipment uses affected mode
        if "all" not in affected_modes:
            has_affected_mode = any(
                s.get(f"distance_{m}", 0) > 0 for m in affected_modes
            )
            if not has_affected_mode:
                is_affected = False

        if is_affected:
            affected_shipments.append(s)
        else:
            unaffected_shipments.append(s)

    # Calculate impact
    baseline_co2 = 0.0
    baseline_cost = 0.0
    baseline_time = 0.0
    rerouted_co2 = 0.0
    rerouted_cost = 0.0
    rerouted_time = 0.0

    for s in affected_shipments:
        weight_kg = s.get("weight_kg", 0)
        total_dist = sum(s.get(f"distance_{m}", 0) for m in ["road", "rail", "sea", "air"])

        # Baseline
        for mode in ["road", "rail", "sea", "air"]:
            dist = s.get(f"distance_{mode}", 0)
            if dist > 0:
                r = calculate_co2e(weight_kg, dist, mode)
                baseline_co2 += r.co2e_kg
                baseline_cost += dist * COST_RATES.get(mode, 1.0) * (weight_kg / 1000)
                baseline_time += dist * TIME_RATES.get(mode, 0.02)

        # Rerouted via fallback
        if total_dist > 0:
            # Add detour factor for rerouting
            detour_factor = 1.0 + (0.2 * severity)
            rerouted_dist = total_dist * detour_factor
            r = calculate_co2e(weight_kg, rerouted_dist, fb_mode)
            rerouted_co2 += r.co2e_kg
            rerouted_cost += rerouted_dist * COST_RATES.get(fb_mode, 1.0) * (weight_kg / 1000)
            rerouted_time += rerouted_dist * TIME_RATES.get(fb_mode, 0.02)

    additional_co2 = rerouted_co2 - baseline_co2
    additional_cost = rerouted_cost - baseline_cost
    additional_time = rerouted_time - baseline_time

    suggestions = []
    if fb_mode == "rail":
        suggestions.append("Reroute affected shipments via rail network")
    elif fb_mode == "road":
        suggestions.append("Reroute affected shipments via alternative road corridors")
    elif fb_mode == "air":
        suggestions.append("Use air freight for critical/time-sensitive shipments")

    suggestions.append("Consolidate shipments to reduce number of affected trips")
    suggestions.append("Contact alternative suppliers in unaffected regions")

    return {
        "disruption": {
            "type": disruption_type,
            "label": disruption_info["label"],
            "description": disruption_info["description"],
            "affected_location": affected_location,
            "severity": severity,
            "fallback_mode": fb_mode,
        },
        "impact": {
            "affected_shipments": len(affected_shipments),
            "total_shipments": len(shipments),
            "affected_pct": round(len(affected_shipments) / len(shipments) * 100, 1) if shipments else 0,
            "additional_co2e_kg": round(additional_co2, 2),
            "additional_cost": round(additional_cost, 2),
            "additional_time_hours": round(additional_time, 2),
            "delay_days": round(additional_time / 24, 1),
        },
        "baseline": {
            "co2e_kg": round(baseline_co2, 2),
            "cost": round(baseline_cost, 2),
            "time_hours": round(baseline_time, 2),
        },
        "rerouted": {
            "co2e_kg": round(rerouted_co2, 2),
            "cost": round(rerouted_cost, 2),
            "time_hours": round(rerouted_time, 2),
        },
        "suggestions": suggestions,
        "note": "Estimates based on configured emission factors and average cost rates. Actual impact depends on carrier availability and real-time conditions.",
    }
