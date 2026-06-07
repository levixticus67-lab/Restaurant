import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { Meal } from "@/types";

interface ProofItem {
  meal: Meal;
  count: number;
  minutes: number;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  meals: Meal[];
}

export default function SocialProofFeed({ meals: allMeals }: Props) {
  const [current, setCurrent] = useState<ProofItem | null>(null);
  const [visible, setVisible] = useState(false);

  const meals = allMeals.filter((m) => m.isAvailable);

  useEffect(() => {
    if (meals.length === 0) return;

    const show = () => {
      const meal = pickRandom(meals);
      setCurrent({
        meal,
        count: Math.floor(Math.random() * 6) + 1,
        minutes: Math.floor(Math.random() * 28) + 3,
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    };

    const initial = setTimeout(show, 3000);
    const interval = setInterval(show, 18000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [meals.length]);

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, x: -20, y: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed bottom-6 left-4 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl max-w-xs"
          style={{
            background: "rgba(10,18,32,0.95)",
            border: "1px solid rgba(239,68,68,0.2)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <img
            src={current.meal.imageUrl}
            alt={current.meal.name}
            className="w-10 h-10 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame size={12} style={{ color: "#ef4444" }} />
              <span className="text-white text-xs font-bold truncate">
                {current.count} {current.count === 1 ? "person" : "people"} ordered
              </span>
            </div>
            <p className="text-white/70 text-xs truncate">
              <span className="font-semibold text-white">{current.meal.name}</span>{" "}
              in the last {current.minutes} min
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
