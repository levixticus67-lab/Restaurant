import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Users, Phone } from "lucide-react";
import ReservationFloorplan from "@/components/ReservationFloorplan";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";

const HIGHLIGHTS = [
  { icon: CalendarDays, label: "Flexible Dates",      desc: "Book up to 30 days ahead" },
  { icon: Clock,        label: "Quick Confirmation",  desc: "Instant reservation confirmation" },
  { icon: Users,        label: "Groups Welcome",      desc: "Tables for 1–8 guests" },
  { icon: Phone,        label: "SMS Reminder",        desc: "We'll remind you 2h before" },
];

export default function Reservations() {
  const [open, setOpen] = useState(false);
  const { settings }    = useRestaurantSettings();
  const accent          = settings.primaryColor || "#D4A853";

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d" }}>
      <ReservationFloorplan isOpen={open} onClose={() => setOpen(false)} />

      <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
            <CalendarDays size={12} />
            Reserve Your Table
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Book Your<br />
            <span style={{ color: accent }}>Perfect Table</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/45 max-w-md mx-auto text-sm">
            Choose your table on our interactive floorplan, pick a date &amp; time, and confirm — all in under 60 seconds.
          </motion.p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="inline-flex p-2.5 rounded-xl mb-3"
                style={{ background: `${accent}15` }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <p className="text-white font-semibold text-sm mb-1">{label}</p>
              <p className="text-white/40 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* Floorplan CTA */}
        <div className="text-center">
          <motion.div whileHover={{ scale: 1.02 }}
            className="inline-block p-6 rounded-3xl mb-8 cursor-pointer"
            style={{ background: `${accent}0d`, border: `1px solid ${accent}25` }}
            onClick={() => setOpen(true)}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: accent }}>
              <CalendarDays size={36} color="#0d0d0d" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Interactive Floorplan</h3>
            <p className="text-white/40 text-sm">Click to open and pick your spot</p>
          </motion.div>

          <br />

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            className="px-10 py-4 rounded-2xl font-bold text-base"
            style={{ background: accent, color: "#0d0d0d" }}>
            Reserve a Table Now
          </motion.button>

          <p className="text-white/25 text-xs mt-4">
            For large groups (&gt;8) or private events, call us at{" "}
            <a href={`tel:${settings.phone}`} className="underline" style={{ color: accent }}>
              {settings.phone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
