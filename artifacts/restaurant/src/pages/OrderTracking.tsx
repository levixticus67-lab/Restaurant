import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, ChefHat, CheckCircle, Truck, X, Clock, UtensilsCrossed } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Order, OrderStatus } from "@/types";
import AnimatedDots from "@/components/AnimatedDots";
import { isFirebaseConfigured } from "@/lib/firebase";

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  { status: "pending",   label: "Order Received",  icon: <Package size={18} />,       desc: "We've got your order!" },
  { status: "confirmed", label: "Confirmed",        icon: <CheckCircle size={18} />,   desc: "Kitchen confirmed your order" },
  { status: "preparing", label: "Being Prepared",   icon: <ChefHat size={18} />,       desc: "Our chefs are working on it" },
  { status: "ready",     label: "Ready",            icon: <UtensilsCrossed size={18} />, desc: "Your order is ready!" },
  { status: "delivered", label: "Delivered",        icon: <Truck size={18} />,         desc: "Enjoy your meal!" },
];

const ORDER_TYPE_LABEL: Record<string, string> = {
  "dine-in": "🍽️ Dine In",
  "delivery": "🛵 Delivery",
  "takeaway": "🥡 Takeaway",
};

function stepIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, { bg: string; color: string; label: string }> = {
    pending:   { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b",  label: "Pending" },
    confirmed: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa",  label: "Confirmed" },
    preparing: { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa",  label: "Preparing" },
    ready:     { bg: "rgba(16,185,129,0.15)",  color: "#34d399",  label: "Ready" },
    delivered: { bg: "rgba(16,185,129,0.12)",  color: "#10b981",  label: "Delivered ✓" },
    cancelled: { bg: "rgba(239,68,68,0.12)",   color: "#f87171",  label: "Cancelled" },
  };
  const s = styles[status];
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function OrderTracking() {
  const { findOrderByNumber } = useOrders();
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setSearching(true);
    setNotFound(false);
    setOrder(null);
    try {
      if (!isFirebaseConfigured) {
        setNotFound(true);
        return;
      }
      const found = await findOrderByNumber(input.trim());
      if (found) {
        setOrder(found);
      } else {
        setNotFound(true);
      }
    } finally {
      setSearching(false);
    }
  };

  const currentStep = order ? stepIndex(order.status) : -1;

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            <Package size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Track Your Order</h1>
          <p className="text-white/40 text-sm">Enter your 6-character order number to see live status</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. AB3X7K"
              maxLength={6}
              className="w-full px-4 py-4 rounded-2xl text-white text-center text-xl font-mono font-bold tracking-widest outline-none placeholder-white/20"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", letterSpacing: "0.25em" }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            disabled={searching || !input.trim()}
            className="px-6 py-4 rounded-2xl font-bold text-white flex items-center gap-2"
            style={{
              background: searching || !input.trim()
                ? "rgba(255,255,255,0.06)"
                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: searching || !input.trim() ? "rgba(255,255,255,0.3)" : "white",
            }}
          >
            {searching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Search size={20} />
              </motion.div>
            ) : (
              <Search size={20} />
            )}
            Track
          </motion.button>
        </div>

        {/* Demo notice */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl text-sm text-center"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
            Demo mode — order tracking requires Firebase. Add your env vars to go live.
          </div>
        )}

        {/* Not found */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center p-8 rounded-3xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <X size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/60 font-semibold">No order found for <span className="font-mono text-white/80">{input}</span></p>
              <p className="text-white/30 text-sm mt-1">Double-check the order number and try again.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order result */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Summary card */}
              <div className="rounded-3xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-extrabold font-mono text-xl tracking-widest"
                        style={{ color: "#a78bfa" }}>
                        #{order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-white/40 text-xs">
                      {ORDER_TYPE_LABEL[order.orderType]} · {order.customerName}
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-white/30 text-xs mt-0.5">{order.deliveryAddress}</p>
                    )}
                  </div>
                  <span className="text-lg font-bold" style={{ color: "#f59e0b" }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                {/* Progress bar */}
                {order.status !== "cancelled" && (
                  <div className="mt-5">
                    <div className="flex items-center relative">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= currentStep;
                        const active = i === currentStep;
                        return (
                          <div key={step.status} className="flex-1 flex flex-col items-center relative">
                            {/* connector line */}
                            {i < STATUS_STEPS.length - 1 && (
                              <div className="absolute top-4 left-1/2 w-full h-0.5 z-0"
                                style={{
                                  background: i < currentStep
                                    ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                                    : "rgba(255,255,255,0.08)",
                                }} />
                            )}
                            {/* dot */}
                            <motion.div
                              animate={active ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-8 h-8 rounded-full flex items-center justify-center z-10 relative"
                              style={{
                                background: done
                                  ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                  : "rgba(255,255,255,0.06)",
                                border: active
                                  ? "2px solid rgba(139,92,246,0.8)"
                                  : "2px solid transparent",
                                color: done ? "white" : "rgba(255,255,255,0.2)",
                              }}
                            >
                              {step.icon}
                            </motion.div>
                            <p className="text-center mt-2 text-xs font-medium"
                              style={{ color: done ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)" }}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active step description */}
                    {currentStep >= 0 && (
                      <motion.p
                        key={order.status}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm mt-4 font-medium"
                        style={{ color: "#a78bfa" }}
                      >
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
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Items Ordered</p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.mealImage} alt={item.mealName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{item.mealName}</p>
                        <p className="text-white/40 text-xs">× {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 space-y-1.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white/70">${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Delivery fee</span>
                      <span className="text-white/70">${order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1">
                    <span className="text-white">Total</span>
                    <span style={{ color: "#f59e0b" }}>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* ETA */}
              {(order.status === "pending" || order.status === "confirmed" || order.status === "preparing") && (
                <div className="flex items-center justify-center gap-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Clock size={14} />
                  Estimated time: 25–35 minutes
                </div>
              )}

              {order.notes && (
                <div className="p-4 rounded-2xl text-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/40 text-xs uppercase tracking-wider">Notes: </span>
                  <span className="text-white/60">{order.notes}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
