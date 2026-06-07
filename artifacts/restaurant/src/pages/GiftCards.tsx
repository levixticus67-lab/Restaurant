import { motion } from "framer-motion";
import { Gift, Heart, Star, Send } from "lucide-react";
import AnimatedDots from "@/components/AnimatedDots";
import { IssueGiftCard, RedeemGiftCard } from "@/components/GiftCardWidget";
import { useState } from "react";
import { GiftCard } from "@/types";
import { useCart } from "@/contexts/CartContext";

const FEATURES = [
  { icon: Gift,  label: "Any Amount",   desc: "$25 – $200 denominations" },
  { icon: Send,  label: "Instant Send", desc: "Share via WhatsApp instantly" },
  { icon: Heart, label: "Never Expires", desc: "Valid for 2 years" },
  { icon: Star,  label: "Any Occasion", desc: "Birthdays, anniversaries, thank-yous" },
];

export default function GiftCards() {
  const [tab, setTab] = useState<"buy" | "redeem">("buy");
  const { setGiftCard } = useCart();
  const [redeemCard, setRedeemCard] = useState<GiftCard | null>(null);

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
            <Gift size={12} />
            Gift Cards
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white mb-4">
            Give the Gift of<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              Great Food
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/50">
            Send a Saveur gift card to anyone — they'll love it.
          </motion.p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="p-2 rounded-xl shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))" }}>
                <Icon size={16} style={{ color: "#a78bfa" }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl p-1 mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => setTab("buy")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={tab === "buy"
              ? { background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white" }
              : { color: "rgba(255,255,255,0.4)" }}>
            🎁 Buy a Gift Card
          </button>
          <button onClick={() => setTab("redeem")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={tab === "redeem"
              ? { background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white" }
              : { color: "rgba(255,255,255,0.4)" }}>
            💳 Check Balance
          </button>
        </div>

        {tab === "buy" ? (
          <IssueGiftCard />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-bold mb-4">Check Gift Card Balance</h3>
              <RedeemGiftCard
                onValidated={(card) => {
                  setRedeemCard(card);
                  setGiftCard({ id: card.id, code: card.code, discount: card.balance });
                }}
                onRemove={() => { setRedeemCard(null); setGiftCard(null); }}
                appliedCard={redeemCard}
                orderTotal={9999}
              />
            </div>
            {redeemCard && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))",
                  border: "1px solid rgba(139,92,246,0.25)",
                }}>
                <p className="text-white font-bold text-lg mb-1">${redeemCard.balance.toFixed(2)}</p>
                <p className="text-white/50 text-sm">Available Balance</p>
                <p className="text-white/30 text-xs mt-2">Original amount: ${redeemCard.originalAmount}</p>
                <p className="text-white/30 text-xs">From: {redeemCard.senderName}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
