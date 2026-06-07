import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Flame, Clock } from "lucide-react";
import { Meal } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  meals: Meal[];
  onOpen: (meal: Meal) => void;
}

function useCountdown(expiresAt: number | undefined) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

function formatCountdown(ms: number) {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}:${String(s).padStart(2, "0")} left`;
}

function SpecialBadge({ meal }: { meal: Meal }) {
  const remaining = useCountdown(meal.expiresAt);
  const isUrgent = meal.expiresAt ? remaining < 10 * 60 * 1000 && remaining > 0 : false;

  if (!meal.isChefSpecial) return null;

  return (
    <div
      className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isUrgent ? "animate-pulse" : ""}`}
      style={{
        background: isUrgent ? "rgba(239,68,68,0.9)" : "rgba(245,158,11,0.9)",
        color: "#0d1b2a",
      }}
    >
      <Flame size={11} fill="currentColor" />
      Today's Special
      {meal.expiresAt && remaining > 0 && (
        <span className="ml-1 flex items-center gap-1">
          <Clock size={10} />
          {formatCountdown(remaining)}
        </span>
      )}
    </div>
  );
}

export default function RotatingProducts({ meals, onOpen }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { addItem } = useCart();

  const featured = meals.filter((m) => m.isFeatured || m.isChefSpecial || m.isAvailable).slice(0, 8);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + featured.length) % featured.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % featured.length);
  };

  const meal = featured[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.85, rotateY: d > 0 ? 25 : -25 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.85, rotateY: d > 0 ? -25 : 25 }),
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ perspective: "1200px" }}>
      <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 360 }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={meal.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => onOpen(meal)}
          >
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-full object-cover rounded-3xl"
            />
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(13,27,42,0.85) 0%, rgba(13,27,42,0.2) 50%, transparent 100%)",
              }}
            />

            <SpecialBadge meal={meal} />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#8b5cf6" }}>{meal.category}</p>
                  <h3 className="text-3xl font-bold text-white mb-2">{meal.name}</h3>
                  <p className="text-white/60 text-sm max-w-xs line-clamp-2">{meal.description}</p>
                </div>
                <div className="shrink-0 ml-4 text-right">
                  <p className="text-3xl font-bold mb-3" style={{ color: "#f59e0b" }}>
                    ${meal.price.toFixed(2)}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(meal);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      color: "white",
                      boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
                    }}
                  >
                    <ShoppingCart size={15} />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all z-10"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all z-10"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
        <ChevronRight size={20} className="text-white" />
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              background: i === current
                ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
