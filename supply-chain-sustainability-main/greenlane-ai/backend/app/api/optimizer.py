"""
GreenLane AI — Pareto Optimization API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.tables import Route, Shipment, Location
from app.schemas.schemas import OptimizeRequest, OptimizeResponse, OptimizeOption
from app.engines.optimizer import optimize

router = APIRouter(prefix="/optimizer", tags=["Optimizer"])


@router.post("/run", response_model=OptimizeResponse)
def run_optimization(req: OptimizeRequest, db: Session = Depends(get_db)):
    """Run multi-objective optimization to find trade-off frontier between CO₂, cost, and lead time."""
    routes = db.query(Route).all()
    route_list = []

    for r in routes:
        orig = db.query(Location).filter(Location.id == r.origin_id).first()
        dest = db.query(Location).filter(Location.id == r.destination_id).first()
        shipment_stats = db.query(
            func.sum(Shipment.weight_kg).label("tot_weight"),
            func.count(Shipment.id).label("count")
        ).filter(
            Shipment.dataset == req.dataset,
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

    result = optimize(
        routes=route_list,
        co2_reduction_target_pct=req.co2_reduction_target_pct,
        max_cost_increase_pct=req.max_cost_increase_pct,
        max_time_increase_pct=req.max_time_increase_pct,
        carbon_price=req.carbon_price,
        available_modes=req.available_modes,
    )

    pareto_opts = [
        OptimizeOption(
            label=opt["label"],
            co2e_kg=opt["co2e_kg"],
            cost=opt["cost"],
            total_cost_with_carbon=opt["total_cost_with_carbon"],
            carbon_cost=opt["carbon_cost"],
            time_hours=opt["time_hours"],
            co2_reduction_pct=opt.get("co2_reduction_pct", 0),
            cost_increase_pct=opt.get("cost_increase_pct", 0),
            time_increase_pct=opt.get("time_increase_pct", 0),
            mode_assignments=opt["mode_assignments"]
        )
        for opt in result["pareto_options"]
    ]

    return OptimizeResponse(
        baseline=result["baseline"],
        feasible_count=result["feasible_count"],
        infeasible_count=result["infeasible_count"],
        pareto_options=pareto_opts,
        constraints=result["constraints"],
        carbon_price=result["carbon_price"],
        note=result["note"]
    )
