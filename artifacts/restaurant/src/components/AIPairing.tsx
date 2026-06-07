import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShoppingCart, X } from "lucide-react";
import { Meal } from "@/types";
import { getAIPairings, isGeminiConfigured } from "@/hooks/useGemini";
import { useCart } from "@/contexts/CartContext";

interface Props {
  triggerMeal: Meal | null;
  allMeals: Meal[];
}

export default function AIPairing({ triggerMeal, allMeals }: Props) {
  const { addItem } = useCart();
  const [pairings, setPairings] = useState<{ meal: Meal; reason: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (!triggerMeal || triggerMeal.id === dismissed) {
      setPairings([]);
      setVisible(false);
      return;
    }
    setVisible(true);
    setLoading(true);
    setPairings([]);
    getAIPairings(triggerMeal, allMeals).then((results) => {
      setPairings(results);
      setLoading(false);
    });
  }, [triggerMeal?.id]);

  if (!triggerMeal || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={triggerMeal.id}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="mx-4 mb-3 rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))",
          border: "1px solid rgba(139,92,246,0.25)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>
              {isGeminiConfigured ? "AI Sommelier Suggests" : "Goes Well With"}
            </span>
          </div>
          <button
            onClick={() => { setVisible(false); setDismissed(triggerMeal.id); }}
            className="p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X size={12} className="text-white/40" />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 h-16 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ) : pairings.length === 0 ? null : (
          <div className="flex flex-col gap-2">
            {pairings.map(({ meal, reason }) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{meal.name}</p>
                  <p className="text-white/40 text-xs truncate italic">{reason}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold mb-1" style={{ color: "#f59e0b" }}>
                    ${meal.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => addItem(meal)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                  >
                    <ShoppingCart size={10} />
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
