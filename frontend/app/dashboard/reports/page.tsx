"use client";

import { FileDown, FileText, FileSpreadsheet, Download, Calendar } from "lucide-react";

export default function ReportsExports() {
  return (
    <div className="p-8 w-full max-w-6xl mx-auto min-h-[calc(100vh-73px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 border-b border-border pb-6 flex items-end justify-between">
        <div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Reports & <span className="font-bold text-primary">Exports</span></h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Extract intelligence payloads, generate executive PDF summaries, and securely download raw CSV spatial datasets.
            </p>
        </div>
        <FileDown size={48} className="text-white/5" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
          
          <div className="glass p-6 rounded-2xl border border-white/5 group hover:border-primary/30 transition-colors flex flex-col justify-between h-64 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText size={80} className="text-primary"/>
               </div>
               <div className="z-10 bg-white/5 w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center mb-4">
                    <FileText size={24} className="text-white"/>
               </div>
               <div className="z-10">
                    <h3 className="text-white font-bold text-xl mb-1">Executive Summary</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">Automated 12-page PDF containing high-level analytics, heatmaps, and AI-predicted wealth trajectory markers over the last trailing 30 days.</p>
               </div>
               <button className="z-10 flex items-center gap-2 text-xs font-bold text-black bg-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity w-full justify-center">
                   <Download size={14}/> Generate PDF Payload
               </button>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-colors flex flex-col justify-between h-64 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileSpreadsheet size={80} className="text-green-500"/>
               </div>
               <div className="z-10 bg-white/5 w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center mb-4">
                    <FileSpreadsheet size={24} className="text-green-400"/>
               </div>
               <div className="z-10">
                    <h3 className="text-white font-bold text-xl mb-1">Raw Spatial Database</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">Export the entire PostGIS inference vector array. Includes precise latitude, longitude, classification confidences, and timeframes.</p>
               </div>
               <button className="z-10 flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors w-full justify-center">
                   <Download size={14}/> Download raw CSV / GeoJSON
               </button>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 group flex flex-col justify-between h-64 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity">
                    <Calendar size={80} className="text-white"/>
               </div>
               <div className="z-10 bg-white/5 w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center mb-4">
                    <Calendar size={24} className="text-white"/>
               </div>
               <div className="z-10">
                    <h3 className="text-white font-bold text-xl mb-1">Scheduled Exports</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">Configure AWS unauthenticated cron jobs to systematically deliver analytical payloads to assigned administrative personnel.</p>
               </div>
               <button className="z-10 flex items-center gap-2 text-xs font-bold text-muted-foreground bg-white/5 border border-white/5 px-4 py-2 rounded-lg hover:text-white transition-colors w-full justify-center">
                   Configure Schedule
               </button>
          </div>

      </div>
    </div>
  );
}
