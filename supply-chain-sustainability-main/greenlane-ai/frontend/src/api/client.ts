/**
 * GreenLane AI — Typed API Client
 * 
 * Falls back to built-in demo data when the backend API is unavailable
 * (e.g. static deployment on Vercel without a backend).
 */

import {
  DEMO_KPI, DEMO_MONTHLY, DEMO_MODES, DEMO_ROUTES, DEMO_NETWORK,
  DEMO_SHIPMENTS, DEMO_SUPPLIERS, DEMO_FACTORS, DEMO_FORECAST,
  DEMO_SCENARIO, DEMO_OPTIMIZER, DEMO_DISRUPTION, DEMO_CHAT,
  DEMO_REPORT, DEMO_SETTINGS, DEMO_SCENARIOS_LIST
} from './demoData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface KPISummary {
  total_co2e_kg: number;
  total_co2e_tonnes: number;
  total_shipments: number;
  total_weight_tonnes: number;
  total_distance_km: number;
  avg_co2e_per_tonne_km: number;
  shadow_carbon_cost: number;
  currency: string;
  data_quality_pct: {
    MEASURED: number;
    ESTIMATED: number;
    ASSUMED: number;
  };
  top_emitter_mode: string;
  top_emitter_mode_pct: number;
  air_freight_emissions_share: number;
  active_dataset: string;
}

export interface MonthlyEmission {
  month_year: string;
  co2e_kg: number;
  co2e_tonnes: number;
  weight_tonnes: number;
  shipment_count: number;
  road_co2: number;
  rail_co2: number;
  sea_co2: number;
  air_co2: number;
}

export interface ModeBreakdown {
  mode: string;
  co2e_kg: number;
  co2e_tonnes: number;
  percentage: number;
  distance_km: number;
  shipment_count: number;
  factor_used: number;
  factor_source: string;
  factor_unit: string;
}

export interface RouteSummary {
  route_id: string;
  origin: string;
  destination: string;
  origin_country: string;
  destination_country: string;
  co2e_kg: number;
  percentage: number;
  shipment_count: number;
  total_weight_tonnes: number;
  primary_mode: string;
  risk_score: number;
}

export interface MapNode {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  location_type: string;
  total_co2_kg: number;
  inbound_shipments: number;
  outbound_shipments: number;
  risk_score: number;
}

export interface MapEdge {
  id: string;
  origin_code: string;
  origin_name: string;
  origin_coords: [number, number];
  destination_code: string;
  destination_name: string;
  destination_coords: [number, number];
  primary_mode: string;
  distance_km: number;
  total_co2_kg: number;
  shipment_count: number;
  risk_score: number;
}

export interface NetworkData {
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface ShipmentItem {
  id: number;
  order_number: number;
  order_line: number;
  date: string;
  month_year: string;
  warehouse_code: string;
  customer_code: string;
  item_code: string;
  units: number;
  euros: number;
  weight_kg: number;
  co2_total: number;
  co2_road: number;
  co2_rail: number;
  co2_sea: number;
  co2_air: number;
  origin_city: string;
  destination_city: string;
  destination_country: string;
  data_quality: string;
  dataset: string;
}

export interface ShipmentListResponse {
  total: number;
  page: number;
  page_size: number;
  shipments: ShipmentItem[];
}

export interface ScenarioResult {
  name: string;
  baseline: {
    co2e_kg: number;
    cost: number;
    time_hours: number;
    carbon_cost: number;
  };
  scenario: {
    co2e_kg: number;
    cost: number;
    time_hours: number;
    carbon_cost: number;
  };
  delta: {
    co2e_kg: number;
    co2e_pct: number;
    cost: number;
    cost_pct: number;
    time_hours: number;
    time_pct: number;
  };
  consolidation_factor: number;
  carbon_price: number;
  timestamp: string;
}

export interface ParetoOption {
  label: string;
  co2e_kg: number;
  cost: number;
  total_cost_with_carbon: number;
  carbon_cost: number;
  time_hours: number;
  co2_reduction_pct: number;
  cost_increase_pct: number;
  time_increase_pct: number;
  mode_assignments: Record<string, string>;
}

export interface OptimizerResponse {
  baseline: {
    co2e_kg: number;
    cost: number;
    time_hours: number;
  };
  feasible_count: number;
  infeasible_count: number;
  pareto_options: ParetoOption[];
  constraints: Record<string, number>;
  carbon_price: number;
  note: string;
}

export interface DisruptionResponse {
  disruption: {
    type: string;
    label: string;
    description: string;
    affected_location?: string;
    severity: number;
    fallback_mode: string;
  };
  impact: {
    affected_shipments: number;
    total_shipments: number;
    affected_pct: number;
    additional_co2e_kg: number;
    additional_cost: number;
    additional_time_hours: number;
    delay_days: number;
  };
  baseline: {
    co2e_kg: number;
    cost: number;
    time_hours: number;
  };
  rerouted: {
    co2e_kg: number;
    cost: number;
    time_hours: number;
  };
  suggestions: string[];
  note: string;
}

export interface ChatResponse {
  reply: string;
  tool_calls: Array<{
    tool: string;
    parameters: Record<string, any>;
    result: any;
  }>;
  suggested_prompts: string[];
}

export interface SupplierItem {
  id: number;
  code: string;
  name: string;
  location_name: string;
  city: string;
  country: string;
  reliability_score: number;
  lead_time_days: number;
  capacity: number;
  data_quality: string;
  risk_score: number;
  co2_intensity: number;
  tier: string;
  esg_grade: string;
}

export interface EmissionFactorItem {
  id: number;
  factor_id: string;
  mode: string;
  fuel_type?: string;
  vehicle_type?: string;
  value: number;
  unit: string;
  source: string;
  methodology: string;
  version: string;
  year: number;
  notes?: string;
  is_active: boolean;
}

// ── Helper: fetch with demo fallback ────────────────────────────────────────

async function fetchWithFallback<T>(url: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Backend unavailable — return demo data
    return fallback;
  }
}

