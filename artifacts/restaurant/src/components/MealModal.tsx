import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Flame, ShoppingCart, ChefHat, Star } from "lucide-react";
import { Meal } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  meal: Meal | null;
  onClose: () => void;
}

export default function MealModal({ meal, onClose }: Props) {
  const { addItem } = useCart();

  return (
    <AnimatePresence>
      {meal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0f1e33 0%, #1a0d2e 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <X size={18} className="text-white" />
            </button>

            <div className="relative h-64">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e33] via-transparent to-transparent" />
              {meal.isFeatured && (
                <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(245,158,11,0.9)", color: "#0d1b2a" }}>
                  <Star size={10} fill="currentColor" />
                  Chef's Pick
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "rgba(139,92,246,0.9)", color: "white" }}>
                  {meal.category}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-bold text-white pr-4">{meal.name}</h2>
                <span className="text-2xl font-bold shrink-0"
                  style={{ color: "#f59e0b" }}>
                  ${meal.price.toFixed(2)}
                </span>
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-5">{meal.description}</p>

              <div className="flex items-center gap-6 mb-5 pb-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {meal.prepTime && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.15)" }}>
                      <Clock size={16} style={{ color: "#3b82f6" }} />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Prep Time</p>
                      <p className="text-white text-sm font-medium">{meal.prepTime}</p>
                    </div>
                  </div>
                )}
                {meal.calories && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(239,68,68,0.15)" }}>
                      <Flame size={16} style={{ color: "#ef4444" }} />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Calories</p>
                      <p className="text-white text-sm font-medium">{meal.calories} kcal</p>
                    </div>
                  </div>
                )}
              </div>

              {meal.ingredients && meal.ingredients.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat size={14} className="text-white/40" />
                    <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Ingredients</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ing) => (
                      <span key={ing}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.7)",
                        }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (meal.isAvailable) {
                    addItem(meal);
                    onClose();
                  }
                }}
                disabled={!meal.isAvailable}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all"
                style={{
                  background: meal.isAvailable
                    ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                    : "rgba(255,255,255,0.08)",
                  color: meal.isAvailable ? "white" : "rgba(255,255,255,0.3)",
                  boxShadow: meal.isAvailable ? "0 8px 30px rgba(139,92,246,0.35)" : "none",
                }}
              >
                <ShoppingCart size={18} />
                {meal.isAvailable ? `Add to Cart — $${meal.price.toFixed(2)}` : "Currently Unavailable"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
