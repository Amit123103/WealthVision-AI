"use client";

import { MapContainer, TileLayer, CircleMarker, useMap, Tooltip } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Global patch to permanently negate "Map container is already initialized" 
// errors when React 18 Strict Mode or NextJS Fast Refresh illegally reuses DOM elements.
if (typeof window !== 'undefined' && !(L.Map.prototype as any)._patched) {
  const originalInit = (L.Map.prototype as any)._initContainer;
  (L.Map.prototype as any)._initContainer = function (id: any, ...args: any[]) {
    const container = typeof id === 'string' ? document.getElementById(id) : id;
    if (container && container._leaflet_id) {
        // Force Leaflet to decouple from the cached React DOM node
        container._leaflet_id = null;
    }
    originalInit.apply(this, [id, ...args]);
  };
  (L.Map.prototype as any)._patched = true;
}

function CenterMap({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

export default function MiniMap({ lat, lng, url }: { lat: number, lng: number, url?: string }) {
  const [mapId, setMapId] = useState<string | null>(null);

  useEffect(() => {
    // Generate an absolutely unique map ID on every mount
    // This physically forces React to mount a pristine DOM node 
    // and instantly destroys it on unmount or dev hot-reload.
    setMapId(`map-${Math.random().toString(36).substring(7)}`);
    
    return () => {
      // Guarantee the Leaflet MapContainer is ripped out of the DOM 
      // BEFORE StrictMode attempts to recycle or double-invoke effects.
      setMapId(null);
    };
  }, []);

  if (!mapId) return null;

  return (
    <div key={mapId + '-wrapper'} className="w-full h-full z-0 relative rounded-xl overflow-hidden border border-white/10">
      <MapContainer 
        key={mapId}
        id={mapId}
        center={[lat, lng]} 
        zoom={15} 
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <CenterMap lat={lat} lng={lng} />

        <CircleMarker
            center={[lat, lng]}
            radius={8}
            pathOptions={{
                fillColor: "#eab308",
                fillOpacity: 1,
                color: "white",
                weight: 2
            }}
        >
          {url && (
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="bg-transparent border-none shadow-none text-transparent">
              <div className="w-40 h-32 rounded-lg overflow-hidden border-2 border-primary shadow-2xl glass p-1">
                 <img src={url} alt="Geospatial target" className="w-full h-full object-cover rounded-md" />
              </div>
            </Tooltip>
          )}
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
