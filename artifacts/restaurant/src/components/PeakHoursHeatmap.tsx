import { useMemo } from "react";
import { motion } from "framer-motion";
import { Order } from "@/types";

interface Props {
  orders: Order[];
}

const HOURS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHour(h: number) {
  if (h === 12) return "12pm";
  if (h > 12) return `${h - 12}pm`;
  return `${h}am`;
}

function getColor(value: number, max: number): string {
  const pct = max === 0 ? 0 : value / max;
  if (pct === 0) return "rgba(255,255,255,0.03)";
  if (pct < 0.25) return "rgba(59,130,246,0.2)";
  if (pct < 0.5) return "rgba(59,130,246,0.45)";
  if (pct < 0.75) return "rgba(139,92,246,0.55)";
  return "rgba(239,68,68,0.7)";
}

export default function PeakHoursHeatmap({ orders }: Props) {
  const grid = useMemo(() => {
    const counts: number[][] = Array.from({ length: 7 }, () => Array(HOURS.length).fill(0));

    orders.forEach((o) => {
      const ts = typeof o.createdAt === "number" ? o.createdAt : 0;
      if (!ts) return;
      const d = new Date(ts);
      const dow = (d.getDay() + 6) % 7;
      const hour = d.getHours();
      const hIdx = HOURS.indexOf(hour);
      if (hIdx !== -1) counts[dow][hIdx]++;
    });

    return counts;
  }, [orders]);

  const max = Math.max(1, ...grid.flat());

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-white/30 text-sm">No order data yet. Heatmap populates as orders come in.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 480 }}>
          <div className="flex mb-1 pl-10">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                {formatHour(h)}
              </div>
            ))}
          </div>

          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-10 text-xs shrink-0" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {day}
              </div>
              {HOURS.map((_, hi) => {
                const val = grid[di][hi];
                return (
                  <motion.div
                    key={hi}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (di * HOURS.length + hi) * 0.01 }}
                    title={`${DAYS[di]} ${formatHour(HOURS[hi])}: ${val} orders`}
                    className="flex-1 h-7 rounded-md mx-0.5 flex items-center justify-center cursor-default"
                    style={{ background: getColor(val, max) }}
                  >
                    {val > 0 && (
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 9 }}>{val}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Quiet</span>
            {["rgba(255,255,255,0.03)", "rgba(59,130,246,0.2)", "rgba(59,130,246,0.45)", "rgba(139,92,246,0.55)", "rgba(239,68,68,0.7)"].map((c, i) => (
              <div key={i} className="w-6 h-4 rounded" style={{ background: c }} />
            ))}
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Busy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
