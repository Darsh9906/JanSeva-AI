import React, { useState } from "react";
import { useStore } from "../services/store";
import { 
  ArrowLeft, MapPin, ThumbsUp, ShieldCheck, CheckCircle2, 
  Clock, AlertTriangle, Sparkles, MessageSquare, Send, 
  Share2, Award, AlertCircle, Radio, Zap 
} from "lucide-react";

interface DetailScreenProps {
  issueId?: string;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({ issueId }) => {
  const { issues, comments, verifications, currentUser, selectedIssueId, actions } = useStore();
  const [commentText, setCommentText] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const activeId = issueId || selectedIssueId || issues[0]?.id;
  const issue = issues.find(i => i.id === activeId);

  if (!issue) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-4 border-[#111216] shadow-[8px_8px_0px_#111216] space-y-4 max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 rounded-2xl bg-[#111216] text-[#FF5A00] flex items-center justify-center mx-auto shadow">
          <AlertCircle className="w-8 h-8 stroke-[2.5px]" />
        </div>
        <h2 className="text-xl font-display font-extrabold text-[#111216] uppercase">ISSUE RECORD NOT FOUND</h2>
        <p className="text-xs font-sans text-slate-600 font-medium">The requested municipal defect log may have been archived or purged from live memory.</p>
        <button
          onClick={() => actions.setActiveScreen("feed")}
          className="bg-[#FF5A00] text-[#111216] font-display font-extrabold px-6 py-3.5 rounded-2xl text-xs uppercase shadow-[3px_3px_0px_#111216] border-2 border-[#111216] hover:bg-[#ff7021] transition active:scale-95 min-h-[44px]"
        >
          ← RETURN TO QUEUE
        </button>
      </div>
    );
  }

  const issueComments = comments.filter(c => c.issueId === issue.id);
  const userVote = currentUser ? verifications.find(v => v.issueId === issue.id && v.userId === currentUser.id) : null;

