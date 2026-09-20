"""
GreenLane AI — Network Map API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.models.tables import Location, Route, Shipment
from app.schemas.schemas import NetworkData, MapNode, MapEdge

router = APIRouter(prefix="/network", tags=["Network"])


@router.get("", response_model=NetworkData)
def get_network_graph(dataset: str = Query("demo"), db: Session = Depends(get_db)):
    """Return nodes and connected shipment edges for the interactive Leaflet map."""
    shipments = db.query(Shipment).filter(Shipment.dataset == dataset).all()

    # Collect active cities and their aggregates
    node_map = {}
    edge_map = {}

    for s in shipments:
        # Destination node
        dest_key = s.destination_city
        if dest_key not in node_map:
            node_map[dest_key] = {
                "id": f"node_{dest_key}",
                "code": s.customer_code,
                "name": f"{dest_key} Hub",
                "city": s.destination_city,
                "country": s.destination_country or "Unknown",
                "latitude": s.latitude or 48.8566,
                "longitude": s.longitude or 2.3522,
                "location_type": "customer",
                "total_co2_kg": 0.0,
                "inbound_shipments": 0,
                "outbound_shipments": 0,
                "risk_score": 0.15,
            }
        node_map[dest_key]["total_co2_kg"] += s.co2_total
        node_map[dest_key]["inbound_shipments"] += 1

        # Origin node
        orig_key = s.origin_city
        if orig_key not in node_map:
            # Look up origin coords
            orig_lat = 12.9716 if orig_key == "Bengaluru" else 48.956 if "CHALONS" in orig_key else 48.871
            orig_lng = 77.5946 if orig_key == "Bengaluru" else 4.363 if "CHALONS" in orig_key else 3.541
            node_map[orig_key] = {
                "id": f"node_{orig_key}",
                "code": s.warehouse_code,
                "name": f"{orig_key} Central DC",
                "city": s.origin_city,
                "country": s.origin_country or "India",
                "latitude": orig_lat,
                "longitude": orig_lng,
                "location_type": "warehouse",
                "total_co2_kg": 0.0,
                "inbound_shipments": 0,
                "outbound_shipments": 0,
                "risk_score": 0.10,
            }
        node_map[orig_key]["outbound_shipments"] += 1

        # Edge
        edge_key = f"{orig_key}➔{dest_key}"
        if edge_key not in edge_map:
            edge_map[edge_key] = {
                "id": f"edge_{orig_key}_{dest_key}",
                "origin_code": s.warehouse_code,
                "origin_name": orig_key,
                "origin_coords": [node_map[orig_key]["latitude"], node_map[orig_key]["longitude"]],
                "destination_code": s.customer_code,
                "destination_name": dest_key,
                "destination_coords": [node_map[dest_key]["latitude"], node_map[dest_key]["longitude"]],
                "primary_mode": "air" if s.distance_air > 0 else "sea" if s.distance_sea > 0 else "road",
                "distance_km": (s.distance_road + s.distance_rail + s.distance_sea + s.distance_air),
                "total_co2_kg": 0.0,
                "shipment_count": 0,
                "risk_score": 0.35 if s.distance_sea > 0 else 0.15,
            }
        edge_map[edge_key]["total_co2_kg"] += s.co2_total
        edge_map[edge_key]["shipment_count"] += 1

    nodes = [MapNode(**v) for v in node_map.values()]
    edges = [MapEdge(**v) for v in edge_map.values()]

    return NetworkData(nodes=nodes, edges=edges)
