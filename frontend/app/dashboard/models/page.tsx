"use client";

import { Cpu, GitBranch, ToggleRight } from 'lucide-react';

export default function ModelManagement() {
  return (
    <div className="p-8 w-full max-w-5xl mx-auto min-h-[calc(100vh-73px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Model <span className="font-bold text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm max-w-2xl">Switch between deployed AI model versions, view performance benchmarks, and manage inference pipelines.</p>
        </div>
        <Cpu size={48} className="text-white/5" />
      </div>

      <div className="space-y-4">
        {[
          { name: 'WealthNet v3.1', status: 'Active', accuracy: '89.2%', params: '147M', description: 'Production ResNet-50 backbone trained on 2.4M satellite tiles.' },
          { name: 'WealthNet v2.8', status: 'Standby', accuracy: '86.7%', params: '98M', description: 'Legacy EfficientNet-B4 model. Deprecated but available for rollback.' },
          { name: 'WealthNet v4.0-beta', status: 'Testing', accuracy: '91.1%', params: '320M', description: 'Vision Transformer (ViT-L) with multi-modal socioeconomic embeddings.' },
        ].map((model, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/3 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <GitBranch size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{model.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-lg">{model.description}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">Accuracy: {model.accuracy}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">Params: {model.params}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                  model.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  model.status === 'Testing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-white/5 text-white/40 border-white/10'
                }`}>{model.status}</span>
                {model.status !== 'Active' && (
                  <button className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition text-white/40 hover:text-white">
                    <ToggleRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
