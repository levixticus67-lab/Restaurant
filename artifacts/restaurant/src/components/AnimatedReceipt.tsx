import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, UtensilsCrossed, CheckCircle } from "lucide-react";
import { Order } from "@/types";

interface Props {
  order: Order | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  "dine-in": "🍽️ Dine In",
  "delivery": "🛵 Delivery",
  "takeaway": "🥡 Takeaway",
};

export default function AnimatedReceipt({ order, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!order) return;
    const text = `My Saveur order #${order.orderNumber}\nTotal: $${order.total.toFixed(2)}\nItems: ${order.items.map((i) => `${i.mealName} x${i.quantity}`).join(", ")}`;
    if (navigator.share) {
      await navigator.share({ title: "Saveur Receipt", text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scaleY: 0, y: -60 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0, y: -40 }}
            transition={{ type: "spring", damping: 24, stiffness: 200, delay: 0.05 }}
            style={{ transformOrigin: "top center" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={receiptRef} className="rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              <div className="px-6 pt-6 pb-4 text-center"
                style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <UtensilsCrossed size={16} className="text-white" />
                  </div>
                  <span className="text-white font-extrabold text-lg tracking-wide">Saveur</span>
                </div>
                <p className="text-white/60 text-xs">Fine Dining · Thank you for your order</p>
              </div>

              <div className="px-6 pt-5 pb-2">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} style={{ color: "#10b981" }} />
                  <div>
                    <p className="text-gray-900 font-bold text-sm">Order Confirmed</p>
                    <p className="text-gray-400 text-xs font-mono tracking-widest">#{order.orderNumber}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-gray-500 text-xs">{STATUS_LABELS[order.orderType]}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mb-4">
                  {order.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex justify-between mb-2.5"
                    >
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm font-medium">{item.mealName}</p>
                        <p className="text-gray-400 text-xs">× {item.quantity} @ ${item.price.toFixed(2)}</p>
                      </div>
                      <span className="text-gray-700 font-semibold text-sm ml-3">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700">${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className="text-gray-700">${order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tip && order.tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tip</span>
                      <span className="text-gray-700">${order.tip.toFixed(2)}</span>
                    </div>
                  )}
                  {order.giftCardDiscount && order.giftCardDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Gift Card</span>
                      <span className="text-green-600">-${order.giftCardDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base pt-1 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center py-3 border-t border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs">Thank you, {order.customerName}!</p>
                  <p className="text-gray-300 text-xs mt-0.5">saveur.restaurant</p>
                </div>
              </div>

              <div className="flex gap-2 p-4 pt-0">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-gray-100 text-gray-600"
                >
                  <X size={14} />
                  Close
                </button>
              </div>
            </div>

            <div className="flex justify-center -mt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-4 h-2 rounded-b-full" style={{ background: "rgba(255,255,255,0.08)", marginRight: 1 }} />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
