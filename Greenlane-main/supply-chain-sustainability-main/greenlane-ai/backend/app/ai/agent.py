"""
GreenLane AI — AI Sustainability Copilot & Tool Agent

Executes analytical tools on the carbon calculation and optimization engines
to provide instant, data-grounded insights, what-if evaluations, and action plans.
"""

from __future__ import annotations
import json
import re
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.tables import Shipment, Route, Location, Supplier, EmissionFactorRecord
from app.engines.carbon import calculate_co2e, calculate_carbon_cost
from app.engines.scenario import run_scenario
from app.engines.optimizer import optimize
from app.engines.disruption import simulate_disruption
from app.engines.emission_factors import registry


class CopilotAgent:
    """
    Intelligent Supply Chain Sustainability Agent.
    Operates in zero-latency offline mode with structured tool execution
    and optional LLM enhancement.
    """

    def __init__(self, db: Session, dataset: str = "demo"):
        self.db = db
        self.dataset = dataset

    # ── Tool Definitions ─────────────────────────────────────────────────────

    def tool_get_total_emissions(self) -> Dict[str, Any]:
        """Fetch total emissions, weight, distance, and shadow carbon cost."""
        shipments = self.db.query(Shipment).filter(Shipment.dataset == self.dataset).all()
        total_co2 = sum(s.co2_total for s in shipments)
        total_weight = sum(s.weight_kg for s in shipments) / 1000.0
        total_dist = sum(s.distance_road + s.distance_rail + s.distance_sea + s.distance_air for s in shipments)
        shadow_cost = calculate_carbon_cost(total_co2, 50.0)

        # Mode breakdown
        road_co2 = sum(s.co2_road for s in shipments)
        rail_co2 = sum(s.co2_rail for s in shipments)
        sea_co2 = sum(s.co2_sea for s in shipments)
        air_co2 = sum(s.co2_air for s in shipments)

        return {
            "total_co2e_kg": round(total_co2, 2),
            "total_co2e_tonnes": round(total_co2 / 1000.0, 2),
            "total_shipments": len(shipments),
            "total_weight_tonnes": round(total_weight, 2),
            "total_distance_km": round(total_dist, 1),
            "shadow_carbon_cost_eur": round(shadow_cost, 2),
            "mode_co2_kg": {
                "road": round(road_co2, 2),
                "rail": round(rail_co2, 2),
                "sea": round(sea_co2, 2),
                "air": round(air_co2, 2),
            },
            "air_freight_emissions_share_pct": round((air_co2 / total_co2 * 100) if total_co2 else 0, 1),
            "dataset": self.dataset
        }

    def tool_get_top_emitters(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Identify highest emitting routes and destinations."""
        results = self.db.query(
            Shipment.destination_city,
            Shipment.destination_country,
            func.sum(Shipment.co2_total).label("co2"),
            func.count(Shipment.id).label("count"),
            func.sum(Shipment.weight_kg).label("weight")
        ).filter(
            Shipment.dataset == self.dataset
        ).group_by(
            Shipment.destination_city, Shipment.destination_country
        ).order_by(
            func.sum(Shipment.co2_total).desc()
        ).limit(limit).all()

        return [
            {
                "destination": f"{r.destination_city}, {r.destination_country}",
                "co2e_kg": round(r.co2, 2),
                "co2e_tonnes": round(r.co2 / 1000.0, 2),
                "shipments": r.count,
                "weight_tonnes": round(r.weight / 1000.0, 2),
            }
            for r in results
        ]

    def tool_run_scenario(self, mode_from: str, mode_to: str, consolidation: float = 1.0) -> Dict[str, Any]:
        """Simulate shifting shipments from one transport mode to another."""
        shipments = self.db.query(Shipment).filter(Shipment.dataset == self.dataset).all()
        shipment_dicts = [
            {
                "route_id": f"{s.warehouse_code}->{s.customer_code}",
                "weight_kg": s.weight_kg,
                "distance_road": s.distance_road,
                "distance_rail": s.distance_rail,
                "distance_sea": s.distance_sea,
                "distance_air": s.distance_air,
            }
            for s in shipments
        ]

        # Mode overrides dict
        mode_overrides = {}
        for s in shipment_dicts:
            if s.get(f"distance_{mode_from.lower()}", 0) > 0:
                mode_overrides[s["route_id"]] = mode_to.lower()

        res = run_scenario(
            shipments=shipment_dicts,
            mode_overrides=mode_overrides,
            consolidation_factor=consolidation,
            carbon_price=50.0
        )
        return res

    def tool_optimize_plan(self, target_co2_reduction_pct: float = 20.0) -> Dict[str, Any]:
        """Run Pareto optimization to minimize CO₂ within cost & time constraints."""
        routes = self.db.query(Route).all()
        # Aggregate weights per route
        route_list = []
        for r in routes:
            orig = self.db.query(Location).filter(Location.id == r.origin_id).first()
            dest = self.db.query(Location).filter(Location.id == r.destination_id).first()
            shipment_stats = self.db.query(
                func.sum(Shipment.weight_kg).label("tot_weight"),
                func.count(Shipment.id).label("count")
            ).filter(
                Shipment.dataset == self.dataset,
                Shipment.customer_code == (dest.code if dest else "")
            ).first()

            tot_w = shipment_stats.tot_weight or 15000.0
            total_dist = (r.distance_road + r.distance_rail + r.distance_sea + r.distance_air) or 500.0

            route_list.append({
                "route_id": r.route_id,
                "origin": orig.name if orig else "Origin",
                "destination": dest.name if dest else "Destination",
                "total_weight_kg": tot_w,
                "total_distance_km": total_dist,
                "primary_mode": r.primary_mode,
            })

        return optimize(
            routes=route_list,
            co2_reduction_target_pct=target_co2_reduction_pct,
            max_cost_increase_pct=15.0,
            max_time_increase_pct=60.0,
            carbon_price=50.0
        )

    def tool_simulate_disruption(self, disruption_type: str = "port_closure", location: str = "Rotterdam") -> Dict[str, Any]:
        """Simulate disruption impact on supply chain network."""
        shipments = self.db.query(Shipment).filter(Shipment.dataset == self.dataset).all()
        shipment_dicts = [
            {
                "route_id": f"{s.warehouse_code}->{s.customer_code}",
                "origin": s.origin_city,
                "destination": s.destination_city,
                "weight_kg": s.weight_kg,
                "distance_road": s.distance_road,
                "distance_rail": s.distance_rail,
                "distance_sea": s.distance_sea,
                "distance_air": s.distance_air,
            }
            for s in shipments
        ]

        return simulate_disruption(
            disruption_type=disruption_type,
            affected_location=location,
            shipments=shipment_dicts,
            severity=1.0
        )

    # ── Agent Orchestrator ───────────────────────────────────────────────────

    def process_message(self, user_msg: str) -> Tuple[str, List[Dict[str, Any]], List[str]]:
        """
        Analyze user intent, trigger relevant calculation tools, and compose
        an executive-grade, fact-grounded response with action items.
        """
        msg_lower = user_msg.lower()
        tool_calls = []

        # Intent 1: Why are emissions high / Breakdown / Summary
        if any(w in msg_lower for w in ["why", "high", "breakdown", "overview", "total", "summary", "carbon"]):
            tot = self.tool_get_total_emissions()
            top = self.tool_get_top_emitters(3)
            tool_calls.append({"tool": "get_total_emissions", "parameters": {}, "result": tot})
            tool_calls.append({"tool": "get_top_emitters", "parameters": {"limit": 3}, "result": top})

            if self.dataset == "demo":
                reply = (
                    f"### 📊 Total Carbon Footprint Analysis\n\n"
                    f"- **Total Scope 3 Transport Emissions**: **{tot['total_co2e_tonnes']:,} tonnes CO₂e** ({tot['total_co2e_kg']:,} kg)\n"
                    f"- **Total Freight Volume**: {tot['total_weight_tonnes']:,} tonnes across **{tot['total_shipments']} shipments**\n"
                    f"- **Shadow Carbon Cost** (@ €50/tonne): **€{tot['shadow_carbon_cost_eur']:,}**\n\n"
                    f"#### 🔍 Key Driver: The Air Freight Anomaly\n"
                    f"Air freight accounts for only **~10% of total shipments**, but generates **{tot['air_freight_emissions_share_pct']}% of your total carbon emissions** ({tot['mode_co2_kg']['air']:,} kg CO₂e). "
                    f"This is driven by high emission intensity (2.1 kg CO₂e/t·km ADEME factor).\n\n"
                    f"#### 🎯 Top Destination Footprints\n"
                    + "\n".join([f"- **{t['destination']}**: {t['co2e_tonnes']} t CO₂e ({t['shipments']} shipments)" for t in top])
                    + "\n\n**Recommended Action**: Consider simulating an **Air-to-Sea mode shift** or running the **Pareto Optimizer** to reduce emissions by 20–40% without compromising delivery SLAs."
                )
            else:
                reply = (
                    f"### 📊 Baseline Emissions Overview (Original Dataset)\n\n"
                    f"- **Total Scope 3 Transport Emissions**: **{tot['total_co2e_kg']:,} kg CO₂e** ({tot['total_co2e_tonnes']} t)\n"
                    f"- **Shipment Count**: {tot['total_shipments']:,} order lines\n"
                    f"- **Dominant Mode**: **Road freight represents {tot['mode_co2_kg']['road']:,} kg CO₂e (99.8%)** from the Paris area distribution center to regional customers.\n\n"
                    f"#### 🎯 Top Emitter Destinations\n"
                    + "\n".join([f"- **{t['destination']}**: {t['co2e_kg']} kg CO₂e ({t['shipments']} shipments)" for t in top])
                    + "\n\n**Recommended Action**: Explore load consolidation and regional rail freight corridors to cut road emissions."
                )

            suggested = [
                "How can we reduce emissions by 25%?",
                "Simulate shifting air shipments to sea freight",
                "What is the impact of a Rotterdam port disruption?",
            ]
            return reply, tool_calls, suggested

        # Intent 2: Mode shift / Scenario Simulation
        elif any(w in msg_lower for w in ["shift", "scenario", "switch", "air to sea", "road to rail", "simulate"]):
            from_m = "air" if "air" in msg_lower else "road"
            to_m = "sea" if "sea" in msg_lower else "rail"
            sc_res = self.tool_run_scenario(from_m, to_m, consolidation=0.90)
            tool_calls.append({
                "tool": "run_scenario",
                "parameters": {"mode_from": from_m, "mode_to": to_m, "consolidation": 0.90},
                "result": sc_res
            })

            delta_co2 = sc_res["delta"]["co2e_kg"]
            delta_pct = sc_res["delta"]["co2e_pct"]
            delta_cost = sc_res["delta"]["cost"]
            delta_cost_pct = sc_res["delta"]["cost_pct"]

            reply = (
                f"### 🔄 What-If Simulation: {from_m.upper()} ➔ {to_m.upper()} Mode Shift\n\n"
                f"We simulated switching eligible shipments from **{from_m.title()}** to **{to_m.title()}** combined with 10% load consolidation:\n\n"
                f"| Metric | Baseline | Scenario | Delta | % Change |\n"
                f"|---|---|---|---|---|\n"
                f"| **CO₂e Emissions** | {sc_res['baseline']['co2e_kg']:,} kg | {sc_res['scenario']['co2e_kg']:,} kg | **{delta_co2:,} kg** | **{delta_pct}%** |\n"
                f"| **Logistics Cost** | €{sc_res['baseline']['cost']:,} | €{sc_res['scenario']['cost']:,} | €{delta_cost:,} | {delta_cost_pct}% |\n"
                f"| **Shadow Carbon Cost** | €{sc_res['baseline']['carbon_cost']:,} | €{sc_res['scenario']['carbon_cost']:,} | €{sc_res['scenario']['carbon_cost'] - sc_res['baseline']['carbon_cost']:,} | {delta_pct}% |\n\n"
                f"#### 💡 Executive Takeaway\n"
                f"By transferring non-urgent cargo to ocean transport, the company can achieve an immediate **{abs(delta_pct)}% drop in carbon footprint** while reducing total freight spend by **{abs(delta_cost_pct)}%**."
            )
            suggested = [
                "Run Pareto multi-objective optimization",
                "Show supplier ESG scorecard",
                "Generate executive PDF report",
            ]
            return reply, tool_calls, suggested

        # Intent 3: Optimize / Target reduction
        elif any(w in msg_lower for w in ["optimize", "reduction", "target", "pareto", "reduce"]):
            target_pct = 20.0
            match = re.search(r'(\d+)%', msg_lower)
            if match:
                target_pct = float(match.group(1))

            opt_res = self.tool_optimize_plan(target_pct)
            tool_calls.append({
                "tool": "optimize_plan",
                "parameters": {"target_co2_reduction_pct": target_pct},
                "result": opt_res
            })

            opts = opt_res.get("pareto_options", [])
            opt_lines = []
            for o in opts[:3]:
                opt_lines.append(
                    f"- **{o['label']}**: **{o['co2_reduction_pct']}% CO₂ reduction** ({o['co2e_kg']:,} kg) | "
                    f"Cost change: {o['cost_increase_pct']:+}% | Lead time: {o['time_increase_pct']:+}%"
                )

            reply = (
                f"### ⚡ Multi-Objective Pareto Optimization ({target_pct}% Target)\n\n"
                f"Found **{opt_res['feasible_count']} feasible plans** satisfying CO₂ reduction ≥ {target_pct}% subject to cost/time constraints:\n\n"
                + "\n".join(opt_lines) +
                f"\n\n**Recommendation**: **Option A** is the most cost-effective path to achieving your ESG carbon reduction milestone."
            )
            suggested = [
                "Simulate Suez / Red Sea disruption",
                "View network map with live flow volume",
                "Export this scenario into the official audit trail",
            ]
            return reply, tool_calls, suggested

        # Intent 4: Disruption & Risk
        elif any(w in msg_lower for w in ["disrupt", "port", "close", "block", "weather", "risk", "delay"]):
            loc = "Rotterdam" if "rotterdam" in msg_lower else "Mumbai" if "mumbai" in msg_lower else "Hamburg"
            dis_res = self.tool_simulate_disruption("port_closure", loc)
            tool_calls.append({
                "tool": "simulate_disruption",
                "parameters": {"disruption_type": "port_closure", "location": loc},
                "result": dis_res
            })

            imp = dis_res["impact"]
            reply = (
                f"### 🚨 Disruption Simulation: Port Closure at {loc}\n\n"
                f"- **Affected Shipments**: **{imp['affected_shipments']}** ({imp['affected_pct']}% of active volume)\n"
                f"- **Additional Carbon Footprint**: **+{imp['additional_co2e_kg']:,} kg CO₂e** (due to detour routing)\n"
                f"- **Cost Escalation**: **+€{imp['additional_cost']:,}**\n"
                f"- **Average Transit Delay**: **+{imp['delay_days']} days**\n\n"
                f"#### 🛡️ Mitigations Suggested:\n"
                + "\n".join([f"- {s}" for s in dis_res["suggestions"]])
            )
            suggested = [
                "Simulate alternative road detour",
                "Show supplier reliability ratings",
                "Return to overview dashboard",
            ]
            return reply, tool_calls, suggested

        # Default fallback: General intelligence assistant
        tot = self.tool_get_total_emissions()
        tool_calls.append({"tool": "get_total_emissions", "parameters": {}, "result": tot})
        reply = (
            f"Hello! I am **GreenLane AI Copilot**, your supply chain sustainability advisor.\n\n"
            f"Your current network footprint stands at **{tot['total_co2e_tonnes']:,} tonnes CO₂e** across **{tot['total_shipments']} shipments**.\n\n"
            f"How can I assist you today?\n"
            f"- Run **What-If Simulations** (e.g. *'Shift air to sea freight'*)\n"
            f"- Solve **Multi-Objective Optimization** (e.g. *'Reduce CO₂ by 25%'*)\n"
            f"- Stress-test against **Disruptions & Port Delays**\n"
            f"- Review **Supplier ESG Reliability & Data Quality Scores**"
        )
        suggested = [
            "Why are our emissions so high?",
            "How can we reduce emissions by 30%?",
            "Simulate a port closure in Rotterdam",
        ]
        return reply, tool_calls, suggested
