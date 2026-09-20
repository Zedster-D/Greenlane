"""
GreenLane AI — Scenario & What-If API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.tables import Scenario, Shipment
from app.schemas.schemas import ScenarioRunRequest, ScenarioResponse
from app.engines.scenario import run_scenario

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("")
def list_saved_scenarios(db: Session = Depends(get_db)):
    """Return list of saved what-if scenario presets."""
    scenarios = db.query(Scenario).all()
    return [
        {
            "id": sc.id,
            "name": sc.name,
            "description": sc.description,
            "consolidation_factor": sc.consolidation_factor,
            "carbon_price": sc.carbon_price,
            "baseline_co2": sc.baseline_co2,
            "scenario_co2": sc.scenario_co2,
            "baseline_cost": sc.baseline_cost,
            "scenario_cost": sc.scenario_cost,
            "co2_change_pct": sc.co2_change_pct,
            "cost_change_pct": sc.cost_change_pct,
        }
        for sc in scenarios
    ]


@router.post("/run", response_model=ScenarioResponse)
def execute_scenario(req: ScenarioRunRequest, db: Session = Depends(get_db)):
    """Execute real-time what-if mode switching, consolidation, and carbon pricing simulation."""
    shipments = db.query(Shipment).filter(Shipment.dataset == req.dataset).all()
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

    # Map general mode switch (e.g. "air" -> "sea") if specified
    mode_overrides = dict(req.mode_overrides or {})
    if "air" in mode_overrides or "road" in mode_overrides:
        target_override = {}
        for s in shipment_dicts:
            for source_mode, target_mode in mode_overrides.items():
                if s.get(f"distance_{source_mode}", 0) > 0:
                    target_override[s["route_id"]] = target_mode
        mode_overrides = target_override

    res = run_scenario(
        shipments=shipment_dicts,
        mode_overrides=mode_overrides,
        consolidation_factor=req.consolidation_factor,
        carbon_price=req.carbon_price
    )

    return ScenarioResponse(
        name=req.name or "Custom What-If Run",
        baseline=res["baseline"],
        scenario=res["scenario"],
        delta=res["delta"],
        consolidation_factor=req.consolidation_factor,
        carbon_price=req.carbon_price,
        timestamp=datetime.utcnow().isoformat()
    )
