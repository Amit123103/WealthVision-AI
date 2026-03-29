"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLocaleStore, useSidebarStore } from '@/lib/store';
import { Globe } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNots, setShowNots] = useState(false);
    
    // i18n
    const { locale, setLocale } = useLocaleStore();
    const { toggle } = useSidebarStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if(isDashboard) {
            const fetchAlerts = () => {
                fetch('http://localhost:8000/api/v2/alerts')
                  .then(res => res.json())
                  .then(data => setNotifications(data))
                  .catch(err => console.error(err));
            };
            fetchAlerts();
            // Unified polling for real-time V2 Alert streams
            interval = setInterval(fetchAlerts, 15000);
        }
        return () => clearInterval(interval);
    }, [isDashboard]);

    return (
        <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
             {isDashboard && (
                <button onClick={toggle} className="text-muted-foreground hover:text-white transition-colors">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
                </button>
             )}
             <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">W</div>
                <h1 className="text-xl font-semibold tracking-wide text-white">GeoWealth<span className="text-primary text-xs ml-1 uppercase">Pro</span></h1>
             </Link>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 border-r border-border pr-4 mr-2">
                <Globe size={16} className="text-muted-foreground" />
                <label htmlFor="language-selector" className="sr-only">Select Language</label>
                <select 
                   id="language-selector"
                   name="language-selector"
                   value={locale} 
                   onChange={(e) => setLocale(e.target.value)}
                   className="bg-transparent text-sm text-muted-foreground hover:text-white cursor-pointer outline-none appearance-none"
                >
                   <option value="en">English</option>
                   <option value="es">Español</option>
                   <option value="fr">Français</option>
                   <option value="pt">Português</option>
                </select>
             </div>

             {isDashboard ? (
                <>
                 <div className="relative flex items-center gap-5 ml-2">
                    {/* Advanced Notification Bell */}
                    <button onClick={() => setShowNots(!showNots)} className="text-muted-foreground hover:text-white transition-all p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 relative outline-none shadow-inner group">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform origin-top"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        {notifications.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                                <span className="relative shadow-xl inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-[#09090b] text-[9px] font-black text-white items-center justify-center pt-[1px] tracking-tighter">
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            </span>
                        )}
                    </button>

                    {showNots && (
                        <div className="absolute top-[120%] right-0 w-80 bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 origin-top-right animate-in fade-in zoom-in-95">
                            <h4 className="text-white text-sm font-bold border-b border-white/10 pb-3 flex justify-between items-center">
                                Alert Center <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">{notifications.length} Unread</span>
                            </h4>
                            {notifications.length === 0 ? <p className="text-xs text-muted-foreground py-2 text-center uppercase tracking-widest font-semibold">Inbox zero</p> : 
                              notifications.map((n, i) => (
                                 <div key={i} className="flex gap-4 text-sm p-3 bg-white/[0.03] rounded-xl border border-white/5 items-start hover:bg-white/10 transition-colors cursor-pointer group">
                                     <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 shadow-lg ${n.severity >= 4 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'bg-primary shadow-[0_0_12px_rgba(234,179,8,0.6)]'}`}></div>
                                     <div className="flex flex-col">
                                         <p className="text-white font-bold text-xs tracking-wide uppercase group-hover:text-primary transition-colors">{n.alert_type.replace('_', ' ')}</p>
                                         <p className="text-muted-foreground text-[10px] uppercase font-semibold mt-0.5">{n.region_name}</p>
                                     </div>
                                 </div>
                              ))
                            }
                        </div>
                    )}

                    {/* Advanced Profile Identity */}
                    <div className="h-8 w-px bg-white/10 mx-1" />
                    
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[13px] font-bold text-white leading-none tracking-wide group-hover:text-primary transition-colors">Admin Director</span>
                            <span className="text-[9px] text-primary/80 uppercase font-bold tracking-[0.2em] leading-relaxed">Level 5 Alpha</span>
                        </div>
                        <div className="relative">
                            {/* Outer Gradient Ring */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-primary to-orange-400 rounded-full blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-primary to-orange-400 rounded-full animate-spin-slow opacity-50" style={{ animationDuration: '8s' }} />
                            
                            <div className="relative w-10 h-10 rounded-full p-[2px] bg-background">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs text-white font-black tracking-widest border border-white/5 backdrop-blur-md z-10 transition-transform group-hover:scale-110">
                                    AD
                                </div>
                                </div>
                            </div>
                            
                            {/* Online Status Indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                        </div>
                    </div>
                 </div>
                </>
             ) : (
                <>
                 <Link href="/login">
                   <button className="text-sm border border-border py-1.5 px-4 rounded text-muted-foreground hover:text-white hover:bg-muted transition">Sign In</button>
                 </Link>
                 <Link href="/login">
                   <button className="text-sm bg-primary text-primary-foreground font-medium py-1.5 px-6 rounded shadow-lg shadow-primary/20 hover:opacity-90 transition">{locale === 'en' ? 'Get Started' : locale === 'es' ? 'Empezar' : 'Commencer'}</button>
                 </Link>
                </>
             )}
          </div>
        </nav>
    );
}
