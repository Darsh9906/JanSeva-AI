import React, { useState } from "react";
import { useStore } from "../services/store";
import { IssueStatus, MunicipalDepartment, Issue } from "../types";
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, UserCheck, 
  ArrowRight, Filter, Search, Sparkles, Wrench, Upload, Camera, 
  MessageSquare, FileText, Check, ChevronDown 
} from "lucide-react";
import confetti from "canvas-confetti";

export const OperationsScreen: React.FC = () => {
  const { issues, currentUser, actions } = useStore();
  const [deptFilter, setDeptFilter] = useState<string>(currentUser?.department || "All");
  const [statusFilter, setStatusFilter] = useState<string>("Active"); // Active vs All vs Resolved
  const [search, setSearch] = useState("");

  // Modal State for Resolving / Advancing
  const [activeModalIss, setActiveModalIss] = useState<Issue | null>(null);
  const [targetStatus, setTargetStatus] = useState<IssueStatus>("In Progress");
  const [resolutionNote, setResolutionNote] = useState("Crews dispatched. Asphalt patch leveled and compacted to municipal grade specs.");
  const [proofImg, setProofImg] = useState("https://images.unsplash.com/photo-1541888946425-d0fbb18f0317?w=800&auto=format&fit=crop&q=80");

  const depts: string[] = [
    "All",
    "Public Works - Roads",
    "Water & Sanitation",
    "Electrical Dept",
    "Waste Management",
    "Public Safety",
    "Parks & Rec"
  ];

  const officersList = [
    "Eng. Ramesh Kumar",
    "Insp. Priya Sharma",
    "Officer David Miller",
    "Field Lead Sanjay Patel",
    "Tech. Carlos Mendez"
  ];

  const filtered = issues.filter(iss => {
    const matchSearch = iss.title.toLowerCase().includes(search.toLowerCase()) ||
                        iss.address.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || iss.department === deptFilter;
    const matchStatus = statusFilter === "All" ? true :
                        statusFilter === "Active" ? iss.status !== "Resolved" : iss.status === "Resolved";
    return matchSearch && matchDept && matchStatus;
  });

  const handleOpenStatusModal = (iss: Issue) => {
    setActiveModalIss(iss);
    const nextSt: IssueStatus = iss.status === "Reported" ? "Verified" :
                                iss.status === "Verified" ? "Assigned" :
                                iss.status === "Assigned" ? "In Progress" : "Resolved";
    setTargetStatus(nextSt);
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalIss) return;

    actions.updateIssueStatus(activeModalIss.id, targetStatus, resolutionNote);
    
    if (targetStatus === "Resolved") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    }

    setActiveModalIss(null);
  };

  if (!currentUser || (currentUser.role !== "officer" && currentUser.role !== "admin")) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-12 text-center border border-slate-800 space-y-4 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Restricted Staff Console</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          This operations dashboard is strictly reserved for municipal maintenance leads and city administrators.
        </p>
        <button
          onClick={() => actions.setActiveScreen("landing")}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs transition shadow-lg inline-block"
        >
          Return to Public Portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Staff Ops Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold uppercase border border-amber-500/30">
              🛠️ Municipal Ops Dispatch Console
            </span>
            <span className="text-xs font-mono text-slate-400">({currentUser.role.toUpperCase()})</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-2 tracking-tight">Public Works Triage Queue</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <span className="text-white font-semibold">{currentUser.name}</span> • Assigned Dept: <span className="text-amber-300 font-mono">{currentUser.department}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setStatusFilter("Active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              statusFilter === "Active" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Active Triage ({issues.filter(i => i.status !== "Resolved").length})
          </button>
          <button
            onClick={() => setStatusFilter("Resolved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              statusFilter === "Resolved" ? "bg-green-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Resolved ({issues.filter(i => i.status === "Resolved").length})
          </button>
          <button
            onClick={() => setStatusFilter("All")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              statusFilter === "All" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dispatch records by street address or title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:border-amber-500 text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto shrink-0 pb-1 sm:pb-0">
          <span className="text-slate-400 font-mono uppercase font-semibold shrink-0">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-900 text-white font-semibold rounded-xl px-3 py-2 outline-none border border-slate-800 shrink-0"
          >
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Triage Cards Table / Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm text-slate-500 text-xs">
            No maintenance dispatches matching current department & status filters.
          </div>
        ) : (
          filtered.map(iss => (
            <div 
              key={iss.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4 min-w-0 flex-1">
                <img src={iss.imageUrl} alt={iss.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-200 bg-slate-100" />
                
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono text-white ${
                      iss.severity === "Critical" ? "bg-red-600" :
                      iss.severity === "High" ? "bg-orange-500" :
                      iss.severity === "Medium" ? "bg-amber-500" : "bg-blue-600"
                    }`}>
                      {iss.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {iss.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">ID: {iss.id}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    {iss.title}
                  </h3>

                  <p className="text-xs text-slate-500 truncate">
                    📍 {iss.address} • Logged: {new Date(iss.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] pt-1">
                    <span className="font-mono text-slate-600 font-semibold">
                      💰 Budget Est: ₹{iss.estimatedCost}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-blue-600 font-semibold">
                      🛡️ Consensus: {iss.confirmCount + iss.upvoteCount} votes
                    </span>
                  </div>
                </div>
              </div>

              {/* Triage Actions Controls Column */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0 border-t md:border-0 border-slate-100 pt-3 md:pt-0">
                
                {/* Officer Assignment Dropdown */}
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={iss.assignedOfficerName || ""}
                    onChange={(e) => actions.assignOfficer(iss.id, e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full max-w-[150px]"
                  >
                    <option value="">Unassigned Crew</option>
                    {officersList.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {/* Status Pill / Advance Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => actions.setActiveScreen("detail", iss.id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => handleOpenStatusModal(iss)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1.5 ${
                      iss.status === "Resolved" ? "bg-green-100 text-green-800 border border-green-300" :
                      iss.status === "In Progress" ? "bg-blue-600 hover:bg-blue-500 text-white" :
                      iss.status === "Assigned" ? "bg-purple-600 hover:bg-purple-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    }`}
                  >
                    <span>Status: {iss.status}</span>
                    {iss.status !== "Resolved" && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Advance Modal */}
      {activeModalIss && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold uppercase">
                  Advance SLA Triage Stage
                </span>
                <h3 className="text-lg font-bold mt-1 truncate max-w-sm">{activeModalIss.title}</h3>
              </div>
              <button onClick={() => setActiveModalIss(null)} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-slate-400 mb-1">Target Municipal Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as IssueStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-300 outline-none"
                >
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress (Dispatching)</option>
                  <option value="Resolved">Resolved (Completed Repair)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-400 mb-1">Official Resolution / Dispatch Log</label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Enter official work log notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed outline-none focus:border-amber-500"
                />
              </div>

              {targetStatus === "Resolved" && (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-green-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-green-400 font-semibold">
                    <Camera className="w-4 h-4" />
                    <span>Upload Proof of Repair Photo</span>
                  </div>
                  <div className="h-28 rounded-xl bg-slate-900 border border-dashed border-slate-700 overflow-hidden relative flex items-center justify-center">
                    <img src={proofImg} alt="Proof" className="w-full h-full object-cover opacity-80" />
                    <span className="absolute bg-slate-900/90 text-white text-[10px] px-3 py-1 rounded-lg border border-white/20">
                      Sample Proof Uploaded ✓
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveModalIss(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold py-3 px-4 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Status Update</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
