import React, { useState } from "react";
import { useStore } from "../services/store";
import { logout } from "../services/firebase";
import { MunicipalDepartment } from "../types";
import { 
  ShieldAlert, Smartphone, Monitor, UserCheck, Shield, Award, 
  LogOut, LogIn, ChevronDown, RefreshCw, KeyRound, Radio, Sparkles 
} from "lucide-react";

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenStaffUnlock: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenStaffUnlock }) => {
  const { currentUser, viewMode, actions } = useStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const depts: MunicipalDepartment[] = [
    "Public Works - Roads", "Water & Sanitation", "Electrical Dept", 
    "Waste Management", "Public Safety", "Parks & Rec"
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d10] text-[#f1f5f9] border-b-2 border-[#262933] shadow-2xl">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <div 
          onClick={() => actions.setActiveScreen("landing")}
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group active:scale-95 transition"
        >
          <div className="relative bg-[#FF5A00] p-1.5 sm:p-2 rounded-xl text-[#0c0d10] shadow-[0_0_15px_rgba(255,90,0,0.4)] border-2 border-[#FF5A00] group-hover:rotate-6 transition transform">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#c5ff00] rounded-full border-2 border-[#0c0d10] animate-ping" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-display font-extrabold text-base sm:text-lg tracking-wider text-white">
                JanSeva.AI
              </span>
            </div>
          </div>
        </div>

        {/* Right Rig: Staff Mode & Role Selector */}
        <div className="flex items-center space-x-2">
          
          {(!currentUser || currentUser.role === "anonymous" || currentUser.role === "citizen") && (
            <button
              onClick={onOpenStaffUnlock}
              title="Staff Code Unlock"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#c5ff00]/10 text-[#c5ff00] border-2 border-[#c5ff00]/30 hover:bg-[#c5ff00]/20 text-xs transition font-mono font-bold uppercase active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff Code</span>
            </button>
          )}

          {/* Role Pill Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#191c24] hover:bg-[#222630] border-2 border-[#333846] text-xs transition min-h-[44px]"
            >
              {currentUser ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-7 h-7 rounded-lg object-cover border-2 border-[#FF5A00]" 
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#2b303c] font-mono font-bold text-[#FF5A00] flex items-center justify-center text-xs border border-[#444a5b]">?</div>
              )}
              <div className="text-left hidden sm:block">
                <p className="font-bold text-xs leading-none text-white max-w-[110px] truncate font-sans">
                  {currentUser?.name || "Anonymous Guest"}
                </p>
                <p className="text-[10px] text-[#c5ff00] font-mono font-bold tracking-wider mt-1 uppercase">
                  {currentUser?.role || "GUEST"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#14161c] rounded-2xl shadow-2xl border-2 border-[#2b303c] p-2 text-slate-200 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#2b303c] text-[10px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest flex items-center justify-between">
                  <span>Persona Rig Triage</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                
                <button
                  onClick={() => { actions.switchRole("citizen"); setRoleMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs hover:bg-[#20232d] transition text-left ${
                    currentUser?.role === "citizen" ? "bg-[#FF5A00]/15 border border-[#FF5A00] text-white font-bold" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="w-4 h-4 text-[#FF5A00]" />
                    <div>
                      <span className="block font-bold text-white">Citizen (Elena)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Neighborhood Reporter</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-extrabold text-[#c5ff00]">340 PTS</span>
                </button>

                <button
                  onClick={() => { actions.switchRole("officer", "Public Works - Roads"); setRoleMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs hover:bg-[#20232d] transition text-left ${
                    currentUser?.role === "officer" ? "bg-[#c5ff00]/15 border border-[#c5ff00] text-white font-bold" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-4 h-4 text-[#c5ff00]" />
                    <div>
                      <span className="block font-bold text-white">Officer (Roads Dept)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Field Expediter</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#c5ff00]/20 px-2 py-0.5 rounded font-mono text-[#c5ff00] font-bold">STAFF</span>
                </button>

                <button
                  onClick={() => { actions.switchRole("admin", "Public Works - Roads"); setRoleMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs hover:bg-[#20232d] transition text-left ${
                    currentUser?.role === "admin" ? "bg-purple-500/20 border border-purple-500 text-white font-bold" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="block font-bold text-white">Admin (Director)</span>
                      <span className="text-[10px] text-slate-400 font-mono">System Commander</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-500/30 px-2 py-0.5 rounded font-mono text-purple-200 font-bold">ROOT</span>
                </button>

                <button
                  onClick={async () => { 
                    try { await logout(); } catch(e) { console.error(e); } 
                    actions.setCurrentUser(null); 
                    setRoleMenuOpen(false); 
                  }}
                  className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs text-slate-400 hover:bg-[#20232d] hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-mono">Sign Out</span>
                </button>

                {(currentUser?.role === "officer" || currentUser?.role === "admin") && (
                  <div className="pt-2 border-t border-[#2b303c] px-2">
                    <p className="text-[10px] font-mono uppercase text-[#c5ff00] font-bold mb-1">Active Jurisdiction</p>
                    <select
                      value={currentUser.department || depts[0]}
                      onChange={(e) => actions.switchRole(currentUser.role, e.target.value as any)}
                      className="w-full bg-[#0c0d10] border-2 border-[#2b303c] rounded-xl text-xs p-2 text-white font-bold outline-none focus:border-[#FF5A00]"
                    >
                      {depts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-2 border-t border-[#2b303c] px-2 flex items-center justify-between">
                  <button
                    onClick={() => { actions.resetDemoData(); setRoleMenuOpen(false); }}
                    className="text-[11px] font-mono flex items-center space-x-1 text-slate-400 hover:text-red-400 transition p-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Purge Storage</span>
                  </button>
                  <button
                    onClick={() => { onOpenAuth(); setRoleMenuOpen(false); }}
                    className="text-[11px] font-mono font-bold text-[#FF5A00] hover:underline p-1"
                  >
                    OAuth Cloud
                  </button>
                </div>

              </div>
            )}
          </div>

          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FF5A00] hover:bg-[#ff7a33] text-[#0c0d10] text-xs font-extrabold shadow-lg transition min-h-[44px]"
            >
              <LogIn className="w-4 h-4 stroke-[2.5px]" />
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
