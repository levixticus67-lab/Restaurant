import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, LogOut, Upload, X, CheckCircle,
  UtensilsCrossed, ToggleLeft, ToggleRight,
  ClipboardList, Settings, BarChart3, CheckSquare, Square,
  ArrowUp, ArrowDown, Palette, DollarSign, ShoppingBag, Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Meal, Order, OrderStatus } from "@/types";
import { Link } from "wouter";

/* ─── Constants ─── */
const EMPTY_FORM = {
  name: "", description: "", price: "", category: "Mains", imageUrl: "",
  ingredients: "", allergens: "", tags: "",
  isAvailable: true, isFeatured: false, isChefSpecial: false,
  expiresAt: "", prepTime: "", calories: "",
  protein: "", carbs: "", fats: "", fiber: "",
  videoUrl: "",
};

const ORDER_STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered"];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  confirmed: { label: "Confirmed", color: "#60a5fa", bg: "rgba(59,130,246,0.12)"  },
  preparing: { label: "Preparing", color: "#a78bfa", bg: "rgba(139,92,246,0.12)"  },
  ready:     { label: "Ready",     color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(239,68,68,0.10)"   },
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  "dine-in":  "🍽️ Dine In",
  "delivery": "🛵 Delivery",
  "takeaway": "🥡 Takeaway",
};

function nextStatus(s: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(s);
  return idx === -1 || idx === ORDER_STATUS_FLOW.length - 1 ? null : ORDER_STATUS_FLOW[idx + 1];
}

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

type AdminTab = "overview" | "orders" | "menu" | "settings" | "branding";

