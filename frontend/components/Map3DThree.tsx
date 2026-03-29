"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { ChevronLeft, Info } from 'lucide-react';

// ─── Types ───
export interface MapPrediction {
  id: number;
  lng: number;
  lat: number;
  wealth_index: number;
  category: string;
  image_url?: string | null;
}

type NeuralStyle = 'dark' | 'satellite' | 'voyager' | 'positron';

// ─── Tile Sources (All Open-Source, Zero API Keys) ───
const TILE_SOURCES: Record<NeuralStyle, { tiles: string[]; tileSize: number; attribution: string }> = {
  dark: {
    tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
    tileSize: 256,
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  },
  satellite: {
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    attribution: '&copy; Esri'
  },
  voyager: {
    tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
    tileSize: 256,
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  },
  positron: {
    tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
    tileSize: 256,
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }
};

// ─── Vector tiles for 3D buildings (OpenFreeMap — OpenMapTiles schema, free, no API key) ───
const BUILDING_VECTOR_URL = 'https://tiles.openfreemap.org/planet';

// ─── Wealth Color Engine ───
function getWealthColor(wealth: number): string {
  if (wealth > 75) return '#10b981';
  if (wealth > 40) return '#f59e0b';
  return '#ef4444';
}

function getWealthLabel(wealth: number): string {
  if (wealth > 75) return 'High Wealth';
  if (wealth > 40) return 'Medium Wealth';
  return 'Low Wealth';
}

// ─── Custom Three.js Layer for Glow Beams ───
// Uses closure pattern to avoid TS errors with CustomLayerInterface
function createThreeLayer(data: MapPrediction[]): maplibregl.CustomLayerInterface {
  let camera: THREE.Camera;
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let beamGroup: THREE.Group | null = null;

  function buildBeams(predictions: MapPrediction[]) {
    // Clear old beams
    if (beamGroup && scene) {
      scene.remove(beamGroup);
      beamGroup.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mat = mesh.material as THREE.Material;
          mat.dispose();
        }
      });
    }

    beamGroup = new THREE.Group();

    predictions.forEach((p) => {
      const color = new THREE.Color(getWealthColor(p.wealth_index));
      const beamHeight = 800 + (p.wealth_index / 100) * 1200;

      // Vertical beam
      const beamGeo = new THREE.CylinderGeometry(15, 15, beamHeight, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = beamHeight / 2;

      // Outer glow ring at base
      const ringGeo = new THREE.RingGeometry(30, 45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 2;

      // Sphere at top
      const sphereGeo = new THREE.SphereGeometry(25, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = beamHeight;

      const group = new THREE.Group();
      group.add(beam);
      group.add(ring);
      group.add(sphere);
      group.userData = { lngLat: [p.lng, p.lat] };

      beamGroup!.add(group);
    });

    if (scene) {
      scene.add(beamGroup);
    }
  }

  return {
    id: 'three-glow-layer',
    type: 'custom',
    renderingMode: '3d',

    onAdd(map: maplibregl.Map, gl: WebGLRenderingContext) {
      camera = new THREE.Camera();
      scene = new THREE.Scene();
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      renderer.autoClear = false;

      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      // Directional light (sun simulation)
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(100, 200, 100);
      scene.add(dirLight);

      // Build glow beams
      buildBeams(data);
    },

    render(gl: WebGLRenderingContext, args: any) {
      // Animate beams
      if (beamGroup) {
        const time = performance.now() * 0.001;
        beamGroup.children.forEach((group, i) => {
          // Pulse ring
          const ring = group.children[1] as THREE.Mesh;
          if (ring) {
            const scale = 1 + Math.sin(time * 2 + i * 0.5) * 0.15;
            ring.scale.set(scale, scale, 1);
            (ring.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 2 + i) * 0.15;
          }
          // Pulse sphere
          const sphere = group.children[2];
          if (sphere) {
            const s = 1 + Math.sin(time * 3 + i * 0.7) * 0.2;
            sphere.scale.set(s, s, s);
          }
        });
      }

      // Project each beam group to the correct mercator position
      if (beamGroup) {
        beamGroup.children.forEach((group) => {
          const lngLat = group.userData.lngLat;
          if (lngLat) {
            const mercator = maplibregl.MercatorCoordinate.fromLngLat(
              lngLat as [number, number],
              0
            );
            const scale = mercator.meterInMercatorCoordinateUnits();
            group.position.set(mercator.x, mercator.y, 0);
            group.scale.set(scale, -scale, scale);
          }
        });
      }

      const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
      camera.projectionMatrix = m;

      renderer.resetState();
      renderer.render(scene, camera);
    },

    onRemove() {
      if (beamGroup) {
        beamGroup.traverse((child: THREE.Object3D) => {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            const mat = mesh.material as THREE.Material;
            mat.dispose();
          }
        });
      }
    }
  };
}

