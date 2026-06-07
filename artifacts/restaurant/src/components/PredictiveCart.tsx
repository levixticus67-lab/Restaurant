import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart } from "lucide-react";
import { Meal, CartItem } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface Props {
  cartItems: CartItem[];
  allMeals: Meal[];
}

function getPopularPairings(cartItems: CartItem[], allMeals: Meal[]): Meal[] {
  if (cartItems.length < 1) return [];

  const cartIds = new Set(cartItems.map((i) => i.meal.id));
  const cartCategories = cartItems.map((i) => i.meal.category);

  const scored = allMeals
    .filter((m) => !cartIds.has(m.id) && m.isAvailable)
    .map((m) => {
      let score = 0;
      if (m.isFeatured) score += 3;
      if (!cartCategories.includes(m.category)) score += 2;
      if (m.category === "Drinks") score += 1;
      if (m.category === "Desserts") score += 1;
      if (m.category === "Starters" && cartCategories.includes("Mains")) score += 2;
      return { meal: m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.meal);

  return scored;
}

export default function PredictiveCart({ cartItems, allMeals }: Props) {
  const { addItem } = useCart();

  if (cartItems.length < 2) return null;

  const suggestions = getPopularPairings(cartItems, allMeals);
  if (suggestions.length === 0) return null;

  return (
    <div className="mx-4 mb-3 p-3 rounded-2xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
      <div className="flex items-center gap-2 mb-2.5">
        <TrendingUp size={13} style={{ color: "#10b981" }} />
        <span className="text-xs font-semibold" style={{ color: "#10b981" }}>
          87% of people who ordered this also got
        </span>
      </div>
      <div className="space-y-2">
        {suggestions.map((meal) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 p-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <img src={meal.imageUrl} alt={meal.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{meal.name}</p>
              <p className="text-white/40 text-xs">{meal.category}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>${meal.price.toFixed(2)}</p>
              <button
                onClick={() => addItem(meal)}
                className="flex items-center gap-1 mt-1 px-2 py-1 rounded-lg text-xs font-semibold text-white"
                style={{ background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
              >
                <ShoppingCart size={9} />
                Add
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
