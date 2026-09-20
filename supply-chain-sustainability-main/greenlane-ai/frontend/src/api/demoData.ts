/**
 * GreenLane AI — Demo/Fallback Data
 * 
 * Used when the backend API is unavailable (e.g. static Vercel deployment).
 * Provides realistic sample data so the app is fully functional as a demo.
 */

import type {
  KPISummary, MonthlyEmission, ModeBreakdown, RouteSummary,
  NetworkData, ShipmentListResponse, SupplierItem, EmissionFactorItem,
  ScenarioResult, OptimizerResponse, DisruptionResponse, ChatResponse
} from './client';

export const DEMO_KPI: KPISummary = {
  total_co2e_kg: 284750,
  total_co2e_tonnes: 284.75,
  total_shipments: 1247,
  total_weight_tonnes: 3820,
  total_distance_km: 425600,
  avg_co2e_per_tonne_km: 0.0175,
  shadow_carbon_cost: 14237.5,
  currency: "EUR",
  data_quality_pct: { MEASURED: 62, ESTIMATED: 28, ASSUMED: 10 },
  top_emitter_mode: "Air",
  top_emitter_mode_pct: 47.3,
  air_freight_emissions_share: 47.3,
  active_dataset: "demo"
};

export const DEMO_MONTHLY: MonthlyEmission[] = [
  { month_year: "2024-01", co2e_kg: 22100, co2e_tonnes: 22.1, weight_tonnes: 310, shipment_count: 98, road_co2: 6800, rail_co2: 1200, sea_co2: 4500, air_co2: 9600 },
  { month_year: "2024-02", co2e_kg: 24500, co2e_tonnes: 24.5, weight_tonnes: 335, shipment_count: 105, road_co2: 7200, rail_co2: 1400, sea_co2: 5100, air_co2: 10800 },
  { month_year: "2024-03", co2e_kg: 21800, co2e_tonnes: 21.8, weight_tonnes: 298, shipment_count: 92, road_co2: 6500, rail_co2: 1100, sea_co2: 4200, air_co2: 10000 },
  { month_year: "2024-04", co2e_kg: 26200, co2e_tonnes: 26.2, weight_tonnes: 360, shipment_count: 112, road_co2: 7800, rail_co2: 1600, sea_co2: 5500, air_co2: 11300 },
  { month_year: "2024-05", co2e_kg: 23900, co2e_tonnes: 23.9, weight_tonnes: 320, shipment_count: 101, road_co2: 7100, rail_co2: 1300, sea_co2: 4800, air_co2: 10700 },
  { month_year: "2024-06", co2e_kg: 25100, co2e_tonnes: 25.1, weight_tonnes: 345, shipment_count: 108, road_co2: 7500, rail_co2: 1500, sea_co2: 5200, air_co2: 10900 },
  { month_year: "2024-07", co2e_kg: 27800, co2e_tonnes: 27.8, weight_tonnes: 385, shipment_count: 120, road_co2: 8200, rail_co2: 1700, sea_co2: 5800, air_co2: 12100 },
  { month_year: "2024-08", co2e_kg: 23400, co2e_tonnes: 23.4, weight_tonnes: 315, shipment_count: 99, road_co2: 6900, rail_co2: 1200, sea_co2: 4600, air_co2: 10700 },
  { month_year: "2024-09", co2e_kg: 24800, co2e_tonnes: 24.8, weight_tonnes: 340, shipment_count: 106, road_co2: 7400, rail_co2: 1400, sea_co2: 5000, air_co2: 11000 },
  { month_year: "2024-10", co2e_kg: 22600, co2e_tonnes: 22.6, weight_tonnes: 305, shipment_count: 95, road_co2: 6700, rail_co2: 1200, sea_co2: 4400, air_co2: 10300 },
  { month_year: "2024-11", co2e_kg: 21200, co2e_tonnes: 21.2, weight_tonnes: 290, shipment_count: 88, road_co2: 6300, rail_co2: 1100, sea_co2: 4100, air_co2: 9700 },
  { month_year: "2024-12", co2e_kg: 21350, co2e_tonnes: 21.35, weight_tonnes: 297, shipment_count: 93, road_co2: 6400, rail_co2: 1150, sea_co2: 4200, air_co2: 9600 },
];