// ─── Pulsing Marker HTML ───
function createMarkerHTML(p: MapPrediction): string {
  const color = getWealthColor(p.wealth_index);
  return `
    <div class="geo-marker-pulse" style="position:relative;width:28px;height:28px;cursor:pointer;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:marker-beacon 2s ease-out infinite;"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 12px ${color},0 0 24px ${color}40;"></div>
    </div>
  `;
}

// ─── Popup HTML ───
function createPopupHTML(p: MapPrediction): string {
  const color = getWealthColor(p.wealth_index);
  const label = getWealthLabel(p.wealth_index);
  return `
    <div style="padding:0;min-width:240px;font-family:Inter,system-ui,sans-serif;">
      ${p.image_url ? `
        <div style="width:100%;height:100px;overflow:hidden;position:relative;">
          <img src="${p.image_url}" alt="Location" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none'"/>
          <div style="position:absolute;bottom:0;left:0;right:0;height:40px;background:linear-gradient(to top,rgba(10,10,10,0.95),transparent);"></div>
        </div>
      ` : ''}
      <div style="padding:14px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${color};background:${color}20;padding:4px 10px;border-radius:6px;border:1px solid ${color}30;">
            ${label}
          </span>
          <span style="font-size:22px;font-weight:300;color:#fff;font-family:monospace;">
            ${p.wealth_index.toFixed(1)}
          </span>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:8px;">
          <div style="flex:1;">
            <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Category</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);font-weight:600;">${p.category || 'Unknown'}</div>
          </div>
          <div style="width:1px;background:rgba(255,255,255,0.1);"></div>
          <div style="flex:1;">
            <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Coordinates</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:monospace;">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
          </div>
        </div>
        <div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.05);overflow:hidden;margin-top:8px;">
          <div style="height:100%;width:${p.wealth_index}%;background:linear-gradient(90deg,${color},${color}80);border-radius:2px;transition:width 0.5s ease;"></div>
        </div>
      </div>
    </div>
  `;
}

// ─── Build the full map style object ───
function buildMapStyle(theme: NeuralStyle): maplibregl.StyleSpecification {
  const tileSource = TILE_SOURCES[theme];

  const style: maplibregl.StyleSpecification = {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      'base-raster': {
        type: 'raster',
        tiles: tileSource.tiles,
        tileSize: tileSource.tileSize,
        attribution: tileSource.attribution,
        maxzoom: 19
      },
      'building-vector': {
        type: 'vector',
        url: BUILDING_VECTOR_URL
      }
    },
    layers: [
      {
        id: 'base-tiles',
        type: 'raster',
        source: 'base-raster',
        minzoom: 0,
        maxzoom: 22
      },
      {
        id: '3d-buildings',
        type: 'fill-extrusion',
        source: 'building-vector',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'render_height'], ['get', 'height'], 5],
            0, theme === 'dark' ? '#1a1a2e' : '#b8c6db',
            15, theme === 'dark' ? '#16213e' : '#8fa4bf',
            40, theme === 'dark' ? '#0f3460' : '#6b8aac',
            80, theme === 'dark' ? '#533483' : '#4a7c9b',
            150, theme === 'dark' ? '#e94560' : '#2e6b8a'
          ],
          'fill-extrusion-height': [
            'coalesce',
            ['get', 'render_height'],
            ['get', 'height'],
            5
          ],
          'fill-extrusion-base': [
            'coalesce',
            ['get', 'render_min_height'],
            ['get', 'min_height'],
            0
          ],
          'fill-extrusion-opacity': 0.88
        }
      }
    ],
    sky: {
      'sky-color': theme === 'dark' ? '#0a0a1a' : '#87CEEB',
      'sky-horizon-blend': 0.5,
      'horizon-color': theme === 'dark' ? '#0f0f2e' : '#c4dfe6',
      'horizon-fog-blend': 0.8,
      'fog-color': theme === 'dark' ? '#050510' : '#e0e8f0',
      'fog-ground-blend': 0.7
    }
  };

  return style;
}

// ─── Main Component ───
interface Map3DThreeProps {
  onSelectPoint?: (pred: MapPrediction) => void;
  location?: { lng: number; lat: number; zoom?: number; name?: string };
  style?: NeuralStyle;
  onLoad?: () => void;
}

