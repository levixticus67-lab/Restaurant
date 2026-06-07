import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock } from "lucide-react";
import { Meal } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  meals: Meal[];
}

function useCountdown(expiresAt: number | undefined) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function formatTime(ms: number) {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SpecialCard({ meal }: { meal: Meal }) {
  const { addItem } = useCart();
  const remaining = useCountdown(meal.expiresAt);
  const isExpired = meal.expiresAt ? remaining <= 0 : false;
  const isUrgent = meal.expiresAt ? remaining < 10 * 60 * 1000 : false;

  return (
    <motion.div
      layout
      animate={isExpired ? { opacity: 0.3, scale: 0.97 } : { opacity: 1, scale: 1 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${isUrgent ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.3)"}`,
      }}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: isUrgent ? "rgba(239,68,68,0.9)" : "rgba(245,158,11,0.9)", color: "#0d1b2a" }}>
          <Flame size={10} fill="currentColor" />
          Chef's Special
        </div>
        {isExpired && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-white/70 font-bold text-sm">Today's special is over</p>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <p className="text-white font-semibold text-sm line-clamp-1">{meal.name}</p>
          <span className="font-bold shrink-0 ml-2 text-sm" style={{ color: "#f59e0b" }}>${meal.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          {meal.expiresAt && !isExpired && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${isUrgent ? "animate-pulse" : ""}`}
              style={{ color: isUrgent ? "#ef4444" : "#f59e0b" }}>
              <Clock size={11} />
              {formatTime(remaining)} left
            </div>
          )}
          {!isExpired && (
            <button
              onClick={() => addItem(meal)}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChefSpecialCountdown({ meals }: Props) {
  const specials = meals.filter((m) => m.isChefSpecial && m.isAvailable);
  if (specials.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} style={{ color: "#f59e0b" }} />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Today's Chef Specials</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
          Limited Time
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {specials.map((meal) => (
            <SpecialCard key={meal.id} meal={meal} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