export const DEMO_MODES: ModeBreakdown[] = [
  { mode: "Road", co2e_kg: 89800, co2e_tonnes: 89.8, percentage: 31.5, distance_km: 142000, shipment_count: 580, factor_used: 0.062, factor_source: "GLEC v3", factor_unit: "kgCO2e/t-km" },
  { mode: "Rail", co2e_kg: 15800, co2e_tonnes: 15.8, percentage: 5.5, distance_km: 85000, shipment_count: 120, factor_used: 0.022, factor_source: "GLEC v3", factor_unit: "kgCO2e/t-km" },
  { mode: "Sea", co2e_kg: 44750, co2e_tonnes: 44.75, percentage: 15.7, distance_km: 125000, shipment_count: 210, factor_used: 0.008, factor_source: "IMO 2023", factor_unit: "kgCO2e/t-km" },
  { mode: "Air", co2e_kg: 134400, co2e_tonnes: 134.4, percentage: 47.3, distance_km: 73600, shipment_count: 337, factor_used: 0.602, factor_source: "ICAO", factor_unit: "kgCO2e/t-km" },
];

export const DEMO_ROUTES: RouteSummary[] = [
  { route_id: "R001", origin: "Mumbai", destination: "Rotterdam", origin_country: "India", destination_country: "Netherlands", co2e_kg: 42500, percentage: 14.9, shipment_count: 185, total_weight_tonnes: 520, primary_mode: "Sea", risk_score: 32 },
  { route_id: "R002", origin: "Shanghai", destination: "Hamburg", origin_country: "China", destination_country: "Germany", co2e_kg: 38200, percentage: 13.4, shipment_count: 162, total_weight_tonnes: 480, primary_mode: "Sea", risk_score: 28 },
  { route_id: "R003", origin: "New Delhi", destination: "London", origin_country: "India", destination_country: "UK", co2e_kg: 56800, percentage: 19.9, shipment_count: 98, total_weight_tonnes: 310, primary_mode: "Air", risk_score: 65 },
  { route_id: "R004", origin: "Berlin", destination: "Paris", origin_country: "Germany", destination_country: "France", co2e_kg: 12400, percentage: 4.4, shipment_count: 210, total_weight_tonnes: 420, primary_mode: "Road", risk_score: 15 },
  { route_id: "R005", origin: "Bangalore", destination: "Singapore", origin_country: "India", destination_country: "Singapore", co2e_kg: 34600, percentage: 12.2, shipment_count: 125, total_weight_tonnes: 280, primary_mode: "Air", risk_score: 58 },
  { route_id: "R006", origin: "Warsaw", destination: "Milan", origin_country: "Poland", destination_country: "Italy", co2e_kg: 8900, percentage: 3.1, shipment_count: 145, total_weight_tonnes: 350, primary_mode: "Rail", risk_score: 12 },
  { route_id: "R007", origin: "Tokyo", destination: "Los Angeles", origin_country: "Japan", destination_country: "USA", co2e_kg: 48200, percentage: 16.9, shipment_count: 78, total_weight_tonnes: 245, primary_mode: "Sea", risk_score: 42 },
  { route_id: "R008", origin: "Dubai", destination: "Frankfurt", origin_country: "UAE", destination_country: "Germany", co2e_kg: 43150, percentage: 15.2, shipment_count: 244, total_weight_tonnes: 715, primary_mode: "Air", risk_score: 55 },
];

