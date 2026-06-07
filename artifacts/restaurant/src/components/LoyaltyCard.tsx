import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Star, Trophy } from "lucide-react";
import { useLoyalty, STAMPS_FOR_REWARD } from "@/hooks/useLoyalty";

interface Props {
  phone: string;
  name: string;
}

function Confetti({ visible }: { visible: boolean }) {
  const pieces = Array.from({ length: 30 });
  const colors = ["#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#ec4899"];

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {pieces.map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                background: colors[i % colors.length],
                left: `${Math.random() * 100}%`,
                top: "-8px",
              }}
              initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                y: 200 + Math.random() * 100,
                opacity: [1, 1, 0],
                rotate: Math.random() * 720 - 360,
                x: (Math.random() - 0.5) * 80,
                scale: [1, 0.8, 0.5],
              }}
              transition={{ duration: 1.5 + Math.random() * 0.5, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function LoyaltyCard({ phone, name }: Props) {
  const { getLoyaltyCard } = useLoyalty();
  const [card, setCard] = useState<{ stamps: number; rewardsClaimed: number; totalSpent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    getLoyaltyCard(phone).then((c) => {
      setCard(c ? { stamps: c.stamps, rewardsClaimed: c.rewardsClaimed, totalSpent: c.totalSpent } : { stamps: 0, rewardsClaimed: 0, totalSpent: 0 });
      setLoading(false);
    });
  }, [phone]);

  const stamps = card?.stamps ?? 0;
  const progress = stamps % STAMPS_FOR_REWARD;
  const isRewardReady = stamps >= STAMPS_FOR_REWARD && stamps % STAMPS_FOR_REWARD === 0 && stamps > 0;

  useEffect(() => {
    if (isRewardReady) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [isRewardReady]);

  if (loading) {
    return (
      <div className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
    );
  }

  return (
    <div className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))",
        border: "1px solid rgba(139,92,246,0.25)",
      }}
    >
      <Confetti visible={showConfetti} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
            <Gift size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{name}'s Loyalty Card</p>
            <p className="text-white/40 text-xs">{card?.rewardsClaimed ?? 0} rewards claimed · ${(card?.totalSpent ?? 0).toFixed(2)} spent</p>
          </div>
        </div>
        {isRewardReady && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "white" }}
          >
            <Trophy size={12} />
            Free Item!
          </motion.div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/40 text-xs">Progress to free item</span>
          <span className="text-white/60 text-xs font-semibold">
            {progress}/{STAMPS_FOR_REWARD} orders
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress / STAMPS_FOR_REWARD) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #8b5cf6, #3b82f6)" }}
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: STAMPS_FOR_REWARD }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", damping: 15 }}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: i < progress
                ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${i < progress ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {i < progress && <Star size={12} fill="white" stroke="none" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
