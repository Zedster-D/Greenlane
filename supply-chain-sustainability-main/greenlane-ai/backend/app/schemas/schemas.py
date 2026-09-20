"""
GreenLane AI — Pydantic Schemas for API Requests & Responses
"""

from __future__ import annotations
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ── Dashboard & KPI Schemas ──────────────────────────────────────────────────

class KPISummary(BaseModel):
    total_co2e_kg: float
    total_co2e_tonnes: float
    total_shipments: int
    total_weight_tonnes: float
    total_distance_km: float
    avg_co2e_per_tonne_km: float
    shadow_carbon_cost: float
    currency: str = "EUR"
    data_quality_pct: Dict[str, float]
    top_emitter_mode: str
    top_emitter_mode_pct: float
    air_freight_emissions_share: float
    active_dataset: str


class MonthlyEmission(BaseModel):
    month_year: str
    co2e_kg: float
    co2e_tonnes: float
    weight_tonnes: float
    shipment_count: int
    road_co2: float
    rail_co2: float
    sea_co2: float
    air_co2: float


class ModeBreakdown(BaseModel):
    mode: str
    co2e_kg: float
    co2e_tonnes: float
    percentage: float
    distance_km: float
    shipment_count: int
    factor_used: float
    factor_source: str
    factor_unit: str


class RouteSummary(BaseModel):
    route_id: str
    origin: str
    destination: str
    origin_country: str
    destination_country: str
    co2e_kg: float
    percentage: float
    shipment_count: int
    total_weight_tonnes: float
    primary_mode: str
    risk_score: float


# ── Network Map Schemas ──────────────────────────────────────────────────────

class MapNode(BaseModel):
    id: str
    code: str
    name: str
    city: str
    country: str
    latitude: float
    longitude: float
    location_type: str
    total_co2_kg: float
    inbound_shipments: int
    outbound_shipments: int
    risk_score: float


class MapEdge(BaseModel):
    id: str
    origin_code: str
    origin_name: str
    origin_coords: List[float]
    destination_code: str
    destination_name: str
    destination_coords: List[float]
    primary_mode: str
    distance_km: float
    total_co2_kg: float
    shipment_count: int
    risk_score: float


class NetworkData(BaseModel):
    nodes: List[MapNode]
    edges: List[MapEdge]


# ── Shipment Schemas ─────────────────────────────────────────────────────────

class ShipmentItem(BaseModel):
    id: int
    order_number: int
    order_line: int
    date: str
    month_year: str
    warehouse_code: str
    customer_code: str
    item_code: str
    units: float
    euros: float
    weight_kg: float
    co2_total: float
    co2_road: float
    co2_rail: float
    co2_sea: float
    co2_air: float
    origin_city: str
    destination_city: str
    destination_country: str
    data_quality: str
    dataset: str


class ShipmentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    shipments: List[ShipmentItem]


# ── Scenario Schemas ─────────────────────────────────────────────────────────

class ScenarioRunRequest(BaseModel):
    name: Optional[str] = "Custom Simulation"
    mode_overrides: Optional[Dict[str, str]] = Field(default_factory=dict) # e.g. {"air": "sea"} or route_id -> mode
    consolidation_factor: float = Field(default=1.0, ge=0.1, le=2.0)
    carbon_price: float = Field(default=50.0, ge=0.0)
    dataset: str = "demo"


class ScenarioResponse(BaseModel):
    name: str
    baseline: Dict[str, float]
    scenario: Dict[str, float]
    delta: Dict[str, float]
    consolidation_factor: float
    carbon_price: float
    timestamp: str


# ── Optimizer Schemas ────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    co2_reduction_target_pct: float = Field(default=20.0, ge=1.0, le=90.0)
    max_cost_increase_pct: float = Field(default=10.0, ge=0.0, le=100.0)
    max_time_increase_pct: float = Field(default=50.0, ge=0.0, le=500.0)
    carbon_price: float = Field(default=50.0, ge=0.0)
    available_modes: List[str] = Field(default=["road", "rail", "sea", "air"])
    dataset: str = "demo"


class OptimizeOption(BaseModel):
    label: str
    co2e_kg: float
    cost: float
    total_cost_with_carbon: float
    carbon_cost: float
    time_hours: float
    co2_reduction_pct: float
    cost_increase_pct: float
    time_increase_pct: float
    mode_assignments: Dict[str, str]


class OptimizeResponse(BaseModel):
    baseline: Dict[str, float]
    feasible_count: int
    infeasible_count: int
    pareto_options: List[OptimizeOption]
    constraints: Dict[str, float]
    carbon_price: float
    note: str


# ── Disruption Schemas ───────────────────────────────────────────────────────

class DisruptionRequest(BaseModel):
    disruption_type: str = "port_closure" # port_closure | road_closure | supplier_failure | severe_weather | fuel_price_spike
    affected_location: Optional[str] = None
    affected_routes: Optional[List[str]] = None
    severity: float = Field(default=1.0, ge=0.1, le=2.0)
    fallback_mode: Optional[str] = None
    dataset: str = "demo"


class DisruptionResponse(BaseModel):
    disruption: Dict[str, Any]
    impact: Dict[str, Any]
    baseline: Dict[str, float]
    rerouted: Dict[str, float]
    suggestions: List[str]
    note: str


# ── AI Copilot Schemas ───────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str # user | assistant | system
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    dataset: str = "demo"


class ToolCallExecution(BaseModel):
    tool: str
    parameters: Dict[str, Any]
    result: Any


class ChatResponse(BaseModel):
    reply: str
    tool_calls: List[ToolCallExecution] = Field(default_factory=list)
    suggested_prompts: List[str] = Field(default_factory=list)


# ── Supplier 360 Schemas ─────────────────────────────────────────────────────

class SupplierItem(BaseModel):
    id: int
    code: str
    name: str
    location_name: str
    city: str
    country: str
    reliability_score: float
    lead_time_days: float
    capacity: float
    data_quality: str
    risk_score: float
    co2_intensity: float
    tier: str
    esg_grade: str


# ── Emission Factor Metadata Schemas ─────────────────────────────────────────

class EmissionFactorItem(BaseModel):
    id: int
    factor_id: str
    mode: str
    fuel_type: Optional[str]
    vehicle_type: Optional[str]
    value: float
    unit: str
    source: str
    methodology: str
    version: str
    year: int
    notes: Optional[str]
    is_active: bool
