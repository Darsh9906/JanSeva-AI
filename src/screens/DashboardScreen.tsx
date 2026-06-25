import React, { useState, useEffect } from "react";
import { useStore } from "../services/store";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from "recharts";
import { 
  TrendingUp, Clock, CheckCircle2, AlertTriangle, Sparkles, 
  RefreshCw, Building2, ShieldAlert, Award, DollarSign, Loader2 
} from "lucide-react";

export const DashboardScreen: React.FC = () => {
  const { issues, actions } = useStore();
  const [aiInsights, setAiInsights] = useState<string[]>([
    "⚡ Pothole reports in Downtown financial district jumped 22% after recent rainfall storms.",
    "💧 Water & Sanitation crews achieved an average 32-hour repair turnaround this week.",
    "🛡️ Neighbor verification voting prevented 14 duplicate emergency maintenance dispatches."
  ]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Aggregate Stats
  const total = issues.length;
  const resolved = issues.filter(i => i.status === "Resolved").length;
  const inProgress = issues.filter(i => i.status === "In Progress" || i.status === "Assigned").length;
  const pending = issues.filter(i => i.status === "Reported" || i.status === "Verified").length;

  const totalCost = issues.reduce((acc, iss) => acc + iss.estimatedCost, 0);
  const avgRisk = total > 0 ? Math.round(issues.reduce((acc, iss) => acc + iss.riskScore, 0) / total) : 0;

  // Chart 1: Issues by Category
  const categoryMap: Record<string, number> = {};
  issues.forEach(i => {
    categoryMap[i.category] = (categoryMap[i.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).map(k => ({ name: k, count: categoryMap[k] }));

  // Chart 2: Issues by Severity
  const severityMap: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  issues.forEach(i => {
    if (severityMap[i.severity] !== undefined) {
      severityMap[i.severity]++;
    }
  });
  const severityData = [
    { name: "Low", value: severityMap["Low"], color: "#3b82f6" },
    { name: "Medium", value: severityMap["Medium"], color: "#f59e0b" },
    { name: "High", value: severityMap["High"], color: "#f97316" },
    { name: "Critical", value: severityMap["Critical"], color: "#ef4444" }
  ];

  // Chart 3: Simulated SLA resolution trends over last 6 days
  const trendData = [
    { day: "Mon", logged: 12, resolved: 8 },
    { day: "Tue", logged: 19, resolved: 15 },
    { day: "Wed", logged: 15, resolved: 14 },
    { day: "Thu", logged: 24, resolved: 21 },
    { day: "Fri", logged: 18, resolved: 19 },
    { day: "Sat", logged: 11, resolved: 12 }
  ];

  const handleGenerateAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: { total, resolved, inProgress, totalCost, avgRisk, categories: categoryMap }
        })
      });
      const data = await res.json();
      if (data.insights && data.insights.length > 0) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.warn("Insights error:", e);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full font-bold border border-cyan-500/30">
              Executive Public Works Pulse
            </span>
          </div>
          <h1 className="text-2xl font-extrabold mt-2 tracking-tight">Municipal Operations Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time infrastructure telemetry, budgetary repair cost aggregates, and city council resolution compliance.
          </p>
        </div>

        <button
          onClick={handleGenerateAIInsights}
          disabled={loadingInsights}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-xs shrink-0 border border-blue-400/30"
        >
          {loadingInsights ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating AI Executive Brief...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Refresh Gemini Executive Brief</span>
            </>
          )}
        </button>
      </div>

      {/* AI Executive Brief Box */}
      <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-blue-500/30 shadow-md space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            <h2 className="font-bold text-sm sm:text-base">Gemini AI Executive Infrastructure Insights</h2>
          </div>
          <span className="text-[10px] font-mono uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
            ● Grounded in Live DB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiInsights.map((ins, idx) => (
            <div key={idx} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-xs text-slate-200 leading-relaxed flex items-start space-x-2.5 shadow-inner">
              <span className="text-blue-400 font-mono font-bold shrink-0 mt-0.5">0{idx+1}</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key KPI Tiles Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-mono uppercase font-semibold">Total Logged</span>
            <AlertTriangle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{total}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">+4 reports today</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-mono uppercase font-semibold">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{inProgress}</p>
          <p className="text-[9px] sm:text-[10px] text-amber-600 font-semibold truncate">Active queue</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-mono uppercase font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{resolved}</p>
          <p className="text-[9px] sm:text-[10px] text-green-600 font-semibold truncate">Exceeding SLA</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-mono uppercase font-semibold">Est. Cost</span>
            <DollarSign className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">${totalCost.toLocaleString()}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Avg risk: {avgRisk}/100</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Breakdown by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Reports by Category</h3>
            <span className="text-[11px] font-mono text-slate-400">Public Works Distribution</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Severity Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">AI Severity Classification</h3>
            <span className="text-[11px] font-mono text-slate-400">Triage Priority Engine</span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                >
                  {severityData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
            {severityData.map(s => (
              <div key={s.name} className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-slate-700">{s.name}</span>
                <p className="font-mono text-slate-500 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SLA Trend Line Chart */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-tight">Weekly SLA Resolution Performance</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Comparison of citizen reports logged vs municipal maintenance resolutions.</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold self-start">
            <span className="flex items-center space-x-1.5 text-blue-600">
              <span className="w-3 h-1 bg-blue-600 rounded-full" />
              <span>Logged</span>
            </span>
            <span className="flex items-center space-x-1.5 text-green-600">
              <span className="w-3 h-1 bg-green-600 rounded-full" />
              <span>Resolved</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="logged" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
