import { motion } from "framer-motion";
import { Plus, Clock, Flame, Star } from "lucide-react";
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
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onClick={() => onOpen(meal)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {meal.isFeatured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "#D4A853", color: "#0d0d0d" }}
          >
            <Star size={9} fill="currentColor" />
            Featured
          </div>
        )}

        {!meal.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white/70 text-sm font-semibold tracking-wide">
              Unavailable
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(212,168,83,0.2)", color: "#D4A853", border: "1px solid rgba(212,168,83,0.3)" }}
          >
            {meal.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm mb-0.5 line-clamp-1">{meal.name}</h3>
        <p className="text-white/40 text-xs line-clamp-1 mb-2">{meal.description}</p>

        <div className="flex items-center gap-3 mb-3">
          {meal.prepTime && (
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Clock size={10} /> {meal.prepTime}
            </span>
          )}
          {meal.calories && (
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Flame size={10} /> {meal.calories} cal
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-base">${meal.price.toFixed(2)}</span>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation();
              if (meal.isAvailable) addItem(meal);
            }}
            disabled={!meal.isAvailable}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: meal.isAvailable ? "#D4A853" : "rgba(255,255,255,0.08)",
              color: meal.isAvailable ? "#0d0d0d" : "rgba(255,255,255,0.2)",
              cursor: meal.isAvailable ? "pointer" : "not-allowed",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
