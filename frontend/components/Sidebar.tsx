"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BrainCircuit, 
  UploadCloud, 
  History, 
  Settings, 
  LogOut,
  LineChart,
  TableProperties,
  Landmark,
  FileDown,
  Users,
  Bell,
  Bookmark,
  Cpu,
  UserCircle2
} from 'lucide-react';
import { useSidebarStore, useAuthStore, UserRole } from '@/lib/store';

type NavConfig = {
    group: string;
    items: {
        name: string;
        href: string;
        icon: any;
        rolesAllowed: UserRole[];
    }[];
}

const sidebarConfig: NavConfig[] = [
    {
        group: "Core Platform",
        items: [
            { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
            { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
            { name: 'Map Visualization', href: '/dashboard/map', icon: MapIcon, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
        ]
    },
    {
        group: "AI Engine",
        items: [
            { name: 'AI Intelligence', href: '/dashboard/intelligence', icon: BrainCircuit, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
            { name: 'Predictions', href: '/dashboard/predictions', icon: TableProperties, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
            { name: 'Policy Simulator', href: '/dashboard/policy', icon: Landmark, rolesAllowed: ['ADMIN', 'POLICY_MAKER'] },
        ]
    },
    {
        group: "Data & Insights",
        items: [
            { name: 'Ingest Data', href: '/dashboard/ingest', icon: UploadCloud, rolesAllowed: ['ADMIN', 'POLICY_MAKER'] },
            { name: 'Historical Log', href: '/dashboard/history', icon: History, rolesAllowed: ['ADMIN', 'POLICY_MAKER'] },
            { name: 'Saved Insights', href: '/dashboard/saved', icon: Bookmark, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
            { name: 'Reports & Exports', href: '/dashboard/reports', icon: FileDown, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
        ]
    },
    {
        group: "Administration",
        items: [
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, rolesAllowed: ['ADMIN', 'POLICY_MAKER', 'VIEWER'] },
            { name: 'Model Management', href: '/dashboard/models', icon: Cpu, rolesAllowed: ['ADMIN'] },
            { name: 'User Management', href: '/dashboard/users', icon: Users, rolesAllowed: ['ADMIN'] },
            { name: 'App Settings', href: '/dashboard/settings', icon: Settings, rolesAllowed: ['ADMIN'] },
        ]
    }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebarStore();
  const { role, setRole } = useAuthStore();
  
  const [width, setWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newWidth = Math.max(200, Math.min(800, e.clientX));
      setWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <aside 
      className={`h-screen bg-card/80 backdrop-blur-xl border-r border-border flex flex-col z-40 relative shadow-2xl flex-shrink-0 overflow-hidden ${
        isDragging ? '' : 'transition-all duration-300 ease-in-out'
      } ${isOpen ? 'opacity-100' : 'opacity-0 border-r-0'}`}
      style={{ width: isOpen ? `${width}px` : '0px' }}
    >
      
      {/* Brand Header REMOVED BY USER REQUEST */}

      {/* Main Scorllable Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
        {sidebarConfig.map((group, idx) => {
            // Pre-filter items user can't see to decide if we render the group title
            const visibleItems = group.items.filter(item => item.rolesAllowed.includes(role));
            if (visibleItems.length === 0) return null;

            return (
                <div key={idx} className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">{group.group}</p>
                    
                    {visibleItems.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                            key={link.name} 
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'bg-transparent text-primary font-semibold shadow-[inset_0_0_15px_rgba(234,179,8,0.1)] border border-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'}`}
                            >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary/70'}`} />
                            <span className="text-sm truncate">{link.name}</span>
                            
                            {/* Visual specific badges for sass feel */}
                            {link.name === 'Notifications' && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            )}
                            </Link>
                        );
                    })}
                </div>
            )
        })}
      </div>

      {/* Role Debugger Overlay (Only rendered because we don't have true auth hooked up) */}
      <div className="p-4 border-t border-border bg-black/40">
        <label htmlFor="role-simulation-select" className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block tracking-widest pl-1 flex items-center justify-between">
            Active Role Simulation
            <UserCircle2 size={12} className="text-primary" />
        </label>
        <select 
            id="role-simulation-select"
            name="role-simulation-select"
            value={role} 
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full bg-card/60 border border-white/10 text-white text-xs rounded-lg px-3 py-2 mb-4 outline-none focus:border-primary shadow-inner custom-select"
        >
            <option value="ADMIN">🚀 Global Admin</option>
            <option value="POLICY_MAKER">🏛️ Policy Maker</option>
            <option value="VIEWER">👁️ Limited Viewer</option>
        </select>

        <Link 
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold tracking-wide">Secure Logout</span>
        </Link>
      </div>
      {/* Resize Handle */}
      {isOpen && (
        <div 
          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/50 transition-colors z-50 flex items-center justify-center group"
          onMouseDown={() => {
            isDraggingRef.current = true;
            setIsDragging(true);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        >
          <div className="h-8 w-1 bg-white/20 rounded-full group-hover:bg-white" />
        </div>
      )}
    </aside>
  );
}
