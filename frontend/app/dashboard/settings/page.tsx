"use client";

import { useState } from 'react';
import { Shield, Key, RefreshCw, Copy, Server } from 'lucide-react';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('sk_live_geo_892nf104mxz...');
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<string|null>(null);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/system/seed', { method: 'POST' });
            const data = await res.json();
            setSeedResult(data.message);
        } catch(e) {
            setSeedResult("Failed to reach advanced endpoint. Is uvicorn running?");
        } finally {
            setSeeding(false);
        }
    }

    return (
        <div className="flex-1 p-8 max-w-5xl">
             <div className="mb-10">
                 <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
                 <p className="text-muted-foreground">Manage organizational access and developer endpoints.</p>
             </div>

             <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-6">
                     <div className="glass p-6 rounded-xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                             <div className="p-2 bg-primary/20 rounded-lg text-primary"><Key size={20}/></div>
                             <h3 className="text-lg font-semibold text-white">Developer API Keys</h3>
                         </div>
                         <p className="text-sm text-muted-foreground mb-4">Use this secret key to authenticate your server's requests to our REST endpoints.</p>
                         
                          <div className="flex items-center gap-2 mb-6">
                             <label htmlFor="api-key-display" className="sr-only">Developer API Key</label>
                             <input 
                                 id="api-key-display" 
                                 name="api-key-display" 
                                 type="password" 
                                 value={apiKey} 
                                 readOnly 
                                 className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white focus:outline-none font-mono text-sm tracking-widest" 
                             />
                             <button className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition"><Copy size={18} /></button>
                             <button className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition"><RefreshCw size={18} /></button>
                         </div>

                         <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                             <Shield size={18} className="text-primary mt-0.5" />
                             <p className="text-xs text-primary/80 leading-relaxed">
                                 Your secret keys carry many privileges. Do not share these keys in publicly accessible areas such as GitHub, client-side code, etc.
                             </p>
                         </div>
                     </div>
                 </div>

                 <div className="space-y-6">
                      <div className="glass p-6 rounded-xl border border-red-500/20 bg-gradient-to-br from-black to-red-950/20">
                           <div className="flex items-center gap-3 mb-4">
                               <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Server size={20}/></div>
                               <h3 className="text-lg font-semibold text-white">System Diagnostics</h3>
                           </div>
                           <p className="text-xs text-muted-foreground mb-4">Generate 20 artificial coordinates with random inference data to populate your live map if your database is empty.</p>
                           
                           <button 
                               onClick={handleSeed}
                               disabled={seeding}
                               className="w-full bg-red-900/50 hover:bg-red-800/80 text-white font-medium py-2.5 rounded border border-red-500/30 transition shadow-lg text-sm"
                           >
                               {seeding ? 'Generating Payload...' : 'Execute DB Seeder'}
                           </button>

                           {seedResult && (
                               <p className="text-xs text-green-400 mt-4 font-mono break-words">{seedResult}</p>
                           )}
                      </div>
                 </div>
             </div>
        </div>
    );
}
