import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, ChefHat, CheckCircle, Truck, X, Clock, UtensilsCrossed } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Order, OrderStatus } from "@/types";
import { isFirebaseConfigured } from "@/lib/firebase";

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  { status: "pending",   label: "Received",   icon: <Package size={16} />,         desc: "We've got your order!" },
  { status: "confirmed", label: "Confirmed",  icon: <CheckCircle size={16} />,     desc: "Kitchen confirmed your order" },
  { status: "preparing", label: "Preparing",  icon: <ChefHat size={16} />,         desc: "Our chefs are working on it" },
  { status: "ready",     label: "Ready",      icon: <UtensilsCrossed size={16} />, desc: "Your order is ready!" },
  { status: "delivered", label: "Delivered",  icon: <Truck size={16} />,           desc: "Enjoy your meal!" },
];

const ORDER_TYPE_LABEL: Record<string, string> = {
  "dine-in":  "🍽️ Dine In",
  "delivery": "🛵 Delivery",
  "takeaway": "🥡 Takeaway",
};

function stepIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  pending:   { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b",  label: "Pending" },
  confirmed: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa",  label: "Confirmed" },
  preparing: { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa",  label: "Preparing" },
  ready:     { bg: "rgba(16,185,129,0.15)",  color: "#34d399",  label: "Ready" },
  delivered: { bg: "rgba(16,185,129,0.12)",  color: "#10b981",  label: "Delivered ✓" },
  cancelled: { bg: "rgba(239,68,68,0.12)",   color: "#f87171",  label: "Cancelled" },
};

export default function OrderTracking() {
  const { findOrderByNumber } = useOrders();
  const { settings }          = useRestaurantSettings();
  const [input, setInput]     = useState("");
  const [order, setOrder]     = useState<Order | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound]   = useState(false);

  const accent = settings.primaryColor || "#D4A853";

  const handleSearch = async () => {
    if (!input.trim()) return;
    setSearching(true); setNotFound(false); setOrder(null);
    try {
      if (!isFirebaseConfigured) { setNotFound(true); return; }
      const found = await findOrderByNumber(input.trim());
      if (found) setOrder(found); else setNotFound(true);
    } finally { setSearching(false); }
  };

  const currentStep = order ? stepIndex(order.status) : -1;

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d" }}>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-20">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: accent }}>
            <Package size={26} color="#0d0d0d" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Track Your Order</h1>
          <p className="text-white/40 text-sm">Enter your 6-character order number to see live status</p>
        </div>

        {/* Search input */}
        <div className="flex gap-3 mb-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. AB3X7K"
            maxLength={6}
            className="flex-1 px-4 py-4 rounded-2xl text-white text-center text-xl font-mono font-bold tracking-widest outline-none placeholder-white/20"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", letterSpacing: "0.25em" }}
          />
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSearch}
            disabled={searching || !input.trim()}
            className="px-6 py-4 rounded-2xl font-bold flex items-center gap-2 text-sm"
            style={{
              background: !input.trim() ? "rgba(255,255,255,0.05)" : accent,
              color: !input.trim() ? "rgba(255,255,255,0.25)" : "#0d0d0d",
            }}>
            {searching ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Search size={18} />
              </motion.div>
            ) : <Search size={18} />}
            Track
          </motion.button>
        </div>

        {/* Demo notice */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl text-sm text-center"
            style={{ background: `${accent}0d`, border: `1px solid ${accent}25`, color: accent }}>
            Demo mode — order tracking requires Firebase.
          </div>
        )}

        {/* Not found */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center p-8 rounded-3xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <X size={40} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/55 font-semibold">
                No order found for <span className="font-mono text-white/80">{input}</span>
              </p>
              <p className="text-white/30 text-sm mt-1">Double-check the number and try again.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order result */}
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              {/* Summary */}
              <div className="rounded-3xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-extrabold font-mono text-xl tracking-widest"
                        style={{ color: accent }}>
                        #{order.orderNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: STATUS_STYLES[order.status].bg, color: STATUS_STYLES[order.status].color }}>
                        {STATUS_STYLES[order.status].label}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs">
                      {ORDER_TYPE_LABEL[order.orderType]} · {order.customerName}
                    </p>
                  </div>
                  <span className="text-lg font-bold" style={{ color: accent }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                {/* Progress */}
                {order.status !== "cancelled" && (
                  <div className="mt-5">
                    <div className="flex items-center">
                      {STATUS_STEPS.map((step, i) => {
                        const done   = i <= currentStep;
                        const active = i === currentStep;
                        return (
                          <div key={step.status} className="flex-1 flex flex-col items-center relative">
                            {i < STATUS_STEPS.length - 1 && (
                              <div className="absolute top-4 left-1/2 w-full h-0.5 z-0"
                                style={{ background: i < currentStep ? accent : "rgba(255,255,255,0.07)" }} />
                            )}
                            <motion.div
                              animate={active ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-8 h-8 rounded-full flex items-center justify-center z-10 relative"
                              style={{
                                background: done ? accent : "rgba(255,255,255,0.06)",
                                border: `2px solid ${active ? accent : "transparent"}`,
                                color: done ? "#0d0d0d" : "rgba(255,255,255,0.2)",
                              }}>
                              {step.icon}
                            </motion.div>
                            <p className="text-center mt-2 text-[10px] font-medium leading-tight"
                              style={{ color: done ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)" }}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {currentStep >= 0 && (
                      <motion.p key={order.status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm mt-4 font-medium" style={{ color: accent }}>
                        {STATUS_STEPS[currentStep]?.desc}
                      </motion.p>
                    )}
                  </div>
                )}

                {order.status === "cancelled" && (
                  <div className="mt-4 p-3 rounded-xl text-center text-sm"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
                    This order was cancelled. Please contact us if you have questions.
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="rounded-3xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/35 text-xs uppercase tracking-wider mb-4">Items Ordered</p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.mealImage} alt={item.mealName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{item.mealName}</p>
                        <p className="text-white/35 text-xs">× {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: accent }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 space-y-1.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white/65">${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Delivery fee</span>
                      <span className="text-white/65">${order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1">
                    <span className="text-white">Total</span>
                    <span style={{ color: accent }}>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* ETA */}
              {["pending", "confirmed", "preparing"].includes(order.status) && (
                <div className="flex items-center justify-center gap-2 text-sm text-white/35">
                  <Clock size={14} /> Estimated time: 25–35 minutes
                </div>
              )}
              {order.notes && (
                <div className="p-4 rounded-2xl text-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/35 text-xs uppercase tracking-wider">Notes: </span>
                  <span className="text-white/55">{order.notes}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