export const DEMO_NETWORK: NetworkData = {
  nodes: [
    { id: "N1", code: "BOM", name: "Mumbai Hub", city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, location_type: "warehouse", total_co2_kg: 42500, inbound_shipments: 45, outbound_shipments: 185, risk_score: 32 },
    { id: "N2", code: "RTM", name: "Rotterdam Port", city: "Rotterdam", country: "Netherlands", latitude: 51.9244, longitude: 4.4777, location_type: "port", total_co2_kg: 38200, inbound_shipments: 185, outbound_shipments: 120, risk_score: 18 },
    { id: "N3", code: "PVG", name: "Shanghai Hub", city: "Shanghai", country: "China", latitude: 31.2304, longitude: 121.4737, location_type: "warehouse", total_co2_kg: 38200, inbound_shipments: 30, outbound_shipments: 162, risk_score: 28 },
    { id: "N4", code: "HAM", name: "Hamburg Port", city: "Hamburg", country: "Germany", latitude: 53.5511, longitude: 9.9937, location_type: "port", total_co2_kg: 28000, inbound_shipments: 162, outbound_shipments: 95, risk_score: 15 },
    { id: "N5", code: "DEL", name: "New Delhi DC", city: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209, location_type: "warehouse", total_co2_kg: 56800, inbound_shipments: 20, outbound_shipments: 98, risk_score: 45 },
    { id: "N6", code: "LHR", name: "London Hub", city: "London", country: "UK", latitude: 51.5074, longitude: -0.1278, location_type: "customer", total_co2_kg: 34000, inbound_shipments: 98, outbound_shipments: 55, risk_score: 22 },
    { id: "N7", code: "SIN", name: "Singapore Hub", city: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, location_type: "port", total_co2_kg: 34600, inbound_shipments: 125, outbound_shipments: 80, risk_score: 20 },
    { id: "N8", code: "BLR", name: "Bangalore DC", city: "Bangalore", country: "India", latitude: 12.9716, longitude: 77.5946, location_type: "warehouse", total_co2_kg: 34600, inbound_shipments: 15, outbound_shipments: 125, risk_score: 38 },
  ],
  edges: [
    { id: "E1", origin_code: "BOM", origin_name: "Mumbai Hub", origin_coords: [19.076, 72.8777], destination_code: "RTM", destination_name: "Rotterdam Port", destination_coords: [51.9244, 4.4777], primary_mode: "Sea", distance_km: 11200, total_co2_kg: 42500, shipment_count: 185, risk_score: 32 },
    { id: "E2", origin_code: "PVG", origin_name: "Shanghai Hub", origin_coords: [31.2304, 121.4737], destination_code: "HAM", destination_name: "Hamburg Port", destination_coords: [53.5511, 9.9937], primary_mode: "Sea", distance_km: 19500, total_co2_kg: 38200, shipment_count: 162, risk_score: 28 },
    { id: "E3", origin_code: "DEL", origin_name: "New Delhi DC", origin_coords: [28.6139, 77.209], destination_code: "LHR", destination_name: "London Hub", destination_coords: [51.5074, -0.1278], primary_mode: "Air", distance_km: 6720, total_co2_kg: 56800, shipment_count: 98, risk_score: 65 },
    { id: "E4", origin_code: "HAM", origin_name: "Hamburg Port", origin_coords: [53.5511, 9.9937], destination_code: "RTM", destination_name: "Rotterdam Port", destination_coords: [51.9244, 4.4777], primary_mode: "Road", distance_km: 480, total_co2_kg: 12400, shipment_count: 210, risk_score: 15 },
    { id: "E5", origin_code: "BLR", origin_name: "Bangalore DC", origin_coords: [12.9716, 77.5946], destination_code: "SIN", destination_name: "Singapore Hub", destination_coords: [1.3521, 103.8198], primary_mode: "Air", distance_km: 3420, total_co2_kg: 34600, shipment_count: 125, risk_score: 58 },
  ]
};

export const DEMO_SHIPMENTS: ShipmentListResponse = {
  total: 1247,
  page: 1,
  page_size: 20,
  shipments: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    order_number: 10001 + i,
    order_line: 1,
    date: `2024-${String(((i % 12) + 1)).padStart(2, '0')}-${String(((i % 28) + 1)).padStart(2, '0')}`,
    month_year: `2024-${String(((i % 12) + 1)).padStart(2, '0')}`,
    warehouse_code: ["BOM", "PVG", "DEL", "BLR", "HAM"][i % 5],
    customer_code: `CUST-${String(200 + i).padStart(4, '0')}`,
    item_code: `ITM-${String(100 + (i * 3)).padStart(5, '0')}`,
    units: Math.floor(Math.random() * 500) + 50,
    euros: Math.floor(Math.random() * 15000) + 2000,
    weight_kg: Math.floor(Math.random() * 5000) + 200,
    co2_total: Math.floor(Math.random() * 800) + 50,
    co2_road: Math.floor(Math.random() * 200),
    co2_rail: Math.floor(Math.random() * 50),
    co2_sea: Math.floor(Math.random() * 150),
    co2_air: Math.floor(Math.random() * 400),
    origin_city: ["Mumbai", "Shanghai", "New Delhi", "Bangalore", "Hamburg"][i % 5],
    destination_city: ["Rotterdam", "Hamburg", "London", "Singapore", "Paris"][i % 5],
    destination_country: ["Netherlands", "Germany", "UK", "Singapore", "France"][i % 5],
    data_quality: ["MEASURED", "ESTIMATED", "MEASURED", "ASSUMED", "MEASURED"][i % 5],
    dataset: "demo"
  }))
};

