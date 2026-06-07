import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import CheckoutModal, { OrderConfirmation } from "./CheckoutModal";
import AIPairing from "./AIPairing";
import PredictiveCart from "./PredictiveCart";
import { useMenu } from "@/hooks/useMenu";

const TIP_OPTIONS = [15, 20, 25, 0];

export default function Cart() {
  const { items, removeItem, updateQty, total, count, isOpen, setIsOpen, tip, setTip, lastAddedMeal } = useCart();
  const { meals } = useMenu();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);

  const deliveryFee = 0;
  const TAX_RATE = 0.0875;
  const tax = total * TAX_RATE;
  const tipAmount = showCustomTip ? (parseFloat(customTip) || 0) : total * (tip / 100);
  const grandTotal = total + deliveryFee + tax + tipAmount;

  const avgPrepTime = items.length > 0
    ? items.reduce((sum, i) => {
        const mins = parseInt(i.meal.prepTime ?? "0");
        return sum + (isNaN(mins) ? 0 : mins);
      }, 0)
    : 0;

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col"
              style={{
                background: "linear-gradient(180deg, #0c1a2e 0%, #13082b 100%)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between p-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} style={{ color: "#8b5cf6" }} />
                  <h2 className="font-bold text-white">Your Order</h2>
                  {count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                      {count}
                    </span>
                  )}
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={16} className="text-white/70" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <ShoppingBag size={48} className="text-white/20" />
                  <p className="text-white/40 text-sm">Your cart is empty. Add some delicious meals!</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 pt-2 pb-2">
                    {/* AI Pairing */}
                    <AIPairing triggerMeal={lastAddedMeal} allMeals={meals} />

                    {/* Predictive Cart */}
                    <PredictiveCart cartItems={items} allMeals={meals} />

                    {/* Items */}
                    <div className="px-4 space-y-3">
                      <AnimatePresence>
                        {items.map(({ meal, quantity }) => (
                          <motion.div
                            key={meal.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex gap-3 p-3 rounded-2xl"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <img src={meal.imageUrl} alt={meal.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{meal.name}</p>
                              <p className="text-sm font-bold mt-0.5" style={{ color: "#f59e0b" }}>
                                ${(meal.price * quantity).toFixed(2)}
                              </p>
                              {meal.prepTime && (
                                <div className="flex items-center gap-1 mt-0.5 text-white/30 text-xs">
                                  <Clock size={10} />
                                  {meal.prepTime}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => updateQty(meal.id, quantity - 1)}
                                  className="p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                                  <Minus size={12} className="text-white" />
                                </button>
                                <span className="text-white text-sm w-6 text-center">{quantity}</span>
                                <button onClick={() => updateQty(meal.id, quantity + 1)}
                                  className="p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                                  <Plus size={12} className="text-white" />
                                </button>
                              </div>
                            </div>
                            <button onClick={() => removeItem(meal.id)}
                              className="p-2 rounded-xl self-start" style={{ background: "rgba(239,68,68,0.1)" }}>
                              <Trash2 size={14} style={{ color: "#ef4444" }} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Tip selector */}
                    <div>
                      <p className="text-white/40 text-xs mb-2">Add a tip</p>
                      <div className="flex gap-1.5">
                        {TIP_OPTIONS.map((pct) => (
                          <button
                            key={pct}
                            onClick={() => { setTip(pct); setShowCustomTip(false); setCustomTip(""); }}
                            className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all"
                            style={
                              tip === pct && !showCustomTip
                                ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }
                                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.07)" }
                            }
                          >
                            {pct === 0 ? "None" : `${pct}%`}
                          </button>
                        ))}
                        <button
                          onClick={() => setShowCustomTip((v) => !v)}
                          className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all"
                          style={
                            showCustomTip
                              ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }
                              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.07)" }
                          }
                        >
                          Custom
                        </button>
                      </div>
                      {showCustomTip && (
                        <input
                          className="mt-2 w-full px-3 py-2 rounded-xl text-white text-xs outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="Enter tip amount ($)"
                          type="number"
                          min="0"
                          step="0.50"
                          value={customTip}
                          onChange={(e) => setCustomTip(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Subtotal</span>
                        <span className="text-white">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Tax (8.75%)</span>
                        <span className="text-white/60">${tax.toFixed(2)}</span>
                      </div>
                      {(tipAmount > 0) && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Tip</span>
                          <span className="text-white/60">${tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {avgPrepTime > 0 && (
                        <div className="flex items-center gap-1.5 text-xs pt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <Clock size={11} />
                          Est. prep time: ~{avgPrepTime} min
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-white font-bold">Total</span>
                      <span className="text-xl font-bold" style={{ color: "#f59e0b" }}>
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCheckoutOpen(true)}
                      className="w-full py-4 rounded-2xl font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
                      }}
                    >
                      Checkout — ${grandTotal.toFixed(2)}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleSuccess}
        tipAmount={tipAmount}
      />

      <AnimatePresence>
        {orderNumber && (
          <OrderConfirmation
            orderNumber={orderNumber}
            onClose={() => setOrderNumber(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
