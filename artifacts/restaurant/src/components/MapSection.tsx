import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Maximize2, X, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";

function buildEmbedUrl(lat: number, lng: number, zoom: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&hl=en`;
}

function buildDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function MapSection() {
  const { settings } = useRestaurantSettings();
  const [expanded, setExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [fullMapLoaded, setFullMapLoaded] = useState(false);

  const embedUrl = buildEmbedUrl(settings.lat, settings.lng, settings.zoom);
  const directionsUrl = buildDirectionsUrl(settings.lat, settings.lng);

  return (
    <>
      {/* ── Section wrapper ─────────────────────────────────────────── */}
      <section id="find-us" className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold mb-3" style={{ color: "#8b5cf6" }}>Find Us</p>
            <h2 className="text-4xl font-extrabold text-white mb-3">Come Visit Saveur</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Tap the map to explore, zoom in, or get turn-by-turn directions right to our door.
            </p>
          </motion.div>

          {/* Card grid */}
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* Info cards (left column) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Address */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl shrink-0"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Address</p>
                    <p className="text-white text-sm font-medium leading-relaxed">{settings.address}</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                    <Phone size={16} style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${settings.phone}`} className="text-white text-sm font-medium hover:text-purple-400 transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl shrink-0"
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                    <Mail size={16} style={{ color: "#fbbf24" }} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-white text-sm font-medium hover:text-purple-400 transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl shrink-0"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <Clock size={16} style={{ color: "#a78bfa" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Opening Hours</p>
                    {Object.entries(settings.hours).map(([meal, time]) => (
                      <div key={meal} className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-white/60">{meal}</span>
                        <span className="text-white font-medium">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Directions CTA */}
              <motion.a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  boxShadow: "0 8px 24px rgba(139,92,246,0.35)",
                }}
              >
                <Navigation size={15} />
                Get Directions
                <ExternalLink size={13} className="opacity-70" />
              </motion.a>
            </motion.div>

            {/* Map card (right 2 columns) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 relative group"
              style={{ height: 460 }}
            >
              {/* Glow */}
              <div
                className="absolute -inset-1 rounded-3xl opacity-40 blur-xl pointer-events-none"
                style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)" }}
              />

              {/* Map container */}
              <div
                className="relative h-full rounded-3xl overflow-hidden cursor-pointer"
                style={{ border: "1px solid rgba(139,92,246,0.4)" }}
                onClick={() => setExpanded(true)}
              >
                {/* Skeleton shimmer while loading */}
                {!mapLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ background: "#0c1728" }}>
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
                      >
                        <MapPin size={22} className="text-white" />
                      </motion.div>
                      <p className="text-white/30 text-sm">Loading map...</p>
                    </div>
                  </div>
                )}

                {/* Google Maps iframe */}
                <iframe
                  src={embedUrl}
                  title="Restaurant Location"
                  className="w-full h-full border-0"
                  loading="lazy"
                  onLoad={() => setMapLoaded(true)}
                  style={{ pointerEvents: "none" }}
                />

                {/* Dark gradient overlays — top and bottom */}
                <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, rgba(8,15,28,0.7), transparent)" }} />
                <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(8,15,28,0.95), transparent)" }} />

                {/* Animated pin overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: 16 + i * 20,
                          height: 16 + i * 20,
                          top: -(8 + i * 10),
                          left: -(8 + i * 10),
                          border: `2px solid rgba(139,92,246,${0.5 - i * 0.12})`,
                        }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                      />
                    ))}
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 20px rgba(139,92,246,0.8)" }}>
                      <MapPin size={11} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between pointer-events-none">
                  <div>
                    <p className="text-white font-bold text-sm">Saveur Restaurant</p>
                    <p className="text-white/50 text-xs truncate max-w-xs">{settings.address}</p>
                  </div>
                  <div className="flex gap-2 pointer-events-auto">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: "rgba(139,92,246,0.85)", backdropFilter: "blur(8px)" }}
                    >
                      <Maximize2 size={12} />
                      Expand
                    </motion.button>
                  </div>
                </div>

                {/* Hover hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: "rgba(8,15,28,0.25)" }}
                >
                  <div className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
                    style={{ background: "rgba(139,92,246,0.85)", backdropFilter: "blur(8px)" }}>
                    <Maximize2 size={16} />
                    Click to open full map
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Full-screen map modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
              onClick={() => setExpanded(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed inset-4 sm:inset-6 z-50 rounded-3xl overflow-hidden flex flex-col"
              style={{ border: "1px solid rgba(139,92,246,0.4)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Map header bar */}
              <div
                className="flex items-center justify-between px-5 py-3.5 shrink-0"
                style={{
                  background: "rgba(8,15,28,0.95)",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    <MapPin size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Saveur Restaurant</p>
                    <p className="text-white/40 text-xs">{settings.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
                  >
                    <Navigation size={13} />
                    Directions
                  </motion.a>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setExpanded(false)}
                    className="p-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <X size={17} className="text-white/70" />
                  </motion.button>
                </div>
              </div>

              {/* Full map */}
              <div className="flex-1 relative" style={{ minHeight: 0 }}>
                {!fullMapLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ background: "#0c1728" }}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                        <MapPin size={26} className="text-white" />
                      </div>
                      <p className="text-white/40 text-sm">Loading map...</p>
                    </motion.div>
                  </div>
                )}
                <iframe
                  src={buildEmbedUrl(settings.lat, settings.lng, 17)}
                  title="Restaurant Location Full"
                  className="w-full h-full border-0"
                  loading="lazy"
                  onLoad={() => setFullMapLoaded(true)}
                  allowFullScreen
                />
              </div>

              {/* Bottom action strip */}
              <div
                className="flex items-center justify-between px-5 py-3 shrink-0"
                style={{
                  background: "rgba(8,15,28,0.95)",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Phone size={12} /> {settings.phone}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    <Mail size={12} /> {settings.email}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${settings.lat},${settings.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#a78bfa" }}
                >
                  Open in Google Maps <ExternalLink size={11} />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
