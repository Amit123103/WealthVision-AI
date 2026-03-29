"use client";

import { Users, Shield, UserPlus, MoreHorizontal } from 'lucide-react';

export default function UserManagement() {
  return (
    <div className="p-8 w-full max-w-6xl mx-auto min-h-[calc(100vh-73px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">User <span className="font-bold text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm max-w-2xl">Administer platform access controls, assign role hierarchies, and audit user activity signatures.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors">
          <UserPlus size={16} /> Invite User
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 bg-black/40 border-b border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <span>User</span> <span>Email</span> <span>Role</span> <span>Status</span> <span className="text-right">Actions</span>
        </div>
        {[
          { name: 'Admin User', email: 'admin@geowealth.ai', role: 'ADMIN', status: 'Active', avatar: 'AU' },
          { name: 'Policy Analyst', email: 'analyst@gov.in', role: 'POLICY_MAKER', status: 'Active', avatar: 'PA' },
          { name: 'Data Viewer', email: 'viewer@ngos.org', role: 'VIEWER', status: 'Invited', avatar: 'DV' },
        ].map((user, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-4 p-4 items-center border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{user.avatar}</div>
              <span className="text-sm text-white font-medium">{user.name}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded w-fit ${
              user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' : user.role === 'POLICY_MAKER' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/40'
            }`}>{user.role.replace('_', ' ')}</span>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${user.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} /> {user.status}
            </span>
            <div className="flex justify-end">
              <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white/40 hover:text-white"><MoreHorizontal size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
