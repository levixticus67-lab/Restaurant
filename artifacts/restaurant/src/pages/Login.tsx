import { useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
export default function Login() {
  const { signIn, isConfigured } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError("Firebase is not configured yet. Add your VITE_FIREBASE_* environment variables.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0d0d0d" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <UtensilsCrossed size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin Login</h1>
            <p className="text-white/40 text-sm mt-1">Access the restaurant management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-white placeholder-white/25 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-white placeholder-white/25 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <button type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                {error}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white"
              style={{
                background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                boxShadow: loading ? "none" : "0 8px 24px rgba(139,92,246,0.3)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
