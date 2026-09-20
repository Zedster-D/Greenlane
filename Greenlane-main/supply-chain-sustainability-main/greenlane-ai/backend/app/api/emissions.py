"""
GreenLane AI — Emissions Analytics API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.tables import Shipment, Product
from app.schemas.schemas import RouteSummary, EmissionFactorItem
from app.engines.emission_factors import registry
from app.engines.forecast import forecast_emissions

router = APIRouter(prefix="/emissions", tags=["Emissions"])


@router.get("/routes", response_model=List[RouteSummary])
def get_route_emissions(dataset: str = Query("demo"), db: Session = Depends(get_db)):
    """Return emissions breakdown per route."""
    shipments = db.query(Shipment).filter(Shipment.dataset == dataset).all()
    tot_co2 = sum(s.co2_total for s in shipments) or 1.0

    # Group by destination
    route_groups = {}
    for s in shipments:
        key = f"{s.origin_city} ➔ {s.destination_city}"
        if key not in route_groups:
            route_groups[key] = {
                "route_id": f"{s.warehouse_code}->{s.customer_code}",
                "origin": s.origin_city,
                "destination": s.destination_city,
                "origin_country": s.origin_country or "Unknown",
                "destination_country": s.destination_country or "Unknown",
                "co2e_kg": 0.0,
                "shipment_count": 0,
                "weight_kg": 0.0,
                "modes": set(),
            }
        g = route_groups[key]
        g["co2e_kg"] += s.co2_total
        g["shipment_count"] += 1
        g["weight_kg"] += s.weight_kg
        if s.distance_air > 0: g["modes"].add("air")
        if s.distance_sea > 0: g["modes"].add("sea")
        if s.distance_rail > 0: g["modes"].add("rail")
        if s.distance_road > 0: g["modes"].add("road")

    results = []
    for key, g in route_groups.items():
        pmode = "air" if "air" in g["modes"] else "sea" if "sea" in g["modes"] else "road"
        risk = 0.35 if pmode == "sea" else 0.15 if pmode == "air" else 0.20
        results.append(RouteSummary(
            route_id=g["route_id"],
            origin=g["origin"],
            destination=g["destination"],
            origin_country=g["origin_country"],
            destination_country=g["destination_country"],
            co2e_kg=round(g["co2e_kg"], 2),
            percentage=round(g["co2e_kg"] / tot_co2 * 100, 1),
            shipment_count=g["shipment_count"],
            total_weight_tonnes=round(g["weight_kg"] / 1000.0, 2),
            primary_mode=pmode,
            risk_score=risk
        ))

    results.sort(key=lambda r: r.co2e_kg, reverse=True)
    return results


@router.get("/factors", response_model=List[EmissionFactorItem])
def get_emission_factors():
    """Return all emission factors with full audit provenance."""
    factors = registry.get_all_factors()
    return [
        EmissionFactorItem(
            id=i + 1,
            factor_id=f.id,
            mode=f.mode,
            fuel_type=f.fuel_type,
            vehicle_type=f.vehicle_type,
            value=f.value,
            unit=f.unit,
            source=f.source,
            methodology=f.methodology,
            version=f.version,
            year=f.year,
            notes=f.notes,
            is_active=f.id.endswith("_default")
        )
        for i, f in enumerate(factors)
    ]


@router.get("/forecast")
def get_forecast(dataset: str = Query("demo"), periods: int = Query(3, ge=1, le=12), db: Session = Depends(get_db)):
    """Generate linear trend forecast with confidence bands."""
    results = db.query(
        Shipment.month_year,
        func.sum(Shipment.co2_total).label("co2"),
    ).filter(
        Shipment.dataset == dataset
    ).group_by(
        Shipment.month_year
    ).all()

    def sort_key(item):
        my = item.month_year.split("-")
        if len(my) == 2:
            try: return (int(my[1]), int(my[0]))
            except ValueError: return (0, 0)
        return (0, 0)

    sorted_res = sorted(results, key=sort_key)
    monthly_series = [{"month": r.month_year, "co2e_kg": float(r.co2 or 0)} for r in sorted_res]

    return forecast_emissions(monthly_series, periods_ahead=periods)