  const handleVote = (type: "confirm" | "upvote" | "reject") => {
    setFeedbackMsg(null);
    const res = actions.voteIssue(issue.id, type);
    if (res.error) {
      setFeedbackMsg({ text: res.error, isError: true });
    } else {
      setFeedbackMsg({ text: "Consensus vote recorded! (+5 Hero PTS earned)" });
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!commentText.trim()) return;

    const res = actions.addComment(issue.id, commentText);
    if (res.error) {
      setFeedbackMsg({ text: res.error, isError: true });
    } else {
      setCommentText("");
      setFeedbackMsg({ text: "Field comment logged! (+3 Hero PTS earned)" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Navigation Deck */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => actions.setActiveScreen("feed")}
          className="flex items-center space-x-2 text-xs font-mono font-extrabold text-[#111216] hover:text-[#FF5A00] transition bg-white px-4 py-2.5 rounded-2xl border-2 border-[#111216] shadow-[3px_3px_0px_#111216] uppercase min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          <span>BACK TO FEED</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-mono font-bold text-slate-400 bg-[#161822] px-3 py-1.5 rounded-xl border border-slate-800">
            LOG ID: {issue.id}
          </span>
          <button 
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                setFeedbackMsg({ text: "Evidentiary link copied to clipboard!" });
              }
            }}
            className="p-2.5 rounded-2xl bg-white border-2 border-[#111216] text-[#111216] hover:bg-[#c5ff00] shadow-[3px_3px_0px_#111216] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-between border-2 shadow-md animate-in fade-in ${
          feedbackMsg.isError ? "bg-red-950/40 text-red-300 border-red-600" : "bg-[#111216] text-[#c5ff00] border-[#c5ff00]"
        }`}>
          <span>⚡ {feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold px-2 text-white">✕</button>
        </div>
      )}

      {/* Main Evidentiary Chassis */}
      <div className="bg-white rounded-3xl border-4 border-[#111216] shadow-[8px_8px_0px_#111216] overflow-hidden flex flex-col">
        {/* Media Canvas */}
        <div className="h-64 bg-slate-900 relative border-b-4 border-[#111216]">
          <img 
            src={issue.imageUrl} 
            alt={issue.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-xl uppercase shadow border border-black/20 ${
              issue.severity === "Critical" ? "bg-red-600 text-white animate-pulse" :
              issue.severity === "High" ? "bg-[#FF5A00] text-white" :
              issue.severity === "Medium" ? "bg-amber-400 text-slate-950" : "bg-blue-600 text-white"
            }`}>
              {issue.severity} RISK
            </span>
            <span className="bg-[#111216]/90 backdrop-blur-md text-[#c5ff00] text-[10px] font-mono px-3 py-1 rounded-xl font-extrabold uppercase border border-white/10">
              {issue.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-[#111216]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white flex items-center justify-between text-xs font-mono font-bold">
            <span>👤 {issue.createdByName}</span>
            <span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Diagnostic Assessment Right Deck */}
        <div className="p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className={`text-xs font-mono font-extrabold px-3.5 py-1.5 rounded-xl uppercase flex items-center space-x-1.5 border-2 self-start ${
                issue.status === "Resolved" ? "bg-green-100 text-green-900 border-green-500" :
                issue.status === "In Progress" ? "bg-blue-100 text-blue-900 border-blue-500" : "bg-amber-100 text-amber-950 border-amber-500"
              }`}>
                {issue.status === "Resolved" && <CheckCircle2 className="w-4 h-4 stroke-[3px]" />}
                {issue.status === "In Progress" && <Clock className="w-4 h-4 animate-spin stroke-[2.5px]" />}
                <span>STAGE: {issue.status}</span>
              </span>

              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg uppercase font-black border self-start ${
                issue.verificationStatus === "Verified" ? "bg-[#c5ff00] text-[#111216] border-[#111216]" : "bg-[#111216] text-white border-slate-700"
              }`}>
                🛡️ {issue.verificationStatus}
              </span>
            </div>

            <h1 className="text-xl font-display font-extrabold text-[#111216] tracking-tight leading-snug uppercase">
              {issue.title}
            </h1>

            <p className="text-xs font-sans text-slate-700 leading-relaxed font-medium">
              {issue.description}
            </p>

            <div className="flex items-start space-x-2 text-xs text-slate-600 pt-1 font-mono font-bold bg-[#F4F4EE] p-3 rounded-2xl border-2 border-[#111216]">
              <MapPin className="w-4 h-4 text-[#FF5A00] shrink-0 mt-0.5" />
              <span>{issue.address}</span>
            </div>
          </div>

          {/* AI Telemetry Chassis */}
          <div className="bg-[#111216] text-white p-5 rounded-3xl space-y-3 border-2 border-[#111216] shadow">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-2">
              <span className="flex items-center space-x-1.5 text-[#c5ff00] font-bold font-mono text-[11px] uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-pulse text-[#FF5A00]" />
                <span>GEMINI VISION TRIAGE</span>
              </span>
              <span className="text-[10px] bg-[#252b3d] px-2.5 py-1 rounded-lg text-white font-mono font-extrabold self-start">
                {(issue.confidence * 100).toFixed(0)}% CONFIDENCE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
              <div className="bg-[#1c202e] p-2 rounded-xl border border-white/5">
                <p className="text-[8px] text-slate-400 uppercase font-bold">HAZARD SCORE</p>
                <p className="font-extrabold text-[#FF5A00] text-sm mt-0.5">{issue.riskScore}</p>
              </div>
              <div className="bg-[#1c202e] p-2 rounded-xl border border-white/5">
                <p className="text-[8px] text-slate-400 uppercase font-bold">EST. BUDGET</p>
                <p className="font-extrabold text-[#c5ff00] text-sm mt-0.5">₹{issue.estimatedCost}</p>
              </div>
              <div className="bg-[#1c202e] p-2 rounded-xl border border-white/5">
                <p className="text-[8px] text-slate-400 uppercase font-bold">TARGET SLA</p>
                <p className="font-extrabold text-white text-xs mt-0.5">{issue.estimatedFixTime}</p>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-300 flex items-center justify-between">
              <span className="text-slate-500 uppercase font-bold">DISPATCH DEPT:</span>
              <span className="font-black text-[#c5ff00] uppercase truncate ml-2">{issue.department}</span>
            </div>
          </div>

          {/* Assigned Field Crew Notice */}
          {issue.assignedOfficerName && (
            <div className="bg-[#c5ff00]/20 border-2 border-[#111216] p-3.5 rounded-2xl flex items-center space-x-3 text-xs text-[#111216] font-mono font-bold">
              <div className="w-9 h-9 rounded-xl bg-[#111216] text-[#c5ff00] flex items-center justify-center font-extrabold text-base shadow shrink-0">
                ⚡
              </div>
              <div>
                <p className="font-display font-black uppercase text-sm">FIELD CREW DISPATCHED</p>
                <p className="text-[11px] text-slate-800">Expediter: {issue.assignedOfficerName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citizen Consensus Voting Rig */}
      <div className="bg-[#111216] text-white p-5 rounded-3xl border-4 border-[#111216] shadow-[6px_6px_0px_#FF5A00] space-y-4">
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="text-lg font-display font-extrabold text-white uppercase tracking-tight">CITIZEN CONSENSUS RIG</h3>
            <p className="text-xs font-sans text-slate-300 font-medium mt-1">Verify field conditions. 3 confirmations trigger review.</p>
          </div>
          <span className="text-xs font-mono text-[#c5ff00] font-black bg-[#222634] px-3 py-1.5 rounded-xl border border-white/10 self-start">
            {issue.confirmCount} VERIFIED • {issue.upvoteCount} UPVOTES
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          <button
            onClick={() => handleVote("confirm")}
            className={`flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl font-display font-extrabold text-xs uppercase tracking-wider transition border-2 min-h-[48px] ${
              userVote?.voteType === "confirm"
                ? "bg-[#c5ff00] text-[#111216] border-[#c5ff00] shadow-[0_0_20px_rgba(197,255,0,0.4)]"
                : "bg-[#1c202e] hover:bg-[#252b3d] text-white border-[#333a52]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#c5ff00]" />
            <span>CONFIRM (+5 PTS)</span>
          </button>

          <button
            onClick={() => handleVote("upvote")}
            className={`flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl font-display font-extrabold text-xs uppercase tracking-wider transition border-2 min-h-[48px] ${
              userVote?.voteType === "upvote"
                ? "bg-[#FF5A00] text-[#111216] border-[#FF5A00] shadow-[0_0_20px_rgba(255,90,0,0.4)]"
                : "bg-[#1c202e] hover:bg-[#252b3d] text-white border-[#333a52]"
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-[#FF5A00]" />
            <span>PRIORITY BOOST</span>
          </button>

          <button
            onClick={() => handleVote("reject")}
            className={`flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl font-display font-extrabold text-xs uppercase tracking-wider transition border-2 min-h-[48px] ${
              userVote?.voteType === "reject"
                ? "bg-red-600 text-white border-red-500"
                : "bg-[#1c202e] hover:bg-red-950/40 text-slate-300 hover:text-red-300 border-[#333a52]"
            }`}
          >
            <span>FLAG FALSE ALARM</span>
          </button>
        </div>
      </div>

      {/* Field Comments Thread */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#111216] shadow-[6px_6px_0px_#111216] space-y-6">
        <div className="flex flex-col gap-2 border-b-2 border-slate-100 pb-4">
          <h3 className="text-lg font-display font-extrabold text-[#111216] uppercase flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-[#FF5A00]" />
            <span>FIELD DISPATCH THREAD ({issueComments.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">OFFICIAL CITIZEN RECORD</span>
        </div>

        {/* Log Comment Form */}
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add update, crew ETA, or neighbor question..."
            className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-2xl p-4 text-xs font-sans text-[#111216] font-medium outline-none focus:border-[#FF5A00] transition"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-[#111216] hover:bg-[#FF5A00] hover:text-[#111216] disabled:opacity-40 text-white font-mono font-extrabold text-xs px-6 py-3 rounded-xl transition shadow flex items-center space-x-1.5 uppercase tracking-wider min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>POST NOTE (+3 PTS)</span>
            </button>
          </div>
        </form>

        {/* Thread Feed */}
        <div className="space-y-3 pt-2">
          {issueComments.length === 0 ? (
            <p className="text-center text-xs font-mono text-slate-400 py-6 uppercase font-bold">No field dispatches logged yet. Be the first to note conditions.</p>
          ) : (
            issueComments.map(c => (
              <div key={c.id} className="bg-[#F4F4EE] p-4 rounded-2xl border-2 border-[#111216] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <img src={c.userAvatar} alt="" className="w-6 h-6 rounded-full border border-slate-700 object-cover" />
                    <span className="font-extrabold text-[#111216] uppercase">{c.userName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-xs font-sans text-slate-800 font-medium pl-8 border-l-2 border-[#FF5A00] leading-relaxed">{c.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
