"""
GreenLane AI — Disruption Simulator API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tables import Shipment
from app.schemas.schemas import DisruptionRequest, DisruptionResponse
from app.engines.disruption import simulate_disruption, DISRUPTION_TYPES

router = APIRouter(prefix="/disruptions", tags=["Disruptions"])


@router.get("/types")
def get_disruption_types():
    """Return available disruption archetypes."""
    return DISRUPTION_TYPES


@router.post("/simulate", response_model=DisruptionResponse)
def run_disruption_simulation(req: DisruptionRequest, db: Session = Depends(get_db)):
    """Simulate supply-chain disruption impact on cost, transit time, and emissions."""
    shipments = db.query(Shipment).filter(Shipment.dataset == req.dataset).all()
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

    res = simulate_disruption(
        disruption_type=req.disruption_type,
        affected_location=req.affected_location,
        affected_routes=req.affected_routes,
        shipments=shipment_dicts,
        severity=req.severity,
        fallback_mode=req.fallback_mode
    )

    return DisruptionResponse(
        disruption=res["disruption"],
        impact=res["impact"],
        baseline=res["baseline"],
        rerouted=res["rerouted"],
        suggestions=res["suggestions"],
        note=res["note"]
    )
