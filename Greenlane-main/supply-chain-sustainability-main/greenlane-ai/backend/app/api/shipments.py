"""
GreenLane AI — Shipments CRUD & Table API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.tables import Shipment
from app.schemas.schemas import ShipmentListResponse, ShipmentItem

router = APIRouter(prefix="/shipments", tags=["Shipments"])


@router.get("", response_model=ShipmentListResponse)
def list_shipments(
    dataset: str = Query("demo"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    mode: Optional[str] = Query(None, description="road | rail | sea | air"),
    search: Optional[str] = Query(None),
    quality: Optional[str] = Query(None, description="MEASURED | ESTIMATED"),
    db: Session = Depends(get_db)
):
    """Return paginated, filtered shipment ledger."""
    query = db.query(Shipment).filter(Shipment.dataset == dataset)

    if mode:
        m = mode.lower()
        if m == "road":
            query = query.filter(Shipment.distance_road > 0)
        elif m == "rail":
            query = query.filter(Shipment.distance_rail > 0)
        elif m == "sea":
            query = query.filter(Shipment.distance_sea > 0)
        elif m == "air":
            query = query.filter(Shipment.distance_air > 0)

    if quality:
        query = query.filter(Shipment.data_quality == quality.upper())

    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Shipment.item_code.ilike(s_term)) |
            (Shipment.destination_city.ilike(s_term)) |
            (Shipment.customer_code.ilike(s_term))
        )

    total = query.count()
    shipments = query.order_by(Shipment.id.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [
        ShipmentItem(
            id=s.id,
            order_number=s.order_number or 0,
            order_line=s.order_line or 1,
            date=s.date.strftime("%Y-%m-%d") if s.date else "2023-01-01",
            month_year=s.month_year or "",
            warehouse_code=s.warehouse_code or "",
            customer_code=s.customer_code or "",
            item_code=s.item_code or "",
            units=s.units or 0,
            euros=s.euros or 0,
            weight_kg=round(s.weight_kg or 0, 2),
            co2_total=round(s.co2_total or 0, 2),
            co2_road=round(s.co2_road or 0, 2),
            co2_rail=round(s.co2_rail or 0, 2),
            co2_sea=round(s.co2_sea or 0, 2),
            co2_air=round(s.co2_air or 0, 2),
            origin_city=s.origin_city or "",
            destination_city=s.destination_city or "",
            destination_country=s.destination_country or "",
            data_quality=s.data_quality or "ESTIMATED",
            dataset=s.dataset or "demo"
        )
        for s in shipments
    ]

    return ShipmentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        shipments=items
    )
