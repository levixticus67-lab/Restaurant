import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Phone, Search, Gift, Trophy, TrendingUp } from "lucide-react";
import LoyaltyCard from "@/components/LoyaltyCard";
import { useLoyalty, STAMPS_FOR_REWARD } from "@/hooks/useLoyalty";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useCart } from "@/contexts/CartContext";

const PERKS = [
  { icon: Star,       label: "Earn Stamps",   desc: "1 stamp per order placed" },
  { icon: Gift,       label: "Free Item",      desc: `Every ${STAMPS_FOR_REWARD} stamps = 1 free dish` },
  { icon: TrendingUp, label: "Track Progress", desc: "See your stamps in real-time" },
  { icon: Trophy,     label: "VIP Benefits",   desc: "Exclusive deals for top members" },
];

export default function Loyalty() {
  const [phone, setPhone]         = useState("");
  const [name, setName]           = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { orderHistory }          = useCart();
  const { settings }              = useRestaurantSettings();

  const accent           = settings.primaryColor || "#D4A853";
  const phoneFromHistory = orderHistory[0]?.customerPhone ?? "";
  const nameFromHistory  = orderHistory[0]?.customerName  ?? "";

  const handleSubmit = () => {
    if (!phone.trim() || !name.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d" }}>
      <div className="max-w-xl mx-auto px-4 pt-8 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
            <Star size={12} />
            Loyalty Programme
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Your Loyalty<br />
            <span style={{ color: accent }}>Rewards</span>
          </h1>
          <p className="text-white/45 text-sm">
            Every order earns a stamp. {STAMPS_FOR_REWARD} stamps = a free dish.
          </p>
        </motion.div>

        {/* Perks grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: accent }} />
                <p className="text-white text-sm font-semibold">{label}</p>
              </div>
              <p className="text-white/40 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* Card lookup / display */}
        {!submitted ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-white font-bold mb-5">Look up your card</h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-1.5">Your Name</label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/20"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Full name" value={name}
                  onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/20"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="+1 555 000 0000" type="tel" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                </div>
              </div>
            </div>

            {phoneFromHistory && (
              <button onClick={() => { setPhone(phoneFromHistory); setName(nameFromHistory); setSubmitted(true); }}
                className="w-full mb-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}>
                <Search size={12} />
                Use my last order — {phoneFromHistory}
              </button>
            )}

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
              disabled={!phone.trim() || !name.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-sm"
              style={{
                background: phone.trim() && name.trim() ? accent : "rgba(255,255,255,0.06)",
                color: phone.trim() && name.trim() ? "#0d0d0d" : "rgba(255,255,255,0.3)",
              }}>
              View My Card
            </motion.button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <LoyaltyCard phone={phone} name={name} />
            <button onClick={() => { setSubmitted(false); setPhone(""); setName(""); }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/60 transition-colors">
              Look up a different card
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
