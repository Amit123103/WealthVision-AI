"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// ─── Pure 3D Engine Wrapper ───
// Redirecting all geospatial intelligence to the specialized WebGL 3D context
const MapWrapper = dynamic(() => import('@/components/MapWrapper'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-[#010101] flex items-center justify-center">
            <div className="text-center space-y-6">
                <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_40px_rgba(234,179,8,0.15)]" />
                <p className="text-[10px] font-black uppercase tracking-[6px] text-primary animate-pulse">Initializing 3D Neural Network...</p>
            </div>
        </div>
    )
});

export default function MapVisualization() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div className="flex h-[calc(100vh-73px)] relative overflow-hidden bg-black font-sans">
            {/* The Unified 3D Map Context */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <MapWrapper />
            </div>

            {/* Infrastructure Metadata Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] glass-cyber rounded-xl px-8 py-3 border border-white/10 flex items-center gap-6 shadow-2xl backdrop-blur-2xl opacity-80">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.6)]"/>
                    <p className="text-[9px] text-white/50 uppercase tracking-[4px] font-black">Architecture: WEBGL 3D Vitals</p>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <p className="text-[9px] text-white/30 uppercase tracking-[3px] font-bold">
                    Self-Hosted · Neural Scanning Active
                </p>
            </div>
        </div>
    );
}
