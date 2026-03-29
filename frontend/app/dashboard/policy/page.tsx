"use client";

import { Landmark, ArrowRight, Activity, Percent, Network, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PolicySimulator() {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulation Terminal Engine
  useEffect(() => {
      if (running) {
          const commands = [
              "Initializing PyTorch tensors...",
              "Loading Gomtipura localized dataset parameters...",
              "Applying generic stimulus distribution weights...",
              "Executing 100,000 epoch simulation loops...",
              "Compiling impact indices against baseline...",
              "Simulation complete."
          ];
          
          let i = 0;
          const interval = setInterval(() => {
              if (i < commands.length) {
                  setLogs(prev => [...prev, commands[i]]);
                  i++;
                  if (i === commands.length) {
                      clearInterval(interval);
                      setTimeout(() => setComplete(true), 800);
                  }
              }
          }, 600);
          
          return () => clearInterval(interval);
      }
  }, [running]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-8 w-full max-w-6xl mx-auto min-h-[calc(100vh-73px)]">
      <motion.div variants={item} className="mb-10 border-b border-border pb-6 flex items-end justify-between">
        <div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Policy <span className="font-bold text-primary">Simulator</span></h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Model macro-economic initiatives globally. Quantify structural shifts algorithmically prior to physical deployment using the Neural Inference Engine.
            </p>
        </div>
        <Landmark size={48} className="text-white/5" />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Policy Builder Form  - Left Pane */}
          <motion.div variants={item} className="glass p-6 rounded-2xl border border-white/5 relative shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Network size={16} className="text-primary"/> Compute Interface
              </h3>
              
              <div className="space-y-4">
                  <div className="space-y-2">
                       <label htmlFor="target-region" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Target Geospatial Region</label>
                       <input id="target-region" name="target-region" type="text" disabled={running} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm text-white focus:border-primary outline-none transition-colors focus:bg-white/5 disabled:opacity-50" defaultValue="Ahmedabad, IN (Ward 14)" />
                  </div>
                  
                  <div className="space-y-2">
                       <label htmlFor="directive-type" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Directive Architecture</label>
                       <select id="directive-type" name="directive-type" disabled={running} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm text-white focus:border-primary outline-none custom-select disabled:opacity-50">
                           <option>Infrastructure Subsidy (Tier 1)</option>
                           <option>Universal Basic Income Allocation</option>
                           <option>Direct Rural Electrification Fund</option>
                           <option>Corporate Tax Relief (Zonal)</option>
                       </select>
                  </div>

                  <div className="space-y-2 mb-8">
                       <label htmlFor="financial-block" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Simulated Financial Block (USD)</label>
                       <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                            <input id="financial-block" name="financial-block" disabled={running} type="number" className="w-full bg-black/40 border border-white/10 p-3 pl-8 rounded-lg text-sm text-white focus:border-primary outline-none font-mono disabled:opacity-50" defaultValue={150000000} />
                       </div>
                  </div>
                  
                  {/* Danger Zone warning */}
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex gap-3 my-6">
                      <ShieldAlert className="text-red-400 shrink-0" size={18} />
                      <p className="text-[10px] text-red-200/60 uppercase tracking-widest leading-relaxed">System processing power will spike during evaluation. Requires approx. 4,200 GB RAM allocation from primary cluster.</p>
                  </div>

                  <button 
                      disabled={running}
                      onClick={() => setRunning(true)}
                      className={`w-full font-bold text-sm tracking-widest uppercase p-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 mt-8 border shadow-lg ${running ? 'bg-primary/20 text-white border-primary/20 opacity-50 cursor-not-allowed' : 'bg-primary text-black hover:bg-yellow-400 border-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.4)]'}`}
                  >
                      {running ? 'Execution Locked' : 'Initiate Neural Simulation'} {!running && <ArrowRight size={16} />}
                  </button>
              </div>
          </motion.div>

          {/* Dynamic Terminal / Results - Right Pane */}
          <motion.div variants={item} className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-card/40 to-black/80 flex flex-col relative overflow-hidden h-full min-h-[400px] shadow-2xl">
              <AnimatePresence mode="wait">
                  {!running && !complete ? (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                              <Activity size={24} className="text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
                              Awaiting Parameters <span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></span>
                          </p>
                          <p className="text-xs text-white/40 max-w-[200px] leading-relaxed">Configure the directive to generate a 5-year longitudinal forecast matrix.</p>
                      </motion.div>
                  ) : running && !complete ? (
                      <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-black/60 rounded-xl p-4 border border-white/10 font-mono text-[10px] sm:text-xs">
                          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                              <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"/><div className="w-2.5 h-2.5 rounded-full bg-green-500"/></div>
                              <span className="text-muted-foreground ml-2">sys_kernel // process_id: 8841</span>
                          </div>
                          <div className="space-y-1 overflow-y-auto">
                              {logs.map((log, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={log?.includes("complete") ? "text-green-400 font-bold mt-4" : "text-white/70"}>
                                      <span className="text-primary/50 mr-2">{'>'}</span>{log}
                                  </motion.div>
                              ))}
                              <div className="animate-pulse text-primary mt-2">_</div>
                          </div>
                      </motion.div>
                  ) : (
                      <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                           <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-primary/20">
                                <p className="text-xs text-primary font-bold tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Payload Resolved</p>
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-mono border border-primary/30">T+5.0 YEARS</span>
                           </div>

                           <div className="space-y-6 flex-1 flex flex-col justify-center">
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-5 rounded-xl border border-green-500/30 bg-green-500/5 relative overflow-hidden group">
                                     <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-green-500/10 to-transparent pointer-events-none" />
                                     <p className="text-[10px] uppercase font-bold text-green-400 mb-1 flex items-center gap-2 opacity-80"><Percent size={12}/> Wealth Index Shift</p>
                                     <h2 className="text-4xl font-light text-white tracking-tight">+14.2<span className="text-sm font-bold text-green-400 ml-1">pts</span></h2>
                                </motion.div>
                                
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
                                     <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
                                     <p className="text-[10px] uppercase font-bold text-blue-400 mb-1 flex items-center gap-2 opacity-80"><Activity size={12}/> Poverty Reduction Rate</p>
                                     <h2 className="text-4xl font-light text-white tracking-tight">8.7<span className="text-sm font-bold text-blue-400 ml-1">%</span></h2>
                                </motion.div>

                                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} onClick={() => { setRunning(false); setComplete(false); setLogs([]); }} className="text-xs text-muted-foreground mt-4 hover:text-white transition w-full text-center tracking-widest uppercase border border-white/5 py-4 rounded-xl bg-black/40 hover:bg-white/5">
                                    Simulate Alternate Policy
                                </motion.button>
                           </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </motion.div>
      </div>
    </motion.div>
  );
}
