import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, CalendarDays, Clock, Check } from "lucide-react";
import { useReservations } from "@/hooks/useReservations";
import { RestaurantTable, Reservation } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

export default function ReservationFloorplan({ isOpen, onClose }: Props) {
  const { tables, getReservationsForDate, makeReservation } = useReservations();
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [takenTableIds, setTakenTableIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time: "", partySize: 2, notes: "" });
  const [step, setStep] = useState<"floor" | "confirm" | "done">("floor");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reservationId, setReservationId] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!form.date) return;
    getReservationsForDate(form.date).then((res: Reservation[]) => {
      const taken = new Set(res.filter((r) => r.time === form.time).map((r) => r.tableId));
      setTakenTableIds(taken);
    });
  }, [form.date, form.time]);

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.time || !selectedTable) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const id = await makeReservation({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || undefined,
        tableId: selectedTable.id,
        tableNumber: selectedTable.number,
        date: form.date,
        time: form.time,
        partySize: form.partySize,
        notes: form.notes.trim() || undefined,
        status: "confirmed",
      });
      setReservationId(id);
      setStep("done");
    } catch {
      setError("Failed to make reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("floor");
      setSelectedTable(null);
      setForm({ name: "", phone: "", email: "", date: "", time: "", partySize: 2, notes: "" });
      setError("");
    }, 300);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(180deg, #0c1a2e 0%, #10082a 100%)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <h2 className="text-white font-bold text-lg">Reserve a Table</h2>
                <p className="text-white/40 text-xs">Pick your spot on the floor</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <X size={16} className="text-white/60" />
              </button>
            </div>

            <div className="p-5">
              {step === "floor" && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">Date *</label>
                      <input type="date" className={inputCls} style={inputStyle} min={today}
                        value={form.date} onChange={(e) => set("date", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">Time *</label>
                      <select className={inputCls} style={inputStyle} value={form.time} onChange={(e) => set("time", e.target.value)}>
                        <option value="" style={{ background: "#0c1a2e" }}>Select...</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t} style={{ background: "#0c1a2e" }}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">Party Size</label>
                      <select className={inputCls} style={inputStyle} value={form.partySize} onChange={(e) => set("partySize", Number(e.target.value))}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n} style={{ background: "#0c1a2e" }}>{n} {n === 1 ? "guest" : "guests"}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-3 text-xs pb-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ background: "rgba(59,130,246,0.7)" }} />
                          <span className="text-white/40">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/60" />
                          <span className="text-white/40">Taken</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden mb-5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", paddingBottom: "56.25%", height: 0 }}>
                    <div className="absolute inset-0 p-4">
                      <div className="absolute top-2 left-2 right-2 bottom-2">
                        {tables.map((table) => {
                          const taken = takenTableIds.has(table.id);
                          const selected = selectedTable?.id === table.id;
                          const tooSmall = table.seats < form.partySize;
                          const disabled = taken || tooSmall;

                          return (
                            <motion.button
                              key={table.id}
                              whileHover={!disabled ? { scale: 1.1 } : {}}
                              whileTap={!disabled ? { scale: 0.95 } : {}}
                              onClick={() => !disabled && setSelectedTable(selected ? null : table)}
                              style={{
                                position: "absolute",
                                left: `${table.x}%`,
                                top: `${table.y}%`,
                                width: table.shape === "rect" ? 60 : table.shape === "square" ? 44 : 40,
                                height: table.shape === "rect" ? 32 : 40,
                                borderRadius: table.shape === "round" ? "50%" : 8,
                                background: selected
                                  ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                  : taken
                                  ? "rgba(239,68,68,0.3)"
                                  : tooSmall
                                  ? "rgba(255,255,255,0.04)"
                                  : "rgba(59,130,246,0.25)",
                                border: selected
                                  ? "2px solid rgba(139,92,246,0.8)"
                                  : taken
                                  ? "1px solid rgba(239,68,68,0.4)"
                                  : "1px solid rgba(59,130,246,0.3)",
                                cursor: disabled ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: 1,
                                transform: "translate(-50%, -50%)",
                              }}
                            >
                              <span style={{ color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 700 }}>
                                T{table.number}
                              </span>
                              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 8 }}>
                                {table.seats}p
                              </span>
                            </motion.button>
                          );
                        })}

                        <div className="absolute bottom-1 left-2 right-2 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs" style={{ color: "rgba(255,255,255,0.1)" }}>
                          Kitchen →
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedTable && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-2xl mb-4"
                      style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}>
                      <div className="flex items-center gap-3">
                        <Users size={16} style={{ color: "#60a5fa" }} />
                        <div>
                          <p className="text-white font-semibold text-sm">Table {selectedTable.number} selected</p>
                          <p className="text-white/40 text-xs">{selectedTable.seats} seats · {selectedTable.shape} table</p>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setStep("confirm")}
                        disabled={!form.date || !form.time}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{
                          background: form.date && form.time
                            ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                            : "rgba(255,255,255,0.06)",
                        }}
                      >
                        Continue →
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}

              {step === "confirm" && selectedTable && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="p-3 rounded-xl mb-2" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <p className="text-white text-sm">
                      <span className="font-bold">Table {selectedTable.number}</span> · {form.date} at {form.time} · {form.partySize} guests
                    </p>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Your Name *</label>
                    <input className={inputCls} style={inputStyle} placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Phone *</label>
                    <input className={inputCls} style={inputStyle} type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Email (optional)</label>
                    <input className={inputCls} style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">Special Requests (optional)</label>
                    <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={2} placeholder="Allergies, occasion, highchair..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                  </div>
                  {error && <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep("floor")} className="px-5 py-3 rounded-2xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                      ← Back
                    </button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={submitting}
                      className="flex-1 py-3 rounded-2xl font-bold text-white"
                      style={{ background: submitting ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                      {submitting ? "Reserving..." : "Confirm Reservation"}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)" }}>
                    <Check size={40} style={{ color: "#10b981" }} />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">Reservation Confirmed!</h3>
                  <p className="text-white/50 text-sm mb-6">
                    Table {selectedTable?.number} · {form.date} at {form.time}
                  </p>
                  <p className="text-white/30 text-xs mb-6">
                    We'll see you soon, {form.name}! Check your phone for reminders.
                  </p>
                  <button onClick={handleClose}
                    className="px-8 py-3 rounded-2xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
