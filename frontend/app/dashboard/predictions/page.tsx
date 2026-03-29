"use client";

import { TableProperties, Search, Filter } from "lucide-react";

export default function Predictions() {
  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-[calc(100vh-73px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 border-b border-border pb-6 flex items-end justify-between">
        <div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Inference <span className="font-bold text-primary">Predictions</span></h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Chronological log of algorithmic decisions. Filter and dissect exact physical coordinates and assigned category scores.
            </p>
        </div>
        <TableProperties size={48} className="text-white/5" />
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5 w-full">
           <div className="flex items-center justify-between mb-6">
                <div className="bg-black/40 border border-white/10 rounded-lg flex items-center px-3 py-2 w-96">
                     <label htmlFor="prediction-search" className="sr-only">Search Predictions</label>
                     <Search size={16} className="text-muted-foreground mr-2"/>
                     <input id="prediction-search" name="prediction-search" type="text" placeholder="Search PostGIS payload ID or coordinates..." className="bg-transparent text-sm w-full text-white outline-none placeholder:text-muted-foreground" />
                </div>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2 rounded-lg text-sm font-semibold text-white">
                     <Filter size={16}/> Filter by AI Confidence
                </button>
           </div>
           
           <div className="w-full bg-black/40 border border-white/10 rounded-xl overflow-hidden mt-6 flex flex-col items-center justify-center p-16">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 mb-4 animate-pulse"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" x2="16" y1="13" y2="13"/><line x1="8" x2="16" y1="17" y2="17"/><line x1="10" x2="10.01" y1="9" y2="9"/></svg>
               <h3 className="text-white font-bold mb-1 tracking-widest uppercase">Predictive State Empty</h3>
               <p className="text-muted-foreground text-sm max-w-sm text-center">Syncing structural vectors from PostgreSQL... Use the Data Ingest block to explicitly run model inference loops.</p>
           </div>
      </div>
    </div>
  );
}