/* ─── Shared field component ─── */
const inputCls   = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/20";
const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/40 text-xs uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/35 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-white text-2xl font-extrabold">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const { user, signOut }                    = useAuth();
  const { meals, addMeal, updateMeal, deleteMeal } = useMenu();
  const { orders, updateOrderStatus }        = useOrders();
  const { settings, saving: savingSettings, saveSettings } = useRestaurantSettings();

  const [activeTab, setActiveTab]   = useState<AdminTab>("overview");
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editing, setEditing]       = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [orderFilter, setOrderFilter]     = useState<OrderStatus | "all">("all");
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const fileRef         = useRef<HTMLInputElement>(null);
  const brandingFileRef = useRef<HTMLInputElement>(null);

  const [settingsForm, setSettingsForm] = useState({
    address: settings.address, lat: String(settings.lat), lng: String(settings.lng),
    zoom: String(settings.zoom), phone: settings.phone, email: settings.email,
    hoursBreakfast: settings.hours.breakfast, hoursLunch: settings.hours.lunch, hoursDinner: settings.hours.dinner,
  });

  const [brandingForm, setBrandingForm] = useState({
    name: settings.name, tagline: settings.tagline,
    logoUrl: settings.logoUrl, heroImageUrl: settings.heroImageUrl,
    primaryColor: settings.primaryColor,
  });

  /* Sync forms after Firebase settings load */
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (!synced && settings.name !== "Saveur") {
      setSynced(true);
      setSettingsForm({
        address: settings.address, lat: String(settings.lat), lng: String(settings.lng),
        zoom: String(settings.zoom), phone: settings.phone, email: settings.email,
        hoursBreakfast: settings.hours.breakfast, hoursLunch: settings.hours.lunch, hoursDinner: settings.hours.dinner,
      });
      setBrandingForm({
        name: settings.name, tagline: settings.tagline,
        logoUrl: settings.logoUrl, heroImageUrl: settings.heroImageUrl,
        primaryColor: settings.primaryColor,
      });
    }
  }, [settings, synced]);

  if (!user && isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="text-center">
          <p className="text-white/45 mb-4 text-sm">Please log in to access the admin portal.</p>
          <Link href="/login">
            <button className="px-6 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: settings.primaryColor || "#D4A853", color: "#0d0d0d" }}>
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const accent = settings.primaryColor || "#D4A853";
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };
  const setSF = (k: keyof typeof settingsForm, v: string) => setSettingsForm((f) => ({ ...f, [k]: v }));
  const setBF = (k: keyof typeof brandingForm, v: string) => setBrandingForm((f) => ({ ...f, [k]: v }));
  const setF  = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  /* ── Handlers ── */
  const handleSaveSettings = async () => {
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    const lat = parseFloat(settingsForm.lat), lng = parseFloat(settingsForm.lng);
    if (isNaN(lat) || isNaN(lng)) { showToast("Enter valid lat/lng numbers"); return; }
    await saveSettings({
      address: settingsForm.address.trim(), lat, lng, zoom: parseInt(settingsForm.zoom) || 16,
      phone: settingsForm.phone.trim(), email: settingsForm.email.trim(),
      hours: { breakfast: settingsForm.hoursBreakfast, lunch: settingsForm.hoursLunch, dinner: settingsForm.hoursDinner },
    });
    showToast("Settings saved!");
  };

  const handleSaveBranding = async () => {
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    await saveSettings({
      name: brandingForm.name.trim() || "Saveur",
      tagline: brandingForm.tagline.trim(),
      logoUrl: brandingForm.logoUrl.trim(),
      heroImageUrl: brandingForm.heroImageUrl.trim(),
      primaryColor: brandingForm.primaryColor,
    });
    showToast("Branding saved! Changes are live across the site.");
  };

  const handleImageUpload = async (file: File, target: "meal" | "logo" | "hero" = "meal") => {
    if (!isCloudinaryConfigured) {
      const url = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
      if (target === "meal") setForm((f) => ({ ...f, imageUrl: url }));
      else if (target === "logo") setBF("logoUrl", url);
      else setBF("heroImageUrl", url);
      showToast("Cloudinary not configured — using demo URL");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (target === "meal") setForm((f) => ({ ...f, imageUrl: url }));
      else if (target === "logo") setBF("logoUrl", url);
      else setBF("heroImageUrl", url);
      showToast("Image uploaded!");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  const openEdit = (meal: Meal) => {
    setEditing(meal.id);
    const n = meal.nutrition;
    setForm({
      name: meal.name, description: meal.description, price: String(meal.price),
      category: meal.category, imageUrl: meal.imageUrl,
      ingredients: meal.ingredients?.join(", ") || "",
      allergens:   meal.allergens?.join(", ") || "",
      tags:        meal.tags?.join(", ") || "",
      isAvailable: meal.isAvailable, isFeatured: meal.isFeatured || false, isChefSpecial: meal.isChefSpecial || false,
      expiresAt: meal.expiresAt ? new Date(meal.expiresAt).toISOString().slice(0, 16) : "",
      prepTime: meal.prepTime || "", calories: String(meal.calories || ""),
      protein: String(n?.protein || ""), carbs: String(n?.carbs || ""),
      fats: String(n?.fats || ""), fiber: String(n?.fiber || ""),
      videoUrl: meal.videoUrl || "",
    });
    setShowForm(true); setActiveTab("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.imageUrl) { showToast("Name, price and image are required."); return; }
    setSaving(true);
    try {
      const hasNutrition = form.protein || form.carbs || form.fats;
      const payload: Omit<Meal, "id"> = {
        name: form.name, description: form.description, price: parseFloat(form.price),
        category: form.category, imageUrl: form.imageUrl,
        ingredients: form.ingredients.split(",").map(s => s.trim()).filter(Boolean),
        allergens:   form.allergens.split(",").map(s => s.trim()).filter(Boolean),
        tags:        form.tags.split(",").map(s => s.trim()).filter(Boolean),
        isAvailable: form.isAvailable, isFeatured: form.isFeatured, isChefSpecial: form.isChefSpecial,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
        prepTime: form.prepTime, calories: form.calories ? parseInt(form.calories) : undefined,
        videoUrl: form.videoUrl || undefined,
        nutrition: hasNutrition ? {
          protein: parseFloat(form.protein) || 0, carbs: parseFloat(form.carbs) || 0,
          fats: parseFloat(form.fats) || 0, fiber: form.fiber ? parseFloat(form.fiber) : undefined,
        } : undefined,
      };
      if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
      if (editing) { await updateMeal(editing, payload); showToast("Meal updated!"); }
      else          { await addMeal(payload); showToast("Meal added!"); }
      resetForm();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meal?")) return;
    if (!isFirebaseConfigured) { showToast("Demo mode"); return; }
    await deleteMeal(id); showToast("Meal deleted.");
    setSelectedMeals(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleAdvanceOrder = async (order: Order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setUpdatingOrder(order.id);
    try { await updateOrderStatus(order.id, next); showToast(`Order #${order.orderNumber} → ${STATUS_META[next].label}`); }
    catch { showToast("Failed to update"); }
    finally { setUpdatingOrder(null); }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm(`Cancel order #${order.orderNumber}?`)) return;
    setUpdatingOrder(order.id);
    try { await updateOrderStatus(order.id, "cancelled"); showToast(`Order #${order.orderNumber} cancelled`); }
    catch { showToast("Failed to cancel"); }
    finally { setUpdatingOrder(null); }
  };

  const toggleSelectAll = () => {
    if (selectedMeals.size === meals.length) setSelectedMeals(new Set());
    else setSelectedMeals(new Set(meals.map(m => m.id)));
  };
  const toggleSelect = (id: string) =>
    setSelectedMeals(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const handleBulkDelete = async () => {
    if (!isFirebaseConfigured) { showToast("Demo mode"); return; }
    if (!confirm(`Delete ${selectedMeals.size} meals?`)) return;
    for (const id of selectedMeals) await deleteMeal(id);
    setSelectedMeals(new Set()); showToast(`Deleted ${selectedMeals.size} meals`);
  };
  const handleBulkToggleAvail = async (available: boolean) => {
    if (!isFirebaseConfigured) { showToast("Demo mode"); return; }
    for (const id of selectedMeals) {
      const meal = meals.find(m => m.id === id);
      if (meal) await updateMeal(id, { ...meal, isAvailable: available });
    }
    showToast(`${available ? "Enabled" : "Disabled"} ${selectedMeals.size} meals`);
    setSelectedMeals(new Set());
  };
  const handleMoveMeal = async (meal: Meal, dir: "up" | "down") => {
    if (!isFirebaseConfigured) { showToast("Demo mode"); return; }
    const current = meal.sortOrder ?? 0;
    await updateMeal(meal.id, { sortOrder: dir === "up" ? current - 1 : current + 1 });
  };

  const filteredOrders = orderFilter === "all" ? orders : orders.filter(o => o.status === orderFilter);
  const pendingCount   = orders.filter(o => ["pending", "confirmed", "preparing"].includes(o.status)).length;
  const todayOrders    = orders.filter(o => Date.now() - o.createdAt < 86_400_000);
  const todayRevenue   = todayOrders.reduce((s, o) => s + o.total, 0);

  const TABS: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview",  label: "Overview",  icon: BarChart3 },
    { id: "orders",    label: "Orders",    icon: ClipboardList, badge: pendingCount || undefined },
    { id: "menu",      label: "Menu",      icon: UtensilsCrossed },
    { id: "settings",  label: "Settings",  icon: Settings },
    { id: "branding",  label: "Branding",  icon: Palette },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "rgba(16,185,129,0.95)", color: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>
              Admin Portal
            </p>
            <h1 className="text-2xl font-extrabold text-white">{settings.name}</h1>
            <p className="text-white/30 text-xs mt-0.5">{user?.email || "Demo mode"}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-semibold">Live</span>
            </div>
            {user && (
              <button onClick={signOut}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-8">
          {TABS.map(({ id, label, icon: Icon, badge }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={active
                  ? { background: accent, color: "#0d0d0d" }
                  : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Icon size={14} />
                {label}
                {badge ? (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: "#ef4444", color: "white" }}>{badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={ShoppingBag}     label="Orders Today"   value={todayOrders.length} sub="Last 24 hours" color="#60a5fa" />
              <StatCard icon={DollarSign}      label="Revenue Today"  value={`$${todayRevenue.toFixed(0)}`} sub="Gross sales" color="#34d399" />
              <StatCard icon={UtensilsCrossed} label="Menu Items"     value={meals.filter(m => m.isAvailable).length} sub={`${meals.length} total`} color={accent} />
              <StatCard icon={Clock}           label="Pending"        value={pendingCount} sub="Need attention" color="#f59e0b" />
            </div>

            {/* Recent orders */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="text-white font-bold text-sm">Recent Orders</h3>
                <button onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold" style={{ color: accent }}>
                  View all →
                </button>
              </div>
              {orders.length === 0 ? (
                <div className="py-12 text-center text-white/25 text-sm">No orders yet</div>
              ) : (
                <div>
                  {orders.slice(0, 6).map((order) => {
                    const meta = STATUS_META[order.status];
                    return (
                      <div key={order.id} className="flex items-center justify-between px-5 py-3"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <p className="text-white text-sm font-semibold">#{order.orderNumber}</p>
                          <p className="text-white/30 text-xs">{ORDER_TYPE_LABEL[order.orderType]} · {timeAgo(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white/65 text-sm font-semibold">${order.total.toFixed(2)}</span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu quick-view */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {meals.slice(0, 6).map((meal) => (
                <div key={meal.id}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => openEdit(meal)}>
                  <img src={meal.imageUrl} alt={meal.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{meal.name}</p>
                    <p className="text-white/35 text-xs">${meal.price.toFixed(2)}</p>
                    <span className="text-xs" style={{ color: meal.isAvailable ? "#34d399" : "#f87171" }}>
                      {meal.isAvailable ? "● On" : "● Off"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {activeTab === "orders" && (
          <div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5">
              {(["all", ...ORDER_STATUS_FLOW, "cancelled"] as const).map((s) => (
                <button key={s} onClick={() => setOrderFilter(s as OrderStatus | "all")}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold capitalize"
                  style={orderFilter === s
                    ? { background: accent, color: "#0d0d0d" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {s === "all" ? "All" : STATUS_META[s as OrderStatus]?.label || s}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-white/25 text-sm">No orders</div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const meta = STATUS_META[order.status];
                  const next = nextStatus(order.status);
                  return (
                    <motion.div key={order.id} layout className="rounded-2xl overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-white font-bold text-sm">#{order.orderNumber}</p>
                              <span className="text-xs" style={{ color: accent }}>{ORDER_TYPE_LABEL[order.orderType]}</span>
                            </div>
                            <p className="text-white/35 text-xs">{order.customerName} · {timeAgo(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm">${order.total.toFixed(2)}</span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: meta.bg, color: meta.color }}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {order.items.map((item) => (
                            <span key={item.mealId} className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)" }}>
                              {item.quantity}× {item.mealName}
                            </span>
                          ))}
                        </div>
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <div className="flex gap-2">
                            {next && (
                              <button onClick={() => handleAdvanceOrder(order)}
                                disabled={updatingOrder === order.id}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                                <CheckCircle size={12} /> Mark {STATUS_META[next].label}
                              </button>
                            )}
                            <button onClick={() => handleCancelOrder(order)}
                              disabled={updatingOrder === order.id}
                              className="px-3 py-2 rounded-xl text-xs font-semibold"
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
            )}
          </div>
        )}

        {/* ─── MENU ─── */}
        {activeTab === "menu" && (
          <div>
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-bold">{editing ? "Edit Meal" : "Add New Meal"}</h3>
                    <button onClick={resetForm}><X size={18} className="text-white/35" /></button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Field label="Name *">
                      <input className={inputCls} style={inputStyle} placeholder="Grilled Salmon"
                        value={form.name} onChange={(e) => setF("name", e.target.value)} />
                    </Field>
                    <Field label="Price *">
                      <input className={inputCls} style={inputStyle} placeholder="24.99" type="number" step="0.01"
                        value={form.price} onChange={(e) => setF("price", e.target.value)} />
                    </Field>
                    <Field label="Category">
                      <select className={inputCls} style={{ ...inputStyle, appearance: "none" } as React.CSSProperties}
                        value={form.category} onChange={(e) => setF("category", e.target.value)}>
                        {["Starters","Mains","Burgers","Pasta","Pizza","Grills","Seafood","Desserts","Drinks"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Prep Time">
                      <input className={inputCls} style={inputStyle} placeholder="20 mins"
                        value={form.prepTime} onChange={(e) => setF("prepTime", e.target.value)} />
                    </Field>
                    <Field label="Calories">
                      <input className={inputCls} style={inputStyle} placeholder="420" type="number"
                        value={form.calories} onChange={(e) => setF("calories", e.target.value)} />
                    </Field>
                    <Field label="Image URL *">
                      <div className="flex gap-2">
                        <input className={inputCls} style={inputStyle} placeholder="https://..."
                          value={form.imageUrl} onChange={(e) => setF("imageUrl", e.target.value)} />
                        <button onClick={() => fileRef.current?.click()} className="px-3 rounded-xl shrink-0"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          {uploading ? <span className="text-white/40 text-xs">…</span> : <Upload size={14} className="text-white/40" />}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "meal"); }} />
                      </div>
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea className={inputCls + " resize-none"} style={inputStyle} rows={2}
                      placeholder="Describe the dish…" value={form.description}
                      onChange={(e) => setF("description", e.target.value)} />
                  </Field>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <Field label="Ingredients (comma separated)">
                      <input className={inputCls} style={inputStyle} placeholder="Salmon, Lemon, Herbs"
                        value={form.ingredients} onChange={(e) => setF("ingredients", e.target.value)} />
                    </Field>
                    <Field label="Allergens">
                      <input className={inputCls} style={inputStyle} placeholder="Fish, Dairy"
                        value={form.allergens} onChange={(e) => setF("allergens", e.target.value)} />
                    </Field>
                    <Field label="Tags">
                      <input className={inputCls} style={inputStyle} placeholder="spicy, vegan"
                        value={form.tags} onChange={(e) => setF("tags", e.target.value)} />
                    </Field>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {([
                      { key: "isAvailable" as const,  label: "Available" },
                      { key: "isFeatured"  as const,  label: "Featured" },
                      { key: "isChefSpecial" as const, label: "Chef Special" },
                    ]).map(({ key, label }) => (
                      <button key={key} onClick={() => setF(key, !form[key])}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                        style={form[key]
                          ? { background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }
                          : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {form[key] ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Nutrition */}
                  <div className="mt-4">
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Nutrition (optional)</p>
                    <div className="grid grid-cols-4 gap-3">
                      {([
                        { key: "protein" as const, label: "Protein g" },
                        { key: "carbs"   as const, label: "Carbs g" },
                        { key: "fats"    as const, label: "Fats g" },
                        { key: "fiber"   as const, label: "Fiber g" },
                      ]).map(({ key, label }) => (
                        <Field key={key} label={label}>
                          <input className={inputCls} style={inputStyle} placeholder="0" type="number"
                            value={form[key]} onChange={(e) => setF(key, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                  </div>

                  {form.imageUrl && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <img src={form.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <p className="text-white font-semibold text-sm">{form.name || "Meal name"}</p>
                        <p className="text-white/35 text-xs">{form.category} · ${form.price || "0.00"}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-5">
                    <button onClick={handleSave} disabled={saving}
                      className="px-6 py-3 rounded-xl text-sm font-bold"
                      style={{ background: accent, color: "#0d0d0d", opacity: saving ? 0.7 : 1 }}>
                      {saving ? "Saving…" : editing ? "Update Meal" : "Add Meal"}
                    </button>
                    <button onClick={resetForm} className="px-5 py-3 rounded-xl text-sm font-semibold"
                      style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)" }}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-bold">Menu Items ({meals.length})</h3>
                {selectedMeals.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/35 text-xs">{selectedMeals.size} selected</span>
                    <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>Delete</button>
                    <button onClick={() => handleBulkToggleAvail(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>Enable</button>
                    <button onClick={() => handleBulkToggleAvail(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>Disable</button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={toggleSelectAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {selectedMeals.size === meals.length && meals.length > 0 ? <CheckSquare size={12} /> : <Square size={12} />}
                  {selectedMeals.size === meals.length && meals.length > 0 ? "Deselect" : "Select All"}
                </button>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: accent, color: "#0d0d0d" }}>
                  <Plus size={14} /> Add Meal
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <input type="checkbox" className="rounded" checked={selectedMeals.has(meal.id)}
                    onChange={() => toggleSelect(meal.id)} />
                  <img src={meal.imageUrl} alt={meal.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm truncate">{meal.name}</p>
                      {meal.isFeatured && <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: `${accent}18`, color: accent }}>Featured</span>}
                    </div>
                    <p className="text-white/30 text-xs">{meal.category} · ${meal.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-semibold shrink-0"
                    style={{ color: meal.isAvailable ? "#34d399" : "#f87171" }}>
                    {meal.isAvailable ? "● On" : "● Off"}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleMoveMeal(meal, "up")} className="p-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.04)" }}><ArrowUp size={12} className="text-white/35" /></button>
                    <button onClick={() => handleMoveMeal(meal, "down")} className="p-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.04)" }}><ArrowDown size={12} className="text-white/35" /></button>
                    <button onClick={() => openEdit(meal)} className="p-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.04)" }}><Pencil size={12} className="text-white/35" /></button>
                    <button onClick={() => handleDelete(meal.id)} className="p-1.5 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.08)" }}><Trash2 size={12} style={{ color: "#f87171" }} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SETTINGS ─── */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-white font-bold">Restaurant Settings</h3>

            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-xs uppercase tracking-wider">Contact &amp; Location</p>
              <Field label="Address">
                <input className={inputCls} style={inputStyle} value={settingsForm.address}
                  onChange={(e) => setSF("address", e.target.value)} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Latitude"><input className={inputCls} style={inputStyle} type="number" step="0.0001" value={settingsForm.lat} onChange={(e) => setSF("lat", e.target.value)} /></Field>
                <Field label="Longitude"><input className={inputCls} style={inputStyle} type="number" step="0.0001" value={settingsForm.lng} onChange={(e) => setSF("lng", e.target.value)} /></Field>
                <Field label="Map Zoom"><input className={inputCls} style={inputStyle} type="number" min="8" max="20" value={settingsForm.zoom} onChange={(e) => setSF("zoom", e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone"><input className={inputCls} style={inputStyle} value={settingsForm.phone} onChange={(e) => setSF("phone", e.target.value)} /></Field>
                <Field label="Email"><input className={inputCls} style={inputStyle} value={settingsForm.email} onChange={(e) => setSF("email", e.target.value)} /></Field>
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-xs uppercase tracking-wider">Opening Hours</p>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Breakfast"><input className={inputCls} style={inputStyle} value={settingsForm.hoursBreakfast} onChange={(e) => setSF("hoursBreakfast", e.target.value)} /></Field>
                <Field label="Lunch"><input className={inputCls} style={inputStyle} value={settingsForm.hoursLunch} onChange={(e) => setSF("hoursLunch", e.target.value)} /></Field>
                <Field label="Dinner"><input className={inputCls} style={inputStyle} value={settingsForm.hoursDinner} onChange={(e) => setSF("hoursDinner", e.target.value)} /></Field>
              </div>
            </div>

            <button onClick={handleSaveSettings} disabled={savingSettings}
              className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: accent, color: "#0d0d0d", opacity: savingSettings ? 0.7 : 1 }}>
              {savingSettings ? "Saving…" : "Save Settings"}
            </button>
          </div>
        )}

        {/* ─── BRANDING ─── */}
        {activeTab === "branding" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-white font-bold">Branding</h3>
              <p className="text-white/35 text-xs mt-0.5">Changes appear live across the entire site instantly</p>
            </div>

            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-xs uppercase tracking-wider">Identity</p>
              <Field label="Restaurant Name">
                <input className={inputCls} style={inputStyle} placeholder="Saveur"
                  value={brandingForm.name} onChange={(e) => setBF("name", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <input className={inputCls} style={inputStyle} placeholder="Crafted with passion…"
                  value={brandingForm.tagline} onChange={(e) => setBF("tagline", e.target.value)} />
              </Field>
              <Field label="Accent Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={brandingForm.primaryColor || "#D4A853"}
                    onChange={(e) => setBF("primaryColor", e.target.value)}
                    className="w-12 h-10 rounded-xl cursor-pointer border-0 outline-none bg-transparent" />
                  <input className={inputCls} style={inputStyle} placeholder="#D4A853"
                    value={brandingForm.primaryColor} onChange={(e) => setBF("primaryColor", e.target.value)} />
                </div>
              </Field>
            </div>

            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-xs uppercase tracking-wider">Images</p>

              <Field label="Logo Image URL">
                <div className="flex gap-2">
                  <input className={inputCls} style={inputStyle} placeholder="https://… (leave blank for icon)"
                    value={brandingForm.logoUrl} onChange={(e) => setBF("logoUrl", e.target.value)} />
                  <button onClick={() => brandingFileRef.current?.click()} className="px-3 rounded-xl shrink-0"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {uploading ? <span className="text-white/40 text-xs">…</span> : <Upload size={14} className="text-white/40" />}
                  </button>
                  <input ref={brandingFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "logo"); }} />
                </div>
                {brandingForm.logoUrl && (
                  <img src={brandingForm.logoUrl} alt="" className="mt-2 w-16 h-16 rounded-2xl object-cover" />
                )}
              </Field>

              <Field label="Hero / Banner Image URL">
                <input className={inputCls} style={inputStyle}
                  placeholder="https://images.unsplash.com/…"
                  value={brandingForm.heroImageUrl} onChange={(e) => setBF("heroImageUrl", e.target.value)} />
                {brandingForm.heroImageUrl && (
                  <img src={brandingForm.heroImageUrl} alt="" className="mt-2 w-full h-32 rounded-2xl object-cover" />
                )}
              </Field>
            </div>

            {/* Live preview */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="px-5 py-3 text-white/35 text-xs uppercase tracking-wider"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                Live Preview
              </p>
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: brandingForm.primaryColor || "#D4A853" }}>
                  {brandingForm.logoUrl
                    ? <img src={brandingForm.logoUrl} alt="" className="w-full h-full object-cover" />
                    : <UtensilsCrossed size={22} color="#0d0d0d" />}
                </div>
                <div>
                  <p className="text-white font-extrabold text-lg leading-tight">
                    {brandingForm.name || "Restaurant Name"}
                  </p>
                  <p className="text-xs text-white/35 leading-tight">
                    {brandingForm.tagline || "Your tagline here"}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: brandingForm.primaryColor || "#D4A853", color: "#0d0d0d" }}>
                  Sample Button
                </div>
              </div>
            </div>

            <button onClick={handleSaveBranding} disabled={savingSettings}
              className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: accent, color: "#0d0d0d", opacity: savingSettings ? 0.7 : 1 }}>
              {savingSettings ? "Saving…" : "Save Branding"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
