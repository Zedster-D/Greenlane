"""
GreenLane AI — Database Models

Normalized tables seeded from the existing CSV data.
"""

from __future__ import annotations
from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    city = Column(String(100))
    country = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    location_type = Column(String(50))  # warehouse | customer | supplier | port | factory
    capacity = Column(Float, default=0)
    risk_score = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"))
    reliability_score = Column(Float, default=0.85)
    lead_time_days = Column(Float, default=7)
    capacity = Column(Float, default=1000)
    data_quality = Column(String(20), default="ESTIMATED")
    risk_score = Column(Float, default=0.3)
    co2_intensity = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    location = relationship("Location")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200))
    conversion_ratio = Column(Float, default=1.0)  # units to kg
    category = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)


class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(String(100), unique=True, nullable=False)
    origin_id = Column(Integer, ForeignKey("locations.id"))
    destination_id = Column(Integer, ForeignKey("locations.id"))
    distance_road = Column(Float, default=0)
    distance_rail = Column(Float, default=0)
    distance_sea = Column(Float, default=0)
    distance_air = Column(Float, default=0)
    primary_mode = Column(String(20), default="road")
    cost_per_tonne_km = Column(Float, default=1.0)
    transit_time_hours = Column(Float, default=24)
    risk_score = Column(Float, default=0.2)
    created_at = Column(DateTime, default=datetime.utcnow)
    origin = relationship("Location", foreign_keys=[origin_id])
    destination = relationship("Location", foreign_keys=[destination_id])


class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_number = Column(Integer)
    order_line = Column(Integer)
    date = Column(DateTime)
    month_year = Column(String(20))
    warehouse_code = Column(String(50))
    customer_code = Column(String(50))
    item_code = Column(String(50))
    units = Column(Float, default=0)
    euros = Column(Float, default=0)
    weight_kg = Column(Float, default=0)
    distance_road = Column(Float, default=0)
    distance_rail = Column(Float, default=0)
    distance_sea = Column(Float, default=0)
    distance_air = Column(Float, default=0)
    co2_road = Column(Float, default=0)
    co2_rail = Column(Float, default=0)
    co2_sea = Column(Float, default=0)
    co2_air = Column(Float, default=0)
    co2_total = Column(Float, default=0)
    origin_city = Column(String(100))
    origin_country = Column(String(100))
    destination_city = Column(String(100))
    destination_country = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    data_quality = Column(String(20), default="ESTIMATED")
    dataset = Column(String(50), default="original")  # original | demo
    created_at = Column(DateTime, default=datetime.utcnow)


class EmissionFactorRecord(Base):
    __tablename__ = "emission_factors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    factor_id = Column(String(50), unique=True, nullable=False)
    mode = Column(String(20), nullable=False)
    fuel_type = Column(String(50))
    vehicle_type = Column(String(50))
    value = Column(Float, nullable=False)
    unit = Column(String(50), default="kg CO₂e / tonne·km")
    source = Column(String(200))
    methodology = Column(Text)
    version = Column(String(20))
    year = Column(Integer)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    mode_overrides = Column(Text)  # JSON string
    consolidation_factor = Column(Float, default=1.0)
    carbon_price = Column(Float, default=50.0)
    baseline_co2 = Column(Float, default=0)
    scenario_co2 = Column(Float, default=0)
    baseline_cost = Column(Float, default=0)
    scenario_cost = Column(Float, default=0)
    co2_change_pct = Column(Float, default=0)
    cost_change_pct = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200))
    report_type = Column(String(50), default="sustainability")
    content = Column(Text)  # JSON
    generated_at = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String(500))
