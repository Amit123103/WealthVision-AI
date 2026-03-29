"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Cuboid, Settings2, ChevronRight } from "lucide-react";

interface MapWrapperProps {
  onSelectPoint?: (pred: any) => void;
  location?: { lng: number; lat: number; zoom?: number; name?: string };
}

type NeuralStyle = 'dark' | 'satellite' | 'voyager' | 'positron';

const Map3DLoader = dynamic(() => import("./Map3DThree"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#010101] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto border border-white/10 relative">
          <Cuboid size={36} className="text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/15 animate-ping" />
        </div>
        <div className="space-y-3">
          <p className="text-lg text-white font-light tracking-[4px] uppercase">3D Geospatial Engine</p>
          <div className="flex items-center justify-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] text-white/30 uppercase tracking-[6px]">Loading MapLibre GL...</p>
          </div>
        </div>
      </div>
    </div>
  )
});

export default function MapWrapper(props: MapWrapperProps) {
  const [style, setStyle] = useState<NeuralStyle>('dark');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#010101] overflow-hidden">
      {/* Map Engine */}
      <Map3DLoader {...props} style={style} onLoad={handleLoad} />
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-[200] bg-[#010101] flex items-center justify-center transition-opacity duration-1000">
          <div className="text-center space-y-8">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-3 rounded-full border-2 border-primary/10 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
              <div className="absolute inset-6 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/10">
                <Cuboid size={36} className="text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xl text-white font-extralight tracking-[10px] uppercase">
                Initializing Engine
              </p>
              <div className="flex flex-col items-center gap-2">
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-[9px] text-white/20 uppercase tracking-[6px] font-bold">
                  MapLibre GL · OSM · DEM Terrain
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Neural Style Switcher ─── */}
      <div 
        className="absolute top-[280px] z-[100] flex flex-row items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ right: isStylePanelOpen ? '32px' : '-220px' }}
      >
        <button 
          onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
          className="bg-black/60 glass-cyber border border-white/10 p-3.5 rounded-l-2xl text-white/50 hover:text-primary transition-all border-r-0 hover:bg-white/10 backdrop-blur-xl relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center -mr-[1px]"
          title="Toggle Map Style"
        >
          {isStylePanelOpen ? <ChevronRight size={16} /> : <Settings2 size={16} />}
        </button>

        <div className="w-[220px] glass-cyber rounded-l-xl rounded-br-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="px-6 py-4 border-b border-white/5 bg-black/40">
            <p className="text-[10px] font-black text-white/40 tracking-[6px] uppercase">Map Style</p>
          </div>
          {(['dark', 'satellite', 'voyager', 'positron'] as NeuralStyle[]).map(key => (
            <button
              key={key}
              onClick={() => setStyle(key)}
              className={`w-full text-left px-8 py-5 text-[11px] font-black tracking-[4px] uppercase transition-all duration-500 border-l-2 ${
                style === key 
                  ? 'bg-primary/20 text-primary border-primary shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]' 
                  : 'text-white/30 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
