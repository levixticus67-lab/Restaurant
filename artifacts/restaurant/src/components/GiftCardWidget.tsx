import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Send, Check, X, Tag } from "lucide-react";
import { useGiftCards } from "@/hooks/useGiftCards";
import { GiftCard } from "@/types";

const AMOUNTS = [25, 50, 75, 100, 150, 200];

interface IssueProps {
  onIssued?: (card: GiftCard) => void;
}

export function IssueGiftCard({ onIssued }: IssueProps) {
  const { issueGiftCard } = useGiftCards();
  const [amount, setAmount] = useState(50);
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    recipientPhone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<GiftCard | null>(null);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.senderName.trim() || !form.recipientName.trim()) {
      setError("Sender and recipient names are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const card = await issueGiftCard({ amount, ...form });
      setIssued(card);
      onIssued?.(card);
    } catch {
      setError("Failed to create gift card. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = (card: GiftCard) => {
    const msg = `🎁 Here's a $${card.originalAmount} Saveur gift card from ${card.senderName}!\n\nCode: ${card.code}\n\n${card.message ? `"${card.message}"\n\n` : ""}Use it at saveur.restaurant 🍽️`;
    if (navigator.share) {
      navigator.share({ title: "Saveur Gift Card", text: msg });
    } else {
      navigator.clipboard.writeText(msg);
      alert("Gift card details copied to clipboard!");
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

  if (issued) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", boxShadow: "0 20px 60px rgba(139,92,246,0.4)" }}
      >
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 14 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <Check size={32} className="text-white" />
          </motion.div>
          <h3 className="text-white font-extrabold text-xl mb-1">Gift Card Created!</h3>
          <p className="text-white/70 text-sm mb-4">For {issued.recipientName} • ${issued.originalAmount}</p>

          <div className="py-4 px-6 rounded-2xl mb-4" style={{ background: "rgba(255,255,255,0.15)" }}>
            <p className="text-white/70 text-xs mb-2 uppercase tracking-wider">Gift Card Code</p>
            <p className="text-white font-extrabold text-2xl font-mono tracking-widest">{issued.code}</p>
          </div>

          <button
            onClick={() => handleShare(issued)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-purple-900"
            style={{ background: "white" }}
          >
            <Send size={16} />
            Send via WhatsApp / Share
          </button>

          <button
            onClick={() => setIssued(null)}
            className="mt-2 text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            Create another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
          <Gift size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Create Gift Card</h3>
          <p className="text-white/40 text-xs">Customize & send via WhatsApp</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-white/50 text-xs uppercase tracking-wider mb-2.5">Amount</p>
        <div className="grid grid-cols-3 gap-2">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className="py-2.5 rounded-xl text-sm font-bold transition-all"
              style={
                amount === a
                  ? { background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              ${a}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Your Name *</label>
          <input className={inputCls} style={inputStyle} placeholder="From..." value={form.senderName} onChange={(e) => set("senderName", e.target.value)} />
        </div>
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Recipient Name *</label>
          <input className={inputCls} style={inputStyle} placeholder="To..." value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} />
        </div>
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Message (optional)</label>
          <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={2} placeholder="Add a personal note..." value={form.message} onChange={(e) => set("message", e.target.value)} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-center" style={{ color: "#f87171" }}>{error}</p>}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-5 w-full py-3.5 rounded-2xl font-bold text-white"
        style={{ background: submitting ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #8b5cf6, #3b82f6)", boxShadow: submitting ? "none" : "0 8px 24px rgba(139,92,246,0.4)" }}
      >
        {submitting ? "Creating..." : `Create $${amount} Gift Card`}
      </motion.button>
    </div>
  );
}

interface AppliedCard {
  id: string;
  code: string;
  discount: number;
}

interface RedeemProps {
  onValidated: (card: GiftCard) => void;
  onRemove: () => void;
  appliedCard: AppliedCard | null;
  orderTotal: number;
}

export function RedeemGiftCard({ onValidated, onRemove, appliedCard, orderTotal }: RedeemProps) {
  const { validateGiftCard } = useGiftCards();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const card = await validateGiftCard(code);
    if (!card) {
      setError("Gift card not found or already used.");
    } else if (card.balance <= 0) {
      setError("This gift card has no remaining balance.");
    } else {
      onValidated(card);
    }
    setLoading(false);
  };

  if (appliedCard) {
    const discount = Math.min(appliedCard.discount, orderTotal);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <Tag size={14} style={{ color: "#10b981" }} />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "#34d399" }}>
            Gift card applied — -${discount.toFixed(2)}
          </p>
          <p className="text-white/40 text-xs font-mono">{appliedCard.code}</p>
        </div>
        <button onClick={onRemove} className="p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
          <X size={14} className="text-white/40" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm outline-none placeholder-white/25"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        placeholder="Gift card code..."
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleValidate()}
      />
      <button
        onClick={handleValidate}
        disabled={loading || !code.trim()}
        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: code.trim() ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        {loading ? "..." : "Apply"}
      </button>
    </div>
  );
}
