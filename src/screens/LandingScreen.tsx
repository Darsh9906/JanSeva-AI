import React from "react";
import { useStore } from "../services/store";
import { 
  PlusCircle, MapPin, CheckCircle2, AlertTriangle, 
  ArrowRight, Users, TrendingUp, ChevronRight 
} from "lucide-react";

export const LandingScreen: React.FC = () => {
  const { issues, currentUser, actions } = useStore();

  const totalReports = issues.length;
  const verifiedReports = issues.filter(i => i.verificationStatus === "Verified" || i.verificationStatus === "Likely Verified").length;
  const resolvedIssues = issues.filter(i => i.status === "Resolved").length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedIssues / totalReports) * 100) : 100;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Mobile-Friendly Hero Section */}
      <div className="bg-[#111216] text-white p-5 rounded-3xl border border-[#222634] shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF5A00]/20 rounded-full blur-2xl pointer-events-none" />
        <h1 className="text-2xl font-display font-extrabold uppercase leading-tight mb-2">
          Report Hazards.<br/>
          <span className="text-[#FF5A00]">Improve Your City.</span>
        </h1>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Snap potholes, water leaks, and safety hazards. Community verification accelerates municipal response.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => actions.setActiveScreen("report")}
            className="flex items-center justify-center space-x-2 bg-[#FF5A00] hover:bg-[#ff7021] text-[#111216] font-bold py-3 rounded-2xl shadow-sm transition active:scale-95 text-xs uppercase"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report</span>
          </button>
          <button
            onClick={() => actions.setActiveScreen("map")}
            className="flex items-center justify-center space-x-2 bg-[#222634] hover:bg-[#2b3042] text-white font-bold py-3 rounded-2xl border border-[#3d445e] transition text-xs uppercase"
          >
            <MapPin className="w-4 h-4 text-[#c5ff00]" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Compact Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-slate-100 text-[#FF5A00] rounded-xl"><AlertTriangle className="w-4 h-4" /></div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-500 font-bold">Logged</p>
            <p className="text-lg font-display font-extrabold">{totalReports}</p>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-slate-100 text-[#c5ff00] rounded-xl"><Users className="w-4 h-4" /></div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-500 font-bold">Verified</p>
            <p className="text-lg font-display font-extrabold">{verifiedReports}</p>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-slate-100 text-green-500 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-500 font-bold">Resolved</p>
            <p className="text-lg font-display font-extrabold">{resolvedIssues}</p>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-slate-100 text-blue-500 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-500 font-bold">Fix Rate</p>
            <p className="text-lg font-display font-extrabold">{resolutionRate}%</p>
          </div>
        </div>
      </div>

      {/* Role Navigation */}
      <div className="space-y-3">
        {currentUser && (currentUser.role === "officer" || currentUser.role === "admin") && (
          <button 
            onClick={() => actions.setActiveScreen("operations")}
            className="w-full bg-[#111216] text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#FF5A00] rounded-lg text-black"><AlertTriangle className="w-4 h-4" /></div>
              <div className="text-left">
                <span className="block font-bold text-sm">Staff Console</span>
                <span className="block text-xs text-slate-400">View triage queue</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
        )}
        
        <button 
          onClick={() => actions.setActiveScreen("dashboard")}
          className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg text-[#c5ff00]"><TrendingUp className="w-4 h-4 text-black" /></div>
            <div className="text-left">
              <span className="block font-bold text-sm">City Insights</span>
              <span className="block text-xs text-slate-500">Live analytics</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Quick Feed */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">Recent Alerts</h2>
          <button onClick={() => actions.setActiveScreen("feed")} className="text-xs text-[#FF5A00] font-bold flex items-center">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
        
        <div className="space-y-3">
          {issues.slice(0, 3).map(iss => (
            <div
              key={iss.id}
              onClick={() => actions.setActiveScreen("detail", iss.id)}
              className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex space-x-3 active:scale-95 transition"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img src={iss.imageUrl} alt={iss.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="font-bold text-sm leading-tight line-clamp-2">{iss.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">📍 {iss.address}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg ${
                    iss.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {iss.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{iss.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
