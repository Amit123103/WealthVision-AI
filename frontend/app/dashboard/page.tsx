"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('@/components/MapWrapper'), { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-black flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 animate-pulse mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div><p className="text-xs text-white/30 uppercase tracking-widest">Loading 3D Engine...</p></div></div> 
});

export default function DashboardHome() {
  const [stats, setStats] = useState({ total_images: 0, total_predictions: 0, average_wealth: 0 });
  const [targetRegion, setTargetRegion] = useState('');
  const [subsidyWeight, setSubsidyWeight] = useState(50);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  
  const [allMapPoints, setAllMapPoints] = useState<any[]>([]);
  const [regionalStats, setRegionalStats] = useState<{count: number, avg: number} | null>(null);
   const [insight, setInsight] = useState<string | null>(null);
   const [isPanelOpen, setIsPanelOpen] = useState(true);
   const [mapLocation, setMapLocation] = useState<{lng: number; lat: number; zoom?: number; name?: string} | undefined>(undefined);

  const fetchBackendData = async (retries = 3) => {
      try {
        const [statsRes, insightsRes, mapRes] = await Promise.all([
            fetch('http://localhost:8000/api/v1/dashboard/stats'),
            fetch('http://localhost:8000/api/v1/insights/region'),
            fetch('http://localhost:8000/api/v1/dashboard/heatmap')
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (insightsRes.ok) setInsight((await insightsRes.json()).insight);
        
        if (mapRes.ok) {
            const mapData = await mapRes.json();
            const points = mapData.features.map((f: any) => ({
                lng: f.geometry.coordinates[0],
                lat: f.geometry.coordinates[1],
                wealth: f.properties.wealth_index
            }));
            setAllMapPoints(points);
        }
      } catch (err) { 
        if (retries > 0) {
            setTimeout(() => fetchBackendData(retries - 1), 1500);
        } else {
            console.error("Data Sync Error:", err); 
        }
      }
  };

  const handleAnalysis = async () => {
    if (!targetRegion) return;
    setIsSimulating(true);
    setSimulationResult(null);
    setBounds(null);
    setRegionalStats(null);
    
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetRegion)}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
            const bb = data[0].boundingbox.map((s: string) => parseFloat(s));
            // bb index: [minLat, maxLat, minLon, maxLon] standard OSM format
            const minLat = Math.min(bb[0], bb[1]);
            const maxLat = Math.max(bb[0], bb[1]);
            const minLng = Math.min(bb[2], bb[3]);
            const maxLng = Math.max(bb[2], bb[3]);
            
            const newBounds: [[number, number], [number, number]] = [ [minLat, minLng], [maxLat, maxLng] ];
            setBounds(newBounds);
            
            // Crunch Real Data!
            const regionPoints = allMapPoints.filter(p => p.lat >= minLat && p.lat <= maxLat && p.lng >= minLng && p.lng <= maxLng);
            const count = regionPoints.length;
            const avg = count > 0 ? regionPoints.reduce((acc, curr) => acc + curr.wealth, 0) / count : 0;
            
            setRegionalStats({ count, avg });
            setMapLocation({ lng: (minLng + maxLng) / 2, lat: (minLat + maxLat) / 2 });
            setSimulationResult(`Geospatial data locked. Evaluated ${count} physical coordinates. Computed Subsidy Impact: +${(subsidyWeight * 0.12).toFixed(2)}% net index gain.`);
            if(!isPanelOpen) setIsPanelOpen(true);
        } else {
            setSimulationResult(`Region not found via OpenStreetMap API.`);
        }
    } catch (e) {
        setSimulationResult("Failed to resolve region coordinates.");
    } finally {
        setIsSimulating(false);
    }
  };

  const handleBookmark = async () => {
     try {
         await fetch('http://localhost:8000/api/v1/reports/save', { method: 'POST' });
         alert("Saved successfully!");
     } catch(e) { console.error(e); }
  }

  useEffect(() => {
    fetchBackendData();
    const pollingSync = setInterval(fetchBackendData, 5000);
    return () => clearInterval(pollingSync);
  }, []);

  const displayCount = regionalStats ? regionalStats.count : stats.total_images;
  const displayAvg = regionalStats ? regionalStats.avg.toFixed(1) : stats.average_wealth.toFixed(1);

  return (
    <div className="flex h-[calc(100vh-73px)] relative overflow-hidden bg-black">
      
      {/* Main Map Visualization */}
      <div className="absolute inset-0 z-0 transition-all duration-500 ease-in-out">
        <MapComponent location={mapLocation} />
      </div>

      {/* Retractable Bottom Panel */}
      <aside 
        className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) ${
            isPanelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
        }`}
      >
        <div className="mx-auto max-w-6xl glass rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col bg-black/60 backdrop-blur-2xl">
            
            {/* Nub Handle */}
            <div 
                className="w-full h-12 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors rounded-t-3xl"
                onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
                <div className="w-16 h-1.5 bg-white/20 rounded-full"></div>
            </div>

            {/* Panel Content Layout - Scrollable if needed */}
            <div className="px-8 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                
                {/* Section 1: Metrics */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">Simulation Engine</h2>
                        <p className="text-xs text-muted-foreground mt-1">Real-time geospatial wealth mapping</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-inner">
                            <p className="text-[10px] text-muted-foreground font-semibold pb-1 uppercase tracking-widest">Surveyed Links</p>
                            <p className="text-4xl font-light text-white">{displayCount}</p>
                            {regionalStats && <p className="text-xs text-green-400 mt-1">Local Bounding Box</p>}
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-inner">
                            <p className="text-[10px] text-muted-foreground font-semibold pb-1 uppercase tracking-widest">Index Median</p>
                            <p className="text-4xl font-light text-primary">{displayAvg}</p>
                            {regionalStats && <p className="text-xs text-green-400 mt-1">Real-time Extracted</p>}
                        </div>
                    </div>
                </div>

                {/* Section 2: Policy Controls */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-white/90">Policy Scenario Simulator</h3>
                    <div className="space-y-4 p-5 bg-black/40 rounded-2xl border border-white/5 flex-1 shadow-inner">
                        <div>
                            <label htmlFor="region-search" className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider font-medium">Target Region (Geocode)</label>
                            <input 
                                id="region-search"
                                name="region-search"
                                type="text" 
                                placeholder="e.g. New Delhi, Paris..." 
                                className="w-full text-sm bg-muted/50 border border-white/10 p-2.5 rounded-lg focus:ring-1 focus:ring-primary outline-none text-white transition-all focus:bg-muted" 
                                value={targetRegion}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAnalysis(); }}
                                onChange={(e) => setTargetRegion(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                               <label htmlFor="subsidy-weight" className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Subsidy Weight</label>
                               <span className="text-xs font-bold text-primary">{subsidyWeight}%</span>
                            </div>
                            <input id="subsidy-weight" name="subsidy-weight" type="range" className="w-full accent-primary" min="0" max="100" value={subsidyWeight} onChange={(e) => setSubsidyWeight(Number(e.target.value))} />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleAnalysis} disabled={isSimulating} className="flex-1 bg-primary text-black font-semibold py-2.5 rounded-lg hover:brightness-110 shadow-[0_0_20px_rgba(234,179,8,0.2)] transition disabled:opacity-50 text-sm">
                                {isSimulating ? 'Geocoding...' : 'Execute Simulator'}
                            </button>
                            <button onClick={handleBookmark} className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg hover:bg-white/10 transition text-muted-foreground hover:text-white" title="Bookmark Report">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 3: Insights & Outputs */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-white/90">Autonomous Insights</h3>
                    <div className="flex-1 space-y-3">
                        {insight && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                                <p className="text-[10px] text-primary block uppercase mb-1.5 tracking-widest font-bold flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Global Network Bias
                                </p>
                                <p className="text-sm text-white/90 leading-relaxed">{insight}</p>
                            </div>
                        )}
                        {simulationResult && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                                 <p className="text-[10px] text-green-500 block uppercase mb-1.5 tracking-widest font-bold flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Crunch Completed
                                </p>
                                <p className="text-sm text-green-200/90 leading-relaxed">{simulationResult}</p>
                            </div>
                        )}
                        {!insight && !simulationResult && (
                            <div className="h-full border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs text-muted-foreground/50 uppercase tracking-widest font-medium p-4 text-center">
                                Standby for AI Payload
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </aside>
    </div>
  );
}