export const DEMO_SUPPLIERS: SupplierItem[] = [
  { id: 1, code: "SUP-001", name: "EcoTex Materials", location_name: "Mumbai Hub", city: "Mumbai", country: "India", reliability_score: 92, lead_time_days: 7, capacity: 5000, data_quality: "MEASURED", risk_score: 18, co2_intensity: 0.042, tier: "Tier 1", esg_grade: "A" },
  { id: 2, code: "SUP-002", name: "GreenPack Solutions", location_name: "Shanghai Hub", city: "Shanghai", country: "China", reliability_score: 88, lead_time_days: 12, capacity: 8000, data_quality: "MEASURED", risk_score: 25, co2_intensity: 0.058, tier: "Tier 1", esg_grade: "B+" },
  { id: 3, code: "SUP-003", name: "Nordic Fibers", location_name: "Hamburg Port", city: "Hamburg", country: "Germany", reliability_score: 95, lead_time_days: 4, capacity: 3000, data_quality: "MEASURED", risk_score: 10, co2_intensity: 0.028, tier: "Tier 1", esg_grade: "A+" },
  { id: 4, code: "SUP-004", name: "SilkRoute Textiles", location_name: "New Delhi DC", city: "New Delhi", country: "India", reliability_score: 78, lead_time_days: 14, capacity: 6000, data_quality: "ESTIMATED", risk_score: 42, co2_intensity: 0.075, tier: "Tier 2", esg_grade: "B" },
  { id: 5, code: "SUP-005", name: "Pacific Dyes Co", location_name: "Singapore Hub", city: "Singapore", country: "Singapore", reliability_score: 90, lead_time_days: 6, capacity: 4500, data_quality: "MEASURED", risk_score: 15, co2_intensity: 0.035, tier: "Tier 1", esg_grade: "A" },
  { id: 6, code: "SUP-006", name: "Alpine Logistics", location_name: "Zurich Center", city: "Zurich", country: "Switzerland", reliability_score: 97, lead_time_days: 3, capacity: 2000, data_quality: "MEASURED", risk_score: 8, co2_intensity: 0.019, tier: "Tier 1", esg_grade: "A+" },
];

export const DEMO_FACTORS: EmissionFactorItem[] = [
  { id: 1, factor_id: "EF-ROAD-01", mode: "Road", fuel_type: "Diesel", vehicle_type: "Heavy truck >32t", value: 0.062, unit: "kgCO2e/t-km", source: "GLEC Framework v3.0", methodology: "Well-to-Wheel", version: "3.0", year: 2023, is_active: true },
  { id: 2, factor_id: "EF-RAIL-01", mode: "Rail", fuel_type: "Electric", vehicle_type: "Freight train", value: 0.022, unit: "kgCO2e/t-km", source: "GLEC Framework v3.0", methodology: "Well-to-Wheel", version: "3.0", year: 2023, is_active: true },
  { id: 3, factor_id: "EF-SEA-01", mode: "Sea", fuel_type: "HFO", vehicle_type: "Container ship >8000 TEU", value: 0.008, unit: "kgCO2e/t-km", source: "IMO Fourth GHG Study 2023", methodology: "Tank-to-Wheel", version: "4.0", year: 2023, is_active: true },
  { id: 4, factor_id: "EF-AIR-01", mode: "Air", fuel_type: "Jet-A1", vehicle_type: "Freighter aircraft", value: 0.602, unit: "kgCO2e/t-km", source: "ICAO Carbon Calculator", methodology: "Well-to-Wheel", version: "2023", year: 2023, is_active: true },
];

export const DEMO_FORECAST = {
  historical: DEMO_MONTHLY,
  forecast: [
    { month_year: "2025-01", co2e_kg: 21800, co2e_tonnes: 21.8, lower: 19200, upper: 24400 },
    { month_year: "2025-02", co2e_kg: 22400, co2e_tonnes: 22.4, lower: 19600, upper: 25200 },
    { month_year: "2025-03", co2e_kg: 21100, co2e_tonnes: 21.1, lower: 18300, upper: 23900 },
  ],
  trend: "stable",
  note: "Forecast based on 12-month historical data using exponential smoothing."
};

