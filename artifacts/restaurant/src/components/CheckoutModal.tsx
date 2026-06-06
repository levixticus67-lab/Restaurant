import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, MapPin, UtensilsCrossed, ShoppingBag, CheckCircle, Copy } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCart } from "@/contexts/CartContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { OrderType } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

const ORDER_TYPES: { value: OrderType; label: string; icon: string }[] = [
  { value: "dine-in", label: "Dine In", icon: "🍽️" },
  { value: "delivery", label: "Delivery", icon: "🛵" },
  { value: "takeaway", label: "Takeaway", icon: "🥡" },
];

export default function CheckoutModal({ isOpen, onClose, onSuccess }: Props) {
  const { items, total, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    orderType: "dine-in" as OrderType,
    deliveryAddress: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = form.orderType === "delivery" ? 3.99 : 0;
  const grandTotal = total + deliveryFee;

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.customerName.trim()) { setError("Please enter your name."); return; }
    if (!form.customerPhone.trim()) { setError("Please enter your phone number."); return; }
    if (form.orderType === "delivery" && !form.deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const orderItems = items.map(({ meal, quantity }) => ({
        mealId: meal.id,
        mealName: meal.name,
        mealImage: meal.imageUrl,
        price: meal.price,
        quantity,
      }));
      const orderNumber = await placeOrder({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        orderType: form.orderType,
        deliveryAddress: form.deliveryAddress.trim() || undefined,
        notes: form.notes.trim() || undefined,
        items: orderItems,
        subtotal: total,
        deliveryFee,
        total: grandTotal,
      });
      clearCart();
      onSuccess(orderNumber);
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #0c1a2e 0%, #10082a 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} style={{ color: "#8b5cf6" }} />
                  <h2 className="font-bold text-white">Complete Your Order</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Demo mode notice */}
                {!isFirebaseConfigured && (
                  <div className="p-3 rounded-xl text-xs"
                    style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                    Demo mode — orders won't be persisted. Add Firebase env vars to go live.
                  </div>
                )}

                {/* Order type */}
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Order Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ORDER_TYPES.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => set("orderType", value)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-semibold transition-all"
                        style={
                          form.orderType === value
                            ? { background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "#fff" }
                            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                        }
                      >
                        <span className="text-lg">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Your Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      className={inputCls}
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                      placeholder="e.g. Alex Johnson"
                      value={form.customerName}
                      onChange={(e) => set("customerName", e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      className={inputCls}
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                      placeholder="+1 555 000 0000"
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => set("customerPhone", e.target.value)}
                    />
                  </div>
                </div>

                {/* Delivery address */}
                {form.orderType === "delivery" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Delivery Address *</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-3.5 text-white/30" />
                      <textarea
                        className={inputCls}
                        style={{ ...inputStyle, paddingLeft: "2.25rem", resize: "none" }}
                        placeholder="Street, City, Zip..."
                        rows={2}
                        value={form.deliveryAddress}
                        onChange={(e) => set("deliveryAddress", e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Special Notes (optional)</label>
                  <textarea
                    className={inputCls}
                    style={{ ...inputStyle, resize: "none" }}
                    placeholder="Allergies, extra requests..."
                    rows={2}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>

                {/* Order summary */}
                <div className="rounded-2xl p-4 space-y-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Order Summary</p>
                  {items.map(({ meal, quantity }) => (
                    <div key={meal.id} className="flex justify-between text-sm">
                      <span className="text-white/70">{meal.name} × {quantity}</span>
                      <span className="text-white font-medium">${(meal.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Subtotal</span>
                      <span className="text-white">${total.toFixed(2)}</span>
                    </div>
                    {form.orderType === "delivery" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Delivery fee</span>
                        <span className="text-white">$3.99</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-1">
                      <span className="text-white">Total</span>
                      <span style={{ color: "#f59e0b" }}>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm"
                  style={{
                    background: submitting ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    boxShadow: submitting ? "none" : "0 8px 24px rgba(139,92,246,0.4)",
                  }}
                >
                  {submitting ? "Placing Order..." : `Confirm Order — $${grandTotal.toFixed(2)}`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Confirmation overlay shown after order placed ─────────────────────────── */
interface ConfirmationProps {
  orderNumber: string;
  onClose: () => void;
}

export function OrderConfirmation({ orderNumber, onClose }: ConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: "linear-gradient(180deg, #0c1a2e 0%, #10082a 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", damping: 16 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)" }}
        >
          <CheckCircle size={40} style={{ color: "#10b981" }} />
        </motion.div>

        <h2 className="text-2xl font-extrabold text-white mb-2">Order Placed!</h2>
        <p className="text-white/50 text-sm mb-6">
          Your food is being prepared. Track your order below.
        </p>

        <div className="rounded-2xl p-4 mb-6"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Your Order Number</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-extrabold tracking-widest"
              style={{ color: "#a78bfa", fontFamily: "monospace" }}>
              {orderNumber}
            </span>
            <button onClick={copy} className="p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              {copied
                ? <CheckCircle size={16} style={{ color: "#10b981" }} />
                : <Copy size={16} className="text-white/50" />
              }
            </button>
          </div>
          <p className="text-white/30 text-xs mt-2">Save this to track your order</p>
        </div>

        <div className="flex gap-3">
          <a
            href="/track"
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white text-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            Track Order
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
