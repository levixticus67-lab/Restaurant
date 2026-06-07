import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useState } from "react";
import CheckoutModal, { OrderConfirmation } from "./CheckoutModal";

const TIP_OPTIONS = [15, 20, 25, 0];

export default function Cart() {
  const { items, removeItem, updateQty, total, count, isOpen, setIsOpen, tip, setTip } = useCart();
  const { settings } = useRestaurantSettings();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);

  const accent = settings.primaryColor || "#D4A853";
  const TAX_RATE = 0.0875;
  const tax = total * TAX_RATE;
  const tipAmount = showCustomTip ? (parseFloat(customTip) || 0) : total * (tip / 100);
  const grandTotal = total + tax + tipAmount;

  const avgPrepTime = items.reduce((sum, i) => {
    const mins = parseInt(i.meal.prepTime ?? "0");
    return sum + (isNaN(mins) ? 0 : mins);
  }, 0);

  const handleSuccess = (num: string) => {
    setCheckoutOpen(false);
    setIsOpen(false);
    setOrderNumber(num);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsOpen(false)} />

            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col"
              style={{ background: "#111111", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>

              {/* Header */}
              <div className="flex items-center justify-between p-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} style={{ color: accent }} />
                  <h2 className="font-bold text-white">Your Order</h2>
                  {count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: `${accent}20`, color: accent }}>
                      {count}
                    </span>
                  )}
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <ShoppingBag size={48} className="text-white/10" />
                  <p className="text-white/35 text-sm">Your cart is empty.<br />Add some delicious meals!</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    <AnimatePresence>
                      {items.map(({ meal, quantity }) => (
                        <motion.div key={meal.id} layout
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                          className="flex gap-3 p-3 rounded-2xl"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <img src={meal.imageUrl} alt={meal.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{meal.name}</p>
                            <p className="text-sm font-bold mt-0.5" style={{ color: accent }}>
                              ${(meal.price * quantity).toFixed(2)}
                            </p>
                            {meal.prepTime && (
                              <div className="flex items-center gap-1 mt-0.5 text-white/30 text-xs">
                                <Clock size={10} /> {meal.prepTime}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => updateQty(meal.id, quantity - 1)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.08)" }}>
                                <Minus size={11} className="text-white" />
                              </button>
                              <span className="text-white text-sm w-5 text-center font-semibold">{quantity}</span>
                              <button onClick={() => updateQty(meal.id, quantity + 1)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.08)" }}>
                                <Plus size={11} className="text-white" />
                              </button>
                            </div>
                          </div>
                          <button onClick={() => removeItem(meal.id)} className="p-2 rounded-xl self-start"
                            style={{ background: "rgba(239,68,68,0.1)" }}>
                            <Trash2 size={14} style={{ color: "#ef4444" }} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="p-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    {/* Tip */}
                    <div>
                      <p className="text-white/35 text-xs mb-2">Add a tip</p>
                      <div className="flex gap-1.5">
                        {TIP_OPTIONS.map((pct) => (
                          <button key={pct}
                            onClick={() => { setTip(pct); setShowCustomTip(false); setCustomTip(""); }}
                            className="flex-1 py-1.5 rounded-xl text-xs font-semibold"
                            style={tip === pct && !showCustomTip
                              ? { background: accent, color: "#0d0d0d" }
                              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            {pct === 0 ? "None" : `${pct}%`}
                          </button>
                        ))}
                        <button onClick={() => setShowCustomTip((v) => !v)}
                          className="flex-1 py-1.5 rounded-xl text-xs font-semibold"
                          style={showCustomTip
                            ? { background: accent, color: "#0d0d0d" }
                            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          Custom
                        </button>
                      </div>
                      {showCustomTip && (
                        <input className="mt-2 w-full px-3 py-2 rounded-xl text-white text-xs outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="Enter tip ($)" type="number" min="0" step="0.50"
                          value={customTip} onChange={(e) => setCustomTip(e.target.value)} />
                      )}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/45">Subtotal</span>
                        <span className="text-white">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/35">Tax (8.75%)</span>
                        <span className="text-white/55">${tax.toFixed(2)}</span>
                      </div>
                      {tipAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/35">Tip</span>
                          <span className="text-white/55">${tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {avgPrepTime > 0 && (
                        <div className="flex items-center gap-1 text-xs pt-1 text-white/25">
                          <Clock size={10} /> Est. prep: ~{avgPrepTime} min
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-white font-bold">Total</span>
                      <span className="text-xl font-bold" style={{ color: accent }}>
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCheckoutOpen(true)}
                      className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide"
                      style={{ background: accent, color: "#0d0d0d" }}>
                      Checkout — ${grandTotal.toFixed(2)}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)}
        onSuccess={handleSuccess} tipAmount={tipAmount} />

      <AnimatePresence>
        {orderNumber && (
          <OrderConfirmation orderNumber={orderNumber} onClose={() => setOrderNumber(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
