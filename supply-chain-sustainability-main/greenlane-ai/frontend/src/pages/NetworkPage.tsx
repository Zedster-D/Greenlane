import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, NetworkData, MapNode, MapEdge } from '../api/client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Globe, MapPin, Navigation, ArrowRight, ShieldAlert, Layers, Activity } from 'lucide-react';

// Custom Leaflet DivIcons
const createNodeIcon = (type: string, risk: number) => {
  const bgColor = type === 'warehouse' ? '#10b981' : type === 'port' ? '#06b6d4' : '#f59e0b';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        width: 18px; 
        height: 18px; 
        background: ${bgColor}; 
        border: 2px solid #ffffff; 
        border-radius: 50%; 
        box-shadow: 0 0 12px ${bgColor};
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export const NetworkPage: React.FC = () => {
  const { dataset } = useApp();
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<MapEdge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getNetwork(dataset)
      .then(data => {
        setNetwork(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [dataset]);

  const MODE_COLORS: Record<string, string> = {
    road: '#f59e0b',
    rail: '#10b981',
    sea: '#06b6d4',
    air: '#f43f5e',
  };

  const centerCoords: [number, number] = dataset === 'demo' ? [25.0, 45.0] : [48.8566, 2.3522];
  const zoomLevel = dataset === 'demo' ? 3 : 5;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-brand-400" />
            <span>Interactive Multi-Modal Supply Chain Network</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial visualization of origin clusters, transit hubs, container ports, and delivery nodes.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-mono bg-dark-850 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="flex items-center text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5"></span> Road</span>
          <span className="flex items-center text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5"></span> Rail</span>
          <span className="flex items-center text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-1.5"></span> Sea</span>
          <span className="flex items-center text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-1.5"></span> Air</span>
        </div>
      </div>

      {/* Main Map Container + Side Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden h-[580px] border border-slate-800 relative z-10">
          {loading || !network ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
              Loading geospatial coordinates and active route vectors...
            </div>
          ) : (
            <MapContainer
              center={centerCoords}
              zoom={zoomLevel}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              {/* Dark CartoDB Map Tiles */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Draw Route Polylines */}
              {network.edges.map((edge) => (
                <Polyline
                  key={edge.id}
                  positions={[edge.origin_coords, edge.destination_coords]}
                  pathOptions={{
                    color: MODE_COLORS[edge.primary_mode] || '#10b981',
                    weight: edge.primary_mode === 'air' ? 2.5 : 2,
                    opacity: 0.75,
                    dashArray: edge.primary_mode === 'air' ? '5, 8' : undefined,
                  }}
                  eventHandlers={{
                    click: () => setSelectedEdge(edge),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <span>{edge.origin_name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{edge.destination_name}</span>
                      </div>
                      <div className="text-slate-300 capitalize">Mode: <strong>{edge.primary_mode}</strong></div>
                      <div className="text-slate-300">Distance: {edge.distance_km} km</div>
                      <div className="text-emerald-400 font-bold font-mono">Emissions: {edge.total_co2_kg.toLocaleString()} kg CO₂e</div>
                      <div className="text-slate-400">{edge.shipment_count} shipments</div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {/* Draw Nodes */}
              {network.nodes.map((node) => (
                <Marker
                  key={node.id}
                  position={[node.latitude, node.longitude]}
                  icon={createNodeIcon(node.location_type, node.risk_score)}
                  eventHandlers={{
                    click: () => setSelectedNode(node),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-white">{node.name}</div>
                      <div className="text-slate-400">{node.city}, {node.country}</div>
                      <div className="text-slate-300 capitalize">Type: {node.location_type}</div>
                      <div className="text-emerald-400 font-mono font-bold">Node CO₂e: {node.total_co2_kg.toLocaleString()} kg</div>
                      <div className="text-slate-300">Flow: {node.inbound_shipments + node.outbound_shipments} shipments</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Side Panel: Selected Node / Edge Details & League Table */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Navigation className="w-4 h-4 text-brand-400" />
              <span>Corridor Inspector</span>
            </h3>

            {selectedEdge ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-dark-850 border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-mono">SELECTED ROUTE</span>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedEdge.origin_name} ➔ {selectedEdge.destination_name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-dark-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Mode</span>
                    <div className="font-bold capitalize text-white font-mono">{selectedEdge.primary_mode}</div>
                  </div>
                  <div className="p-2 rounded bg-dark-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Distance</span>
                    <div className="font-bold text-white font-mono">{selectedEdge.distance_km} km</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-dark-850 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Carbon Impact</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {selectedEdge.total_co2_kg.toLocaleString()} kg CO₂e
                  </div>
                </div>

                <div className="p-2.5 rounded bg-dark-850 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Corridor Risk Index:</span>
                  <span className={`font-mono font-bold ${selectedEdge.risk_score > 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(selectedEdge.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any line or glowing pin on the map to inspect route carbon, distance, freight throughput, and vulnerability rating.
              </p>
            )}
          </div>

          {/* Quick Hub Breakdown */}
          {network && (
            <div className="glass-panel p-4 rounded-xl">
              <h4 className="text-xs font-semibold text-white mb-2">Network Nodes ({network.nodes.length})</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {network.nodes.map(n => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className="p-2 rounded bg-dark-850 hover:bg-dark-800 border border-slate-800/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{n.city}</div>
                      <span className="text-[10px] text-slate-400 capitalize">{n.location_type}</span>
                    </div>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      {(n.total_co2_kg / 1000).toFixed(1)} t
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
