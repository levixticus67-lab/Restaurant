import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star, Clock, Award, ChefHat, ArrowRight, MapPin, Phone } from "lucide-react";
import MealCard from "@/components/MealCard";
import MealModal from "@/components/MealModal";
import { useMenu } from "@/hooks/useMenu";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Meal } from "@/types";

const STATS = [
  { icon: Star,    value: "4.9",  label: "Rating" },
  { icon: Clock,   value: "25m",  label: "Delivery" },
  { icon: Award,   value: "15+",  label: "Awards" },
  { icon: ChefHat, value: "50+",  label: "Items" },
];

export default function Home() {
  const { meals } = useMenu();
  const { settings } = useRestaurantSettings();
  const [selected, setSelected] = useState<Meal | null>(null);

  const featured = meals.filter((m) => m.isAvailable && m.isFeatured).slice(0, 8);
  const popular  = meals.filter((m) => m.isAvailable && !m.isFeatured).slice(0, 6);

  const accent = settings.primaryColor || "#D4A853";

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d" }}>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={settings.heroImageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80"}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.82) 60%, #0d0d0d 100%)",
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-12 pb-16 pt-24"
          style={{ minHeight: "92vh" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4"
              style={{ color: accent }}>
              ✦ Premium Dining
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-3">
              {settings.name}
            </h1>
            <p className="text-white/60 text-lg md:text-xl mb-8 max-w-lg">
              {settings.tagline}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-10">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Icon size={14} style={{ color: accent }} />
                  <span className="text-white font-bold text-sm">{value}</span>
                  <span className="text-white/40 text-xs">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/menu">
                <motion.button whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm"
                  style={{ background: accent, color: "#0d0d0d" }}>
                  View Menu
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/reservations">
                <motion.button whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm"
                  style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}>
                  Reserve a Table
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ORDER TYPE STRIP ─── */}
      <section className="px-5 md:px-12 py-6">
        <div className="flex gap-3 overflow-x-auto scrollbar-none">
          {[
            { label: "Dine In",   icon: "🍽️", desc: "Reserve a table" },
            { label: "Takeaway",  icon: "🥡", desc: "Pick up your order" },
            { label: "Delivery",  icon: "🛵", desc: "Delivered to you" },
          ].map((type) => (
            <Link href="/menu" key={type.label}>
              <div className="shrink-0 flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer transition-all hover:border-amber-500/40"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 160 }}>
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{type.label}</p>
                  <p className="text-white/35 text-xs">{type.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED MEALS ─── */}
      {featured.length > 0 && (
        <section className="px-5 md:px-12 pb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white text-xl font-extrabold">Chef's Picks</h2>
              <p className="text-white/35 text-xs mt-0.5">Handpicked by our kitchen</p>
            </div>
            <Link href="/menu">
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: accent }}>
                See all <ArrowRight size={12} />
              </span>
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-none pb-2">
            {featured.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="shrink-0"
                style={{ width: 200 }}
              >
                <MealCard meal={meal} onOpen={setSelected} />
              </motion.div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <MealCard meal={meal} onOpen={setSelected} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── POPULAR ITEMS ─── */}
      {popular.length > 0 && (
        <section className="px-5 md:px-12 pb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white text-xl font-extrabold">Popular Right Now</h2>
              <p className="text-white/35 text-xs mt-0.5">Customer favourites</p>
            </div>
            <Link href="/menu">
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: accent }}>
                View all <ArrowRight size={12} />
              </span>
            </Link>
          </div>

          <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-none pb-2">
            {popular.map((meal, i) => (
              <motion.div key={meal.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }} className="shrink-0" style={{ width: 200 }}>
                <MealCard meal={meal} onOpen={setSelected} />
              </motion.div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
            {popular.map((meal, i) => (
              <motion.div key={meal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <MealCard meal={meal} onOpen={setSelected} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── ABOUT / INFO STRIP ─── */}
      <section className="mx-5 md:mx-12 mb-10 rounded-3xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: accent }}>
              Hours
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-white/60">Breakfast: <span className="text-white">{settings.hours.breakfast}</span></p>
              <p className="text-white/60">Lunch: <span className="text-white">{settings.hours.lunch}</span></p>
              <p className="text-white/60">Dinner: <span className="text-white">{settings.hours.dinner}</span></p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: accent }}>
              Location
            </p>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-white/40 mt-0.5 shrink-0" />
              <p className="text-white/70 text-sm">{settings.address}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: accent }}>
              Contact
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-white/40" />
                <p className="text-white/70 text-sm">{settings.phone}</p>
              </div>
              <p className="text-white/40 text-sm">{settings.email}</p>
            </div>
          </div>
        </div>
      </section>

      {selected && <MealModal meal={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
