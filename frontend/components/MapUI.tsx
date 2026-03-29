import { MapContainer, TileLayer, Tooltip, CircleMarker, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import { useEffect, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';

// ─── Map Auto-Bounds Updater ───
function BoundsUpdater({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    }
  }, [bounds, map]);
  return null;
}

// ─── Pulsing HTML Marker Icon Factory ───
function createPulseIcon(color: string) {
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div class="marker-dot" style="width:24px;height:24px;">
        <div class="marker-pulse-ring" style="background:${color};"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color}, 0 0 24px ${color}40;border:2px solid rgba(255,255,255,0.5);position:relative;z-index:2;"></div>
      </div>
    `
  });
}

// ─── Tile Layer Definitions ───
const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    label: 'Dark Mode',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    label: 'Satellite',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    label: 'Terrain',
  },
};

type TileKey = keyof typeof TILE_LAYERS;

export interface MapPrediction {
    id: number;
    lng: number;
    lat: number;
    wealth_index: number;
    category: string;
    image_url: string | null;
}

interface MapUIProps {
    targetBounds?: [[number, number], [number, number]] | null;
    onSelectPoint?: (pred: MapPrediction) => void;
    externalPoints?: MapPrediction[] | null;
}

export default function MapUI({ targetBounds, onSelectPoint, externalPoints }: MapUIProps) {
  const [predictions, setPredictions] = useState<MapPrediction[]>([]);
  const [activeTile, setActiveTile] = useState<TileKey>('dark');
  const [showHeatOverlay, setShowHeatOverlay] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ─── Data Fetching with Debounced Polling ───
  useEffect(() => {
    if (externalPoints) {
        setPredictions(externalPoints);
        return;
    }
    const fetchHeatmap = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/dashboard/heatmap');
        if (res.ok) {
          const data = await res.json();
          const points: MapPrediction[] = data.features.map((f: any, i: number) => ({
            id: i,
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
            wealth_index: f.properties.wealth_index,
            category: f.properties.category,
            image_url: f.properties.image_url,
          }));
          setPredictions(points);
        }
      } catch (err) {
        console.error("Failed to fetch heatmap:", err);
      }
    };
    fetchHeatmap();
    const hook = setInterval(fetchHeatmap, 5000);
    return () => clearInterval(hook);
  }, [externalPoints]);

  // ─── Color Engine ───
  const getColor = useCallback((wealth: number) => {
      if (wealth > 75) return '#10b981';
      if (wealth > 40) return '#f59e0b';
      return '#ef4444';
  }, []);

  const getCategoryLabel = useCallback((wealth: number) => {
      if (wealth > 75) return 'High Wealth';
      if (wealth > 40) return 'Medium Wealth';
      return 'Low Wealth';
  }, []);

  // ─── Memoized Icons ───
  const icons = useMemo(() => ({
      high: createPulseIcon('#10b981'),
      medium: createPulseIcon('#f59e0b'),
      low: createPulseIcon('#ef4444'),
  }), []);

  const getIcon = useCallback((wealth: number) => {
      if (wealth > 75) return icons.high;
      if (wealth > 40) return icons.medium;
      return icons.low;
  }, [icons]);

  if (!mounted) return null;

  // Use a per-session random key to force absolute cleanup of the container
  const instanceKey = useMemo(() => `leaflet-${Date.now()}`, []);

  return (
    <div key={`${instanceKey}-parent`} className="w-full h-full min-h-[500px] z-0 relative">
      <MapContainer 
        id={instanceKey}
        key={instanceKey}
        center={[23.0225, 72.5714]}
        zoom={13} 
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dynamic Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={TILE_LAYERS[activeTile].url}
          key={activeTile}
        />

        {/* Built-in Zoom Control repositioned */}
        <ZoomControls />
        
        {targetBounds && <BoundsUpdater bounds={targetBounds} />}
        {targetBounds && (
            <Rectangle 
                bounds={targetBounds} 
                pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.08, weight: 2, dashArray: '8, 6' }} 
                interactive={false}
            />
        )}
        
        {/* ─── Main Data Layer: Pulsing Markers ─── */}
        {predictions.map(pred => (
            <Marker
                key={pred.id}
                position={[pred.lat, pred.lng]}
                icon={getIcon(pred.wealth_index)}
                eventHandlers={{
                    click: () => onSelectPoint?.(pred)
                }}
            >
                <Tooltip 
                    direction="top" 
                    offset={[0, -18]} 
                    opacity={1} 
                    className="geo-tooltip"
                    sticky={false}
                >
                    <div style={{ minWidth: '220px', overflow: 'hidden', borderRadius: '12px' }}>
                        {pred.image_url && (
                            <div style={{ width: '100%', height: '100px', overflow: 'hidden', position: 'relative' }}>
                                <img 
                                    src={pred.image_url} 
                                    alt="intel" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                />
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', 
                                    background: 'linear-gradient(to top, rgba(10,10,10,0.95), transparent)'
                                }}/>
                            </div>
                        )}
                        <div style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ 
                                    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
                                    color: getColor(pred.wealth_index), background: `${getColor(pred.wealth_index)}20`,
                                    padding: '3px 8px', borderRadius: '6px', border: `1px solid ${getColor(pred.wealth_index)}30`
                                }}>
                                    {getCategoryLabel(pred.wealth_index)}
                                </span>
                                <span style={{ fontSize: '18px', fontWeight: 300, color: '#fff', fontFamily: 'monospace' }}>
                                    {pred.wealth_index.toFixed(1)}
                                </span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                                {pred.category} &middot; LAT {pred.lat.toFixed(4)}
                            </div>
                        </div>
                    </div>
                </Tooltip>
            </Marker>
        ))}

        {/* ─── Heatmap Circle Overlays (intensity rings) ─── */}
        {showHeatOverlay && predictions.map(pred => (
            <CircleMarker
                key={`heat-${pred.id}`}
                center={[pred.lat, pred.lng]}
                radius={30 + (100 - pred.wealth_index) * 0.4}
                pathOptions={{
                    fillColor: getColor(pred.wealth_index),
                    fillOpacity: 0.08,
                    color: getColor(pred.wealth_index),
                    weight: 0,
                }}
                interactive={false}
            />
        ))}
      </MapContainer>

      {/* ─── Floating Control Panel ─── */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
          {/* Tile Switcher */}
          <div className="glass rounded-xl overflow-hidden shadow-2xl">
              {(Object.keys(TILE_LAYERS) as TileKey[]).map(key => (
                  <button
                      key={key}
                      onClick={() => setActiveTile(key)}
                      className={`block w-full text-left px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                          activeTile === key 
                              ? 'bg-primary/20 text-primary border-l-2 border-primary' 
                              : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                  >
                      {TILE_LAYERS[key].label}
                  </button>
              ))}
          </div>
          
          {/* Heatmap Toggle */}
          <button
              onClick={() => setShowHeatOverlay(prev => !prev)}
              className={`glass px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-2xl ${
                  showHeatOverlay ? 'text-primary border border-primary/30' : 'text-white/40 hover:text-white border border-transparent'
              }`}
          >
              {showHeatOverlay ? '🔥 Heat: ON' : '❄️ Heat: OFF'}
          </button>
      </div>

      {/* ─── Legend ───*/}
      <div className="absolute bottom-6 left-4 z-[500] glass rounded-xl p-4 shadow-2xl min-w-[160px]">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Wealth Classification</p>
          <div className="space-y-2.5">
              {[
                  { color: '#10b981', label: 'High (75+)', glow: '0 0 8px #10b98140' },
                  { color: '#f59e0b', label: 'Medium (40-75)', glow: '0 0 8px #f59e0b40' },
                  { color: '#ef4444', label: 'Low (<40)', glow: '0 0 8px #ef444440' },
              ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color, boxShadow: item.glow }}/>
                      <span className="text-xs text-white/70 font-medium">{item.label}</span>
                  </div>
              ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/30 font-mono">{predictions.length} active nodes</p>
          </div>
      </div>
    </div>
  );
}

// ─── Custom Zoom Position ───
function ZoomControls() {
  const map = useMap();
  useEffect(() => {
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    return () => { 
      document.querySelectorAll('.leaflet-control-zoom').forEach((el, i) => { if (i > 0) el.remove(); });
    };
  }, [map]);
  return null;
}
