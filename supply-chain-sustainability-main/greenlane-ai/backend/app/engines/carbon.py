"""
GreenLane AI — Canonical Carbon Calculation Engine

Single source of truth for all CO₂e calculations.
Frontend NEVER calculates emissions — all math happens here.

Core formula (ADEME / GHG Protocol):
    CO₂e (kg) = weight (tonnes) × distance (km) × emission_factor (kg CO₂e / tonne·km)
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from .emission_factors import registry, EmissionFactor


@dataclass
class EmissionResult:
    """Result of a single CO₂e calculation with full audit trail."""
    co2e_kg: float
    weight_kg: float
    weight_tonnes: float
    distance_km: float
    mode: str
    factor: EmissionFactor
    data_quality: str  # MEASURED | ESTIMATED | ASSUMED
    formula: str       # Human-readable formula string


def calculate_co2e(
    weight_kg: float,
    distance_km: float,
    mode: str,
    factor_id: Optional[str] = None,
    weight_data_quality: str = "MEASURED",
    distance_data_quality: str = "MEASURED",
) -> EmissionResult:
    """
    Calculate CO₂e for a single shipment leg.

    This is the ONE canonical calculation function.
    Every API endpoint, AI tool, scenario engine, and optimizer
    calls this function — nothing else computes emissions.

    Args:
        weight_kg: Shipment weight in kilograms
        distance_km: Distance in kilometres
        mode: Transport mode (road, rail, sea, air)
        factor_id: Optional specific emission factor ID
        weight_data_quality: Data quality of weight measurement
        distance_data_quality: Data quality of distance measurement

    Returns:
        EmissionResult with value and full audit metadata
    """
    if weight_kg < 0:
        raise ValueError(f"Weight cannot be negative: {weight_kg}")
    if distance_km < 0:
        raise ValueError(f"Distance cannot be negative: {distance_km}")

    factor = registry.get_factor(mode, factor_id)
    weight_tonnes = weight_kg / 1000.0
    co2e_kg = weight_tonnes * distance_km * factor.value

    # Overall data quality is the weakest link
    qualities = [weight_data_quality, distance_data_quality, factor.data_quality]
    quality_rank = {"MEASURED": 0, "ESTIMATED": 1, "ASSUMED": 2}
    overall_quality = max(qualities, key=lambda q: quality_rank.get(q, 2))

    formula = (
        f"{co2e_kg:.4f} kg CO₂e = "
        f"{weight_tonnes:.4f} t × {distance_km:.1f} km × "
        f"{factor.value} {factor.unit} ({factor.source})"
    )

    return EmissionResult(
        co2e_kg=co2e_kg,
        weight_kg=weight_kg,
        weight_tonnes=weight_tonnes,
        distance_km=distance_km,
        mode=mode,
        factor=factor,
        data_quality=overall_quality,
        formula=formula,
    )


def calculate_shipment_emissions(
    weight_kg: float,
    distance_road: float = 0,
    distance_rail: float = 0,
    distance_sea: float = 0,
    distance_air: float = 0,
) -> dict:
    """
    Calculate emissions for a shipment across all transport modes.
    Replicates the original project's multi-mode calculation.

    Returns dict with per-mode and total emissions.
    """
    results = {}
    total_co2e = 0.0
    modes_data = {
        "road": distance_road,
        "rail": distance_rail,
        "sea": distance_sea,
        "air": distance_air,
    }

    for mode, distance in modes_data.items():
        if distance > 0:
            result = calculate_co2e(weight_kg, distance, mode)
            results[mode] = {
                "co2e_kg": result.co2e_kg,
                "distance_km": distance,
                "factor": result.factor.value,
                "factor_source": result.factor.source,
                "formula": result.formula,
                "data_quality": result.data_quality,
            }
            total_co2e += result.co2e_kg
        else:
            results[mode] = {
                "co2e_kg": 0.0,
                "distance_km": 0,
                "factor": registry.get_factor(mode).value,
                "factor_source": registry.get_factor(mode).source,
                "formula": "N/A — no distance",
                "data_quality": "N/A",
            }

    results["total"] = {
        "co2e_kg": total_co2e,
        "weight_kg": weight_kg,
    }
    return results


def calculate_carbon_cost(co2e_kg: float, carbon_price_per_tonne: float = 50.0) -> float:
    """Calculate shadow carbon cost.  Default €50/tonne (EU ETS ballpark)."""
    return (co2e_kg / 1000.0) * carbon_price_per_tonne
