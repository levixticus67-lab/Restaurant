import { motion } from "framer-motion";
import { Meal } from "@/types";

interface Props {
  meal: Meal;
}

const ALLERGEN_COLORS: Record<string, string> = {
  gluten: "#ef4444",
  nuts: "#f59e0b",
  dairy: "#3b82f6",
  eggs: "#f59e0b",
  shellfish: "#8b5cf6",
  soy: "#10b981",
  fish: "#06b6d4",
  wheat: "#ef4444",
};

function MacroRing({
  value,
  max,
  color,
  label,
  unit,
  delay,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  unit: string;
  delay: number;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs">{value}{unit}</span>
        </div>
      </div>
      <span className="text-white/40 text-xs">{label}</span>
    </div>
  );
}

export default function NutritionPanel({ meal }: Props) {
  const n = meal.nutrition;
  const cal = meal.calories;

  if (!n && !cal) return null;

  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-4">
        Nutrition
      </p>

      <div className="flex items-center justify-around mb-4">
        {cal && (
          <div className="flex flex-col items-center gap-1">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-extrabold"
              style={{ color: "#f59e0b" }}
            >
              {cal}
            </motion.span>
            <span className="text-white/40 text-xs">kcal</span>
          </div>
        )}

        {n && (
          <>
            <MacroRing value={n.protein} max={60} color="#3b82f6" label="Protein" unit="g" delay={0.1} />
            <MacroRing value={n.carbs} max={100} color="#f59e0b" label="Carbs" unit="g" delay={0.2} />
            <MacroRing value={n.fats} max={50} color="#ef4444" label="Fats" unit="g" delay={0.3} />
            {n.fiber != null && (
              <MacroRing value={n.fiber} max={20} color="#10b981" label="Fiber" unit="g" delay={0.4} />
            )}
          </>
        )}
      </div>

      {n && (
        <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {n.sodium != null && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              Sodium: {n.sodium}mg
            </span>
          )}
          {n.sugar != null && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              Sugar: {n.sugar}g
            </span>
          )}
        </div>
      )}

      {meal.allergens && meal.allergens.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Contains</p>
          <div className="flex flex-wrap gap-1.5">
            {meal.allergens.map((a) => (
              <span
                key={a}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: `${ALLERGEN_COLORS[a.toLowerCase()] ?? "#6b7280"}18`,
                  border: `1px solid ${ALLERGEN_COLORS[a.toLowerCase()] ?? "#6b7280"}44`,
                  color: ALLERGEN_COLORS[a.toLowerCase()] ?? "#9ca3af",
                }}
              >
                ⚠️ {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
