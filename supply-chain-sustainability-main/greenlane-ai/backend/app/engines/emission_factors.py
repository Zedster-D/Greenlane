"""
GreenLane AI — Centralized Emission Factor Registry

Every emission factor has full provenance: mode, value, unit, source,
methodology, version, and notes.  The UI exposes this metadata so users
can audit which factor drove each number.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass(frozen=True)
class EmissionFactor:
    """Immutable emission-factor record with full provenance."""
    id: str
    mode: str                # road | rail | sea | air
    fuel_type: str           # diesel | electric | bunker_fuel | jet_fuel | mixed
    vehicle_type: str        # truck | train | container_ship | cargo_aircraft | general
    value: float             # kg CO₂e per tonne·km
    unit: str                # always "kg CO₂e / tonne·km"
    source: str              # e.g. "ADEME", "DEFRA", "GHG Protocol"
    methodology: str         # description of how factor was derived
    version: str             # e.g. "2023-v1"
    year: int                # publication year
    notes: str = ""
    data_quality: str = "ESTIMATED"  # MEASURED | ESTIMATED | ASSUMED


# ── Canonical factor set (matches dict_co2e from the original project) ────────
# These are the factors used on the real dataset producing 4,613.92 kg total CO₂.

CANONICAL_FACTORS: Dict[str, EmissionFactor] = {
    "road_default": EmissionFactor(
        id="road_default",
        mode="road",
        fuel_type="diesel",
        vehicle_type="truck",
        value=0.096,
        unit="kg CO₂e / tonne·km",
        source="ADEME – Base Carbone",
        methodology="Well-to-wheel, average European articulated truck >32t, average load",
        version="2023-v1",
        year=2023,
        notes="Default road factor from original project (dict_co2e)",
    ),
    "rail_default": EmissionFactor(
        id="rail_default",
        mode="rail",
        fuel_type="electric",
        vehicle_type="train",
        value=0.028,
        unit="kg CO₂e / tonne·km",
        source="ADEME – Base Carbone",
        methodology="Average European freight train, mixed electric/diesel",
        version="2023-v1",
        year=2023,
        notes="Default rail factor from original project (dict_co2e)",
    ),
    "sea_default": EmissionFactor(
        id="sea_default",
        mode="sea",
        fuel_type="bunker_fuel",
        vehicle_type="container_ship",
        value=0.01,
        unit="kg CO₂e / tonne·km",
        source="ADEME – Base Carbone",
        methodology="Average container ship, well-to-wake",
        version="2023-v1",
        year=2023,
        notes="Default sea factor from original project (dict_co2e)",
    ),
    "air_default": EmissionFactor(
        id="air_default",
        mode="air",
        fuel_type="jet_fuel",
        vehicle_type="cargo_aircraft",
        value=2.1,
        unit="kg CO₂e / tonne·km",
        source="ADEME – Base Carbone",
        methodology="Average air freight, belly-hold + dedicated freighter, well-to-wake",
        version="2023-v1",
        year=2023,
        notes="Default air factor from original project (dict_co2e). Includes radiative forcing.",
    ),
}

# ── Alternative factor set (from EMISSION_FACTORS constant, line 14) ──────────
ALTERNATIVE_FACTORS: Dict[str, EmissionFactor] = {
    "road_ghg": EmissionFactor(
        id="road_ghg",
        mode="road",
        fuel_type="diesel",
        vehicle_type="truck",
        value=0.062,
        unit="kg CO₂e / tonne·km",
        source="GHG Protocol",
        methodology="Tank-to-wheel, average truck",
        version="2021-v1",
        year=2021,
        notes="Alternative road factor from EMISSION_FACTORS constant in original code",
        data_quality="ESTIMATED",
    ),
    "rail_ghg": EmissionFactor(
        id="rail_ghg",
        mode="rail",
        fuel_type="electric",
        vehicle_type="train",
        value=0.022,
        unit="kg CO₂e / tonne·km",
        source="GHG Protocol",
        methodology="Average freight train",
        version="2021-v1",
        year=2021,
        notes="Alternative rail factor",
        data_quality="ESTIMATED",
    ),
    "sea_ghg": EmissionFactor(
        id="sea_ghg",
        mode="sea",
        fuel_type="bunker_fuel",
        vehicle_type="container_ship",
        value=0.016,
        unit="kg CO₂e / tonne·km",
        source="GHG Protocol",
        methodology="Average container ship",
        version="2021-v1",
        year=2021,
        notes="Alternative sea factor",
        data_quality="ESTIMATED",
    ),
    "air_ghg": EmissionFactor(
        id="air_ghg",
        mode="air",
        fuel_type="jet_fuel",
        vehicle_type="cargo_aircraft",
        value=0.602,
        unit="kg CO₂e / tonne·km",
        source="GHG Protocol",
        methodology="Average air freight, no radiative forcing multiplier",
        version="2021-v1",
        year=2021,
        notes="Alternative air factor, lower than ADEME (no RF multiplier)",
        data_quality="ESTIMATED",
    ),
}


class EmissionFactorRegistry:
    """Central registry for emission factors. Supports multiple factor sets."""

    def __init__(self):
        self._factors: Dict[str, EmissionFactor] = {}
        self._active_set: str = "canonical"
        # Load canonical by default
        self._factors.update(CANONICAL_FACTORS)
        self._factors.update(ALTERNATIVE_FACTORS)

    def get_factor(self, mode: str, factor_id: Optional[str] = None) -> EmissionFactor:
        """Get the active emission factor for a transport mode."""
        if factor_id and factor_id in self._factors:
            return self._factors[factor_id]
        # Default: use canonical
        default_id = f"{mode.lower()}_default"
        if default_id in self._factors:
            return self._factors[default_id]
        raise ValueError(f"No emission factor found for mode '{mode}'")

    def get_all_factors(self) -> List[EmissionFactor]:
        return list(self._factors.values())

    def get_factors_by_mode(self, mode: str) -> List[EmissionFactor]:
        return [f for f in self._factors.values() if f.mode == mode.lower()]

    def get_factor_value(self, mode: str) -> float:
        """Convenience: get the default factor value for a mode."""
        return self.get_factor(mode).value


# Singleton
registry = EmissionFactorRegistry()
