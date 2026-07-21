"use client";

import { useState } from "react";
import { Lock, KeyRound, AlertCircle, ShieldCheck } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminModal({ isOpen, onClose, onLoginSuccess }: AdminModalProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password) {
      setErrorMsg("Please enter password.");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess();
        setPassword("");
        onClose();
      } else {
        // Fixed safe message — never echo server details or hints to the login screen
        setErrorMsg("Incorrect password. Access denied.");
      }
    } catch (err) {
      setErrorMsg("Incorrect password. Access denied.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#2C1B17] rounded-3xl max-w-sm w-full p-6 border border-[#C9A227] shadow-2xl text-white relative animate-scaleUp">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/20 border border-[#C9A227] text-[#C9A227] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-serif font-bold text-xl text-amber-100">
            Fana Cafe Admin Login
          </h3>

          <p className="text-xs text-stone-300 font-light">
            Enter password to unlock live site editor & order management.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-amber-200/80 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#3D2314] border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-[#C9A227]"
              />
              <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8921F] hover:from-[#d6ad2a] hover:to-[#c29b21] text-[#2C1B17] font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition"
          >
            {isVerifying ? "Unlocking Admin..." : "Unlock Live Editor"}
          </button>
        </form>

      </div>
    </div>
  );
}