export const DEMO_SCENARIO: ScenarioResult = {
  name: "Green Mode Shift",
  baseline: { co2e_kg: 284750, cost: 425000, time_hours: 1820, carbon_cost: 14237 },
  scenario: { co2e_kg: 198500, cost: 448000, time_hours: 2150, carbon_cost: 9925 },
  delta: { co2e_kg: -86250, co2e_pct: -30.3, cost: 23000, cost_pct: 5.4, time_hours: 330, time_pct: 18.1 },
  consolidation_factor: 1.0,
  carbon_price: 50,
  timestamp: new Date().toISOString()
};

export const DEMO_OPTIMIZER: OptimizerResponse = {
  baseline: { co2e_kg: 284750, cost: 425000, time_hours: 1820 },
  feasible_count: 8,
  infeasible_count: 2,
  pareto_options: [
    { label: "Balanced Green", co2e_kg: 213562, cost: 446250, total_cost_with_carbon: 456928, carbon_cost: 10678, time_hours: 2002, co2_reduction_pct: 25, cost_increase_pct: 5, time_increase_pct: 10, mode_assignments: { "R003": "Sea", "R005": "Sea" } },
    { label: "Maximum Reduction", co2e_kg: 170850, cost: 489250, total_cost_with_carbon: 497792, carbon_cost: 8542, time_hours: 2366, co2_reduction_pct: 40, cost_increase_pct: 15.1, time_increase_pct: 30, mode_assignments: { "R003": "Rail", "R005": "Sea", "R008": "Rail" } },
    { label: "Cost Conscious", co2e_kg: 242037, cost: 433500, total_cost_with_carbon: 445602, carbon_cost: 12102, time_hours: 1911, co2_reduction_pct: 15, cost_increase_pct: 2, time_increase_pct: 5, mode_assignments: { "R003": "Sea" } },
  ],
  constraints: { co2_reduction_target_pct: 20, max_cost_increase_pct: 20, max_time_increase_pct: 35 },
  carbon_price: 50,
  note: "Pareto-optimal solutions generated from multi-objective optimization."
};

export const DEMO_DISRUPTION: DisruptionResponse = {
  disruption: { type: "port_closure", label: "Port Closure", description: "Temporary closure of Rotterdam Port due to severe weather", affected_location: "Rotterdam", severity: 0.7, fallback_mode: "Road" },
  impact: { affected_shipments: 185, total_shipments: 1247, affected_pct: 14.8, additional_co2e_kg: 28500, additional_cost: 42000, additional_time_hours: 280, delay_days: 5 },
  baseline: { co2e_kg: 284750, cost: 425000, time_hours: 1820 },
  rerouted: { co2e_kg: 313250, cost: 467000, time_hours: 2100 },
  suggestions: [
    "Reroute via Hamburg Port to minimize delays",
    "Pre-position inventory at alternate European warehouses",
    "Switch affected sea freight to rail via overland corridor",
    "Negotiate priority berthing at Antwerp as backup port"
  ],
  note: "Simulation based on historical disruption patterns and current network topology."
};

export const DEMO_REPORT = {
  period: "2024-01 to 2024-12",
  total_co2e_tonnes: 284.75,
  total_shipments: 1247,
  modes: DEMO_MODES,
  top_routes: DEMO_ROUTES.slice(0, 5),
  yoy_change_pct: -8.2,
  carbon_cost: 14237.5,
  recommendations: [
    "Shift 30% of air freight to sea freight on India–Europe lanes to cut emissions by ~25%",
    "Consolidate LTL shipments on Berlin–Paris route to improve load factors",
    "Invest in rail infrastructure for intra-European routes to replace road transport",
    "Implement real-time carbon tracking with IoT sensors for Tier 1 suppliers"
  ]
};

export const DEMO_CHAT: ChatResponse = {
  reply: "Based on the current data, your highest-emitting route is **New Delhi → London** via Air freight, contributing 19.9% of total emissions. Switching this route to Sea freight could reduce emissions by approximately 85%, though transit time would increase from ~8 hours to ~25 days. A balanced approach would be to use Air for urgent shipments only and route the rest via Sea/Rail combination.",
  tool_calls: [],
  suggested_prompts: [
    "What are the top 3 ways to reduce emissions?",
    "Compare road vs rail for European routes",
    "What's our carbon cost at €75/tonne?"
  ]
};

export const DEMO_SETTINGS = {
  carbon_price: 50,
  currency: "EUR",
  ai_provider: "demo",
  active_dataset: "demo",
  demo_mode: true
};

export const DEMO_SCENARIOS_LIST = [DEMO_SCENARIO];