export default function Map3DThree({
  onSelectPoint,
  location,
  style = 'dark',
  onLoad
}: Map3DThreeProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [data, setData] = useState<MapPrediction[]>([]);
  const [fps, setFps] = useState(60);
  const [tileCount, setTileCount] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(true);
  const prevStyleRef = useRef<NeuralStyle>(style);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());

  // ─── Fetch Heatmap Data ───
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const r = await fetch('http://localhost:8000/api/v1/dashboard/heatmap');
        if (r.ok) {
          const d = await r.json();
          setData(d.features.map((f: any, i: number) => ({
            id: i,
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
            wealth_index: f.properties.wealth_index,
            category: f.properties.category,
            image_url: f.properties.image_url
          })));
        }
      } catch {
        // API not available — that's fine, map still works
      }
    };
    fetchHeatmap();
    const iv = setInterval(fetchHeatmap, 10000);
    return () => clearInterval(iv);
  }, []);

  // ─── FPS Counter ───
  useEffect(() => {
    let animId: number;
    const countFrame = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }
      animId = requestAnimationFrame(countFrame);
    };
    animId = requestAnimationFrame(countFrame);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ─── Initialize Map ───
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Critical: Clean reset before initializing
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildMapStyle(style),
      center: [72.5714, 23.0225], // Ahmedabad
      zoom: 15,
      pitch: 60,
      bearing: -30,
      // @ts-ignore - maplibre TS types are missing antialias but WebGL context uses it
      antialias: true,
      maxZoom: 20,
      minZoom: 2
    });

    mapRef.current = map;

    // Navigation controls
    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true
    }), 'bottom-right');

    // Scale control
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 200 }), 'bottom-left');

    // Fullscreen control
    map.addControl(new maplibregl.FullscreenControl(), 'bottom-right');

    map.on('load', () => {
      map.resize();
      setMapLoaded(true);
      onLoad?.();

      // Set lighting
      map.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: style === 'dark' ? 0.3 : 0.5,
        position: [1.5, 90, 80]
      });

      // Track tile loading for stats
      map.on('data', (e: any) => {
        if (e.dataType === 'source' && e.isSourceLoaded) {
          setTileCount(prev => prev + 1);
        }
      });

      // Fly to initial position
      map.flyTo({
        center: location ? [location.lng, location.lat] : [72.5714, 23.0225],
        zoom: location?.zoom || 15.5,
        pitch: 65,
        bearing: -45,
        speed: 0.8,
        curve: 1.4
      });
    });

    // ─── WebGL Context Loss Recovery ───
    const canvas = map.getCanvas();
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('[GeoEngine] WebGL context lost — attempting recovery...');
    };
    const handleContextRestored = () => {
      console.info('[GeoEngine] WebGL context restored.');
      map.triggerRepaint();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // ─── Error Handling ───
    map.on('error', (e: any) => {
      console.warn('[GeoEngine] Map error:', e.error?.message || e);
    });

    // Cleanup
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      // Remove markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      // Remove map
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  // ─── Style Switching ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (prevStyleRef.current === style) return;
    prevStyleRef.current = style;

    map.setStyle(buildMapStyle(style));

    // Re-add Three.js layer after style change
    map.once('style.load', () => {
      if (data.length > 0) {
        addThreeLayer(map, data);
      }
      // Re-apply lighting
      map.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: style === 'dark' ? 0.3 : 0.5,
        position: [1.5, 90, 80]
      });
    });
  }, [style, mapLoaded, data]);

  // ─── Add Three.js Layer ───
  const addThreeLayer = useCallback((map: maplibregl.Map, predictions: MapPrediction[]) => {
    // Remove old layer
    try {
      if (map.getLayer('three-glow-layer')) {
        map.removeLayer('three-glow-layer');
      }
    } catch { /* already removed */ }

    if (predictions.length === 0) return;

    const layer = createThreeLayer(predictions);

    try {
      map.addLayer(layer);
    } catch (e) {
      console.warn('[GeoEngine] Could not add Three.js layer:', e);
    }
  }, []);

  // ─── Update Data Markers + Three.js Beams ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    data.forEach((p) => {
      const el = document.createElement('div');
      el.innerHTML = createMarkerHTML(p);

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: true,
        maxWidth: '300px',
        className: 'glass-popup'
      }).setHTML(createPopupHTML(p));

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);

      // Click handler
      el.addEventListener('click', () => {
        onSelectPoint?.(p);
      });

      markersRef.current.push(marker);
    });

    // Add Three.js glow beams
    addThreeLayer(map, data);
  }, [data, mapLoaded, onSelectPoint, addThreeLayer]);

  // ─── Fly to location when prop changes ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !location) return;

    map.flyTo({
      center: [location.lng, location.lat],
      zoom: location.zoom || 16,
      pitch: 65,
      bearing: -45,
      speed: 0.8,
      curve: 1.4
    });
  }, [location, mapLoaded]);

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: '#010101' }}
      />

      {/* ─── HUD Overlay ─── */}
      {mapLoaded && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top-Left: Title Panel */}
          <div 
            className="absolute top-8 z-20 flex flex-row items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: isHudOpen ? '32px' : '-440px' }}
          >
            <div className="w-[440px] pointer-events-auto glass-cyber rounded-r-3xl rounded-tl-xl p-8 border border-white/10 backdrop-blur-3xl shadow-[0_0_120px_rgba(0,0,0,0.8)] flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                <p className="text-[11px] font-black text-white/40 tracking-[8px] uppercase">
                  Geospatial Engine Active
                </p>
              </div>
              <h1 className="text-4xl font-extralight text-white tracking-[12px] uppercase">
                Smart City
              </h1>
              <div className="flex gap-12 mt-8">
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">
                    Data Points
                  </p>
                  <p className="text-3xl font-mono text-white mt-1">
                    {data.length || '—'}
                  </p>
                </div>
                <div className="w-px h-14 bg-white/10" />
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">
                    Style
                  </p>
                  <p className="text-3xl font-mono text-primary mt-1 uppercase">
                    {style}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsHudOpen(!isHudOpen)}
              className="pointer-events-auto bg-black/60 glass-cyber border border-white/10 p-3.5 rounded-r-2xl text-white/50 hover:text-primary transition-all border-l-0 hover:bg-white/10 backdrop-blur-xl relative z-10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center -ml-[1px]"
              title="Toggle HUD"
            >
              {isHudOpen ? <ChevronLeft size={16} /> : <Info size={16} />}
            </button>
          </div>

          {/* Top-Right: Status Badges */}
          <div className="hidden absolute top-8 right-8 flex flex-col items-end gap-4" style={{ right: '250px' }}>
            <div className="glass-cyber px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl">
              <div className="h-1.5 w-14 bg-primary rounded-full" />
              <p className="text-[11px] font-black text-white tracking-[8px] uppercase">
                REALTIME_{style}
              </p>
            </div>
            <div className="glass-cyber px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
              <div className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_20px_#10b981]" />
              <p className="text-[11px] font-black text-white/60 tracking-[2px] uppercase">
                MAPLIBRE: CONNECTED
              </p>
            </div>
          </div>

          {/* Bottom-Left: Geo Focus Panel */}
          <div className="absolute bottom-24 left-8">
            <div className="glass-cyber px-10 py-8 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-[0_0_120px_rgba(0,0,0,0.8)]">
              <div className="flex items-end gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/15 uppercase tracking-[10px]">
                    Geospatial Focus
                  </p>
                  <p className="text-5xl font-extralight text-white font-mono tracking-tighter">
                    Ahmedabad
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">
                    Engine Status
                  </p>
                  <p className="text-2xl font-bold text-white uppercase tracking-[6px] leading-none">
                    STABLE
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Right: Performance Stats */}
          <div className="absolute bottom-24 right-8">
            <div className="glass-cyber px-8 py-5 rounded-2xl border border-white/10 flex items-center gap-8 shadow-2xl">
              <div className="text-center">
                <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">FPS</p>
                <p className={`text-xl font-mono mt-1 ${fps >= 50 ? 'text-[#10b981]' : fps >= 30 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                  {fps}
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">Tiles</p>
                <p className="text-xl font-mono text-white/60 mt-1">{tileCount}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">3D</p>
                <p className="text-xl font-mono text-primary mt-1">ON</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-8 left-8 pointer-events-auto">
            <div className="glass-cyber rounded-2xl p-5 border border-white/10 shadow-2xl min-w-[180px]">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[4px] mb-3">
                Wealth Classification
              </p>
              <div className="space-y-2.5">
                {[
                  { color: '#10b981', label: 'High (75+)' },
                  { color: '#f59e0b', label: 'Medium (40-75)' },
                  { color: '#ef4444', label: 'Low (<40)' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                    />
                    <span className="text-[11px] text-white/60 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[9px] text-white/20 font-mono">{data.length} active nodes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
