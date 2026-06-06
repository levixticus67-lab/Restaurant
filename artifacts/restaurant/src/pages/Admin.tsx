import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, LogOut, Upload, X, CheckCircle,
  UtensilsCrossed, ToggleLeft, ToggleRight, ImageIcon,
  ClipboardList, ChevronDown, Package, ChefHat, Truck,
  Settings, MapPin, ExternalLink, Phone, Mail, Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Meal, Order, OrderStatus } from "@/types";
import { Link } from "wouter";
import AnimatedDots from "@/components/AnimatedDots";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Mains",
  imageUrl: "",
  ingredients: "",
  isAvailable: true,
  isFeatured: false,
  prepTime: "",
  calories: "",
};

const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending", "confirmed", "preparing", "ready", "delivered",
];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Package size={13} /> },
  confirmed: { label: "Confirmed", color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  icon: <CheckCircle size={13} /> },
  preparing: { label: "Preparing", color: "#a78bfa", bg: "rgba(139,92,246,0.12)",  icon: <ChefHat size={13} /> },
  ready:     { label: "Ready",     color: "#34d399", bg: "rgba(16,185,129,0.12)",  icon: <UtensilsCrossed size={13} /> },
  delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.08)",  icon: <Truck size={13} /> },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(239,68,68,0.1)",    icon: <X size={13} /> },
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  "dine-in": "🍽️ Dine In",
  "delivery": "🛵 Delivery",
  "takeaway": "🥡 Takeaway",
};

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const { meals, addMeal, updateMeal, deleteMeal } = useMenu();
  const { orders, updateOrderStatus } = useOrders();
  const { settings, saving: savingSettings, saveSettings } = useRestaurantSettings();

  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "settings">("menu");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const fileRef = useRef<HTMLInputElement>(null);

  // Settings form local state
  const [settingsForm, setSettingsForm] = useState({
    address: settings.address,
    lat: String(settings.lat),
    lng: String(settings.lng),
    zoom: String(settings.zoom),
    phone: settings.phone,
    email: settings.email,
    hoursBreakfast: settings.hours.breakfast,
    hoursLunch: settings.hours.lunch,
    hoursDinner: settings.hours.dinner,
  });
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [mapPreviewKey, setMapPreviewKey] = useState(0);

  // Sync settings form when Firestore data loads
  const [synced, setSynced] = useState(false);
  if (!synced && settings.address !== "123 Gourmet Lane, Food District, New York, NY 10001") {
    setSynced(true);
    setSettingsForm({
      address: settings.address,
      lat: String(settings.lat),
      lng: String(settings.lng),
      zoom: String(settings.zoom),
      phone: settings.phone,
      email: settings.email,
      hoursBreakfast: settings.hours.breakfast,
      hoursLunch: settings.hours.lunch,
      hoursDinner: settings.hours.dinner,
    });
  }

  if (!user && isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080f1c" }}>
        <div className="text-center">
          <p className="text-white/50 mb-4">Please log in to access the admin portal.</p>
          <Link href="/login">
            <button className="px-6 py-3 rounded-2xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const setSF = (key: keyof typeof settingsForm, val: string) => {
    setSettingsForm((f) => ({ ...f, [key]: val }));
    setSettingsDirty(true);
  };

  const handleSaveSettings = async () => {
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    const lat = parseFloat(settingsForm.lat);
    const lng = parseFloat(settingsForm.lng);
    if (isNaN(lat) || isNaN(lng)) { showToast("Enter valid lat/lng numbers"); return; }
    await saveSettings({
      address: settingsForm.address.trim(),
      lat,
      lng,
      zoom: parseInt(settingsForm.zoom) || 16,
      phone: settingsForm.phone.trim(),
      email: settingsForm.email.trim(),
      hours: {
        breakfast: settingsForm.hoursBreakfast.trim(),
        lunch: settingsForm.hoursLunch.trim(),
        dinner: settingsForm.hoursDinner.trim(),
      },
    });
    setSettingsDirty(false);
    setMapPreviewKey((k) => k + 1);
    showToast("Settings saved! Map updated on the home page.");
  };

  const handleImageUpload = async (file: File) => {
    if (!isCloudinaryConfigured) {
      showToast("Cloudinary not configured — using demo image URL");
      setForm((f) => ({ ...f, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" }));
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      showToast("Image uploaded successfully");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (meal: Meal) => {
    setEditing(meal.id);
    setForm({
      name: meal.name, description: meal.description, price: String(meal.price),
      category: meal.category, imageUrl: meal.imageUrl,
      ingredients: meal.ingredients?.join(", ") || "",
      isAvailable: meal.isAvailable, isFeatured: meal.isFeatured || false,
      prepTime: meal.prepTime || "", calories: String(meal.calories || ""),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.imageUrl) { showToast("Name, price and image are required."); return; }
    setSaving(true);
    try {
      const payload: Omit<Meal, "id"> = {
        name: form.name, description: form.description, price: parseFloat(form.price),
        category: form.category, imageUrl: form.imageUrl,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        isAvailable: form.isAvailable, isFeatured: form.isFeatured,
        prepTime: form.prepTime, calories: form.calories ? parseInt(form.calories) : undefined,
      };
      if (editing) {
        if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
        await updateMeal(editing, payload); showToast("Meal updated!");
      } else {
        if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
        await addMeal(payload); showToast("Meal added!");
      }
      resetForm();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meal?")) return;
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    await deleteMeal(id); showToast("Meal deleted.");
  };

  const handleAdvanceOrder = async (order: Order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setUpdatingOrder(order.id);
    try {
      await updateOrderStatus(order.id, next);
      showToast(`Order #${order.orderNumber} → ${STATUS_META[next].label}`);
    } catch { showToast("Failed to update order status"); }
    finally { setUpdatingOrder(null); }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm(`Cancel order #${order.orderNumber}?`)) return;
    setUpdatingOrder(order.id);
    try {
      await updateOrderStatus(order.id, "cancelled");
      showToast(`Order #${order.orderNumber} cancelled`);
    } catch { showToast("Failed to cancel order"); }
    finally { setUpdatingOrder(null); }
  };

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
  const pendingCount = orders.filter((o) => ["pending","confirmed","preparing"].includes(o.status)).length;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
              <p className="text-white/40 text-xs">{meals.length} items · {orders.length} orders</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={signOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <LogOut size={16} /> Logout
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 rounded-2xl w-fit"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { key: "menu",     label: "Menu",     icon: <UtensilsCrossed size={15} /> },
            { key: "orders",   label: "Orders",   icon: <ClipboardList size={15} />, badge: pendingCount },
            { key: "settings", label: "Settings", icon: <Settings size={15} /> },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab.key
                ? { background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "#fff" }
                : { color: "rgba(255,255,255,0.45)" }}>
              {tab.icon}
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: "#ef4444", color: "white" }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Demo notice */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-sm" style={{ color: "#f59e0b" }}>
              <strong>Demo mode:</strong> Add your Firebase & Cloudinary env vars to enable live data management.
            </p>
          </div>
        )}

        {/* ── MENU TAB ─────────────────────────────────── */}
        {activeTab === "menu" && (
          <>
            <div className="flex justify-end mb-6">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                <Plus size={16} /> Add Meal
              </motion.button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="mb-10 rounded-3xl p-6"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">{editing ? "Edit Meal" : "Add New Meal"}</h2>
                    <button onClick={resetForm} className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <X size={16} className="text-white/60" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Meal Name *"><input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Truffle Pasta" /></Field>
                    <Field label="Price ($) *"><input className={inputCls} style={inputStyle} type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="18.99" /></Field>
                    <Field label="Category">
                      <select className={inputCls} style={inputStyle} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                        {["Starters","Mains","Burgers","Pasta","Pizza","Grills","Seafood","Desserts","Drinks"].map(c => (
                          <option key={c} value={c} style={{ background: "#0c1a2e" }}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Prep Time"><input className={inputCls} style={inputStyle} value={form.prepTime} onChange={(e) => setForm((f) => ({ ...f, prepTime: e.target.value }))} placeholder="15 min" /></Field>
                    <Field label="Calories (kcal)"><input className={inputCls} style={inputStyle} type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} placeholder="520" /></Field>
                    <Field label="Ingredients (comma-separated)"><input className={inputCls} style={inputStyle} value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} placeholder="Chicken, Herbs, Lemon..." /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Description"><textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the dish..." /></Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Meal Photo *">
                        <div className="flex gap-3 items-start">
                          <div className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {form.imageUrl ? <img src={form.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={28} className="text-white/20" />}
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="Paste image URL..." className={inputCls} style={inputStyle} />
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: uploading ? "rgba(255,255,255,0.3)" : "#60a5fa" }}>
                              <Upload size={14} />{uploading ? "Uploading..." : "Upload via Cloudinary"}
                            </button>
                          </div>
                        </div>
                      </Field>
                    </div>
                    <div className="flex items-center gap-6">
                      <button type="button" onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))} className="flex items-center gap-2 text-sm font-medium text-white/70">
                        {form.isAvailable ? <ToggleRight size={22} style={{ color: "#10b981" }} /> : <ToggleLeft size={22} style={{ color: "#6b7280" }} />} Available
                      </button>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))} className="flex items-center gap-2 text-sm font-medium text-white/70">
                        {form.isFeatured ? <ToggleRight size={22} style={{ color: "#f59e0b" }} /> : <ToggleLeft size={22} style={{ color: "#6b7280" }} />} Featured
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <motion.button whileTap={{ scale: 0.96 }} onClick={handleSave} disabled={saving}
                      className="flex-1 py-3 rounded-2xl font-bold text-white"
                      style={{ background: saving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                      {saving ? "Saving..." : editing ? "Update Meal" : "Add Meal"}
                    </motion.button>
                    <button onClick={resetForm} className="px-6 py-3 rounded-2xl font-semibold text-white/60" style={{ background: "rgba(255,255,255,0.06)" }}>Cancel</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.map((meal) => (
                <motion.div key={meal.id} layout className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {!meal.isAvailable && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(239,68,68,0.8)", color: "white" }}>Unavailable</span>}
                      {meal.isFeatured && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(245,158,11,0.9)", color: "#0d1b2a", fontWeight: 700 }}>Featured</span>}
                    </div>
                    <div className="absolute bottom-2 left-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.9)", color: "white" }}>{meal.category}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{meal.name}</h3>
                      <span className="font-bold shrink-0 ml-2 text-sm" style={{ color: "#f59e0b" }}>${meal.price.toFixed(2)}</span>
                    </div>
                    <p className="text-white/40 text-xs line-clamp-2 mb-4">{meal.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(meal)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(meal.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ── ORDERS TAB ─────────────────────────────────── */}
        {activeTab === "orders" && (
          <div>
            <div className="flex gap-2 flex-wrap mb-6">
              {(["all", ...ORDER_STATUS_FLOW, "cancelled"] as const).map((f) => {
                const count = f === "all" ? orders.length : orders.filter(o => o.status === f).length;
                const meta = f !== "all" ? STATUS_META[f] : null;
                return (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={orderFilter === f
                      ? { background: meta?.bg ?? "rgba(255,255,255,0.12)", color: meta?.color ?? "white", border: `1px solid ${meta?.color ?? "rgba(255,255,255,0.3)"}` }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {meta?.icon}
                    {f === "all" ? "All" : STATUS_META[f].label}
                    <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {!isFirebaseConfigured && (
              <div className="text-center py-16 text-white/40">
                <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Orders require Firebase to be configured.</p>
              </div>
            )}

            {isFirebaseConfigured && filteredOrders.length === 0 && (
              <div className="text-center py-16 text-white/40">
                <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No {orderFilter !== "all" ? orderFilter : ""} orders yet.</p>
              </div>
            )}

            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const meta = STATUS_META[order.status];
                const next = nextStatus(order.status);
                const isUpdating = updatingOrder === order.id;
                return (
                  <motion.div key={order.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-extrabold text-white tracking-widest text-sm">#{order.orderNumber}</span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: meta.bg, color: meta.color }}>
                              {meta.icon} {meta.label}
                            </span>
                          </div>
                          <p className="text-white/50 text-xs">{order.customerName} · {order.customerPhone} · {ORDER_TYPE_LABEL[order.orderType]}</p>
                          {order.deliveryAddress && <p className="text-white/30 text-xs mt-0.5">{order.deliveryAddress}</p>}
                          <p className="text-white/25 text-xs mt-0.5">{timeAgo(order.createdAt)}</p>
                        </div>
                        <span className="font-bold text-sm shrink-0 ml-3" style={{ color: "#f59e0b" }}>${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {order.items.map((item, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                            <img src={item.mealImage} alt="" className="w-4 h-4 rounded-md object-cover" />
                            {item.mealName} × {item.quantity}
                          </span>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-xs mb-3 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>📝 {order.notes}</p>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <div className="flex gap-2">
                          {next && (
                            <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAdvanceOrder(order)} disabled={isUpdating}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                              style={{ background: isUpdating ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: isUpdating ? "rgba(255,255,255,0.3)" : "white" }}>
                              <ChevronDown size={13} />{isUpdating ? "Updating..." : `Mark as ${STATUS_META[next].label}`}
                            </motion.button>
                          )}
                          <button onClick={() => handleCancelOrder(order)} disabled={isUpdating}
                            className="px-3 py-2.5 rounded-xl text-xs font-semibold"
                            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="max-w-3xl space-y-6">

            {/* Location section */}
            <div className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                  <MapPin size={17} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Restaurant Location</h3>
                  <p className="text-white/40 text-xs">This updates the live map on your home page instantly</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <Field label="Full Address">
                    <input className={inputCls} style={inputStyle} value={settingsForm.address}
                      onChange={(e) => setSF("address", e.target.value)}
                      placeholder="123 Main St, City, State, ZIP" />
                  </Field>
                </div>
                <Field label="Latitude">
                  <input className={inputCls} style={inputStyle} type="number" step="any"
                    value={settingsForm.lat} onChange={(e) => setSF("lat", e.target.value)}
                    placeholder="40.7580" />
                </Field>
                <Field label="Longitude">
                  <input className={inputCls} style={inputStyle} type="number" step="any"
                    value={settingsForm.lng} onChange={(e) => setSF("lng", e.target.value)}
                    placeholder="-73.9855" />
                </Field>
                <Field label="Map Zoom Level (1–20)">
                  <input className={inputCls} style={inputStyle} type="number" min="1" max="20"
                    value={settingsForm.zoom} onChange={(e) => setSF("zoom", e.target.value)}
                    placeholder="16" />
                </Field>
              </div>

              {/* Helper */}
              <div className="p-4 rounded-2xl mb-5"
                style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#60a5fa" }}>📍 How to get your exact coordinates</p>
                <ol className="text-white/50 text-xs space-y-1 list-decimal list-inside">
                  <li>Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#60a5fa" }}>Google Maps <ExternalLink size={10} className="inline" /></a></li>
                  <li>Search for your restaurant address</li>
                  <li>Right-click on the pin → the first item shown is <strong className="text-white/70">lat, lng</strong></li>
                  <li>Click it to copy, then paste the two numbers above</li>
                </ol>
              </div>

              {/* Live preview */}
              <div className="mb-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Map Preview</p>
                <div className="relative rounded-2xl overflow-hidden" style={{ height: 220, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <iframe
                    key={mapPreviewKey}
                    src={`https://maps.google.com/maps?q=${settingsForm.lat || 40.758},${settingsForm.lng || -73.9855}&z=${settingsForm.zoom || 16}&output=embed`}
                    title="Map Preview"
                    className="w-full h-full border-0"
                    loading="lazy"
                    style={{ pointerEvents: "none" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(8,15,28,0.6), transparent)" }} />
                </div>
                <p className="text-white/25 text-xs mt-1.5 text-center">Preview updates after you save</p>
              </div>
            </div>

            {/* Contact section */}
            <div className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <Phone size={17} style={{ color: "#34d399" }} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Contact Info</h3>
                  <p className="text-white/40 text-xs">Shown in the map section and footer</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone Number">
                  <div className="relative">
                    <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.2rem" }}
                      value={settingsForm.phone} onChange={(e) => setSF("phone", e.target.value)}
                      placeholder="+1 (555) 234-5678" />
                  </div>
                </Field>
                <Field label="Email Address">
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.2rem" }}
                      value={settingsForm.email} onChange={(e) => setSF("email", e.target.value)}
                      placeholder="hello@yourrestaurant.com" />
                  </div>
                </Field>
              </div>
            </div>

            {/* Hours section */}
            <div className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <Clock size={17} style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Opening Hours</h3>
                  <p className="text-white/40 text-xs">Displayed on the home page and map section</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Breakfast">
                  <input className={inputCls} style={inputStyle} value={settingsForm.hoursBreakfast}
                    onChange={(e) => setSF("hoursBreakfast", e.target.value)} placeholder="7am – 11am" />
                </Field>
                <Field label="Lunch">
                  <input className={inputCls} style={inputStyle} value={settingsForm.hoursLunch}
                    onChange={(e) => setSF("hoursLunch", e.target.value)} placeholder="12pm – 3pm" />
                </Field>
                <Field label="Dinner">
                  <input className={inputCls} style={inputStyle} value={settingsForm.hoursDinner}
                    onChange={(e) => setSF("hoursDinner", e.target.value)} placeholder="6pm – 11pm" />
                </Field>
              </div>
            </div>

            {/* Save button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveSettings}
              disabled={savingSettings || !settingsDirty}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
              style={{
                background: savingSettings || !settingsDirty
                  ? "rgba(255,255,255,0.06)"
                  : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: savingSettings || !settingsDirty ? "rgba(255,255,255,0.3)" : "white",
                boxShadow: savingSettings || !settingsDirty ? "none" : "0 8px 24px rgba(139,92,246,0.35)",
              }}
            >
              <Settings size={16} />
              {savingSettings ? "Saving..." : settingsDirty ? "Save Changes" : "No Changes"}
            </motion.button>
          </div>
        )}

      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold z-50"
            style={{ background: "rgba(16,185,129,0.9)", color: "white", backdropFilter: "blur(8px)" }}>
            <CheckCircle size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
