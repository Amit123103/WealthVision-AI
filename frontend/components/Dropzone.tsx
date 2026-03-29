"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

export default function Dropzone() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [targetRegion, setTargetRegion] = useState("Gomtipura");
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [explainData, setExplainData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [storedData, setStoredData] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/v1/upload/history');
        if (res.ok) {
            setStoredData(await res.json());
        }
    } catch (err) { console.error("History lock failed:", err); }
  };

  useEffect(() => {
    fetchHistory();
    const syncHook = setInterval(fetchHistory, 5000);
    return () => clearInterval(syncHook);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        setFiles(Array.from(e.target.files));
     }
  };

  const handleProcess = async (file: File) => {
    setUploadStatus(prev => ({ ...prev, [file.name]: 'Uploading...' }));
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Geocode User Target Geo-Region
    try {
        if (targetRegion.trim() !== "") {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetRegion)}`);
            if (geoRes.ok) {
                const data = await geoRes.json();
                if (data && data.length > 0) {
                    const bb = data[0].boundingbox.map((s: string) => parseFloat(s));
                    formData.append('min_lat', Math.min(bb[0], bb[1]).toString());
                    formData.append('max_lat', Math.max(bb[0], bb[1]).toString());
                    formData.append('min_lng', Math.min(bb[2], bb[3]).toString());
                    formData.append('max_lng', Math.max(bb[2], bb[3]).toString());
                }
            }
        }
    } catch (err) { console.error("Optional Geocoding error:", err); }

    try {
      const res = await fetch('http://localhost:8000/api/v1/upload/', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'Success!' }));
        fetchHistory(); // Immediately sync new element into Data Warehouse
      } else {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'Error' }));
      }
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'Failed' }));
    }
  };
  
  const handleDelete = async (id: number) => {
      try {
          await fetch(`http://localhost:8000/api/v1/upload/${id}`, { method: 'DELETE' });
          fetchHistory();
      } catch (err) { console.error("Erasure block failed", err); }
  }

  const handleDrag = function(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="w-full flex-col gap-8 flex">
      {/* Upload Module */}
      <div className="w-full p-6 glass rounded-2xl border border-border shadow-xl">
        <div className="flex flex-col gap-4 mb-6">
           <label htmlFor="geo-region-anchor" className="text-sm font-semibold text-white/90">Target Geo-Region</label>
           <input 
               id="geo-region-anchor"
               name="geo-region-anchor"
               type="text" 
               value={targetRegion} 
               onChange={(e) => setTargetRegion(e.target.value)}
               className="bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-primary w-full shadow-inner"
               placeholder="Enter Region (e.g. Varanasi, Gomtipura) to geo-anchor uploads..."
           />
        </div>
        
        <div 
          className={`h-48 rounded-xl border-dashed border-2 flex flex-col items-center justify-center transition p-4 text-center cursor-pointer ${dragActive ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-white/40'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <label htmlFor="file-upload-input" className="sr-only">Upload Analytics Files</label>
          <input 
             id="file-upload-input"
             name="file-upload-input"
             type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} 
             accept=".jpg,.jpeg,.png,application/pdf,.doc,.docx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <p className="text-white font-medium mb-1">Drag and drop source files</p>
          <p className="text-xs text-muted-foreground">Supported: Images, PDF, DOC, CSV (up to 50MB)</p>
        </div>

        {files.length > 0 && (
            <div className="mt-8 space-y-3">
                <p className="text-sm text-white/90 font-semibold mb-3 tracking-wide border-b border-white/10 pb-2">Pending Payload Sync ({files.length})</p>
                {files.map((f: File, i: number) => (
                    <div key={i} className="flex bg-black/60 p-4 rounded-xl border border-white/5 items-center justify-between shadow-inner">
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-muted rounded overflow-hidden flex items-center justify-center">
                               {f.type.startsWith('image/') ? <img src={URL.createObjectURL(f)} className="w-full h-full object-cover"/> : <span className="text-[10px] uppercase font-bold text-white/50">{f.type.split('/')[1]?.substring(0,3) || 'DOC'}</span>}
                           </div>
                           <div>
                              <p className="text-sm font-medium text-white truncate max-w-[200px]">{f.name}</p>
                              <p className="text-[10px] text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                           </div>
                       </div>
                       
                       <div className="flex items-center gap-4">
                           <button 
                               className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${uploadStatus[f.name] === 'Success!' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary text-black hover:opacity-90'}`}
                               onClick={() => handleProcess(f)}
                               disabled={!!uploadStatus[f.name]}
                           >
                               {uploadStatus[f.name] || 'Process & Store'}
                           </button>
                       </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Historical Data Warehouse Module */}
      {storedData.length > 0 && (
          <div className="w-full p-6 glass rounded-2xl border border-border shadow-xl animate-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Data Warehouse</h3>
              <p className="text-xs text-muted-foreground mb-6">Chronological footprint of integrated datasets driving geospatial inference engines.</p>
              
              <div className="space-y-3 pr-2">
                  {storedData.map((item) => (
                      <div key={item.id} className="flex bg-card/60 p-3 rounded-xl border border-white/5 items-center justify-between group hover:bg-card/80 transition">
                          <div className="flex items-center gap-4 w-1/3">
                              <div className="w-10 h-10 bg-black/50 rounded-lg overflow-hidden flex shrink-0 items-center justify-center shadow-inner border border-white/10">
                                  {item.filename.endsWith('.jpg') || item.filename.endsWith('.png') ? (
                                      <img src={item.url} alt="db_entry" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; }} />
                                  ) : (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="13" y2="13"/><line x1="9" x2="12" y1="17" y2="17"/></svg>
                                  )}
                              </div>
                              <div className="truncate">
                                  <p className="text-xs font-semibold text-white truncate max-w-[200px]" title={item.filename}>{item.filename}</p>
                                  <p className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()} &middot; ID #{item.id}</p>
                              </div>
                          </div>
                          
                          <div className="w-1/3 flex justify-center">
                              {item.wealth ? (
                                  <span className="inline-flex py-1 px-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold text-primary/90 tracking-widest uppercase">
                                      Index: {item.wealth.toFixed(1)}
                                  </span>
                              ) : (
                                  <span className="inline-flex py-1 px-3 bg-muted rounded-full text-[10px] text-muted-foreground tracking-widest uppercase">
                                      Orphan Node
                                  </span>
                              )}
                          </div>
                          
                          <div className="w-1/3 flex justify-end items-center gap-3 opacity-80 group-hover:opacity-100 transition">
                              <button onClick={() => setExplainData(item)} className="text-muted-foreground hover:text-white transition p-2 bg-white/5 rounded-lg border border-transparent hover:border-white/10" title="Explainability Payload">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 transition p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20" title="Purge Record & Analytics">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
      
      {/* Upgraded Explainability Overlay Modal */}
      {explainData && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
             <div className="w-full max-w-6xl bg-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                 
                 <div className="flex justify-between items-center p-6 border-b border-border bg-black/40">
                     <div>
                         <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                             Explainability Matrix
                         </h3>
                         <p className="text-xs text-muted-foreground mt-1">Cross-referencing payload #{explainData.id} geographically.</p>
                     </div>
                     <button onClick={() => setExplainData(null)} className="w-auto px-4 py-2 flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white text-sm font-semibold border border-white/10">
                         Close Matrix
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                     </button>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-6 p-6 h-[500px]">
                     
                     <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/60 flex items-center justify-center border border-white/10 group">
                         {explainData.filename.endsWith('.jpg') || explainData.filename.endsWith('.png') ? (
                             <>
                                 <img src={explainData.url} alt="Explainability View" className="absolute w-full h-full object-contain z-0 transition duration-700 group-hover:scale-105" />
                                 {/* Genuine Glass Overlay instead of destructive Color Glitches */}
                                 <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
                                     <span className="block px-3 py-1 bg-black/60 rounded text-[10px] uppercase font-bold text-red-400 border border-white/10 backdrop-blur-lg">High Density Heat Map Overlay</span>
                                     <span className="block px-3 py-1 bg-black/60 rounded text-[10px] uppercase font-bold border border-white/10 backdrop-blur-lg text-primary">Inference: Structured</span>
                                 </div>
                             </>
                         ) : (
                             <p className="text-muted-foreground font-semibold flex flex-col items-center gap-4">
                               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                               Raw Text/Doc Vector
                             </p>
                         )}
                     </div>

                     <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/60 border border-white/10 flex flex-col items-center justify-center">
                         {explainData.lat && explainData.lng ? (
                             <>
                                 <MiniMap lat={explainData.lat} lng={explainData.lng} url={explainData.url} />
                                 <div className="absolute bottom-4 right-4 z-[400] bg-black/80 backdrop-blur border border-white/10 rounded-lg p-3 text-right">
                                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Decoded Geocode Protocol</p>
                                     <p className="text-sm font-bold text-white tracking-widest font-mono">LAT: {explainData.lat.toFixed(4)}</p>
                                     <p className="text-sm font-bold text-white tracking-widest font-mono">LNG: {explainData.lng.toFixed(4)}</p>
                                 </div>
                             </>
                         ) : (
                             <p className="text-muted-foreground text-sm uppercase tracking-widest flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                                No Valid GIS Parameters Attached
                             </p>
                         )}
                     </div>

                 </div>
             </div>
         </div>
      )}
    </div>
  );
}
