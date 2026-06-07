import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, ShoppingCart, Star, ChefHat, RotateCcw } from "lucide-react";
import { Meal } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  meal: Meal;
  onOpen: (meal: Meal) => void;
}

export default function MealCard({ meal, onOpen }: Props) {
  const { addItem } = useCart();
  const [flipped, setFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped((v) => !v);
  };

  return (
    <div
      className="relative group cursor-pointer"
      style={{ perspective: "900px", height: 340 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 180 }}
        style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
          onClick={() => !flipped && onOpen(meal)}
        >
          <div className="relative overflow-hidden" style={{ height: 200 }}>
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {meal.isFeatured && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(245,158,11,0.9)", color: "#0d1b2a" }}>
                <Star size={10} fill="currentColor" />
                Featured
              </div>
            )}
            {meal.isChefSpecial && (
              <div className="absolute top-3 right-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.9)", color: "white" }}>
                <Flame size={10} fill="currentColor" />
                Special
              </div>
            )}
            {!meal.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white/80 font-semibold text-sm">Unavailable</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: "rgba(139,92,246,0.85)", color: "white" }}>
                {meal.category}
              </span>
              <span className="text-white font-bold text-lg drop-shadow">${meal.price.toFixed(2)}</span>
            </div>
            <button
              onClick={handleFlip}
              className="absolute top-3 right-3 p-1.5 rounded-full z-10"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}
              title="Flip for details"
            >
              <RotateCcw size={12} className="text-white/70" />
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-white text-base mb-1 line-clamp-1">{meal.name}</h3>
            <p className="text-white/50 text-xs line-clamp-2 mb-3">{meal.description}</p>

            <div className="flex items-center gap-4 mb-4">
              {meal.prepTime && (
                <div className="flex items-center gap-1 text-white/40 text-xs">
                  <Clock size={11} />
                  {meal.prepTime}
                </div>
              )}
              {meal.calories && (
                <div className="flex items-center gap-1 text-white/40 text-xs">
                  <Flame size={11} />
                  {meal.calories} cal
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                if (meal.isAvailable) addItem(meal);
              }}
              disabled={!meal.isAvailable}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: meal.isAvailable
                  ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                  : "rgba(255,255,255,0.08)",
                color: meal.isAvailable ? "white" : "rgba(255,255,255,0.3)",
                cursor: meal.isAvailable ? "pointer" : "not-allowed",
              }}
            >
              <ShoppingCart size={14} />
              {meal.isAvailable ? "Add to Cart" : "Unavailable"}
            </motion.button>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(145deg, #0f1e33 0%, #1a0d2e 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm line-clamp-1">{meal.name}</h3>
            <button onClick={handleFlip}
              className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <RotateCcw size={12} className="text-white/60" />
            </button>
          </div>

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mb-4 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <ChefHat size={12} className="text-white/40" />
                <p className="text-white/40 text-xs uppercase tracking-wider">Ingredients</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.map((ing) => (
                  <span key={ing} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meal.allergens && meal.allergens.length > 0 && (
            <div className="mb-3">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-1.5">⚠️ Allergens</p>
              <div className="flex flex-wrap gap-1">
                {meal.allergens.map((a) => (
                  <span key={a} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meal.tags && meal.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {meal.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <p className="text-white/30 text-xs mb-2 italic line-clamp-2">{meal.description}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); if (meal.isAvailable) { addItem(meal); setFlipped(false); } }}
              disabled={!meal.isAvailable}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: meal.isAvailable ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.08)",
                color: meal.isAvailable ? "white" : "rgba(255,255,255,0.3)",
              }}
            >
              <ShoppingCart size={14} />
              Add — ${meal.price.toFixed(2)}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
