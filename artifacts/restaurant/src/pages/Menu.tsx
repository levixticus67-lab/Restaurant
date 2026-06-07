import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Flame, Leaf, ShieldCheck, Zap, Filter } from "lucide-react";
import MealCard from "@/components/MealCard";
import MealModal from "@/components/MealModal";
import AIMenuSearch from "@/components/AIMenuSearch";
import MoodSelector from "@/components/MoodSelector";
import ChefSpecialCountdown from "@/components/ChefSpecialCountdown";
import SocialProofFeed from "@/components/SocialProofFeed";
import { useMenu } from "@/hooks/useMenu";
import { Meal, Category, MoodType } from "@/types";
import AnimatedDots from "@/components/AnimatedDots";
import { MOODS } from "@/components/MoodSelector";

const CATEGORIES: Category[] = [
  "All", "Starters", "Mains", "Burgers", "Pasta", "Pizza", "Grills", "Seafood", "Desserts", "Drinks",
];

const SMART_FILTERS = [
  { id: "spicy",       label: "Spicy 🌶️",       test: (m: Meal) => m.tags?.includes("spicy") || false },
  { id: "vegan",       label: "Vegan 🌱",        test: (m: Meal) => m.tags?.includes("vegan") || false },
  { id: "gluten-free", label: "Gluten Free 🌾",   test: (m: Meal) => m.allergens ? !m.allergens.includes("gluten") && (m.tags?.includes("gluten-free") || false) : false },
  { id: "under-20",   label: "Under $20",         test: (m: Meal) => m.price < 20 },
  { id: "quick",      label: "Quick ⚡",          test: (m: Meal) => parseInt(m.prepTime ?? "99") <= 15 },
  { id: "featured",   label: "Chef's Picks ⭐",   test: (m: Meal) => m.isFeatured || false },
];

export default function Menu() {
  const { meals, loading } = useMenu();
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Meal | null>(null);
  const [aiResults, setAiResults] = useState<Meal[] | null>(null);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [ingredientSearch, setIngredientSearch] = useState("");

  const tableParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("table") : null;

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = (() => {
    let base = aiResults ?? meals;

    // Category filter
    if (category !== "All") base = base.filter((m) => m.category === category);

    // Basic search (when not using AI search)
    if (!aiResults && search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Ingredient search
    if (ingredientSearch.trim()) {
      const q = ingredientSearch.toLowerCase();
      base = base.filter((m) =>
        m.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
        m.name.toLowerCase().includes(q)
      );
    }

    // Mood filter
    if (mood) {
      const moodObj = MOODS.find((mo) => mo.id === mood);
      if (moodObj) {
        base = base.filter((m) =>
          m.tags?.some((t) => moodObj.tags.includes(t.toLowerCase())) ||
          m.isFeatured
        );
      }
    }

    // Smart filters
    activeFilters.forEach((filterId) => {
      const filter = SMART_FILTERS.find((f) => f.id === filterId);
      if (filter) base = base.filter(filter.test);
    });

    return base;
  })();

  const specials = meals.filter((m) => m.isChefSpecial && m.isAvailable);

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />
      <SocialProofFeed meals={meals} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm font-semibold mb-2" style={{ color: "#8b5cf6" }}>
            What We Offer
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Our Full Menu
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/50 max-w-md mx-auto">
            From quick bites to full feasts — everything made fresh to order.
          </motion.p>
          {tableParam && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mt-4"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}>
              🍽️ Table {tableParam} — Scan to order
            </motion.div>
          )}
        </div>

        {/* Chef's Specials */}
        {specials.length > 0 && <ChefSpecialCountdown meals={specials} />}

        {/* AI Search */}
        <AIMenuSearch
          allMeals={meals}
          onResults={(results) => {
            setAiResults(results);
            if (results === null) setSearch("");
          }}
          isActive={aiSearchActive}
          onToggle={() => {
            setAiSearchActive((v) => !v);
            if (aiSearchActive) { setAiResults(null); }
          }}
        />

        {/* Basic search */}
        {!aiSearchActive && (
          <div className="max-w-lg mx-auto mb-6 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setAiResults(null); }}
              placeholder="Search dishes, ingredients..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl text-white text-sm outline-none placeholder-white/25"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Ingredient search */}
        {!aiSearchActive && (
          <div className="max-w-lg mx-auto mb-6 relative">
            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Filter by ingredient (e.g. truffle, salmon...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-white text-sm outline-none placeholder-white/20"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            />
            {ingredientSearch && (
              <button onClick={() => setIngredientSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/30">
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Mood selector */}
        <MoodSelector selected={mood} onSelect={setMood} />

        {/* Smart filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {SMART_FILTERS.map((f) => (
            <button key={f.id} onClick={() => toggleFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                activeFilters.has(f.id)
                  ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }>
              {f.label}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              style={
                category === cat
                  ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }>
              {cat}
            </button>
          ))}
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {(aiResults || mood || activeFilters.size > 0 || ingredientSearch) && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-wrap gap-2 mb-4 items-center">
              <span className="text-white/30 text-xs">Active:</span>
              {aiResults && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
                  AI Search ({aiResults.length} results)
                  <button onClick={() => { setAiResults(null); setAiSearchActive(false); }}><X size={10} /></button>
                </span>
              )}
              {mood && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                  {MOODS.find((m) => m.id === mood)?.label}
                  <button onClick={() => setMood(null)}><X size={10} /></button>
                </span>
              )}
              {ingredientSearch && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                  Ingredient: {ingredientSearch}
                  <button onClick={() => setIngredientSearch("")}><X size={10} /></button>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meals grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 340, background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20">
            <p className="text-4xl mb-4">🍽️</p>
            <p className="text-white/50 text-lg font-semibold mb-2">No dishes found</p>
            <p className="text-white/30 text-sm">Try adjusting your filters or search query</p>
            <button onClick={() => { setSearch(""); setAiResults(null); setMood(null); setActiveFilters(new Set()); setIngredientSearch(""); setCategory("All"); }}
              className="mt-6 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <>
            <p className="text-white/30 text-xs mb-4">{filtered.length} dishes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filtered.map((meal, i) => (
                  <motion.div key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.04 }}>
                    <MealCard meal={meal} onOpen={setSelected} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <MealModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
