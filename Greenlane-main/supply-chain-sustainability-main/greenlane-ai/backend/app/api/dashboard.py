"""
GreenLane AI — Dashboard API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.tables import Shipment, Route, Location, EmissionFactorRecord
from app.schemas.schemas import KPISummary, MonthlyEmission, ModeBreakdown, RouteSummary
from app.engines.carbon import calculate_carbon_cost
from app.engines.emission_factors import registry

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=KPISummary)
def get_kpi_summary(dataset: str = Query("demo", description="demo | original"), db: Session = Depends(get_db)):
    """Return top-level executive KPIs."""
    shipments = db.query(Shipment).filter(Shipment.dataset == dataset).all()
    total_count = len(shipments)

    if total_count == 0:
        return KPISummary(
            total_co2e_kg=0, total_co2e_tonnes=0, total_shipments=0,
            total_weight_tonnes=0, total_distance_km=0, avg_co2e_per_tonne_km=0,
            shadow_carbon_cost=0, currency="EUR",
            data_quality_pct={"MEASURED": 0, "ESTIMATED": 100, "ASSUMED": 0},
            top_emitter_mode="road", top_emitter_mode_pct=0,
            air_freight_emissions_share=0, active_dataset=dataset
        )

    tot_co2 = sum(s.co2_total for s in shipments)
    tot_weight = sum(s.weight_kg for s in shipments) / 1000.0
    tot_dist = sum(s.distance_road + s.distance_rail + s.distance_sea + s.distance_air for s in shipments)
    shadow_cost = calculate_carbon_cost(tot_co2, 50.0)

    # Mode sums
    road_co2 = sum(s.co2_road for s in shipments)
    rail_co2 = sum(s.co2_rail for s in shipments)
    sea_co2 = sum(s.co2_sea for s in shipments)
    air_co2 = sum(s.co2_air for s in shipments)

    mode_map = {"road": road_co2, "rail": rail_co2, "sea": sea_co2, "air": air_co2}
    top_mode = max(mode_map, key=mode_map.get)
    top_mode_pct = round((mode_map[top_mode] / tot_co2 * 100) if tot_co2 else 0, 1)

    # Data Quality breakdown
    measured_count = sum(1 for s in shipments if s.data_quality == "MEASURED")
    estimated_count = sum(1 for s in shipments if s.data_quality == "ESTIMATED")
    assumed_count = total_count - measured_count - estimated_count

    dq_pct = {
        "MEASURED": round(measured_count / total_count * 100, 1),
        "ESTIMATED": round(estimated_count / total_count * 100, 1),
        "ASSUMED": round(assumed_count / total_count * 100, 1),
    }

    air_share = round((air_co2 / tot_co2 * 100) if tot_co2 else 0, 1)
    avg_intensity = round((tot_co2 / (tot_weight * (tot_dist / total_count))) if (tot_weight and tot_dist) else 0.096, 4)

    return KPISummary(
        total_co2e_kg=round(tot_co2, 2),
        total_co2e_tonnes=round(tot_co2 / 1000.0, 2),
        total_shipments=total_count,
        total_weight_tonnes=round(tot_weight, 2),
        total_distance_km=round(tot_dist, 1),
        avg_co2e_per_tonne_km=avg_intensity,
        shadow_carbon_cost=round(shadow_cost, 2),
        currency="EUR",
        data_quality_pct=dq_pct,
        top_emitter_mode=top_mode,
        top_emitter_mode_pct=top_mode_pct,
        air_freight_emissions_share=air_share,
        active_dataset=dataset
    )


@router.get("/monthly", response_model=List[MonthlyEmission])
def get_monthly_emissions(dataset: str = Query("demo"), db: Session = Depends(get_db)):
    """Return historical emissions grouped by month."""
    results = db.query(
        Shipment.month_year,
        func.sum(Shipment.co2_total).label("co2"),
        func.sum(Shipment.weight_kg).label("weight"),
        func.count(Shipment.id).label("count"),
        func.sum(Shipment.co2_road).label("road"),
        func.sum(Shipment.co2_rail).label("rail"),
        func.sum(Shipment.co2_sea).label("sea"),
        func.sum(Shipment.co2_air).label("air"),
    ).filter(
        Shipment.dataset == dataset
    ).group_by(
        Shipment.month_year
    ).all()

    # Sort logically by year-month
    def sort_key(item):
        my = item.month_year.split("-")
        if len(my) == 2:
            try:
                return (int(my[1]), int(my[0]))
            except ValueError:
                return (0, 0)
        return (0, 0)

    sorted_results = sorted(results, key=sort_key)

    return [
        MonthlyEmission(
            month_year=r.month_year,
            co2e_kg=round(r.co2 or 0, 2),
            co2e_tonnes=round((r.co2 or 0) / 1000.0, 2),
            weight_tonnes=round((r.weight or 0) / 1000.0, 2),
            shipment_count=r.count,
            road_co2=round(r.road or 0, 2),
            rail_co2=round(r.rail or 0, 2),
            sea_co2=round(r.sea or 0, 2),
            air_co2=round(r.air or 0, 2),
        )
        for r in sorted_results
    ]


@router.get("/modes", response_model=List[ModeBreakdown])
def get_mode_breakdown(dataset: str = Query("demo"), db: Session = Depends(get_db)):
    """Return emissions by transport mode with emission factor metadata."""
    shipments = db.query(Shipment).filter(Shipment.dataset == dataset).all()
    tot_co2 = sum(s.co2_total for s in shipments) or 1.0

    modes_data = [
        ("road", sum(s.co2_road for s in shipments), sum(s.distance_road for s in shipments), sum(1 for s in shipments if s.distance_road > 0)),
        ("rail", sum(s.co2_rail for s in shipments), sum(s.distance_rail for s in shipments), sum(1 for s in shipments if s.distance_rail > 0)),
        ("sea", sum(s.co2_sea for s in shipments), sum(s.distance_sea for s in shipments), sum(1 for s in shipments if s.distance_sea > 0)),
        ("air", sum(s.co2_air for s in shipments), sum(s.distance_air for s in shipments), sum(1 for s in shipments if s.distance_air > 0)),
    ]

    breakdown = []
    for mode, co2, dist, count in modes_data:
        factor_obj = registry.get_factor(mode)
        breakdown.append(ModeBreakdown(
            mode=mode,
            co2e_kg=round(co2, 2),
            co2e_tonnes=round(co2 / 1000.0, 2),
            percentage=round(co2 / tot_co2 * 100, 1),
            distance_km=round(dist, 1),
            shipment_count=count,
            factor_used=factor_obj.value,
            factor_source=factor_obj.source,
            factor_unit=factor_obj.unit
        ))

    return breakdown
