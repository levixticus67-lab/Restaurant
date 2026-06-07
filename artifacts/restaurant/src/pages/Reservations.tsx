import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Users, Phone } from "lucide-react";
import AnimatedDots from "@/components/AnimatedDots";
import ReservationFloorplan from "@/components/ReservationFloorplan";
import { useReservations } from "@/hooks/useReservations";

const HIGHLIGHTS = [
  { icon: CalendarDays, label: "Flexible Dates",   desc: "Book up to 30 days ahead" },
  { icon: Clock,        label: "Quick Confirmation", desc: "Instant reservation confirmation" },
  { icon: Users,        label: "Groups Welcome",    desc: "Tables for 1–8 guests" },
  { icon: Phone,        label: "SMS Reminder",      desc: "We'll remind you 2h before" },
];

export default function Reservations() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />
      <ReservationFloorplan isOpen={open} onClose={() => setOpen(false)} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
            <CalendarDays size={12} />
            Reserve Your Table
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Book Your<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              Perfect Table
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/50 max-w-md mx-auto">
            Choose your table on our interactive floorplan, pick a date & time, and confirm — all in under 60 seconds.
          </motion.p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="inline-flex p-2.5 rounded-xl mb-3"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))" }}>
                <Icon size={18} style={{ color: "#60a5fa" }} />
              </div>
              <p className="text-white font-semibold text-sm mb-1">{label}</p>
              <p className="text-white/40 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-block p-6 rounded-3xl mb-8 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
            onClick={() => setOpen(true)}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <CalendarDays size={36} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Interactive Floorplan</h3>
            <p className="text-white/40 text-sm">Click to open and pick your spot</p>
          </motion.div>

          <br />

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            className="px-10 py-4 rounded-2xl font-bold text-white text-lg"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 12px 40px rgba(139,92,246,0.4)",
            }}
          >
            Reserve a Table Now
          </motion.button>

          <p className="text-white/30 text-xs mt-4">
            For large groups (&gt;8) or private events, call us at{" "}
            <a href="tel:+15552345678" className="underline" style={{ color: "#60a5fa" }}>
              +1 (555) 234-5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
