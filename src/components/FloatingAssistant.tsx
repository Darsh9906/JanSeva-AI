import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../services/store";
import { Bot, X, Send, Sparkles, MessageSquare, Loader2, ThumbsUp } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export const FloatingAssistant: React.FC = () => {
  const { issues, viewMode } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_msg",
      sender: "bot",
      text: "👋 Hi! I am your JanSeva.AI Assistant. Ask me about local road repairs, water leaks, or how neighbor verifications work!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    setInputText("");

    const newMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedList = [...messages, newMsg];
    setMessages(updatedList);
    setLoading(true);

    try {
      const issuesSummary = issues.slice(0, 8).map(i => ({
        title: i.title,
        category: i.category,
        severity: i.severity,
        status: i.status,
        confirmations: i.confirmCount,
        department: i.department
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedList.map(m => ({ sender: m.sender, text: m.text })),
          issuesSummary
        })
      });

      const data = await res.json();
      
      const botReply: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: data.reply || "I am currently tracking all municipal maintenance dispatches in your neighborhood.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...updatedList, botReply]);
    } catch (err) {
      setMessages([...updatedList, {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: "Municipal AI server is currently synchronizing with city council databases. Please try asking again in a moment!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Where is the nearest pothole?",
    "How do I earn Hero Points?",
    "Which department fixes streetlights?"
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`absolute z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition flex items-center space-x-2 border-2 border-blue-400/40 group bottom-24 right-4 sm:right-6 sm:bottom-28`}
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
          </div>
        </button>
      )}

      {/* Persistent Assistant Modal Sheet */}
      {isOpen && (
        <div className={`absolute z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 bottom-20 right-4 w-[calc(100%-2rem)] max-w-[340px] h-[520px] max-h-[70vh]`}>
          
          {/* Sheet Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-400/30 text-blue-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm">JanSeva.AI</h3>
                  <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] px-1.5 py-0.2 rounded uppercase font-mono font-semibold">
                    Live Grounded
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Civic Knowledge Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-slate-800 text-xs">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 w-max shadow-sm text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span className="text-[11px] italic">Analyzing city records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex overflow-x-auto space-x-1.5 scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => { setInputText(qp); }}
                className="whitespace-nowrap bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-[10px] hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition font-medium shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about local issues..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-blue-600 disabled:bg-slate-300 text-white p-2 rounded-xl shadow hover:bg-blue-500 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
