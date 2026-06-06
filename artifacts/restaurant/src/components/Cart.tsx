import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import CheckoutModal, { OrderConfirmation } from "./CheckoutModal";

export default function Cart() {
  const { items, removeItem, updateQty, total, count, isOpen, setIsOpen } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const deliveryFee = 0;

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
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                            <p className="text-sm font-bold mt-1" style={{ color: "#f59e0b" }}>
                              ${(meal.price * quantity).toFixed(2)}
                            </p>
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

                  <div className="p-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-sm">Subtotal</span>
                      <span className="text-white font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/40 text-xs">
                      <span>Delivery fee</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-white font-bold">Subtotal</span>
                      <span className="text-xl font-bold" style={{ color: "#f59e0b" }}>
                        ${(total + deliveryFee).toFixed(2)}
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
                      Checkout — ${total.toFixed(2)}
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
