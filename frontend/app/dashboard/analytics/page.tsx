"use client";

import { LineChart, BarChart2, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="p-8 w-full max-w-7xl mx-auto min-h-[calc(100vh-73px)]"
    >
      <motion.div variants={item} className="mb-10 border-b border-border pb-6">
        <h1 className="text-4xl font-light text-white tracking-tight mb-2">Deep <span className="font-bold text-primary">Analytics</span> Engine</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Granular structural breakdown of spatial wealth distributions across analyzed territories utilizing staggered machine learning metrics.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
            { title: "Processed Regions", value: "4,291", icon: Activity, trend: "+12.5%", color: "text-blue-400" },
            { title: "Avg Target Index", value: "68.4", icon: BarChart2, trend: "+2.1%", color: "text-primary" },
            { title: "Live Integrations", value: "112", icon: LineChart, trend: "Stable", color: "text-purple-400" }
        ].map((kpi, idx) => (
            <motion.div variants={item} key={idx} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:scale-[1.02] hover:border-white/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-colors" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{kpi.title}</p>
                        <h4 className="text-3xl font-light text-white mt-2">{kpi.value}</h4>
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10 transition-colors">
                        <kpi.icon size={20} className={kpi.color} />
                    </div>
                </div>
                <div className="relative z-10">
                    <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded inline-flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                        {kpi.trend} 30d
                    </span>
                </div>
            </motion.div>
        ))}
      </motion.div>

      {/* Advanced Chart Frameworks */}
      <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div variants={item} className="glass p-6 rounded-2xl border border-white/5 min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
              <h3 className="text-lg font-bold text-white mb-6 relative z-10">Geospatial Bias Heatmap</h3>
              <div className="flex-1 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden p-6 z-10">
                   {/* Animated Grid SVG Mockup */}
                   <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                       <defs>
                           <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                               <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
                               <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                           </linearGradient>
                       </defs>
                       <motion.path 
                           d="M 0 150 Q 50 50, 100 100 T 200 80 T 300 120 T 400 40" 
                           fill="none" 
                           stroke="url(#grad1)" 
                           strokeWidth="4"
                           initial={{ pathLength: 0 }}
                           animate={{ pathLength: 1 }}
                           transition={{ duration: 2, ease: "easeInOut" }}
                       />
                       <motion.path 
                           d="M 0 150 Q 50 50, 100 100 T 200 80 T 300 120 T 400 40 L 400 200 L 0 200 Z" 
                           fill="url(#grad1)" 
                           opacity="0.2"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 0.2 }}
                           transition={{ duration: 1, delay: 1 }}
                       />
                   </svg>
                   <div className="absolute inset-x-0 bottom-4 flex justify-between px-8">
                       {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => <span key={m} className="text-[10px] text-muted-foreground uppercase">{m}</span>)}
                   </div>
              </div>
          </motion.div>

          <motion.div variants={item} className="glass p-6 rounded-2xl border border-white/5 min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <h3 className="text-lg font-bold text-white mb-6 relative z-10">Temporal Predictability</h3>
              <div className="flex-1 bg-black/40 rounded-xl border border-white/5 flex items-end justify-between p-6 px-12 z-10 relative">
                  
                  {/* Dynamic Staggered Bars */}
                   {[40, 60, 45, 80, 55, 90, 75, 85].map((h, i) => (
                       <motion.div 
                           key={i} 
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                           className="w-8 bg-primary/30 hover:bg-primary/90 transition-colors rounded-t cursor-pointer relative group border-t-2 border-primary" 
                       >
                           <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black px-2 py-1 rounded text-[10px] text-white font-bold pointer-events-none border border-white/10 transition-opacity z-20">+{h}pts</span>
                       </motion.div>
                   ))}

                   {/* Background Graph Lines */}
                   <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-20 z-0">
                       <div className="border-t border-white/20 w-full" />
                       <div className="border-t border-white/20 w-full" />
                       <div className="border-t border-white/20 w-full" />
                       <div className="border-t border-white/20 w-full" />
                   </div>
              </div>
          </motion.div>

      </motion.div>
    </motion.div>
  );
}
