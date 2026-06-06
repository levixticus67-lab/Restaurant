import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Star, Clock, Award, ChefHat } from "lucide-react";
import AnimatedDots from "@/components/AnimatedDots";
import RotatingProducts from "@/components/RotatingProducts";
import MealModal from "@/components/MealModal";
import MapSection from "@/components/MapSection";
import { useMenu } from "@/hooks/useMenu";
import { Meal } from "@/types";

const STATS = [
  { icon: Star, value: "4.9", label: "Rating" },
  { icon: Clock, value: "25min", label: "Avg Delivery" },
  { icon: Award, value: "15+", label: "Awards" },
  { icon: ChefHat, value: "50+", label: "Menu Items" },
];

export default function Home() {
  const { meals } = useMenu();
  const [selected, setSelected] = useState<Meal | null>(null);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#080f1c" }}>
      <AnimatedDots />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#a78bfa",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Now Open · Dine In &amp; Takeaway
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight"
          >
            Crafted with{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)" }}
            >
              Passion
            </span>
            <br />
            Served with Pride
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-lg mb-10 max-w-xl mx-auto"
          >
            Fine dining flavours at your doorstep. Farm-to-table ingredients, 
            bold recipes, unforgettable taste.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  boxShadow: "0 12px 40px rgba(139,92,246,0.35)",
                }}
              >
                Explore Menu
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Book a Table
            </motion.button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 w-full max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16"
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon size={20} style={{ color: "#8b5cf6" }} />
              <span className="text-white font-extrabold text-xl">{value}</span>
              <span className="text-white/40 text-xs">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Rotating Products */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 w-full max-w-2xl mx-auto"
          style={{ minHeight: 400 }}
        >
          <p className="text-center text-white/30 text-xs uppercase tracking-widest font-semibold mb-4">
            Featured Tonight
          </p>
          <RotatingProducts meals={meals} onOpen={setSelected} />
        </motion.div>
      </section>

      {/* About */}
      <section
        id="about"
        className="relative z-10 py-24 px-4"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "#8b5cf6" }}>Our Story</p>
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
              Where Every Dish Tells a Story
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-6">
              Founded by Chef Marco Rivera in 2018, Saveur was born from a passion for 
              elevating everyday ingredients into extraordinary experiences. We partner 
              with local farmers to bring you the freshest produce, sustainably sourced 
              proteins, and flavours that transport you around the world — all from one table.
            </p>
            <p className="text-white/50 text-base leading-relaxed">
              From our wood-fired grill to our handmade pasta station, every technique 
              is intentional, every garnish purposeful. Come hungry. Leave inspired.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
              "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80",
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
              "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80",
            ].map((src, i) => (
              <motion.img
                key={i}
                whileHover={{ scale: 1.04 }}
                src={src}
                alt=""
                className={`w-full object-cover rounded-2xl ${i === 1 ? "mt-8" : i === 3 ? "-mt-8" : ""}`}
                style={{ height: 160 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Map & Contact */}
      <MapSection />

      <MealModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