// ── API Functions ───────────────────────────────────────────────────────────

export const api = {
  getKPIs: (dataset = 'demo') => 
    fetchWithFallback<KPISummary>(`${API_BASE}/dashboard/kpis?dataset=${dataset}`, DEMO_KPI),

  getMonthly: (dataset = 'demo') => 
    fetchWithFallback<MonthlyEmission[]>(`${API_BASE}/dashboard/monthly?dataset=${dataset}`, DEMO_MONTHLY),

  getModes: (dataset = 'demo') => 
    fetchWithFallback<ModeBreakdown[]>(`${API_BASE}/dashboard/modes?dataset=${dataset}`, DEMO_MODES),

  getRoutes: (dataset = 'demo') => 
    fetchWithFallback<RouteSummary[]>(`${API_BASE}/emissions/routes?dataset=${dataset}`, DEMO_ROUTES),

  getFactors: () => 
    fetchWithFallback<EmissionFactorItem[]>(`${API_BASE}/emissions/factors`, DEMO_FACTORS),

  getForecast: (dataset = 'demo', periods = 3) => 
    fetchWithFallback(`${API_BASE}/emissions/forecast?dataset=${dataset}&periods=${periods}`, DEMO_FORECAST),

  getNetwork: (dataset = 'demo') => 
    fetchWithFallback<NetworkData>(`${API_BASE}/network?dataset=${dataset}`, DEMO_NETWORK),

  getShipments: (params: { dataset?: string; page?: number; pageSize?: number; mode?: string; quality?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params.dataset) q.set('dataset', params.dataset);
    if (params.page) q.set('page', params.page.toString());
    if (params.pageSize) q.set('page_size', params.pageSize.toString());
    if (params.mode) q.set('mode', params.mode);
    if (params.quality) q.set('quality', params.quality);
    if (params.search) q.set('search', params.search);
    return fetchWithFallback<ShipmentListResponse>(`${API_BASE}/shipments?${q.toString()}`, DEMO_SHIPMENTS);
  },

  getScenarios: () => 
    fetchWithFallback(`${API_BASE}/scenarios`, DEMO_SCENARIOS_LIST),

  runScenario: (payload: { name?: string; mode_overrides?: Record<string, string>; consolidation_factor?: number; carbon_price?: number; dataset?: string }) => 
    fetchWithFallback<ScenarioResult>(`${API_BASE}/scenarios/run`, DEMO_SCENARIO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  runOptimizer: (payload: { co2_reduction_target_pct?: number; max_cost_increase_pct?: number; max_time_increase_pct?: number; carbon_price?: number; available_modes?: string[]; dataset?: string }) => 
    fetchWithFallback<OptimizerResponse>(`${API_BASE}/optimizer/run`, DEMO_OPTIMIZER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  runDisruption: (payload: { disruption_type: string; affected_location?: string; severity?: number; fallback_mode?: string; dataset?: string }) => 
    fetchWithFallback<DisruptionResponse>(`${API_BASE}/disruptions/simulate`, DEMO_DISRUPTION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getSuppliers: () => 
    fetchWithFallback<SupplierItem[]>(`${API_BASE}/suppliers`, DEMO_SUPPLIERS),

  getReportSummary: (dataset = 'demo') => 
    fetchWithFallback(`${API_BASE}/reports/summary?dataset=${dataset}`, DEMO_REPORT),

  sendChatMessage: (message: string, dataset = 'demo') => 
    fetchWithFallback<ChatResponse>(`${API_BASE}/ai/chat`, DEMO_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, dataset })
    }),

  getSettings: () => 
    fetchWithFallback(`${API_BASE}/settings`, DEMO_SETTINGS),

  updateSettings: (cfg: Record<string, any>) => 
    fetchWithFallback(`${API_BASE}/settings`, DEMO_SETTINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    }),
};
