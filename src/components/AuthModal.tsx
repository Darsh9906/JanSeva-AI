import React, { useState } from "react";
import { useStore } from "../services/store";
import { X, ShieldAlert, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { loginWithGoogle } from "../services/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { actions } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await loginWithGoogle();
      // User profile is automatically set by Firebase sync service
      actions.setCurrentUser(user);
      console.log('✅ User authenticated:', user.name);
      onClose();
    } catch (error: any) {
      console.error("Login failed", error);
      const errorMessage = error.code === 'auth/popup-closed-by-user' 
        ? "Login cancelled" 
        : error.message || "Failed to log in with Google";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousGuest = () => {
    actions.setCurrentUser(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-blue-600 p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Sign in to CivicPulse</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Report neighborhood issues, verify alerts, earn Hero Points, and track municipal response transparently.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 p-3 rounded-lg text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2.5 text-xs">
          <div className="flex items-center space-x-2 text-cyan-300 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Citizen Privileges</span>
          </div>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>Submit verified photo & video reports</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>Vote on reports to elevate municipal SLA</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>Earn Hero Points, badges & rewards</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-1">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={handleAnonymousGuest}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold py-3 px-4 rounded-2xl border border-slate-700 transition text-xs"
          >
            Browse Anonymously (Limited Features)
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 border-t border-slate-700 pt-4">
          Your data is secure. We never share personal information.
        </p>
      </div>
    </div>
  );
};
