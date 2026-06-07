import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import MealCard from "@/components/MealCard";
import MealModal from "@/components/MealModal";
import { useMenu } from "@/hooks/useMenu";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Meal, Category } from "@/types";

const CATEGORIES: { id: Category; emoji: string }[] = [
  { id: "All",      emoji: "🍽️" },
  { id: "Starters", emoji: "🥗" },
  { id: "Mains",    emoji: "🍖" },
  { id: "Burgers",  emoji: "🍔" },
  { id: "Pasta",    emoji: "🍝" },
  { id: "Pizza",    emoji: "🍕" },
  { id: "Grills",   emoji: "🔥" },
  { id: "Seafood",  emoji: "🦞" },
  { id: "Desserts", emoji: "🍮" },
  { id: "Drinks",   emoji: "🥤" },
];

export default function Menu() {
  const { meals, loading } = useMenu();
  const { settings } = useRestaurantSettings();
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Meal | null>(null);

  const accent = settings.primaryColor || "#D4A853";

  const filtered = meals.filter((m) => {
    if (!m.isAvailable) return false;
    if (category !== "All" && m.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen px-4 md:px-8 pt-6 pb-8" style={{ background: "#0d0d0d" }}>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Our Menu</h1>
        <p className="text-white/40 text-sm mt-0.5">{meals.filter(m => m.isAvailable).length} items available</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meals, ingredients..."
          className="w-full pl-10 pr-10 py-3.5 rounded-2xl text-white text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2">
            <X size={14} className="text-white/40" />
          </button>
        )}
      </div>

      {/* Category icons */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-6">
        {CATEGORIES.map(({ id, emoji }) => {
          const active = category === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setCategory(id)}
              className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all"
              style={{
                background: active ? `${accent}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? accent + "50" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span className="text-xs font-medium whitespace-nowrap"
                style={{ color: active ? accent : "rgba(255,255,255,0.45)" }}>
                {id}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ height: 260, background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-5xl">🍽️</span>
          <p className="text-white/40 text-sm">No meals found</p>
          <button onClick={() => { setSearch(""); setCategory("All"); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
            Clear filters
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((meal, i) => (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
              >
                <MealCard meal={meal} onOpen={setSelected} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {selected && <MealModal meal={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
