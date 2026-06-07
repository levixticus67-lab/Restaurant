import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Phone, Search, Gift, Trophy, TrendingUp } from "lucide-react";
import AnimatedDots from "@/components/AnimatedDots";
import LoyaltyCard from "@/components/LoyaltyCard";
import { useLoyalty, STAMPS_FOR_REWARD } from "@/hooks/useLoyalty";
import { useCart } from "@/contexts/CartContext";

const PERKS = [
  { icon: Star,      label: "Earn Stamps",      desc: "1 stamp per order placed" },
  { icon: Gift,      label: "Free Item",         desc: `Every ${STAMPS_FOR_REWARD} stamps = 1 free dish` },
  { icon: TrendingUp, label: "Track Progress",  desc: "See your stamps in real-time" },
  { icon: Trophy,    label: "VIP Benefits",      desc: "Exclusive deals for top members" },
];

export default function Loyalty() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { orderHistory } = useCart();

  const phoneFromHistory = orderHistory[0]?.customerPhone ?? "";
  const nameFromHistory = orderHistory[0]?.customerName ?? "";

  const handleSubmit = () => {
    if (!phone.trim() || !name.trim()) return;
    setSubmitted(true);
  };

  const handleQuickLookup = () => {
    if (phoneFromHistory) {
      setPhone(phoneFromHistory);
      setName(nameFromHistory);
      setSubmitted(true);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
            <Star size={12} />
            Loyalty Programme
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white mb-4">
            Your Loyalty<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              Rewards
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/50">
            Every order earns a stamp. {STAMPS_FOR_REWARD} stamps = a free dish.
          </motion.p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: "#f59e0b" }} />
                <p className="text-white text-sm font-semibold">{label}</p>
              </div>
              <p className="text-white/40 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {!submitted ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-white font-bold mb-5">Look up your card</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Your Name</label>
                <input className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="+1 555 000 0000" type="tel" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                </div>
              </div>
            </div>

            {phoneFromHistory && (
              <button onClick={handleQuickLookup}
                className="w-full mb-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                <Search size={12} />
                Use my last order info — {phoneFromHistory}
              </button>
            )}

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
              disabled={!phone.trim() || !name.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-white"
              style={{
                background: phone.trim() && name.trim()
                  ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                  : "rgba(255,255,255,0.06)",
              }}>
              View My Card
            </motion.button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <LoyaltyCard phone={phone} name={name} />
            <button onClick={() => { setSubmitted(false); setPhone(""); setName(""); }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
              Look up a different card
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
