import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, X, Loader2 } from "lucide-react";
import { Meal } from "@/types";
import { naturalLanguageSearch, isGeminiConfigured } from "@/hooks/useGemini";

interface Props {
  allMeals: Meal[];
  onResults: (meals: Meal[] | null) => void;
  isActive: boolean;
  onToggle: () => void;
}

const SUGGESTIONS = [
  "Show me spicy dishes under $20",
  "What's gluten-free tonight?",
  "Something light and healthy",
  "Best dishes for a date night",
  "Dishes with truffle",
  "No nuts please",
];

export default function AIMenuSearch({ allMeals, onResults, isActive, onToggle }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setHasSearched(true);
    const results = await naturalLanguageSearch(q, allMeals);
    onResults(results);
    setLoading(false);
  };

  const handleClear = () => {
    setQuery("");
    setHasSearched(false);
    onResults(null);
    inputRef.current?.focus();
  };

  return (
    <div className="mb-6">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mx-auto mb-4"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))"
            : "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.3)",
          color: "#a78bfa",
        }}
      >
        <Sparkles size={14} />
        {isGeminiConfigured ? "AI Search" : "Smart Search"}
        {isActive && <X size={12} className="ml-1 opacity-60" />}
      </motion.button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-lg mx-auto">
              <div className="relative mb-3">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                  placeholder={isGeminiConfigured ? "Ask anything — 'spicy dishes under $18'..." : "Search ingredients, tags, dishes..."}
                  className="w-full pl-10 pr-24 py-3 rounded-2xl text-white text-sm outline-none placeholder-white/25"
                  style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  {query && (
                    <button onClick={handleClear} className="p-1 rounded-lg text-white/30 hover:text-white/60">
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSearch(query)}
                    disabled={loading || !query.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                    style={{
                      background: query.trim()
                        ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Go
                  </button>
                </div>
              </div>

              {!hasSearched && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
