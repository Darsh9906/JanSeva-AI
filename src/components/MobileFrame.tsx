import React from "react";
import { useStore } from "../services/store";
import { ActiveScreen } from "../types";
import { 
  Home, ListTodo, PlusCircle, MapPin, BarChart3, Trophy, 
  ShieldCheck, Bell, Zap 
} from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { activeScreen, currentUser, actions } = useStore();

  const navTabs: { id: ActiveScreen; label: string; icon: any; isSpecial?: boolean; requiresStaff?: boolean }[] = [
    { id: "landing", label: "Home", icon: Home },
    { id: "map", label: "Map", icon: MapPin },
    { id: "report", label: "Report", icon: PlusCircle, isSpecial: true },
    { id: "feed", label: "Issues", icon: ListTodo },
    { id: "leaderboard", label: "Profile", icon: Trophy },
  ];

  // Dispatch and Pulse are accessed from Home dashboard cards to save mobile dock space


  return (
    <div className="flex flex-col h-full bg-[#EAEAE2] text-[#111216] relative overflow-hidden font-sans w-full max-w-md mx-auto shadow-2xl border-x-2 border-[#111216]">
      {/* Mobile OS Top Navigation Header */}
      <div className="bg-[#111216] text-white px-5 py-4 flex items-center justify-between border-b-4 border-[#FF5A00] shadow-md z-30 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c5ff00] animate-ping" />
          <span className="font-display font-extrabold text-base tracking-wider uppercase text-white">
            {activeScreen === "feed" ? "TRIAGE QUEUE" : activeScreen === "map" ? "CIVIC MAP" : activeScreen === "landing" ? "PUBLIC PORTAL" : activeScreen}
          </span>
        </div>
        <div className="flex items-center space-x-2.5">
          {currentUser && (
            <div className="flex items-center space-x-1 bg-[#222533] px-2.5 py-1 rounded-xl border border-[#3b415a]">
              <Zap className="w-3 h-3 text-[#FF5A00] fill-current" />
              <span className="text-xs font-mono font-extrabold text-[#c5ff00]">{currentUser.heroPoints}</span>
            </div>
          )}
          <button className="p-1.5 rounded-xl bg-[#222533] text-slate-300 hover:text-white border border-[#3b415a]">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Screen Content Canvas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#EAEAE2] pb-28 px-4 pt-5 no-scrollbar">
        {children}
      </div>

      {/* Tactile Utilitarian Bottom Navigation Dock */}
      <div className="absolute bottom-4 left-4 right-4 bg-[#111216] rounded-3xl border-2 border-[#2b3042] px-2 py-2 flex items-center justify-around z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const active = activeScreen === tab.id;
          
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => actions.setActiveScreen(tab.id)}
                className="flex flex-col items-center justify-center -mt-10 group focus:outline-none min-h-[50px] shrink-0 z-50"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FF5A00] text-[#111216] flex items-center justify-center shadow-[0_8px_25px_rgba(255,90,0,0.6)] border-4 border-[#111216] group-active:scale-95 transition transform">
                  <PlusCircle className="w-7 h-7 stroke-[3px]" />
                </div>
                <span className="text-[10px] font-mono font-extrabold text-[#FF5A00] mt-1.5 uppercase tracking-wider">REPORT</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => actions.setActiveScreen(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition focus:outline-none min-h-[48px] ${
                active ? "bg-[#252b3d] text-[#c5ff00] font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px] text-[#c5ff00]" : "stroke-2"}`} />
              <span className="text-[9px] font-mono mt-1 font-bold uppercase truncate max-w-[60px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

