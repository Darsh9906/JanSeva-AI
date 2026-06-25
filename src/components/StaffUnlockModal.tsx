import React, { useState } from "react";
import { useStore } from "../services/store";
import { MunicipalDepartment } from "../types";
import { X, ShieldCheck, Lock, KeyRound, AlertCircle } from "lucide-react";

interface StaffUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffUnlockModal: React.FC<StaffUnlockModalProps> = ({ isOpen, onClose }) => {
  const { actions } = useStore();
  const [code, setCode] = useState("CIVIC2026");
  const [role, setRole] = useState<"officer" | "admin">("officer");
  const [department, setDepartment] = useState<MunicipalDepartment>("Public Works - Roads");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const depts: MunicipalDepartment[] = [
    "Public Works - Roads",
    "Water & Sanitation",
    "Electrical Dept",
    "Waste Management",
    "Public Safety",
    "Parks & Rec"
  ];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() !== "CIVIC2026" && code.trim().toUpperCase() !== "JANSEVA") {
      setError("Invalid staff access passphrase. Demo passphrases: CIVIC2026 or JANSEVA.");
      return;
    }
    actions.switchRole(role, department);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleUnlock} className="space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <KeyRound className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Staff Console Unlock</h3>
            <p className="text-xs text-slate-400">
              Enter municipal operations passphrase to access triage queues and status overrides.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Access Passphrase</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(""); }}
                  placeholder="Enter CIVIC2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-amber-300 tracking-widest outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Staff Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("officer")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                    role === "officer"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  Municipal Officer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                    role === "admin"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  City Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Assigned Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as MunicipalDepartment)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
              >
                {depts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Staff Console</span>
          </button>
        </form>

      </div>
    </div>
  );
};
