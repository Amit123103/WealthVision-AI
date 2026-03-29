"use client";

import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert, Activity, ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Notifications() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const fetchAlerts = () => {
    fetch('http://localhost:8000/api/v2/alerts')
      .then(res => res.json())
      .then(setAlerts)
      .catch(() => {});
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const visibleAlerts = alerts.filter((_, idx) => !dismissed.has(idx));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto min-h-[calc(100vh-73px)] relative">
      {/* Background glow effects */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 border-b border-border pb-6 flex items-end justify-between relative z-10"
      >
        <div>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2 flex items-center gap-4">
            System <span className="font-bold text-primary">Notifications</span>
            {visibleAlerts.length > 0 && (
                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {visibleAlerts.length} Active
                </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">Real-time anomaly detection alerts autonomously propagated from the GeoWealth inference pipeline.</p>
        </div>
        <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 glass hidden sm:block">
            <Bell size={32} className={visibleAlerts.length > 0 ? "text-primary animate-pulse shadow-primary" : "text-white/20"} />
            {visibleAlerts.length > 0 && <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />}
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 relative z-10"
      >
        <AnimatePresence>
            {visibleAlerts.length === 0 ? (
            <motion.div 
                key="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-96 flex flex-col items-center justify-center text-center glass rounded-3xl border border-white/5"
            >
                <div className="w-24 h-24 bg-green-500/5 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <CheckCircle2 size={48} className="text-green-500/60" />
                </div>
                <p className="text-muted-foreground uppercase tracking-widest text-sm font-semibold mb-2">All Systems Nominal</p>
                <p className="text-xs text-white/40 max-w-sm">No structural or inferential anomalies detected in the current pipeline cycle. Telemetry is stable.</p>
            </motion.div>
            ) : visibleAlerts.map((alert: any, idx: number) => {
                const isCritical = alert.severity >= 4;
                const Icon = isCritical ? ShieldAlert : Activity;
                return (
                    <motion.div 
                        key={idx} 
                        variants={itemAnim}
                        layout
                        className={`glass p-6 rounded-2xl border group flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all hover:bg-white/[0.04] overflow-hidden relative ${isCritical ? 'border-red-500/30 hover:border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.05)]' : 'border-white/10 hover:border-primary/30'}`}
                    >
                        {/* Status highlight bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCritical ? 'bg-red-500' : 'bg-primary'}`} />

                        <div className={`p-4 rounded-xl shrink-0 border ${isCritical ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                            <Icon size={24} className={isCritical ? "animate-pulse" : ""} />
                        </div>

                        <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white tracking-wide uppercase">{alert.alert_type?.replace(/_/g, ' ')}</h3>
                            <span className={`text-[10px] px-3 py-1 rounded-sm font-black uppercase tracking-widest self-start sm:self-auto shadow-inner ${isCritical ? 'bg-red-500 text-background' : 'bg-primary text-background'}`}>
                                SEV-{alert.severity}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-white/70">{alert.region_name}</p>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">{new Date().toLocaleTimeString()}</p>
                        </div>
                        </div>

                        <div className="w-full sm:w-auto flex gap-3 mt-4 sm:mt-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link href="/dashboard/intelligence" className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${isCritical ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}>
                                Investigate <ArrowRight size={14} />
                            </Link>
                            <button 
                                onClick={() => {
                                    setDismissed(prev => {
                                        const next = new Set(prev);
                                        next.add(idx);
                                        return next;
                                    });
                                }}
                                className="px-3 py-2.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 border border-white/5 bg-black/40 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
