"""
GreenLane AI — Suppliers 360 API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.tables import Supplier, Location
from app.schemas.schemas import SupplierItem

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=List[SupplierItem])
def list_suppliers(db: Session = Depends(get_db)):
    """Return supplier directory with ESG grades, reliability, and carbon intensity."""
    suppliers = db.query(Supplier).all()
    results = []

    for s in suppliers:
        loc = db.query(Location).filter(Location.id == s.location_id).first()
        city = loc.city if loc else "Regional"
        country = loc.country if loc else "India"
        loc_name = loc.name if loc else "Manufacturing Cluster"

        # Calculate tier and ESG Grade based on co2_intensity and reliability
        co2_int = s.co2_intensity or 1.5
        rel = s.reliability_score or 0.85

        if co2_int <= 1.0 and rel >= 0.90:
            esg_grade = "A+"
        elif co2_int <= 2.0 and rel >= 0.85:
            esg_grade = "A"
        elif co2_int <= 3.5:
            esg_grade = "B"
        else:
            esg_grade = "C"

        tier = "Tier 1" if rel >= 0.90 else "Tier 2"

        results.append(SupplierItem(
            id=s.id,
            code=s.code,
            name=s.name,
            location_name=loc_name,
            city=city,
            country=country,
            reliability_score=round(rel, 2),
            lead_time_days=round(s.lead_time_days or 7.0, 1),
            capacity=round(s.capacity or 5000.0, 0),
            data_quality=s.data_quality or "ESTIMATED",
            risk_score=round(s.risk_score or 0.2, 2),
            co2_intensity=round(co2_int, 2),
            tier=tier,
            esg_grade=esg_grade
        ))

    return results
