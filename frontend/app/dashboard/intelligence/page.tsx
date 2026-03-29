"use client";

import { useState, useEffect } from 'react';

export default function IntelligenceHub() {
    const [region, setRegion] = useState("Varanasi");
    const [insight, setInsight] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const pullIntelligence = async () => {
        setLoading(true);
        try {
            // Geocode Real Region to Bounding Box Interceptor
            let boundsParam = "";
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(region)}`);
                if (geoRes.ok) {
                    const data = await geoRes.json();
                    if (data && data.length > 0) {
                        const bb = data[0].boundingbox.map((s: string) => parseFloat(s));
                        const minLat = Math.min(bb[0], bb[1]);
                        const maxLat = Math.max(bb[0], bb[1]);
                        const minLng = Math.min(bb[2], bb[3]);
                        const maxLng = Math.max(bb[2], bb[3]);
                        boundsParam = `&min_lat=${minLat}&max_lat=${maxLat}&min_lng=${minLng}&max_lng=${maxLng}`;
                    }
                }
            } catch (err) { console.error("Geocoding bypass fail:", err); }

            // Parallel fetches to V2 Engine targeting Spatial DB Rows directly
            const [insightRes, forecastRes] = await Promise.all([
                fetch(`http://localhost:8000/api/v2/insights/auto?region=${encodeURIComponent(region)}${boundsParam}`),
                fetch(`http://localhost:8000/api/v2/predict/future?region=${encodeURIComponent(region)}${boundsParam}`)
            ]);
            
            if (insightRes.ok) setInsight(await insightRes.json());
            if (forecastRes.ok) setForecast(await forecastRes.json());
        } catch (error) {
            console.error("Failed AI Intelligence Hook", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount
    useEffect(() => {
        pullIntelligence();
    }, []);

    // SVG Mathematical Formulators
    const chartHeight = 300;
    const chartWidth = 1000;
    const pointsStr = forecast?.forecast_series?.map((p: any, i: number) => {
        const x = (i / 11) * chartWidth;
        const y = chartHeight - ((Math.max(10, Math.min(95, p.predicted_index)) - 10) / 85) * chartHeight;
        return `${x},${y}`;
    }).join(" ");
    const areaStr = pointsStr ? `M0,${chartHeight} L${pointsStr.split(" ")[0]} L${pointsStr.replace(/ /g, " L")} L${chartWidth},${chartHeight} Z` : "";

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-[calc(100vh-73px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tight mb-2">Autonomous <span className="font-bold text-primary">Intelligence</span></h1>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        V2.0 Engine: Aggregating spatial metadata and compiling NLP-based decision matrices for predictive governance.
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <label htmlFor="hub-region" className="sr-only">Target Macro-Region</label>
                    <input 
                        id="hub-region"
                        name="hub-region"
                        type="text" 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)} 
                        className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg text-white outline-none focus:border-primary w-64"
                        placeholder="Target Macro-Region..."
                    />
                    <button 
                        onClick={pullIntelligence} 
                        disabled={loading}
                        className="bg-primary text-black font-semibold px-6 py-2 rounded-lg hover:scale-105 transition active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Synthesizing...' : 'Re-Scan'}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Auto Insight Generator Panel */}
                <div className="md:col-span-1 flex flex-col gap-6">
                    <div className="p-6 glass rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center justify-between">
                            Executive Summary
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded tracking-widest uppercase shadow-[0_0_10px_rgba(234,179,8,0.3)]">NLP Generated</span>
                        </h3>
                        {loading ? (
                            <div className="animate-pulse space-y-3 mt-8">
                                <div className="h-4 bg-white/5 rounded w-full"></div>
                                <div className="h-4 bg-white/5 rounded w-5/6"></div>
                                <div className="h-4 bg-white/5 rounded w-4/6"></div>
                                <div className="h-4 bg-white/5 rounded w-full mt-4"></div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line mt-4">
                                {insight?.summary || "No active synthesis protocol for this sector."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Predictive Forecasting Engine */}
                <div className="md:col-span-2">
                    <div className="p-6 glass rounded-2xl border border-white/5 shadow-2xl h-full flex flex-col">
                        <div className="mb-6 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Time-Series Forecast Model</h3>
                                <p className="text-xs text-muted-foreground">12-Month Mathematical Vector Projection anchoring structural drift</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-3xl font-light text-primary">{forecast?.current_index ?? '0.0'}</h4>
                                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Current Base Index</p>
                            </div>
                        </div>

                        {/* Interactive Vector Chart Layer */}
                        <div className="relative w-full flex-1 bg-black/40 rounded-xl border border-white/5 p-6 flex flex-col justify-end items-center overflow-hidden min-h-[300px]">
                           {loading ? (
                               <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="flex flex-col items-center gap-3">
                                       <span className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></span>
                                       <p className="text-xs text-primary/70 uppercase tracking-widest animate-pulse font-semibold">Running Monte Carlo Simulations...</p>
                                   </div>
                               </div>
                           ) : pointsStr ? (
                               <svg viewBox="-20 -50 1040 380" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                   <defs>
                                       <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                           <stop offset="0%" stopColor="#eab308" stopOpacity={0.4}/>
                                           <stop offset="100%" stopColor="#eab308" stopOpacity={0.0}/>
                                       </linearGradient>
                                       <filter id="glow">
                                           <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                                           <feMerge>
                                               <feMergeNode in="coloredBlur"/>
                                               <feMergeNode in="SourceGraphic"/>
                                           </feMerge>
                                       </filter>
                                   </defs>
                                   
                                   {/* Axis Grid Markers */}
                                   <g className="text-white/5 text-[10px]" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6">
                                       <line x1="0" y1="0" x2="1000" y2="0" />
                                       <text x="-5" y="5" fill="#a1a1aa" stroke="none" textAnchor="end">95.0</text>
                                       <line x1="0" y1="150" x2="1000" y2="150" />
                                       <text x="-5" y="155" fill="#a1a1aa" stroke="none" textAnchor="end">52.5</text>
                                       <line x1="0" y1="300" x2="1000" y2="300" />
                                       <text x="-5" y="305" fill="#a1a1aa" stroke="none" textAnchor="end">10.0</text>
                                   </g>

                                   <path d={areaStr} fill="url(#chartGradient)" className="animate-in fade-in duration-1000" />
                                   <polyline points={pointsStr} fill="none" stroke="#eab308" strokeWidth="3" filter="url(#glow)" className="animate-in slide-in-from-left duration-1000" />
                                   
                                   {/* Interaction Tooltips */}
                                   {forecast?.forecast_series?.map((p: any, i: number) => {
                                       const x = (i / 11) * chartWidth;
                                       const y = chartHeight - ((Math.max(10, Math.min(95, p.predicted_index)) - 10) / 85) * chartHeight;
                                       return (
                                           <g key={i} className="group cursor-crosshair">
                                               {/* Proximity hover catcher block */}
                                               <rect x={x - 40} y={-50} width={80} height={400} fill="transparent" />
                                               
                                               <line x1={x} y1={y} x2={x} y2={chartHeight} stroke="#eab308" strokeWidth="1" strokeDasharray="2 4" className="opacity-0 group-hover:opacity-50 transition-opacity" />
                                               <circle cx={x} cy={y} r="5" fill="#000" stroke="#eab308" strokeWidth="2" className="transition-all duration-300 group-hover:r-[8px] group-hover:fill-[#eab308]" />
                                               
                                               <rect x={x - 30} y={y - 45} width="60" height="32" rx="4" fill="#000" stroke="#eab308" strokeOpacity="0.4" className="opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                                               <text x={x} y={y - 23} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                  {p.predicted_index}
                                               </text>
                                           </g>
                                       )
                                   })}
                                   
                                   {/* X-Axis Labels */}
                                   {forecast?.forecast_series?.map((p: any, i: number) => (
                                       <text key={`label-${i}`} x={(i / 11) * chartWidth} y={chartHeight + 20} fill="#71717a" fontSize="11" fontWeight="600" textAnchor="middle" className="uppercase tracking-widest">
                                           M+{i+1}
                                       </text>
                                   ))}
                               </svg>
                           ) : (
                               <span className="text-muted-foreground">Insufficient Time-Series Vectors</span>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
