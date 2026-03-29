"use client";

import { Bookmark, Star, Zap } from 'lucide-react';

export default function SavedInsights() {
  return (
    <div className="p-8 w-full max-w-5xl mx-auto min-h-[calc(100vh-73px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-4xl font-light text-white tracking-tight mb-2">Saved <span className="font-bold text-primary">Insights</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl">Bookmarked AI-generated analysis fragments and manually pinned wealth estimation patterns.</p>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Gomtipura Ward 14 — Poverty Cluster Detection', severity: 'critical', date: '2 hours ago', icon: Zap },
          { title: 'Delhi NCR Infrastructure Anomaly Pattern', severity: 'info', date: '1 day ago', icon: Star },
          { title: 'Kolkata Region Temporal Wealth Shift +4.2pts', severity: 'positive', date: '3 days ago', icon: Bookmark },
        ].map((insight, idx) => (
          <div key={idx} className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${insight.severity === 'critical' ? 'bg-red-500/10 text-red-400' : insight.severity === 'positive' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/50'}`}>
                <insight.icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{insight.date}</p>
              </div>
            </div>
            <span className="text-white/20 group-hover:text-white/60 transition">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
