import React from "react";
import { useStore } from "../services/store";
import { 
  Award, Trophy, Medal, Star, ShieldCheck, Sparkles, 
  TrendingUp, Users, Zap, CheckCircle2, Crown, Gift 
} from "lucide-react";
import confetti from "canvas-confetti";

export const LeaderboardScreen: React.FC = () => {
  const { users, currentUser, actions } = useStore();

  // Sort citizens by points
  const sortedCitizens = [...users]
    .filter(u => u.role === "citizen")
    .sort((a, b) => b.heroPoints - a.heroPoints);

  const top3 = sortedCitizens.slice(0, 3);
  const others = sortedCitizens.slice(3);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Gamified Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Downtown Civic League Season 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Citizen Hero Leaderboard</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Active citizens reporting potholes and verifying maintenance hazards earn city rank recognition, Hero Badges, and neighborhood impact awards.
            </p>
          </div>

          <button
            onClick={() => {
              triggerConfetti();
              alert("Daily Civic Login Bonus Claimed! (+10 Hero Points added to your profile)");
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold px-5 py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-xs shrink-0 active:scale-95 self-start sm:self-auto"
          >
            <Gift className="w-4 h-4 animate-bounce" />
            <span>Claim Daily Civic Bonus</span>
          </button>
        </div>

        {/* Scoring Guide Pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono text-[11px] border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-blue-400 font-bold">+20 Pts</span>
            <span className="text-slate-400 block text-[9px] uppercase mt-0.5">Per Issue Logged</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-green-400 font-bold">+5 Pts</span>
            <span className="text-slate-400 block text-[9px] uppercase mt-0.5">Per Verification Vote</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold">+50 Pts</span>
            <span className="text-slate-400 block text-[9px] uppercase mt-0.5">SLA Fix Confirmed</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">🏆 Hall of Champions (Top 3)</h2>
          <p className="text-xs text-slate-500">Leading neighborhood advocates this month</p>
        </div>

        <div className="flex items-end justify-center gap-2 sm:gap-6 pt-4 px-2 max-w-xl mx-auto">
          
          {/* RANK #2 (Silver) */}
          {top3[1] && (
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <img src={top3[1].avatar} alt={top3[1].name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-4 border-slate-300 shadow-md" />
                <span className="absolute -bottom-2.5 inset-x-0 mx-auto w-6 h-6 rounded-full bg-slate-400 text-white font-bold text-xs flex items-center justify-center shadow">2</span>
              </div>
              <p className="font-bold text-xs text-slate-900 text-center truncate w-full mt-2">{top3[1].name}</p>
              <p className="text-[10px] font-mono font-bold text-slate-500">{top3[1].heroPoints} pts</p>
              
              <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl h-24 sm:h-28 mt-3 flex items-center justify-center border border-slate-300/80">
                <Medal className="w-8 h-8 text-slate-400 opacity-60" />
              </div>
            </div>
          )}

          {/* RANK #1 (Gold) */}
          {top3[0] && (
            <div className="flex-1 flex flex-col items-center -mt-8">
              <Crown className="w-7 h-7 text-amber-500 animate-bounce mb-1" />
              <div className="relative mb-2">
                <img src={top3[0].avatar} alt={top3[0].name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-amber-400 shadow-xl" />
                <span className="absolute -bottom-2.5 inset-x-0 mx-auto w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-lg">1</span>
              </div>
              <p className="font-extrabold text-sm text-slate-900 text-center truncate w-full mt-2">{top3[0].name}</p>
              <p className="text-xs font-mono font-extrabold text-amber-600">{top3[0].heroPoints} pts</p>

              <div className="w-full bg-gradient-to-t from-amber-200 via-amber-100 to-yellow-50 rounded-t-2xl h-36 sm:h-40 mt-3 flex flex-col items-center justify-center border border-amber-300 shadow-inner">
                <Trophy className="w-10 h-10 text-amber-500" />
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase mt-1">Civic MVP</span>
              </div>
            </div>
          )}

          {/* RANK #3 (Bronze) */}
          {top3[2] && (
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <img src={top3[2].avatar} alt={top3[2].name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-4 border-amber-700 shadow-md" />
                <span className="absolute -bottom-2.5 inset-x-0 mx-auto w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow">3</span>
              </div>
              <p className="font-bold text-xs text-slate-900 text-center truncate w-full mt-2">{top3[2].name}</p>
              <p className="text-[10px] font-mono font-bold text-slate-500">{top3[2].heroPoints} pts</p>

              <div className="w-full bg-gradient-to-t from-amber-100 to-orange-50 rounded-t-2xl h-20 sm:h-24 mt-3 flex items-center justify-center border border-amber-200">
                <Medal className="w-7 h-7 text-amber-700 opacity-60" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Ranks 4+ List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-900">Neighborhood Advocate Rankings</h3>
          <span className="text-xs font-mono text-slate-500">{sortedCitizens.length} Active Citizens</span>
        </div>

        <div className="divide-y divide-slate-100">
          {others.map((cit, idx) => {
            const rank = idx + 4;
            const isMe = currentUser?.id === cit.id;

            return (
              <div 
                key={cit.id}
                className={`p-4 sm:p-5 flex items-center justify-between transition ${
                  isMe ? "bg-blue-50/80 border-l-4 border-blue-600" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <span className="font-mono font-bold text-sm text-slate-400 w-6 text-center shrink-0">
                    #{rank}
                  </span>
                  <img src={cit.avatar} alt={cit.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-bold text-xs sm:text-sm truncate ${isMe ? "text-blue-700 font-extrabold" : "text-slate-900"}`}>
                        {cit.name} {isMe && "(You)"}
                      </p>
                    </div>
                    
                    {/* Badges pills */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cit.badges.map((bdg, bi) => (
                        <span key={bi} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                          🛡️ {bdg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <p className="font-mono font-extrabold text-sm sm:text-base text-slate-900">{cit.heroPoints}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Hero Pts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current User Fixed Sticky Highlight (If logged in as citizen) */}
      {currentUser && currentUser.role === "citizen" && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-blue-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-extrabold font-mono text-lg shadow-md">
              <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold">Your Neighborhood Status</span>
              <h4 className="font-bold text-base">{currentUser.name}</h4>
              <p className="text-xs text-slate-300 mt-0.5">Badges unlocked: {currentUser.badges.join(", ")}</p>
            </div>
          </div>

          <div className="text-right bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Balance</span>
            <span className="text-xl font-mono font-extrabold text-amber-400">{currentUser.heroPoints} Pts</span>
          </div>
        </div>
      )}

    </div>
  );
};
