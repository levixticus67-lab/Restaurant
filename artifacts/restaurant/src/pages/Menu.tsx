import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import MealCard from "@/components/MealCard";
import MealModal from "@/components/MealModal";
import { useMenu } from "@/hooks/useMenu";
import { Meal, Category } from "@/types";
import AnimatedDots from "@/components/AnimatedDots";

const CATEGORIES: Category[] = [
  "All", "Starters", "Mains", "Burgers", "Pasta", "Pizza", "Grills", "Seafood", "Desserts", "Drinks",
];

export default function Menu() {
  const { meals, loading } = useMenu();
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Meal | null>(null);

  const filtered = meals.filter((m) => {
    const matchCat = category === "All" || m.category === category;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold mb-2"
            style={{ color: "#8b5cf6" }}
          >
            What We Offer
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
          >
            Our Full Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 max-w-md mx-auto"
          >
            From quick bites to full feasts — everything made fresh to order.
          </motion.p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: category === cat
                  ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                  : "rgba(255,255,255,0.06)",
                color: category === cat ? "white" : "rgba(255,255,255,0.5)",
                border: category === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Count */}
        <p className="text-white/30 text-sm mb-6">
          {filtered.length} {filtered.length === 1 ? "dish" : "dishes"} found
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", height: 340 }} />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filtered.map((meal) => (
                <MealCard key={meal.id} meal={meal} onOpen={setSelected} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center gap-4 py-20 text-center"
              >
                <p className="text-white/20 text-5xl">🍽️</p>
                <p className="text-white/40">No dishes found for "{search}"</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <MealModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
