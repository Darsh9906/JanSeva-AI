import React from "react";
import { useStore } from "../services/store";
import { 
  Search, Filter, MapPin, ThumbsUp, CheckCircle2, 
  Clock, PlusCircle, Sparkles, AlertCircle, MessageSquare, Radio, Zap 
} from "lucide-react";

export const FeedScreen: React.FC = () => {
  const { issues, searchQuery, filterCategory, filterStatus, actions } = useStore();

  const categories: string[] = [
    "All", "Pothole", "Water Leakage", "Streetlight", 
    "Waste Management", "Road Damage", "Drainage", "Public Safety"
  ];

  const statuses: string[] = ["All", "Reported", "Verified", "Assigned", "In Progress", "Resolved"];

  const filteredIssues = issues.filter(iss => {
    const matchesSearch = iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          iss.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          iss.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "All" || iss.category === filterCategory;
    const matchesStatus = filterStatus === "All" || iss.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Feed Command Deck */}
      <div className="bg-[#111216] p-5 rounded-3xl border-4 border-[#111216] shadow-[6px_6px_0px_#FF5A00] text-white space-y-5">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF5A00] animate-pulse" />
              <span className="text-[10px] font-mono font-extrabold text-[#c5ff00] uppercase tracking-widest">DISPATCH QUEUE FEED</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-white mt-1 uppercase tracking-tight">COMMUNITY TRIAGE</h1>
            <p className="text-xs font-sans text-slate-300 mt-1 font-medium">
              Live municipal hazard logs. Upvote alerts to accelerate city SLA dispatches.
            </p>
          </div>

          <button
            onClick={() => actions.setActiveScreen("report")}
            className="w-full flex items-center justify-center space-x-2 bg-[#FF5A00] hover:bg-[#ff7021] text-[#111216] font-display font-extrabold px-5 py-3.5 rounded-2xl text-xs shadow-[3px_3px_0px_#c5ff00] transition active:scale-95 uppercase tracking-wider min-h-[48px]"
          >
            <PlusCircle className="w-4 h-4 stroke-[3px]" />
            <span>FILE NEW ALERT</span>
          </button>
        </div>

        {/* Search Bar Rig */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => actions.setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full bg-[#1c1f2b] border-2 border-[#333a52] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-[#FF5A00] transition font-mono font-bold"
          />
        </div>

        {/* Category Pills Rig */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-[#FF5A00] font-bold tracking-widest">
            <Filter className="w-3 h-3" />
            <span>CATEGORY TAGS</span>
          </div>
          <div className="flex overflow-x-auto space-x-2 pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => actions.setFilterCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition border-2 shrink-0 min-h-[38px] ${
                  filterCategory === cat
                    ? "bg-[#FF5A00] text-[#111216] border-[#FF5A00] shadow-[2px_2px_0px_#c5ff00]"
                    : "bg-[#202330] text-slate-300 border-[#33394d] hover:border-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Rig */}
        <div className="flex overflow-x-auto space-x-2 pt-2 border-t-2 border-[#262a3a] items-center no-scrollbar">
          <span className="text-[10px] font-mono uppercase text-[#c5ff00] font-extrabold pr-1 shrink-0 tracking-wider">STAGE:</span>
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => actions.setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-extrabold whitespace-nowrap transition border shrink-0 min-h-[34px] ${
                filterStatus === st
                  ? "bg-[#c5ff00] text-[#111216] border-[#c5ff00]"
                  : "bg-[#161822] text-slate-400 border-[#2b3042] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Matrix Grid */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-[#111216] shadow-[4px_4px_0px_#111216] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#111216] text-[#FF5A00] mx-auto flex items-center justify-center shadow">
            <AlertCircle className="w-8 h-8 stroke-[2.5px]" />
          </div>
          <h3 className="text-lg font-display font-extrabold text-[#111216] uppercase">NO MATCHING ALERTS</h3>
          <p className="text-xs font-sans text-slate-600 font-medium">
            No maintenance records match your active tag or search filters.
          </p>
          <button
            onClick={() => { actions.setSearchQuery(""); actions.setFilterCategory("All"); actions.setFilterStatus("All"); }}
            className="text-xs font-mono font-extrabold text-[#FF5A00] underline uppercase mt-2 inline-block p-2"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredIssues.map(iss => (
            <div
              key={iss.id}
              onClick={() => actions.setActiveScreen("detail", iss.id)}
              className="bg-white rounded-3xl border-2 border-[#111216] overflow-hidden shadow-[4px_4px_0px_#111216] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111216] cursor-pointer transition flex flex-col group relative"
            >
              {/* Media Thumb */}
              <div className="h-48 bg-slate-900 relative overflow-hidden border-b-2 border-[#111216]">
                <img 
                  src={iss.imageUrl} 
                  alt={iss.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                />
                
                <div className="absolute top-3 left-3 flex items-center space-x-1.5 pointer-events-none">
                  <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg uppercase shadow border border-black/20 ${
                    iss.severity === "Critical" ? "bg-red-600 text-white animate-pulse" :
                    iss.severity === "High" ? "bg-[#FF5A00] text-white" :
                    iss.severity === "Medium" ? "bg-amber-400 text-slate-950" : "bg-blue-600 text-white"
                  }`}>
                    {iss.severity} RISK
                  </span>
                  <span className="bg-[#111216]/90 backdrop-blur-md text-[#c5ff00] font-mono text-[10px] px-2.5 py-1 rounded-lg border border-white/10 font-bold uppercase">
                    {iss.category}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 pointer-events-none">
                  <span className={`text-[10px] font-mono font-extrabold px-3 py-1 rounded-xl shadow-lg border border-black/20 uppercase flex items-center space-x-1.5 ${
                    iss.status === "Resolved" ? "bg-green-500 text-slate-950 font-black" :
                    iss.status === "In Progress" ? "bg-blue-600 text-white" :
                    iss.status === "Assigned" ? "bg-purple-600 text-white" : "bg-[#111216] text-white"
                  }`}>
                    {iss.status === "Resolved" && <CheckCircle2 className="w-3 h-3 stroke-[3px]" />}
                    {iss.status === "In Progress" && <Clock className="w-3 h-3 animate-spin stroke-[2.5px]" />}
                    <span>{iss.status}</span>
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#111216] group-hover:text-[#FF5A00] transition line-clamp-1 uppercase tracking-tight">
                    {iss.title}
                  </h3>
                  <p className="text-xs font-sans text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                    {iss.description}
                  </p>
                </div>

                {/* AI / Dept Metadata */}
                <div className="bg-[#F4F4EE] rounded-2xl p-3 border-2 border-[#111216] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-800 truncate font-bold">
                    <Zap className="w-4 h-4 text-[#FF5A00] shrink-0 fill-current" />
                    <span className="truncate uppercase font-mono text-[11px]">{iss.department.split("-")[0]}</span>
                  </div>
                  <span className="font-mono font-extrabold text-[#111216] shrink-0 bg-[#c5ff00] px-2 py-0.5 rounded border border-[#111216]">
                    EST. ₹{iss.estimatedCost}
                  </span>
                </div>

                {/* Footer Metrics */}
                <div className="pt-2.5 border-t-2 border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                  <div className="flex items-center space-x-1 truncate max-w-[130px]">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FF5A00]" />
                    <span className="truncate">{iss.address.split(",")[0]}</span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 text-slate-800">
                    <span className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 text-blue-700">
                      <ThumbsUp className="w-3 h-3 stroke-[2.5px]" />
                      <span>{iss.confirmCount + iss.upvoteCount}</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                      <MessageSquare className="w-3 h-3" />
                      <span>{iss.commentCount}</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
