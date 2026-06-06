import { motion } from "framer-motion";
import { Clock, Flame, ShoppingCart, Star } from "lucide-react";
import { Meal } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  meal: Meal;
  onOpen: (meal: Meal) => void;
}

export default function MealCard({ meal, onOpen }: Props) {
  const { addItem } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}
      onClick={() => onOpen(meal)}
    >
      <div className="relative overflow-hidden h-52">
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
    </motion.div>
  );
}
