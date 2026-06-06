import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Meal } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  meals: Meal[];
  onOpen: (meal: Meal) => void;
}

export default function RotatingProducts({ meals, onOpen }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { addItem } = useCart();

  const featured = meals.filter((m) => m.isFeatured || m.isAvailable).slice(0, 6);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % featured.length);
    }, 4000);
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

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all z-10"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
      >
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all z-10"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
      >
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
