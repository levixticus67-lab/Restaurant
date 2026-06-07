import { motion, AnimatePresence } from "framer-motion";
import { MoodType } from "@/types";

interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  desc: string;
  gradient: string;
  tags: string[];
}

const MOODS: MoodOption[] = [
  {
    id: "adventurous",
    emoji: "🌶️",
    label: "Adventurous",
    desc: "Bold & unexpected",
    gradient: "linear-gradient(135deg, #ef4444, #f59e0b)",
    tags: ["spicy", "exotic", "bold", "truffle", "wagyu"],
  },
  {
    id: "comfort",
    emoji: "🍔",
    label: "Comfort Food",
    desc: "Warm & satisfying",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    tags: ["comfort", "burger", "pasta", "pizza", "hearty"],
  },
  {
    id: "healthy",
    emoji: "🥗",
    label: "Healthy",
    desc: "Light & nourishing",
    gradient: "linear-gradient(135deg, #10b981, #3b82f6)",
    tags: ["healthy", "light", "vegan", "salad", "seafood"],
  },
  {
    id: "celebrating",
    emoji: "🥂",
    label: "Celebrating",
    desc: "Indulge & splurge",
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    tags: ["premium", "special", "featured", "wagyu", "truffle", "dessert"],
  },
];

interface Props {
  selected: MoodType | null;
  onSelect: (mood: MoodType | null) => void;
}

export default function MoodSelector({ selected, onSelect }: Props) {
  return (
    <div className="mb-8">
      <p className="text-center text-white/30 text-xs uppercase tracking-widest font-semibold mb-4">
        What's the vibe?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {MOODS.map((mood) => {
          const active = selected === mood.id;
          return (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(active ? null : mood.id)}
              className="relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all"
              style={
                active
                  ? {
                      background: mood.gradient,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }
              }
            >
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                )}
              </AnimatePresence>
              <motion.span
                animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-2xl"
              >
                {mood.emoji}
              </motion.span>
              <div className="text-center">
                <p
                  className="text-xs font-bold"
                  style={{ color: active ? "white" : "rgba(255,255,255,0.7)" }}
                >
                  {mood.label}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)" }}
                >
                  {mood.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { MOODS };
