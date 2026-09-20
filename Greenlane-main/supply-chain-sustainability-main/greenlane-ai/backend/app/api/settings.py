"""
GreenLane AI — Settings & Configuration API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any

from app.core.config import DEFAULT_CARBON_PRICE, DEFAULT_CURRENCY, DEMO_MODE, APP_NAME, APP_VERSION

router = APIRouter(prefix="/settings", tags=["Settings"])


class SystemConfig(BaseModel):
    app_name: str
    version: str
    carbon_price_eur: float
    currency: str
    demo_mode: bool
    active_dataset: str


_runtime_config = {
    "carbon_price_eur": DEFAULT_CARBON_PRICE,
    "currency": DEFAULT_CURRENCY,
    "active_dataset": "demo",
}


@router.get("", response_model=SystemConfig)
def get_system_config():
    """Return runtime system configurations."""
    return SystemConfig(
        app_name=APP_NAME,
        version=APP_VERSION,
        carbon_price_eur=_runtime_config["carbon_price_eur"],
        currency=_runtime_config["currency"],
        demo_mode=DEMO_MODE,
        active_dataset=_runtime_config["active_dataset"]
    )


@router.post("")
def update_system_config(cfg: Dict[str, Any]):
    """Update runtime configurations (e.g. active dataset, carbon price)."""
    if "carbon_price_eur" in cfg:
        _runtime_config["carbon_price_eur"] = float(cfg["carbon_price_eur"])
    if "currency" in cfg:
        _runtime_config["currency"] = str(cfg["currency"])
    if "active_dataset" in cfg:
        _runtime_config["active_dataset"] = str(cfg["active_dataset"])
    return {"status": "success", "config": _runtime_config}
