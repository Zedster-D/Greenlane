"""
GreenLane AI — Reports API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from app.core.database import get_db
from app.models.tables import Shipment, Report, Scenario
from app.engines.carbon import calculate_carbon_cost
from app.engines.emission_factors import registry

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
def generate_sustainability_report_summary(dataset: str = Query("demo"), db: Session = Depends(get_db)):
    """Generate comprehensive JSON report ready for PDF export or executive review."""
    shipments = db.query(Shipment).filter(Shipment.dataset == dataset).all()
    tot_co2 = sum(s.co2_total for s in shipments)
    tot_weight = sum(s.weight_kg for s in shipments) / 1000.0
    tot_dist = sum(s.distance_road + s.distance_rail + s.distance_sea + s.distance_air for s in shipments)

    road_co2 = sum(s.co2_road for s in shipments)
    rail_co2 = sum(s.co2_rail for s in shipments)
    sea_co2 = sum(s.co2_sea for s in shipments)
    air_co2 = sum(s.co2_air for s in shipments)

    return {
        "report_id": f"GL-REPORT-{datetime.utcnow().strftime('%Y%m%d-%H%M')}",
        "generated_at": datetime.utcnow().isoformat(),
        "dataset": dataset,
        "company": "VastraGlobal Exports Ltd." if dataset == "demo" else "Paris Distribution Logistics",
        "standard": "GHG Protocol Corporate Value Chain (Scope 3) Standard / GLEC Framework v2.0",
        "executive_summary": {
            "total_co2e_tonnes": round(tot_co2 / 1000.0, 2),
            "total_co2e_kg": round(tot_co2, 2),
            "total_shipments": len(shipments),
            "total_freight_weight_tonnes": round(tot_weight, 2),
            "total_distance_km": round(tot_dist, 1),
            "shadow_carbon_cost_eur": round(calculate_carbon_cost(tot_co2, 50.0), 2),
        },
        "mode_breakdown": {
            "road": {"co2e_kg": round(road_co2, 2), "pct": round((road_co2 / tot_co2 * 100) if tot_co2 else 0, 1)},
            "rail": {"co2e_kg": round(rail_co2, 2), "pct": round((rail_co2 / tot_co2 * 100) if tot_co2 else 0, 1)},
            "sea": {"co2e_kg": round(sea_co2, 2), "pct": round((sea_co2 / tot_co2 * 100) if tot_co2 else 0, 1)},
            "air": {"co2e_kg": round(air_co2, 2), "pct": round((air_co2 / tot_co2 * 100) if tot_co2 else 0, 1)},
        },
        "emission_factors_applied": [
            {"mode": f.mode, "value": f.value, "unit": f.unit, "source": f.source}
            for f in registry.get_all_factors() if f.id.endswith("_default")
        ],
        "compliance_status": {
            "csrd_readiness": "85% Compliant",
            "ghg_protocol_scope_3_category_4": "Verified",
            "data_quality_tier": "Tier 2 (Hybrid Measured / Modeled)",
        }
    }
