import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Plus, Minus, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import AnimatedDots from "@/components/AnimatedDots";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/contexts/CartContext";
import { Meal, MealComponent } from "@/types";

const DEFAULT_BASES: MealComponent[] = [
  { name: "Artisan Sourdough Bread",   price: 0 },
  { name: "Jasmine Rice",              price: 0 },
  { name: "Garlic Mashed Potato",      price: 0 },
  { name: "Wild Rice & Quinoa",        price: 1 },
  { name: "Sweet Potato Fries",        price: 1.5 },
];

const DEFAULT_PROTEINS: MealComponent[] = [
  { name: "Grilled Chicken Breast",    price: 0 },
  { name: "Pan-Seared Salmon",         price: 3 },
  { name: "8oz Beef Tenderloin",       price: 6 },
  { name: "Tiger Prawns",              price: 4 },
  { name: "Crispy Tofu (Vegan)",       price: 0 },
  { name: "Wagyu Patty",              price: 8 },
];

const DEFAULT_SIDES: MealComponent[] = [
  { name: "Garden Salad",             price: 0 },
  { name: "Truffle Mac & Cheese",     price: 2.5 },
  { name: "Roasted Seasonal Veg",     price: 0 },
  { name: "French Fries",             price: 0 },
  { name: "Creamed Spinach",          price: 1 },
];

const DEFAULT_SAUCES: MealComponent[] = [
  { name: "Béarnaise",                price: 0 },
  { name: "Peppercorn Cream",         price: 0 },
  { name: "Chimichurri",              price: 0 },
  { name: "Red Wine Jus",             price: 0 },
  { name: "Truffle Aioli",            price: 1 },
  { name: "Mango Habanero",           price: 0 },
];

const BASE_PRICE = 18;

interface Selection {
  base: MealComponent | null;
  protein: MealComponent | null;
  sides: MealComponent[];
  sauce: MealComponent | null;
}

function Section({
  title,
  icon,
  items,
  selected,
  multi,
  onSelect,
}: {
  title: string;
  icon: string;
  items: MealComponent[];
  selected: MealComponent | MealComponent[] | null;
  multi?: boolean;
  onSelect: (item: MealComponent) => void;
}) {
  const isSelected = (item: MealComponent) => {
    if (Array.isArray(selected)) return selected.some((s) => s.name === item.name);
    return selected?.name === item.name;
  };

  return (
    <div className="mb-6">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
        {multi && <span className="text-xs text-white/40 font-normal">Up to 2</span>}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => {
          const sel = isSelected(item);
          return (
            <motion.button
              key={item.name}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(item)}
              className="p-3 rounded-xl text-left transition-all"
              style={
                sel
                  ? { background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.2))", border: "1px solid rgba(139,92,246,0.5)" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{item.name}</p>
              <p className="text-xs font-bold" style={{ color: sel ? "#a78bfa" : "#f59e0b" }}>
                {item.price === 0 ? "Included" : `+$${item.price.toFixed(2)}`}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function MealBuilder() {
  const { addItem } = useCart();
  const [selection, setSelection] = useState<Selection>({ base: null, protein: null, sides: [], sauce: null });
  const [added, setAdded] = useState(false);

  const totalExtras =
    (selection.base?.price ?? 0) +
    (selection.protein?.price ?? 0) +
    selection.sides.reduce((s, i) => s + i.price, 0) +
    (selection.sauce?.price ?? 0);

  const total = BASE_PRICE + totalExtras;

  const handleSideToggle = (item: MealComponent) => {
    setSelection((prev) => {
      const exists = prev.sides.some((s) => s.name === item.name);
      if (exists) return { ...prev, sides: prev.sides.filter((s) => s.name !== item.name) };
      if (prev.sides.length >= 2) return { ...prev, sides: [prev.sides[1], item] };
      return { ...prev, sides: [...prev.sides, item] };
    });
  };

  const handleAddToCart = () => {
    const nameParts: string[] = [];
    if (selection.protein) nameParts.push(selection.protein.name);
    if (selection.base) nameParts.push(`on ${selection.base.name}`);
    if (selection.sauce) nameParts.push(`with ${selection.sauce.name}`);

    const customMeal: Meal = {
      id: `custom-${Date.now()}`,
      name: nameParts.length > 0 ? nameParts.join(" ") : "Custom Build",
      description: `Custom build: ${[selection.base?.name, selection.protein?.name, ...selection.sides.map((s) => s.name), selection.sauce?.name].filter(Boolean).join(", ")}`,
      price: total,
      category: "Mains",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
      isAvailable: true,
    };

    addItem(customMeal);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const canAdd = selection.base && selection.protein;

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
            <ChefHat size={12} />
            Meal Builder
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white mb-4">
            Build Your<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              Perfect Meal
            </span>
          </motion.h1>
          <p className="text-white/50">
            Mix and match from ${BASE_PRICE} base. Your rules, your flavour.
          </p>
        </div>

        <div className="rounded-3xl p-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Section title="Base" icon="🍞" items={DEFAULT_BASES}
            selected={selection.base}
            onSelect={(item) => setSelection((p) => ({ ...p, base: p.base?.name === item.name ? null : item }))} />

          <Section title="Protein" icon="🥩" items={DEFAULT_PROTEINS}
            selected={selection.protein}
            onSelect={(item) => setSelection((p) => ({ ...p, protein: p.protein?.name === item.name ? null : item }))} />

          <Section title="Sides" icon="🥗" items={DEFAULT_SIDES}
            selected={selection.sides} multi
            onSelect={handleSideToggle} />

          <Section title="Sauce" icon="🫙" items={DEFAULT_SAUCES}
            selected={selection.sauce}
            onSelect={(item) => setSelection((p) => ({ ...p, sauce: p.sauce?.name === item.name ? null : item }))} />
        </div>

        {/* Price summary */}
        <motion.div layout className="mt-6 p-5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold text-lg">${total.toFixed(2)}</p>
              <p className="text-white/40 text-xs">Base ${BASE_PRICE} + ${totalExtras.toFixed(2)} extras</p>
            </div>
            <div className="text-right text-xs text-white/30 space-y-0.5">
              {selection.base && <p>✓ {selection.base.name}</p>}
              {selection.protein && <p>✓ {selection.protein.name}</p>}
              {selection.sides.map((s) => <p key={s.name}>✓ {s.name}</p>)}
              {selection.sauce && <p>✓ {selection.sauce.name}</p>}
            </div>
          </div>

          {!canAdd && (
            <p className="text-white/30 text-xs text-center mb-3">
              Select a base and protein to continue
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!canAdd || added}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white"
            style={{
              background: added
                ? "rgba(16,185,129,0.3)"
                : canAdd
                ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                : "rgba(255,255,255,0.06)",
              boxShadow: canAdd && !added ? "0 8px 24px rgba(139,92,246,0.4)" : "none",
            }}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  ✓ Added to Cart!
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Add Custom Build — ${total.toFixed(2)}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
