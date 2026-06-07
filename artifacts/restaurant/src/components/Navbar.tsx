import { motion } from "framer-motion";
import { Home, UtensilsCrossed, CalendarDays, Package, Star, ShoppingCart, LogIn, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";

const NAV = [
  { label: "Home",         href: "/",            icon: Home },
  { label: "Menu",         href: "/menu",         icon: UtensilsCrossed },
  { label: "Reservations", href: "/reservations", icon: CalendarDays },
  { label: "Track Order",  href: "/track",        icon: Package },
  { label: "Loyalty",      href: "/loyalty",      icon: Star },
];

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();
  const { settings } = useRestaurantSettings();
  const [location] = useLocation();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-30"
        style={{
          width: 260,
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.name} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: settings.primaryColor || "#D4A853" }}>
                <UtensilsCrossed size={18} color="#0d0d0d" />
              </div>
            )}
            <div>
              <p className="font-extrabold text-white text-base leading-tight">{settings.name}</p>
              <p className="text-white/30 text-xs leading-tight truncate max-w-[160px]">{settings.tagline}</p>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    background: active ? `${settings.primaryColor || "#D4A853"}18` : "transparent",
                    borderLeft: active ? `3px solid ${settings.primaryColor || "#D4A853"}` : "3px solid transparent",
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: active ? settings.primaryColor || "#D4A853" : "rgba(255,255,255,0.4)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: active ? "#fff" : "rgba(255,255,255,0.4)" }}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {user && (
            <Link href="/admin">
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                style={{
                  background: isActive("/admin") ? "rgba(212,168,83,0.1)" : "transparent",
                  borderLeft: isActive("/admin") ? "3px solid #D4A853" : "3px solid transparent",
                }}
              >
                <LayoutDashboard size={17} style={{ color: isActive("/admin") ? "#D4A853" : "rgba(255,255,255,0.4)" }} />
                <span className="text-sm font-medium" style={{ color: isActive("/admin") ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  Admin Panel
                </span>
              </motion.div>
            </Link>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Cart */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl relative"
            style={{ background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.2)" }}
          >
            <ShoppingCart size={17} style={{ color: "#D4A853" }} />
            <span className="text-sm font-semibold text-white">My Cart</span>
            {count > 0 && (
              <span className="ml-auto min-w-[22px] h-[22px] rounded-full text-xs font-bold flex items-center justify-center px-1"
                style={{ background: "#D4A853", color: "#0d0d0d" }}>
                {count}
              </span>
            )}
          </motion.button>

          {/* Login/Logout */}
          {!user && (
            <Link href="/login">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <LogIn size={17} className="text-white/30" />
                <span className="text-sm text-white/40">Staff Login</span>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center"
        style={{
          background: "#0d0d0d",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV.slice(0, 2).map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center justify-center h-full gap-1 py-2">
                <Icon size={20} style={{ color: active ? settings.primaryColor || "#D4A853" : "rgba(255,255,255,0.35)" }} />
                <span className="text-[10px] font-medium"
                  style={{ color: active ? settings.primaryColor || "#D4A853" : "rgba(255,255,255,0.35)" }}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Center cart button */}
        <div className="flex-1 flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: settings.primaryColor || "#D4A853" }}
          >
            <ShoppingCart size={20} color="#0d0d0d" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "#ef4444", color: "white" }}>
                {count}
              </span>
            )}
          </motion.button>
        </div>

        {NAV.slice(2, 4).map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center justify-center h-full gap-1 py-2">
                <Icon size={20} style={{ color: active ? settings.primaryColor || "#D4A853" : "rgba(255,255,255,0.35)" }} />
                <span className="text-[10px] font-medium"
                  style={{ color: active ? settings.primaryColor || "#D4A853" : "rgba(255,255,255,0.35)" }}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
