"""
GreenLane AI — Database Seeding Script

Loads original CSV datasets and generates the VastraGlobal demo dataset.
"""

from __future__ import annotations
import csv
import os
from pathlib import Path
from datetime import datetime, timedelta
import random

from app.core.database import SessionLocal, init_db
from app.core.config import DATA_DIR
from app.models.tables import (
    Location, Supplier, Product, Route, Shipment,
    EmissionFactorRecord, Scenario, Report
)
from app.engines.emission_factors import CANONICAL_FACTORS, ALTERNATIVE_FACTORS
from app.engines.carbon import calculate_co2e


def seed_emission_factors(db):
    """Seed canonical and alternative emission factor records with full metadata."""
    if db.query(EmissionFactorRecord).count() > 0:
        return

    all_factors = list(CANONICAL_FACTORS.values()) + list(ALTERNATIVE_FACTORS.values())
    for f in all_factors:
        rec = EmissionFactorRecord(
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
            is_active=f.id.endswith("_default"),
        )
        db.add(rec)
    db.commit()
    print("[OK] Seeded emission factors")


def seed_original_dataset(db):
    """Seed the original 4-file CSV dataset."""
    if db.query(Shipment).filter(Shipment.dataset == "original").count() > 0:
        return

    # Check data directory
    data_path = DATA_DIR
    if not (data_path / "order_lines.csv").exists():
        # Fallback search
        candidate = Path(__file__).resolve().parent.parent.parent.parent / "data"
        if candidate.exists():
            data_path = candidate

    gps_file = data_path / "gps_locations.csv"
    uom_file = data_path / "uom_conversions.csv"
    dist_file = data_path / "distances.csv"
    orders_file = data_path / "order_lines.csv"

    if not (gps_file.exists() and uom_file.exists() and dist_file.exists() and orders_file.exists()):
        print(f"[WARN] Original CSV files not found at {data_path}, skipping original dataset seed.")
        return

    # 1. Parse GPS Locations
    gps_dict = {}  # "COUNTRY, CITY" -> (lat, lng)
    with open(gps_file, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) >= 4 and row[1]:
                loc_key = row[1].strip().upper()
                try:
                    lat = float(row[2])
                    lng = float(row[3])
                    gps_dict[loc_key] = (lat, lng)
                except ValueError:
                    continue

    # 2. Parse UOM Conversions (Item -> ratio)
    uom_dict = {}
    with open(uom_file, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) >= 3 and row[1]:
                item_code = row[1].strip()
                try:
                    ratio = float(row[2])
                    uom_dict[item_code] = ratio
                    # Also add Product table entry if not exists
                    prod = Product(
                        item_code=item_code,
                        name=f"Product {item_code}",
                        conversion_ratio=ratio,
                        category="General Cargo"
                    )
                    db.add(prod)
                except ValueError:
                    continue
    db.commit()

    # 3. Parse Distances & Create Locations & Routes
    dist_dict = {}  # (wh_code, cust_code) -> dict
    wh_locations = {
        "3403434": ("WAREHOUSE PARIS AREA 1", "FRANCE", "CHALONS-EN-CHAMPAGNE", 48.956, 4.363),
        "3402002": ("WAREHOUSE PARIS AREA 2", "FRANCE", "MONTMIRAIL", 48.871, 3.541),
    }

    # Add warehouses to Location
    for code, (wname, wcountry, wcity, wlat, wlng) in wh_locations.items():
        loc = Location(
            code=code,
            name=wname,
            country=wcountry,
            city=wcity,
            latitude=wlat,
            longitude=wlng,
            location_type="warehouse",
            capacity=50000,
            risk_score=0.1
        )
        db.add(loc)
    db.commit()

    with open(dist_file, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        # Columns: ,Warehouse Code,Warehouse Name,Warehouse Country,Warehouse City,Customer Code,Customer Country,Customer City,Road,Rail,Sea,Air
        for row in reader:
            if len(row) >= 12:
                wh_code = row[1].strip()
                cust_code = row[5].strip()
                cust_country = row[6].strip().upper()
                cust_city = row[7].strip().upper()
                road = float(row[8]) if row[8] else 0.0
                rail = float(row[9]) if row[9] else 0.0
                sea = float(row[10]) if row[10] else 0.0
                air = float(row[11]) if row[11] else 0.0

                gps_key = f"{cust_country}, {cust_city}"
                lat, lng = gps_dict.get(gps_key, (48.8566, 2.3522))

                # Add customer Location
                cust_loc = db.query(Location).filter(Location.code == cust_code).first()
                if not cust_loc:
                    cust_loc = Location(
                        code=cust_code,
                        name=f"Customer {cust_city} ({cust_code})",
                        country=cust_country,
                        city=cust_city,
                        latitude=lat,
                        longitude=lng,
                        location_type="customer",
                        risk_score=0.15
                    )
                    db.add(cust_loc)
                    db.commit()

                dist_dict[(wh_code, cust_code)] = {
                    "country": cust_country,
                    "city": cust_city,
                    "lat": lat,
                    "lng": lng,
                    "road": road,
                    "rail": rail,
                    "sea": sea,
                    "air": air,
                }

                # Add Route
                wh_loc = db.query(Location).filter(Location.code == wh_code).first()
                route_id = f"{wh_code}->{cust_code}"
                route = Route(
                    route_id=route_id,
                    origin_id=wh_loc.id if wh_loc else None,
                    destination_id=cust_loc.id if cust_loc else None,
                    distance_road=road,
                    distance_rail=rail,
                    distance_sea=sea,
                    distance_air=air,
                    primary_mode="road" if road > 0 else "sea",
                    cost_per_tonne_km=1.2,
                    transit_time_hours=24.0,
                    risk_score=0.15
                )
                db.add(route)
    db.commit()

    # 4. Parse Order Lines and compute emissions
    shipment_batch = []
    with open(orders_file, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        # Columns: ,Date,Month-Year,Warehouse Code,Customer Code,Order Number,Order Line Number,Item Code,Units,Euros
        for row in reader:
            if len(row) >= 10:
                try:
                    date_str = row[1].strip()
                    date_val = datetime.strptime(date_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
                except Exception:
                    date_val = datetime(2021, 1, 1)

                month_year = row[2].strip()
                wh_code = row[3].strip()
                cust_code = row[4].strip()
                order_num = int(row[5]) if row[5] else 0
                order_line = int(row[6]) if row[6] else 1
                item_code = row[7].strip()
                units = float(row[8]) if row[8] else 0.0
                euros = float(row[9]) if row[9] else 0.0

                ratio = uom_dict.get(item_code, 1.0)
                weight_kg = units * ratio

                route_info = dist_dict.get((wh_code, cust_code), {
                    "country": "FRANCE", "city": "PARIS", "lat": 48.8566, "lng": 2.3522,
                    "road": 250.0, "rail": 0.0, "sea": 0.0, "air": 0.0
                })

                # Calculate canonical CO₂
                co2_road = calculate_co2e(weight_kg, route_info["road"], "road").co2e_kg if route_info["road"] > 0 else 0.0
                co2_rail = calculate_co2e(weight_kg, route_info["rail"], "rail").co2e_kg if route_info["rail"] > 0 else 0.0
                co2_sea = calculate_co2e(weight_kg, route_info["sea"], "sea").co2e_kg if route_info["sea"] > 0 else 0.0
                co2_air = calculate_co2e(weight_kg, route_info["air"], "air").co2e_kg if route_info["air"] > 0 else 0.0
                co2_total = co2_road + co2_rail + co2_sea + co2_air

                shipment = Shipment(
                    order_number=order_num,
                    order_line=order_line,
                    date=date_val,
                    month_year=month_year,
                    warehouse_code=wh_code,
                    customer_code=cust_code,
                    item_code=item_code,
                    units=units,
                    euros=euros,
                    weight_kg=weight_kg,
                    distance_road=route_info["road"],
                    distance_rail=route_info["rail"],
                    distance_sea=route_info["sea"],
                    distance_air=route_info["air"],
                    co2_road=co2_road,
                    co2_rail=co2_rail,
                    co2_sea=co2_sea,
                    co2_air=co2_air,
                    co2_total=co2_total,
                    origin_city="CHALONS-EN-CHAMPAGNE" if wh_code == "3403434" else "MONTMIRAIL",
                    origin_country="FRANCE",
                    destination_city=route_info["city"],
                    destination_country=route_info["country"],
                    latitude=route_info["lat"],
                    longitude=route_info["lng"],
                    data_quality="ESTIMATED",
                    dataset="original"
                )
                shipment_batch.append(shipment)

                if len(shipment_batch) >= 1000:
                    db.bulk_save_objects(shipment_batch)
                    db.commit()
                    shipment_batch = []

    if shipment_batch:
        db.bulk_save_objects(shipment_batch)
        db.commit()

    print("[OK] Seeded original 5,208 shipments & reference data")


def seed_vastraglobal_demo_dataset(db):
    """
    Seed the rich 'VastraGlobal Exports' demo dataset.
    Features:
    - Indian export hub (Tirupur/Bengaluru/Mumbai) shipping globally.
    - Demonstrates multimodal trade (Road, Rail DFC, Sea container, Air express).
    - Features the 10% air freight shipments -> ~45% carbon emissions anomaly.
    - Supplier ESG ratings, disruptions, and pre-computed scenarios.
    """
    if db.query(Shipment).filter(Shipment.dataset == "demo").count() > 0:
        return

    # 1. Demo Locations
    demo_locs = [
        # Origins & Indian hubs
        ("LOC_BLR", "Vastra Global HQ & Central Warehouse", "Bengaluru", "India", 12.9716, 77.5946, "warehouse", 40000, 0.12),
        ("LOC_BOM", "Nhava Sheva Port & Logistics Hub", "Mumbai", "India", 18.9498, 72.9515, "port", 120000, 0.25),
        ("LOC_TUP", "Tirupur Knitwear Manufacturing Hub", "Tirupur", "India", 11.1085, 77.3411, "factory", 30000, 0.18),
        ("LOC_MAA", "Chennai Port & Logistics Cluster", "Chennai", "India", 13.0827, 80.2707, "port", 80000, 0.15),
        ("LOC_DEL", "North India Inland Container Depot", "Delhi", "India", 28.6139, 77.2090, "warehouse", 50000, 0.22),
        # International Destinations
        ("LOC_RTM", "Port of Rotterdam Euro Hub", "Rotterdam", "Netherlands", 51.9244, 4.4777, "customer", 100000, 0.10),
        ("LOC_HAM", "Hamburg Port Container Terminal", "Hamburg", "Germany", 53.5511, 9.9937, "customer", 90000, 0.10),
        ("LOC_LHR", "London Distribution Gateway", "London", "United Kingdom", 51.5074, -0.1278, "customer", 75000, 0.15),
        ("LOC_NYC", "New York Port Gateway (Newark)", "New York", "United States", 40.7128, -74.0060, "customer", 150000, 0.20),
        ("LOC_LAX", "Los Angeles Logistics Gateway", "Los Angeles", "United States", 34.0522, -118.2437, "customer", 130000, 0.18),
    ]

    loc_obj_map = {}
    for code, name, city, country, lat, lng, ltype, cap, risk in demo_locs:
        loc = Location(
            code=code, name=name, city=city, country=country,
            latitude=lat, longitude=lng, location_type=ltype,
            capacity=cap, risk_score=risk
        )
        db.add(loc)
        db.commit()
        loc_obj_map[code] = loc

    # 2. Demo Suppliers
    demo_suppliers = [
        ("SUP_COTTON_01", "Coimbatore Organic Cotton Mills", "LOC_TUP", 0.94, 5.0, 5000, "MEASURED", 0.12, 1.4),
        ("SUP_DYE_02", "Cauvery Eco Dyeing & Finishing", "LOC_TUP", 0.88, 7.0, 3500, "ESTIMATED", 0.28, 3.8),
        ("SUP_KNIT_03", "Apex Garment Weaving Tech", "LOC_BLR", 0.96, 4.0, 8000, "MEASURED", 0.08, 0.9),
        ("SUP_ACC_04", "Delhi Trim & Accessories Ltd", "LOC_DEL", 0.82, 10.0, 2000, "ESTIMATED", 0.42, 2.1),
        ("SUP_PACK_05", "GreenPack Biodegradable Containers", "LOC_BLR", 0.95, 3.0, 10000, "MEASURED", 0.05, 0.4),
    ]

    for scode, sname, lcode, rel, lt, cap, dq, rsk, co2int in demo_suppliers:
        sup = Supplier(
            code=scode, name=sname,
            location_id=loc_obj_map[lcode].id if lcode in loc_obj_map else None,
            reliability_score=rel, lead_time_days=lt,
            capacity=cap, data_quality=dq, risk_score=rsk,
            co2_intensity=co2int
        )
        db.add(sup)
    db.commit()

    # 3. Demo Products
    demo_prods = [
        ("PRD_ORGANIC_TEE", "100% Organic Cotton T-Shirt", 0.22, "Apparel"),
        ("PRD_DENIM_JEANS", "Recycled Denim Jeans (Zero-Water)", 0.65, "Apparel"),
        ("PRD_HOODIE_FLEECE", "Heavyweight Fleece Hoodie", 0.85, "Apparel"),
        ("PRD_WOOL_SWEATER", "Merino Wool Knit Sweater", 0.45, "Apparel"),
        ("PRD_ECO_TOTE", "Canvas Retail Shopper Bag", 0.18, "Accessories"),
    ]

    for pcode, pname, ratio, cat in demo_prods:
        p = Product(item_code=pcode, name=pname, conversion_ratio=ratio, category=cat)
        db.add(p)
    db.commit()

    # 4. Demo Routes
    # Route format: (route_id, orig_code, dest_code, road_km, rail_km, sea_km, air_km, primary_mode, cost_per_tkm, transit_hrs, risk)
    demo_routes = [
        ("RT_BLR_RTM_SEA", "LOC_BLR", "LOC_RTM", 350, 0, 12500, 0, "sea", 0.18, 480, 0.35), # Sea via Mumbai/Suez
        ("RT_BLR_RTM_AIR", "LOC_BLR", "LOC_RTM", 40, 0, 0, 7600, "air", 4.80, 24, 0.10),   # Express Air
        ("RT_BLR_HAM_SEA", "LOC_BLR", "LOC_HAM", 350, 0, 13100, 0, "sea", 0.18, 510, 0.35),
        ("RT_BLR_HAM_AIR", "LOC_BLR", "LOC_HAM", 40, 0, 0, 7500, "air", 4.80, 24, 0.10),
        ("RT_BLR_LHR_SEA", "LOC_BLR", "LOC_LHR", 350, 0, 12200, 0, "sea", 0.18, 460, 0.30),
        ("RT_BLR_LHR_AIR", "LOC_BLR", "LOC_LHR", 40, 0, 0, 7700, "air", 4.90, 22, 0.10),
        ("RT_BLR_NYC_SEA", "LOC_BLR", "LOC_NYC", 350, 0, 15800, 0, "sea", 0.20, 620, 0.40),
        ("RT_BLR_NYC_AIR", "LOC_BLR", "LOC_NYC", 40, 0, 0, 13400, "air", 5.20, 36, 0.15),
        ("RT_BLR_LAX_SEA", "LOC_BLR", "LOC_LAX", 350, 0, 17200, 0, "sea", 0.21, 680, 0.38),
        ("RT_BLR_LAX_AIR", "LOC_BLR", "LOC_LAX", 40, 0, 0, 14200, "air", 5.40, 38, 0.15),
        # Domestic freight corridors (DFC Rail vs Road)
        ("RT_TUP_BOM_ROAD", "LOC_TUP", "LOC_BOM", 1250, 0, 0, 0, "road", 1.25, 48, 0.25),
        ("RT_TUP_BOM_RAIL", "LOC_TUP", "LOC_BOM", 0, 1280, 0, 0, "rail", 0.65, 36, 0.12),
        ("RT_DEL_BOM_RAIL", "LOC_DEL", "LOC_BOM", 0, 1400, 0, 0, "rail", 0.60, 30, 0.10), # Western DFC
        ("RT_DEL_BOM_ROAD", "LOC_DEL", "LOC_BOM", 1420, 0, 0, 0, "road", 1.30, 55, 0.28),
    ]

    for rid, ocode, dcode, r_km, ra_km, s_km, a_km, pmode, c_tkm, thrs, rsk in demo_routes:
        r = Route(
            route_id=rid,
            origin_id=loc_obj_map[ocode].id,
            destination_id=loc_obj_map[dcode].id,
            distance_road=r_km,
            distance_rail=ra_km,
            distance_sea=s_km,
            distance_air=a_km,
            primary_mode=pmode,
            cost_per_tonne_km=c_tkm,
            transit_time_hours=thrs,
            risk_score=rsk
        )
        db.add(r)
    db.commit()

    # 5. Generate 850 Realistic Shipments spanning 2023-2024
    random.seed(42)
    start_date = datetime(2023, 1, 1)
    demo_shipments = []

    dest_weights = [
        ("LOC_RTM", 0.30),
        ("LOC_HAM", 0.20),
        ("LOC_LHR", 0.18),
        ("LOC_NYC", 0.18),
        ("LOC_LAX", 0.14),
    ]

    prod_codes = [p[0] for p in demo_prods]
    prod_weights = {"PRD_ORGANIC_TEE": 0.22, "PRD_DENIM_JEANS": 0.65, "PRD_HOODIE_FLEECE": 0.85, "PRD_WOOL_SWEATER": 0.45, "PRD_ECO_TOTE": 0.18}

    for i in range(1, 851):
        # Pick date
        day_offset = random.randint(0, 364)
        s_date = start_date + timedelta(days=day_offset)
        m_yr = f"{s_date.month}-{s_date.year}"

        # Choose destination
        d_code = random.choices([d[0] for d in dest_weights], weights=[d[1] for d in dest_weights])[0]
        dest_loc = loc_obj_map[d_code]

        # Mode determination: 88% Sea (Container), 10% Air (Rush Order / Peak Season), 2% Rail
        is_air_rush = random.random() < 0.10  # 10% Air freight!
        mode = "air" if is_air_rush else "sea"

        # Item & units
        item_code = random.choice(prod_codes)
        units = random.randint(500, 6000) if not is_air_rush else random.randint(200, 1500)
        weight_kg = units * prod_weights[item_code]
        euros = units * random.uniform(12.0, 48.0)

        # Distances
        r_road, r_rail, r_sea, r_air = 0.0, 0.0, 0.0, 0.0
        if mode == "air":
            r_air = 7500.0 if "EU" in dest_loc.city or dest_loc.city in ["Rotterdam", "Hamburg", "London"] else 13800.0
            r_road = 40.0
        else:
            r_sea = 12500.0 if dest_loc.city in ["Rotterdam", "Hamburg", "London"] else 16500.0
            r_road = 350.0

        # Calculations
        co2_road = calculate_co2e(weight_kg, r_road, "road").co2e_kg if r_road > 0 else 0.0
        co2_rail = calculate_co2e(weight_kg, r_rail, "rail").co2e_kg if r_rail > 0 else 0.0
        co2_sea = calculate_co2e(weight_kg, r_sea, "sea").co2e_kg if r_sea > 0 else 0.0
        co2_air = calculate_co2e(weight_kg, r_air, "air").co2e_kg if r_air > 0 else 0.0
        co2_total = co2_road + co2_rail + co2_sea + co2_air

        s = Shipment(
            order_number=100000 + i,
            order_line=1,
            date=s_date,
            month_year=m_yr,
            warehouse_code="LOC_BLR",
            customer_code=d_code,
            item_code=item_code,
            units=units,
            euros=euros,
            weight_kg=weight_kg,
            distance_road=r_road,
            distance_rail=r_rail,
            distance_sea=r_sea,
            distance_air=r_air,
            co2_road=co2_road,
            co2_rail=co2_rail,
            co2_sea=co2_sea,
            co2_air=co2_air,
            co2_total=co2_total,
            origin_city="Bengaluru",
            origin_country="India",
            destination_city=dest_loc.city,
            destination_country=dest_loc.country,
            latitude=dest_loc.latitude,
            longitude=dest_loc.longitude,
            data_quality="MEASURED" if random.random() > 0.3 else "ESTIMATED",
            dataset="demo"
        )
        demo_shipments.append(s)

    db.bulk_save_objects(demo_shipments)
    db.commit()

    # 6. Seed Pre-configured Scenarios
    scenarios = [
        Scenario(
            name="Air-to-Sea Mode Shift (Fast Steaming)",
            description="Shift 60% of non-urgent express air freight to scheduled premium ocean carrier routes. Drastically cuts carbon at ~70% cost reduction.",
            mode_overrides='{"air": "sea"}',
            consolidation_factor=0.90,
            carbon_price=60.0,
            baseline_co2=84520.0,
            scenario_co2=18240.0,
            baseline_cost=185000.0,
            scenario_cost=62000.0,
            co2_change_pct=-78.4,
            cost_change_pct=-66.5,
        ),
        Scenario(
            name="Western DFC Rail Electrification",
            description="Migrate North India to Nhava Sheva container haulage from diesel trucking to electrified Dedicated Freight Corridor (DFC) rail.",
            mode_overrides='{"road": "rail"}',
            consolidation_factor=0.95,
            carbon_price=50.0,
            baseline_co2=42300.0,
            scenario_co2=12330.0,
            baseline_cost=95000.0,
            scenario_cost=68000.0,
            co2_change_pct=-70.8,
            cost_change_pct=-28.4,
        ),
        Scenario(
            name="Load Consolidation & Route Bundling",
            description="Consolidate LCL (Less-than-Container Load) shipments into FCL (Full Container Load) via Bengaluru freight hub.",
            mode_overrides='{}',
            consolidation_factor=0.80,
            carbon_price=50.0,
            baseline_co2=126800.0,
            scenario_co2=101440.0,
            baseline_cost=280000.0,
            scenario_cost=224000.0,
            co2_change_pct=-20.0,
            cost_change_pct=-20.0,
        )
    ]
    for sc in scenarios:
        db.add(sc)
    db.commit()

    print("[OK] Seeded VastraGlobal demo dataset & pre-configured scenarios")


def seed_all():
    """Main seed entry point."""
    print("[SEED] Initializing GreenLane AI Database...")
    init_db()
    db = SessionLocal()
    try:
        seed_emission_factors(db)
        seed_original_dataset(db)
        seed_vastraglobal_demo_dataset(db)
        print("[SUCCESS] Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
