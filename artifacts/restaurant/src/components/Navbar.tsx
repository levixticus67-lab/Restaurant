import { motion } from "framer-motion";
import { ShoppingCart, UtensilsCrossed, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Track Order", href: "/track" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30"
      style={{
        background: "rgba(10,16,28,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <div className="p-1.5 rounded-xl" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <span>Saveur</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <span
                className="text-sm font-medium transition-colors cursor-pointer"
                style={{
                  color: location === l.href ? "#8b5cf6" : "rgba(255,255,255,0.6)",
                }}
              >
                {l.label}
              </span>
            </Link>
          ))}
          {user && (
            <Link href="/admin">
              <span className="text-sm font-medium transition-colors cursor-pointer"
                style={{ color: "rgba(255,255,255,0.6)" }}>
                Admin
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "white" }}
              >
                {count}
              </motion.span>
            )}
          </motion.button>

          <button className="md:hidden p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}
            onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden py-4 px-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <span className="block py-2 text-sm font-medium text-white/70" onClick={() => setMobileOpen(false)}>
                {l.label}
              </span>
            </Link>
          ))}
          {user && (
            <Link href="/admin">
              <span className="block py-2 text-sm font-medium text-white/70" onClick={() => setMobileOpen(false)}>
                Admin Portal
              </span>
            </Link>
          )}
        </motion.div>
      )}
    </header>
  );
}
