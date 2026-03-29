"use client";

import { useEffect, useState } from 'react';
import { DownloadCloud, Filter, CheckCircle2, Clock } from 'lucide-react';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/history')
           .then(res => res.json())
           .then(data => { setHistory(data); setLoading(false); })
           .catch(err => { console.error(err); setLoading(false); });
    }, []);

    return (
        <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                   <h1 className="text-3xl font-bold text-white mb-2">Historical Log</h1>
                   <p className="text-muted-foreground">Audit trail of automated geospatial wealth inferences.</p>
                </div>
                <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm text-white hover:bg-white/5 transition glass">
                       <Filter size={16} /> Filter
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                       <DownloadCloud size={16} /> Export CSV
                   </button>
                </div>
            </div>

            <div className="w-full glass rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-black/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-white/5">
                      <tr>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Transaction ID</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Index Score</th>
                          <th className="px-6 py-4">Confidence</th>
                          <th className="px-6 py-4">Timestamp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-white">
                      {loading ? (
                          <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading historical data...</td></tr>
                      ) : history.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No records found.</td></tr>
                      ) : history.map((record) => (
                          <tr key={record.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                  {record.confidence > 0.8 ? (
                                      <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit text-[11px] font-medium border border-green-500/20"><CheckCircle2 size={12}/> Verified</div>
                                  ) : (
                                      <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded w-fit text-[11px] font-medium border border-yellow-500/20"><Clock size={12}/> Pending</div>
                                  )}
                              </td>
                              <td className="px-6 py-4 font-mono text-muted-foreground">#GEO-A{record.id.toString().padStart(6, '0')}</td>
                              <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${record.category.includes('High') ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                                      {record.category}
                                  </span>
                              </td>
                              <td className="px-6 py-4">{record.wealth_index.toFixed(2)}</td>
                              <td className="px-6 py-4">{(record.confidence * 100).toFixed(1)}%</td>
                              <td className="px-6 py-4 text-muted-foreground">{new Date(record.date).toLocaleString()}</td>
                          </tr>
                      ))}
                   </tbody>
                </table>
            </div>
        </div>
    );
}
